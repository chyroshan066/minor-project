"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { 
  faUserPlus, 
  faSearch, 
  faUserInjured, 
  faEdit, 
  faTrashAlt,
  faPhone,
  faEnvelope,
  faTimes,
  faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  DataTableWrapper,
  Table,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";

import { decryptIfEncrypted } from "@/lib/crypto/decryptField";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  type Patient,
  createPatient,
  deletePatient,
  listPatients,
  updatePatient,
} from "@/lib/api/patients";

type PatientDraft = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  medical_history?: string;
};

/* --- REUSABLE MODAL COMPONENT (Force Centered & Glass Blur) --- */
function PatientModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
  loading,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PatientDraft;
  onSubmit: (draft: PatientDraft) => Promise<void>;
  loading: boolean;
  title: string;
}) {
  const [draft, setDraft] = useState<PatientDraft>(initial);

  useEffect(() => { setDraft(initial); }, [initial]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* FULL SCREEN BLUR OVERLAY */}
        <Dialog.Overlay 
          className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in" 
        />
        
        {/* CENTERED CONTENT - Using Flexbox on a fixed wrapper to guarantee absolute center */}
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
          <Dialog.Content 
            className="pointer-events-auto w-full max-w-md rounded-[2rem] bg-white p-8 shadow-soft-2xl outline-none animate-in zoom-in-95 fade-in duration-200"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tl from-blue-600 to-cyan-400 text-slate-400 shadow-soft-md">
                   <FontAwesomeIcon icon={faUserPlus} className="text-lg" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold text-slate-700 leading-tight">
                    {title}
                  </Dialog.Title>
                  <p className="text-xs font-semibold text-slate-400 tracking-wide">Enter patient record details</p>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-500 transition-all">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </Dialog.Close>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(draft); }}>
              <div className="space-y-2">
                <label className="text-xxs font-bold uppercase text-slate-400 ml-1 tracking-widest">Full Name *</label>
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-600 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 transition-all placeholder:text-slate-300 shadow-soft-xxs"
                  placeholder="e.g. Prateek Koirala"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xxs font-bold uppercase text-slate-400 ml-1 tracking-widest">Email</label>
                    <input
                      type="email"
                      className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-600 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 transition-all placeholder:text-slate-300 shadow-soft-xxs"
                      placeholder="patient@gmail.com"
                      value={draft.email ?? ""}
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xxs font-bold uppercase text-slate-400 ml-1 tracking-widest">Phone</label>
                    <input
                      className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-600 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 transition-all placeholder:text-slate-300 shadow-soft-xxs"
                      placeholder="98XXXXXXXX"
                      value={draft.phone ?? ""}
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    />
                  </div>
              </div>

              <div className="space-y-2">
                <label className="text-xxs font-bold uppercase text-slate-400 ml-1 tracking-widest">Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                     <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-slate-200 pl-10 pr-4 text-sm text-slate-600 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 transition-all placeholder:text-slate-300 shadow-soft-xxs"
                    placeholder="Dharan, Nepal"
                    value={draft.address ?? ""}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-10 flex items-center justify-end gap-4">
                <Dialog.Close asChild>
                  <button type="button" className="h-12 rounded-2xl px-6 text-xs font-bold uppercase text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 rounded-2xl bg-gradient-to-tl from-blue-600 to-cyan-400 px-10 text-xs font-bold uppercase text-slate-400 shadow-soft-md transition-all hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Patient"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* --- MAIN TABLE COMPONENT --- */
export const ReceptionistTable = () => {
  const [items, setItems] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalInitial, setModalInitial] = useState<PatientDraft>({ name: "" });

  async function fetchData(nextPage = 1) {
    setLoading(true);
    try {
      const res = await listPatients({ page: nextPage, limit, search: search || undefined });
      
      const decrypted = await Promise.all(res.items.map(async (p) => ({
        ...p,
        name: await decryptIfEncrypted(p.name),
        phone: await decryptIfEncrypted(p.phone),
      })));

      setItems(decrypted);
      setPage(res.page);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    fetchData(page); 
  }, [search, page]);

  const openCreate = () => {
    setEditingId(null);
    setModalInitial({ name: "", email: "", phone: "", address: "" });
    setModalOpen(true);
  };

  const openEdit = async (p: Patient) => {
    setEditingId(p.id);
    setModalInitial({ 
      name: p.name ?? "", 
      email: p.email ?? "", 
      phone: p.phone ?? "", 
      address: p.address ?? "" 
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete patient record?")) return;
    try {
      await deletePatient(id);
      toast.success("Patient removed");
      fetchData(page);
    } catch (err) { toast.error(getApiErrorMessage(err)); }
  };

  async function submitModal(draft: PatientDraft) {
    setModalLoading(true);
    try {
      if (editingId) {
        await updatePatient(editingId, draft);
        toast.success("Patient updated");
      } else {
        await createPatient(draft);
        toast.success("Patient registered");
      }
      setModalOpen(false);
      setSearch(""); 
      await fetchData(1); 
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally { 
      setModalLoading(false); 
    }
  }

  const canGoNext = useMemo(() => items.length === limit && !loading, [items.length, limit, loading]);

  return (
    <DataTableWrapper title="Patient Directory">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <FontAwesomeIcon icon={faSearch} className="text-xs" />
          </span>
          <input
            placeholder="Search patients..."
            className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-xs outline-none focus:border-cyan-400 transition-all shadow-soft-xxs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={openCreate}
          className="h-10 rounded-xl bg-gradient-to-tl from-blue-600 to-cyan-400 px-6 text-xs font-bold uppercase text-slate-400 shadow-soft-md transition-all hover:scale-105 active:opacity-85"
        >
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> Add Patient
        </button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <th className="table-header px-6 text-left uppercase text-xxs font-bold opacity-70">Patient</th>
            <th className="table-header text-left uppercase text-xxs font-bold opacity-70">Contact Info</th>
            <th className="table-header text-left uppercase text-xxs font-bold opacity-70">Address</th>
            <th className="table-header text-right px-6 uppercase text-xxs font-bold opacity-70">Actions</th>
          </tr>
        </TableHead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="py-20 text-center animate-pulse text-xs font-bold uppercase text-slate-400">Loading Directory...</td></tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={4} className="py-12"><EmptyState message="No patients found" icon={faUserInjured} description="Try a different search term or add a new patient." /></td></tr>
          ) : (
            items.map((p, index) => (
              <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell isLastRow={index === items.length - 1} className="px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-cyan-500 shadow-soft-xxs group-hover:bg-cyan-500 group-hover:text-white transition-all">
                      <FontAwesomeIcon icon={faUserInjured} className="text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{p.name}</span>
                      <span className="text-xxs font-bold text-slate-400 uppercase">Joined {new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell isLastRow={index === items.length - 1}>
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <FontAwesomeIcon icon={faEnvelope} className="text-[10px] text-slate-400" /> {p.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <FontAwesomeIcon icon={faPhone} className="text-[10px] text-slate-400" /> {p.phone || 'N/A'}
                      </div>
                   </div>
                </TableCell>
                <TableCell isLastRow={index === items.length - 1}>
                  <p className="text-xs font-semibold text-slate-500 truncate max-w-[150px]">{p.address || '—'}</p>
                </TableCell>
                <TableCell isLastRow={index === items.length - 1} className="px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-white transition-all">
                      <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-all">
                      <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                    </button>
                  </div>
                </TableCell>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
        <span className="text-xxs font-bold uppercase text-slate-400">Page {page}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-1.5 text-xxs font-bold uppercase border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 transition-all shadow-soft-xxs">Prev</button>
          <button disabled={!canGoNext} onClick={() => setPage(page + 1)} className="px-4 py-1.5 text-xxs font-bold uppercase border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 transition-all shadow-soft-xxs">Next</button>
        </div>
      </div>

      <PatientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={modalInitial}
        loading={modalLoading}
        title={editingId ? "Update Patient" : "Register New Patient"}
        onSubmit={submitModal}
      />
    </DataTableWrapper>
  );
};