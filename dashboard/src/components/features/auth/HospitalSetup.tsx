"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import emailjs from "@emailjs/browser";

// Soft UI Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/form/Input";

// Logic & Store Imports
import { setupHospital } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/store/authStore";

const setupSchema = z.object({
  hospital_name: z.string().min(2, "Hospital name is too short"),
  license_number: z.string().min(5, "Valid license number is required"),
  address: z.string().min(5, "Address is required"),
  admin_name: z.string().min(2, "Admin name is required"),
  admin_email: z.string().email("Invalid email address"),
  admin_password: z.string().min(8, "Password must be at least 8 characters"),
});

type SetupForm = z.infer<typeof setupSchema>;

export default function SetupHospitalPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
  });

  async function onSubmit(values: SetupForm) {
    setSubmitting(true);
    try {
      // 1. Create Hospital & Admin in Database
      const data = await setupHospital(values);

      // FIX: Guard clause to handle TypeScript 'possibly null' error
      if (!data || !data.hospital) {
        throw new Error("Registration failed: Hospital data not received.");
      }

      // 2. Send Welcome Email via EmailJS
      const templateParams = {
        admin_name: values.admin_name,
        admin_email: values.admin_email,
        hospital_name: values.hospital_name,
        hospital_id: data.hospital.id,
      };

      try {
        // Only attempt to send if environment variables are present
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_kapkbvp";
        
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_t8am5qm";

        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "HZ6bVjwq92m_MSQfT";
        emailjs.init(publicKey);

        const response = await emailjs.send(
          serviceId,
          templateId,
          templateParams,
          publicKey
        );
        
        console.log("EmailJS Success:", response.status, response.text);

        if (serviceId && templateId && publicKey) {
          await emailjs.send(serviceId, templateId, templateParams, publicKey);
        }
      } catch (emailErr) {
        // Log the error but don't stop the user redirect
        console.error("EmailJS Error:", emailErr);
      }

      // 3. Set Session and Redirect
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });

      toast.success("Setup successful! Check your email for your Hospital ID.");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mt-0 transition-all duration-200 ease-soft-in-out">
      <section>
        <div className="relative flex items-center p-0 overflow-hidden bg-center bg-cover min-h-screen">
          <div className="container z-10">
            <div className="flex flex-wrap mt-0 -mx-3">
              {/* Form Side */}
              <div className="flex flex-col w-full max-w-full px-3 mx-auto md:flex-0 shrink-0 md:w-7/12 lg:w-5/12 xl:w-4/12">
                <div className="relative flex flex-col min-w-0 mt-24 break-words bg-transparent border-0 shadow-none rounded-2xl bg-clip-border">
                  <div className="p-6 pb-0 mb-0 bg-transparent border-b-0 rounded-t-2xl">
                    <h3 className="relative z-10 font-bold text-transparent bg-gradient-soft-blue600-cyan400 bg-clip-text">
                      Hospital Setup
                    </h3>
                    <p className="mb-0 text-sm">Register your clinic and primary admin account.</p>
                  </div>

                  <div className="flex-auto p-6">
                    <form role="form" onSubmit={handleSubmit(onSubmit)}>
                      <h6 className="mb-4 text-xxs font-bold uppercase text-slate-400 opacity-60">Clinic Information</h6>

                      <div className="flex flex-wrap -mx-3">
                        <div className="w-full max-w-full px-3 mb-4 md:w-1/2">
                          <label className="mb-2 ml-1 font-bold text-xs text-slate-700 capitalize">Hospital Name</label>
                          <Input placeholder="Arthonyx Dental" {...register("hospital_name")} />
                          {errors.hospital_name && <p className="text-xxs text-red-500 mt-1 ml-1">{errors.hospital_name.message}</p>}
                        </div>
                        <div className="w-full max-w-full px-3 mb-4 md:w-1/2">
                          <label className="mb-2 ml-1 font-bold text-xs text-slate-700 capitalize">License No.</label>
                          <Input placeholder="MED-12345" {...register("license_number")} />
                          {errors.license_number && <p className="text-xxs text-red-500 mt-1 ml-1">{errors.license_number.message}</p>}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="mb-2 ml-1 font-bold text-xs text-slate-700 capitalize">Clinic Address</label>
                        <Input placeholder="123 Dental St, Butwal" {...register("address")} />
                        {errors.address && <p className="text-xxs text-red-500 mt-1 ml-1">{errors.address.message}</p>}
                      </div>

                      <h6 className="mt-6 mb-4 text-xxs font-bold uppercase text-slate-400 opacity-60">Admin Credentials</h6>

                      <div className="mb-4">
                        <label className="mb-2 ml-1 font-bold text-xs text-slate-700 capitalize">Full Name</label>
                        <Input placeholder="John Doe" {...register("admin_name")} />
                        {errors.admin_name && <p className="text-xxs text-red-500 mt-1 ml-1">{errors.admin_name.message}</p>}
                      </div>

                      <div className="flex flex-wrap -mx-3">
                        <div className="w-full max-w-full px-3 mb-4 md:w-1/2">
                          <label className="mb-2 ml-1 font-bold text-xs text-slate-700 capitalize">Email</label>
                          <Input type="email" placeholder="admin@clinic.com" {...register("admin_email")} />
                          {errors.admin_email && <p className="text-xxs text-red-500 mt-1 ml-1">{errors.admin_email.message}</p>}
                        </div>
                        <div className="w-full max-w-full px-3 mb-4 md:w-1/2">
                          <label className="mb-2 ml-1 font-bold text-xs text-slate-700 capitalize">Password</label>
                          <Input type="password" placeholder="••••••••" {...register("admin_password")} />
                          {errors.admin_password && <p className="text-xxs text-red-500 mt-1 ml-1">{errors.admin_password.message}</p>}
                        </div>
                      </div>

                      <div className="text-center">
                        <Button
                          variant="gradient"
                          type="submit"
                          disabled={submitting}
                          className="w-full mt-6 mb-0 border-0"
                          backgroundColor="bg-gradient-soft-blue600-cyan400"
                          btnText={submitting ? "Creating..." : "Finish Setup"}
                        />
                      </div>
                    </form>
                  </div>

                  <div className="p-6 px-1 pt-0 text-center bg-transparent">
                    <p className="mx-auto mb-6 text-sm">
                      Already have an ID?&nbsp;
                      <Link href="/login" className="font-semibold text-transparent bg-gradient-soft-blue600-cyan400 bg-clip-text">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Image Side */}
              <div className="w-full max-w-full px-3 lg:flex-0 shrink-0 md:w-6/12">
                <div className="absolute top-0 hidden w-3/5 h-full -mr-32 overflow-hidden -skew-x-10 -right-40 rounded-bl-xl md:block">
                  <div
                    className="absolute inset-x-0 top-0 z-0 h-full -ml-16 bg-cover skew-x-10 bg-[url('/images/curved-images/curved6.jpg')]"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}