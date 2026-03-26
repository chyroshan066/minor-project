"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Caption,
  Table,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  faCheck,
  faEllipsisV,
  faUserInjured,
  faPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// API & Lib Imports
import { decryptIfEncrypted } from "@/lib/crypto/decryptField";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  type Patient,
  listPatients,
  deletePatient,
  getPatient,
  updatePatient,
  createPatient,
} from "@/lib/api/patients";

type PatientDraft = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  medical_history?: string;
};

// --- MODAL COMPONENT ---
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

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] z-[1001] w-[95vw] max-w-lg translate-x-[-50%] translate-y-[-50%] 
                     rounded-2xl border border-white bg-white p-6 shadow-soft-2xl 
                     animate-in fade-in zoom-in duration-200 
                     max-h-[90vh] overflow-y-auto outline-none"
        >
          <Dialog.Title className="text-lg font-bold text-slate-700">
            {title}
          </Dialog.Title>
          
          <form 
            className="mt-4 flex flex-col gap-4" 
            onSubmit={async (e) => {
              e.preventDefault();
              await onSubmit(draft);
            }}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500 ml-1">Full Name *</label>
              <input
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1">Email</label>
                <input
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"
                  value={draft.email ?? ""}
                  placeholder="john@example.com"
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1">Phone</label>
                <input
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"
                  value={draft.phone ?? ""}
                  placeholder="+977-..."
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500 ml-1">Address</label>
              <input
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"
                value={draft.address ?? ""}
                placeholder="Street Address, City"
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-slate-500 ml-1">Medical History</label>
              <textarea
                className="min-h-[100px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
                value={draft.medical_history ?? ""}
                placeholder="Notes on allergies, previous treatments..."
                onChange={(e) => setDraft({ ...draft, medical_history: e.target.value })}
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white pt-2">
              <Dialog.Close asChild>
                <button type="button" className="text-xs font-bold uppercase text-slate-400 hover:text-slate-600 px-4 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="h-10 rounded-xl bg-gradient-to-tl from-blue-600 to-cyan-400 px-6 text-xs font-bold uppercase text-slate-400 shadow-soft-md transition-all hover:scale-[1.02] active:opacity-85 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// --- MAIN TABLE COMPONENT ---
