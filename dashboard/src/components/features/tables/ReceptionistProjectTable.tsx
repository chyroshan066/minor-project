"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import {
  faCalendarPlus,
  faSyncAlt,
  faUser,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faCircleNotch,
  faUserMd,
  faEnvelope,
  faSearch,
  faTimes,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  DataTableWrapper,
  Table,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";

import {
  createAppointment,
  listAppointments,
  updateAppointment,
  type Appointment,
  type BillingSummary,
} from "@/lib/api/appointments";
import { getApiErrorMessage } from "@/lib/api/errors";
import { listUsers } from "@/lib/api/users";

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const truncateId = (id: string) =>
  id?.length > 8 ? `${id.substring(0, 8)}...` : id;

export const ReceptionistProjectTable = () => {
  const [date, setDate] = useState(todayISO);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [patientEmail, setPatientEmail] = useState("");
  const [dentistId, setDentistId] = useState("");
  const [time, setTime] = useState("09:00");
  const [billingTotal, setBillingTotal] = useState<string>("");
  const [billingCurrency] = useState<string>("NPR");
  const [billingPaid, setBillingPaid] = useState<boolean>(false);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await listUsers({ role: "dentist", limit: 100 });
      setDentists(res.items || []);
    } catch (err) {
      console.error("Failed to load dentists", err);
    }
  }, []);

  const fetchAppointments = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      try {
        const res = await listAppointments({
          page: nextPage,
          limit,
          date_from: date,
          date_to: date,
        });
        setAppointments(res.items || []);
        setPage(res.page);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [date, limit]
  );

  useEffect(() => {
    fetchAppointments(1);
    fetchStaff();
  }, [date, fetchAppointments, fetchStaff]);

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    return appointments.filter((appt: any) => 
      appt.patient_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  const canGoNext = useMemo(
    () => appointments.length === limit && !loading,
    [appointments.length, limit, loading]
  );

  async function onBook() {
    if (!patientEmail.trim() || !dentistId.trim()) {
      toast.error("Required: Patient Email & Dentist Selection");
      return;
    }

    setSubmitting(true);
    try {
      const billing: BillingSummary | undefined = billingTotal
        ? {
            total: Number(billingTotal),
            currency: billingCurrency,
            paid: billingPaid,
          }
        : undefined;

      await createAppointment({
        patient_email: patientEmail.trim(),
        dentist_id: dentistId.trim(),
        date,
        time,
        appointment_status: "Scheduled",
        status: "scheduled",
        billing_summary: billing,
      } as any);

      toast.success("Appointment Created Successfully");
      setPatientEmail("");
      setDentistId("");
      setBillingTotal("");
      setBillingPaid(false);
      setIsModalOpen(false);
      fetchAppointments(1);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(id: string, status: any) {
    try {
      await updateAppointment(id, {
        appointment_status: status,
        status: status === "Completed" ? "completed" : "scheduled",
      });
      toast.success(`Status updated to ${status}`);
      fetchAppointments(page);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleTogglePayment(appt: Appointment) {
    const currentBilling = appt.billing_summary as BillingSummary;
    if (!currentBilling) return;

    try {
      await updateAppointment(appt.id, {
        billing_summary: { ...currentBilling, paid: !currentBilling.paid },
      });
      toast.success(`Marked as ${!currentBilling.paid ? "Paid" : "Unpaid"}`);
      fetchAppointments(page);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="relative w-full space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group w-full md:w-80">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-cyan-500 transition-colors" 
            />
            <input 
              type="text"
              placeholder="Search patient email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-2xl border border-white bg-white/80 pl-11 pr-4 text-xs font-bold shadow-soft-xl outline-none focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-sm transition-all"
            />
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 rounded-2xl border border-white bg-white/80 px-4 text-xs font-bold shadow-soft-xl outline-none focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-sm"
          />
          <button
            onClick={() => fetchAppointments(1)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-soft-xl text-slate-400 hover:text-cyan-500 transition-all"
          >
            <FontAwesomeIcon icon={faSyncAlt} spin={loading} />
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 h-11 px-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-soft-lg hover:shadow-cyan-500/20 transition-all active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Appointment
        </button>
      </div>

      {/* FULL WIDTH TABLE */}
      <DataTableWrapper title={`Timeline for ${date}`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Timing</th>
                <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Patient & Dentist</th>
                <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Billing</th>
                <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </TableHead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center text-[10px] font-black uppercase text-slate-300 animate-pulse">Synchronizing...</td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={5} className="py-20"><EmptyState message="No Appointments" icon={faCheckCircle} description="All clear." /></td></tr>
              ) : (
                filteredAppointments.map((appt, idx) => {
                  const billing = appt.billing_summary as BillingSummary;
                  const anyAppt = appt as any; 
                  return (
                    <tr key={appt.id} className="group transition-all hover:bg-slate-50/50">
                      <TableCell isLastRow={idx === filteredAppointments.length - 1} className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">{appt.time}</span>
                          <span className="text-[10px] font-bold text-cyan-500 uppercase">{appt.date}</span>
                        </div>
                      </TableCell>
                      <TableCell isLastRow={idx === filteredAppointments.length - 1}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:text-cyan-500 transition-all">
                            <FontAwesomeIcon icon={faUser} className="text-xs" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{anyAppt.patient_email || "New Patient"}</span>
                            <span className="text-[10px] font-bold text-cyan-600 uppercase">Dr. {anyAppt.dentist_name || truncateId(appt.dentist_id)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell isLastRow={idx === filteredAppointments.length - 1} className="text-center">
                        {billing ? (
                          <button onClick={() => handleTogglePayment(appt)} className="flex flex-col items-center w-full">
                            <span className="text-[10px] font-black text-slate-600">{billing.currency} {billing.total}</span>
                            <span className={`text-[9px] px-2 rounded-full font-bold uppercase ${billing.paid ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"}`}>{billing.paid ? "Paid" : "Pending"}</span>
                          </button>
                        ) : <span className="text-[10px] text-slate-300">—</span>}
                      </TableCell>
                      <TableCell isLastRow={idx === filteredAppointments.length - 1} className="text-center">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase text-white ${appt.appointment_status === "Completed" ? "bg-emerald-500" : appt.appointment_status === "Arrived" ? "bg-cyan-500" : "bg-slate-400"}`}>
                          {appt.appointment_status ?? "Scheduled"}
                        </span>
                      </TableCell>
                      <TableCell isLastRow={idx === filteredAppointments.length - 1} className="px-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleStatusUpdate(appt.id, "Arrived")} className="rounded-xl px-2 py-1.5 text-[9px] font-black uppercase text-slate-500 hover:text-cyan-500">Arrived</button>
                          <button onClick={() => handleStatusUpdate(appt.id, "Completed")} className="rounded-xl px-2 py-1.5 text-[9px] font-black uppercase text-slate-500 hover:text-emerald-500">Finish</button>
                        </div>
                      </TableCell>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/30 rounded-b-3xl">
          <span className="text-[10px] font-black uppercase text-slate-300">Page {page}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => fetchAppointments(page - 1)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white shadow-soft-xxs"><FontAwesomeIcon icon={faChevronLeft} /></button>
            <button disabled={!canGoNext} onClick={() => fetchAppointments(page + 1)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white shadow-soft-xxs"><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>
        </div>
      </DataTableWrapper>

      {/* CREATE APPOINTMENT MODAL */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          {/* BACKGROUND BLUR OVERLAY */}
          <Dialog.Overlay className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" />
          
          <Dialog.Content 
            className="fixed left-[50%] top-[50%] z-[1001] w-full max-w-md translate-x-[-50%] translate-y-[-50%] 
                       rounded-3xl border border-white bg-white p-8 shadow-2xl 
                       animate-in fade-in zoom-in duration-200 outline-none"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tl from-slate-800 to-slate-700 text-slate-400 shadow-lg">
                  <FontAwesomeIcon icon={faCalendarPlus} className="text-xs" />
                </div>
                <Dialog.Title className="text-sm font-black uppercase tracking-tight text-slate-700">
                  New Appointment
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="text-slate-300 hover:text-slate-500 transition-colors">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase text-slate-400">Patient Email</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300" />
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/50 pl-10 pr-4 text-xs font-bold outline-none focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="group">
                <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase text-slate-400">Assign Dentist</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faUserMd} className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 pointer-events-none" />
                  <select
                    value={dentistId}
                    onChange={(e) => setDentistId(e.target.value)}
                    className="h-12 w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 pl-10 pr-4 text-xs font-bold outline-none focus:bg-white transition-all"
                  >
                    <option value="">Select Dentist...</option>
                    {dentists.map((d) => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase text-slate-400">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-xs font-bold outline-none focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase text-slate-400">Total ({billingCurrency})</label>
                  <input
                    value={billingTotal}
                    onChange={(e) => setBillingTotal(e.target.value)}
                    placeholder="0.00"
                    className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 text-xs font-bold outline-none focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="modal-paid"
                  checked={billingPaid}
                  onChange={(e) => setBillingPaid(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-200 text-cyan-500 focus:ring-cyan-500/20"
                />
                <label htmlFor="modal-paid" className="text-[10px] font-black uppercase text-slate-500 cursor-pointer">Mark as Paid</label>
              </div>

              <button
                disabled={submitting}
                onClick={onBook}
                className="mt-4 w-full h-12 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-soft-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? <FontAwesomeIcon icon={faCircleNotch} spin className="mr-2" /> : "Confirm Appointment"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};