"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { faUsersSlash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import emailjs from "@emailjs/browser"; // Added EmailJS import

import {
  DataTableWrapper,
  Table,
  TableAvatarCell,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";

import { listUsers, type User } from "@/lib/api/users";
import { registerStaff } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { Role } from "@/store/authStore";

// The Dialog Component
import { UserCreateDialog } from "@/components/features/tables/UserCreateDialog";
import { useAuthStore } from "@/store/authStore"; 

export const AdminStaffTable = () => {
  // --- Logic State ---
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // --- API Actions ---
  async function fetchUsers(nextPage = 1) {
    setLoading(true);
    try {
      const res = await listUsers({
        page: nextPage,
        limit,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      });
      setItems(res.items);
      setPage(res.page);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(1);
  }, [search, roleFilter]);

  const canGoNext = useMemo(() => items.length === limit && !loading, [items, limit, loading]);

  const { user: adminUser, hospitalId } = useAuthStore();

  async function createUser(draft: any) {
    setCreating(true);
    try {
      
      // 1. Register user in database
      const newUser = await registerStaff(draft);
      
      // 2. Send Invitation Email via EmailJS
      try {
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_kapkbvp"; // Replace with your actual service ID
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_FOR_STAFF || "template_hfai8g8"; // Recommended: specific template for staff
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "HZ6bVjwq92m_MSQfT";

        emailjs.init(publicKey);

        const templateParams = {
        to_name: draft.name,
        to_email: draft.email,
        from_email: adminUser?.email, 
        role: draft.role.charAt(0).toUpperCase() + draft.role.slice(1),
        hospital_name: "Arthonyx Dental Care", 
        hospital_id: hospitalId, 
        password: draft.password,
        login_url: `${window.location.origin}/login`,
      };

        await emailjs.send(serviceId, templateId, templateParams, publicKey);
      } catch (emailErr) {
        console.error("EmailJS Invitation Error:", emailErr);
        // We use warning because the user was created successfully in DB
        toast.warning("Staff created, but welcome email could not be sent.");
      }

      toast.success("Staff member invited successfully");
      setCreateOpen(false);
      fetchUsers(1);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <DataTableWrapper title="Staff Management">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="h-10 w-full max-w-sm rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "")}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="dentist">Dentist</option>
            <option value="receptionist">Receptionist</option>
          </select>
        </div>
        
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-2 h-11 px-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-soft-lg hover:shadow-cyan-500/20 transition-all active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Invite Staff
        </button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <th className="table-header text-left px-6 uppercase text-xxs font-bold opacity-70">Author / Staff</th>
            <th className="table-header text-left uppercase text-xxs font-bold opacity-70">Function</th>
            <th className="table-header text-center uppercase text-xxs font-bold opacity-70">Joined</th>
            <th className="table-header text-left uppercase text-xxs font-bold opacity-70">User ID</th>
            <th className="table-header opacity-70"></th>
          </tr>
        </TableHead>

        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="py-20 text-center text-disabled animate-pulse">Fetching staff records...</td></tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12">
                <EmptyState
                  message="No staff members found"
                  icon={faUsersSlash}
                  description="Your search didn't match any records or the directory is empty."
                />
              </td>
            </tr>
          ) : (
            items.map((user, index) => (
              <tr key={user.id}>
                <TableCell isLastRow={index === items.length - 1} className="px-6">
                  <TableAvatarCell
                    img={user.avatar_url || ""} 
                    name={user.name}
                    subTitle={user.email}
                  />
                </TableCell>
                
                <TableCell isLastRow={index === items.length - 1}>
                  <p className="mb-0 caption font-semibold text-dark capitalize">{user.role}</p>
                  <p className="mb-0 caption text-disabled text-xxs uppercase">
                    {user.role === 'dentist' ? 'Medical' : 'Administrative'}
                  </p>
                </TableCell>

                <TableCell isLastRow={index === items.length - 1} className="text-center">
                  <span className="text-disabled text-xs font-semibold">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </TableCell>

                <TableCell isLastRow={index === items.length - 1}>
                  <code className="text-xxs text-disabled bg-slate-100 px-1 rounded truncate max-w-[80px] inline-block">
                    {user.id}
                  </code>
                </TableCell>

                <TableCell isLastRow={index === items.length - 1} className="px-6 text-right">
                  <button className="text-xs font-semibold text-disabled hover:text-cyan-500 transition-colors">
                    Edit
                  </button>
                </TableCell>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <span className="text-xxs font-bold uppercase text-disabled">
          Page <span className="text-dark">{page}</span>
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => fetchUsers(page - 1)}
            className="px-4 py-1.5 text-xxs font-bold uppercase border border-border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            Prev
          </button>
          <button
            disabled={!canGoNext}
            onClick={() => fetchUsers(page + 1)}
            className="px-4 py-1.5 text-xxs font-bold uppercase border border-border rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            Next
          </button>
        </div>
      </div>

      <UserCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={createUser}
        loading={creating}
      />
    </DataTableWrapper>
  );
};