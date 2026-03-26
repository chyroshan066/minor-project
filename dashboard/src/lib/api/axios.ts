import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { redirectToLogin } from "@/lib/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Separate client so refresh failures don't get re-intercepted.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function refreshTokens() {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) {
    useAuthStore.getState().clearSession();
    redirectToLogin();
    throw new Error("Missing refresh token");
  }

  const res = await refreshClient.post("/auth/refresh", { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = res.data as {
    accessToken: string;
    refreshToken: string;
  };

  useAuthStore.getState().setTokens({
    accessToken,
    refreshToken: newRefreshToken,
  });
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const config = err.config as RetryableRequestConfig | undefined;

    // If we can't identify the request, just bubble up.
    if (!config) return Promise.reject(err);

    // Avoid infinite loops by skipping refresh endpoint and already-retried requests.
    const url = config.url ?? "";
    const isRefreshCall = url.includes("/auth/refresh");

    if (status === 401 && !isRefreshCall && !config._retry) {
      config._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshTokens().finally(() => {
            isRefreshing = false;
          });
        }

        if (refreshPromise) await refreshPromise;

        const { accessToken } = useAuthStore.getState();
        if (!accessToken) throw new Error("No access token after refresh");

        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient.request(config);
      } catch (refreshErr) {
        useAuthStore.getState().clearSession();
        redirectToLogin();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

