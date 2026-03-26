"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Role } from "@/store/authStore";

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (draft: any) => Promise<void>;
  loading: boolean;
}

export function UserCreateDialog({
  open,
  onOpenChange,
  onCreate,
  loading,
}: UserCreateDialogProps) {
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    password: "",
    role: "dentist" as Role,
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setDraft({ name: "", email: "", password: "", role: "dentist" });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(draft);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Centered Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
        
        {/* Centered Content */}
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] z-[1001] w-[95vw] max-w-md translate-x-[-50%] translate-y-[-50%] 
                     rounded-2xl border border-white bg-white p-6 shadow-soft-2xl 
                     animate-in fade-in zoom-in duration-200 
                     max-h-[90vh] overflow-y-auto"
        >
          <Dialog.Title className="text-lg font-bold text-slate-700">
            Invite New Staff Member
          </Dialog.Title>
          <Dialog.Description className="text-xs text-slate-500 mt-1">
            Fill in the details below to grant access to the dental system.
          </Dialog.Description>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500 ml-1">Full Name *</label>
              <input
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="e.g. Dr. John Doe"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500 ml-1">Email Address *</label>
              <input
                type="email"
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="name@clinic.com"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1">System Role</label>
                <select
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}
                >
                  <option value="dentist">Dentist</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1">Temp Password *</label>
                <input
                  type="password"
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••"
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white pt-2">
              <Dialog.Close asChild>
                <button 
                  type="button" 
                  className="text-xs font-bold uppercase text-slate-400 hover:text-slate-600 px-4 transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="h-10 rounded-xl bg-gradient-to-tl from-blue-600 to-cyan-400 px-6 text-xs font-bold uppercase text-slate-400 shadow-soft-md transition-all hover:scale-[1.02] active:opacity-85 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Sending Invitation..." : "Invite Member"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}