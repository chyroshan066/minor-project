import axios, { type AxiosError } from "axios";

export function getApiErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? err.message ?? "Request failed";
  }
  return "Request failed";
}

export function isAxiosError(err: unknown): err is AxiosError {
  return axios.isAxiosError(err);
}