export const ProjectsTable = () => {
  const [items, setItems] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add Patient");
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [modalInitial, setModalInitial] = useState<PatientDraft>({
    name: "", email: "", phone: "", address: "", medical_history: "",
  });

  const fetchPatients = useCallback(async (nextPage = page, query = searchQuery) => {
    setLoading(true);
    try {
      const res = await listPatients({ page: nextPage, limit, search: query });
      const decrypted = await Promise.all(
        res.items.map(async (p) => ({
          ...p,
          name: await decryptIfEncrypted(p.name),
          phone: await decryptIfEncrypted(p.phone),
        }))
      );
      setItems(decrypted);
      setPage(res.page);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(1, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasData = items.length > 0;
  const canGoNext = useMemo(() => items.length === limit && !loading, [items.length, loading]);

  // --- ACTIONS ---
  function openAdd() {
    setEditingPatientId(null);
    setModalTitle("Add New Patient");
    setModalInitial({ name: "", email: "", phone: "", address: "", medical_history: "" });
    setModalOpen(true);
  }

  async function openEdit(patientId: string) {
    setEditingPatientId(patientId);
    setModalTitle("Edit Patient Record");
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await getPatient(patientId);
      const p = res.patient;
      setModalInitial({
        name: p.name ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        address: p.address ?? "",
        medical_history: p.medical_history ?? "",
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  }

  async function submitModal(draft: PatientDraft) {
    setModalLoading(true);
    try {
      if (editingPatientId) {
        await updatePatient(editingPatientId, draft);
        toast.success("Record updated successfully");
      } else {
        await createPatient(draft);
        toast.success("Patient registered successfully");
      }
      setModalOpen(false);
      fetchPatients(page);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  }

  async function onDelete(patientId: string) {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await deletePatient(patientId);
      toast.success("Record deleted");
      fetchPatients(page);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <Card
      outerDivClassName="mb-6 w-full mt-0"
      innerDivClassName="border-black/12.5 shadow-soft-xl bg-surface flex flex-col"
    >
      <CardHeader className="border-black/12.5 border-solid mb-4">
        <div className="flex flex-wrap items-center justify-between -mx-3">
          <div className="w-full lg:w-1/3 px-3">
            <h6 className="font-bold">Patient Registry</h6>
            <p className="mb-0 text-sm leading-normal text-slate-500">
              <FontAwesomeIcon icon={faCheck} className="text-cyan-500" />
              <span className="ml-1 font-semibold">{items.length} records</span> shown
            </p>
          </div>

          <div className="w-full lg:w-2/3 px-3 mt-4 lg:mt-0">
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FontAwesomeIcon icon={faSearch} className="text-xs" />
                </span>
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full h-9 pl-9 pr-4 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={openAdd}
                  className="inline-block px-4 py-2 text-xs font-bold text-center text-slate-400 uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer shadow-soft-md bg-gradient-to-tl from-blue-600 to-cyan-400 hover:scale-[1.02] active:opacity-85"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  New Patient
                </button>
                
                <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <button 
                      disabled={page <= 1 || loading} 
                      onClick={() => fetchPatients(page - 1)}
                      className="px-2 text-xxs font-bold uppercase disabled:opacity-30 hover:text-cyan-500 transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-xxs font-bold px-2 text-slate-400">{page}</span>
                    <button 
                      disabled={!canGoNext} 
                      onClick={() => fetchPatients(page + 1)}
                      className="px-2 text-xxs font-bold uppercase disabled:opacity-30 hover:text-cyan-500 transition-colors"
                    >
                      Next
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <div className="flex-auto px-0 pt-0 pb-2 flex flex-col min-h-[450px]">
        {!hasData && !loading ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              message={searchQuery ? "No matches found" : "No patients found"}
              icon={faUserInjured}
              description={searchQuery ? "Try refining your search terms." : "Start by adding your first patient record."}
            />
          </div>
        ) : (
          <ScrollArea className="w-full flex-1">
            <div className="min-w-full inline-block align-middle">
              <Table className="min-w-full border-collapse">
                <TableHead className="sticky top-0 z-10 bg-surface shadow-sm">
                  <tr>
                    <th className="table-header text-left uppercase text-xxs border-b border-slate-100 px-6 py-4 bg-inherit font-bold text-slate-400">Patient Details</th>
                    <th className="table-header text-left uppercase text-xxs border-b border-slate-100 px-6 py-4 bg-inherit font-bold text-slate-400">Contact</th>
                    <th className="table-header text-left uppercase text-xxs border-b border-slate-100 px-6 py-4 bg-inherit font-bold text-slate-400">Address</th>
                    <th className="table-header text-center uppercase text-xxs border-b border-slate-100 px-6 py-4 bg-inherit font-bold text-slate-400">Added On</th>
                    <th className="table-header text-right uppercase text-xxs border-b border-slate-100 px-6 py-4 bg-inherit font-bold text-slate-400"></th>
                  </tr>
                </TableHead>

                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-32">
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                           <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Syncing Data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((patient, index) => (
                      <tr key={patient.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-b-0">
                        <TableCell isLastRow={index === items.length - 1}>
                          <div className="flex flex-col px-2">
                            <Caption className="font-bold text-slate-700">{patient.name || "Anonymous"}</Caption>
                            <span className="text-xxs text-slate-400 font-medium uppercase tracking-tighter">REF: {patient.id.slice(-8)}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell isLastRow={index === items.length - 1}>
                            <div className="flex flex-col px-2">
                              <Caption className="font-semibold text-slate-600">{patient.phone || "No Phone"}</Caption>
                              <span className="text-xxs text-slate-400 lowercase">{patient.email || "No Email"}</span>
                            </div>
                        </TableCell>

                        <TableCell isLastRow={index === items.length - 1}>
                          <Caption className="text-slate-500 line-clamp-1 max-w-[200px]">{patient.address || "—"}</Caption>
                        </TableCell>

                        <TableCell isLastRow={index === items.length - 1}>
                            <div className="text-center">
                              <span className="px-2.5 py-1 text-xxs font-bold bg-slate-100 rounded-lg text-slate-500 uppercase">
                                {new Date(patient.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                        </TableCell>

                        <TableCell isLastRow={index === items.length - 1} className="px-6 text-right">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors outline-none rounded-lg hover:bg-slate-100">
                                <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content 
                                align="end" 
                                sideOffset={5}
                                className="z-[1002] min-w-[160px] bg-white rounded-xl shadow-soft-2xl border border-slate-100 p-1 animate-in slide-in-from-top-2 duration-200"
                              >
                                <DropdownMenu.Item 
                                  onSelect={() => openEdit(patient.id)}
                                  className="flex items-center px-3 py-2.5 text-xs font-bold uppercase text-slate-600 cursor-pointer hover:bg-slate-50 rounded-lg outline-none transition-colors"
                                >
                                  Edit Record
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                                <DropdownMenu.Item 
                                  onSelect={() => onDelete(patient.id)}
                                  className="flex items-center px-3 py-2.5 text-xs font-bold uppercase text-red-500 cursor-pointer hover:bg-red-50 rounded-lg outline-none transition-colors"
                                >
                                  Delete Record
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </TableCell>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </div>

      <PatientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={modalInitial}
        loading={modalLoading}
        title={modalTitle}
        onSubmit={submitModal}
      />
    </Card>
  );
};