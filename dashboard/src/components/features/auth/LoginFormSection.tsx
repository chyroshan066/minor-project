"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

// Soft UI Components
import { Button } from "@/components/ui/Button";
import { CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/form/Checkbox";
import { Input } from "@/components/ui/form/Input";

// Logic & Store Imports
import { login } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/store/authStore";

// 1. Validation Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(320),
  password: z.string().min(1, "Password is required").max(200),
  hospital_id: z.string().uuid("Invalid Hospital ID format"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginFormSection = () => {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitting, setSubmitting] = useState(false);

  // 2. Form Initialization
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", hospital_id: "" },
  });

  // 3. Login Logic
  async function onSubmit(values: LoginForm) {
    setSubmitting(true);
    try {
      const data = await login(values);
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });

      toast.success("Login successful");

      // Role-based redirection
      if (data.user.role === "admin") router.replace("/dashboard");
      else if (data.user.role === "dentist") router.replace("/dentist");
      else router.replace("/receptionist");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="relative flex items-center p-0 overflow-hidden bg-center bg-cover min-h-75-screen lg:max-h-screen">
        <div className="container z-10">
          <div className="flex flex-wrap mt-0 -mx-3">
            <div className="flex flex-col w-full max-w-full px-3 mx-auto md:flex-0 shrink-0 md:w-6/12 lg:w-5/12 xl:w-4/12">
              <div className="relative flex flex-col min-w-0 mt-32 break-words bg-transparent border-0 shadow-none rounded-2xl bg-clip-border">
                <CardHeader backgroundColor="bg-transparent">
                  <h3 className="relative z-10 font-bold text-transparent bg-gradient-soft-blue600-cyan400 bg-clip-text">
                    Welcome back
                  </h3>
                  <p className="mb-0">Enter your credentials to access your hospital dashboard</p>
                </CardHeader>
                
                <div className="flex-auto p-6">
                  <form role="form" onSubmit={handleSubmit(onSubmit)}>
                    {/* Email Field */}
                    <div className="group flex flex-col my-1">
                      <label className="mb-2 ml-1 font-bold text-xs text-main capitalize">Email</label>
                      <div className="mb-2">
                        <Input 
                          placeholder="Email" 
                          type="email" 
                          {...register("email")} 
                        />
                        {errors.email && <p className="text-xxs text-red-500 mt-1 ml-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="group flex flex-col my-1">
                      <label className="mb-2 ml-1 font-bold text-xs text-main capitalize">Password</label>
                      <div className="mb-2">
                        <Input 
                          placeholder="Password" 
                          type="password" 
                          {...register("password")} 
                        />
                        {errors.password && <p className="text-xxs text-red-500 mt-1 ml-1">{errors.password.message}</p>}
                      </div>
                    </div>

                    {/* Hospital ID Field (Crucial for your multi-tenant setup) */}
                    <div className="group flex flex-col my-1">
                      <label className="mb-2 ml-1 font-bold text-xs text-main capitalize">Hospital ID</label>
                      <div className="mb-2">
                        <Input 
                          placeholder="e.g. 3fa85f64..." 
                          type="text" 
                          {...register("hospital_id")} 
                        />
                        {errors.hospital_id && <p className="text-xxs text-red-500 mt-1 ml-1">{errors.hospital_id.message}</p>}
                      </div>
                    </div>

                    <div className="min-h-6 mb-0.5 block">
                      <Checkbox id="rememberMe" />
                      <label className="mb-2 ml-2 font-normal cursor-pointer text-sm text-main" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>

                    <div className="text-center">
                      <Button
                        variant="gradient"
                        type="submit"
                        disabled={submitting}
                        className="w-full mb-0 border-0 mt-6"
                        backgroundColor="bg-gradient-soft-blue600-cyan400"
                        btnText={submitting ? "Signing in..." : "Sign in"}
                      />
                    </div>
                  </form>
                </div>

                <div className="p-6 px-1 pt-0 text-center bg-transparent">
                  <p className="mx-auto mb-6 text-sm">
                    New hospital?&nbsp;
                    <Link href="/setup-hospital" className="font-semibold text-transparent bg-gradient-soft-blue600-cyan400 bg-clip-text">
                      Set up here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative Background Section */}
            <div className="w-full max-w-full px-3 lg:flex-0 shrink-0 md:w-6/12">
              <div className="absolute top-0 hidden w-3/5 h-full -mr-32 overflow-hidden -skew-x-10 -right-40 rounded-bl-xl md:block">
                <div
                  className="absolute inset-x-0 top-0 z-0 h-full -ml-16 bg-cover skew-x-10"
                  style={{ backgroundImage: "url('/images/curved-images/curved6.jpg')" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};