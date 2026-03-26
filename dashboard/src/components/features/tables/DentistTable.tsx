"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  faClock, 
  faUser, 
  faSyncAlt, 
  faCalendarDay,
  faCheckCircle,
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Soft UI Components
import {
  DataTableWrapper,
  Table,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";

// Logic & API
import { dailySchedule } from "@/lib/api/dentist";
import { updateAppointment, type Appointment } from "@/lib/api/appointments";
import { getApiErrorMessage } from "@/lib/api/errors";

// Helper for today's date in YYYY-MM-DD
function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const DentistTable = () => {
  const [date, setDate] = useState(todayISO());
  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (nextPage = 1) => {
    setLoading(true);
    try {
      const res = await dailySchedule({ date, page: nextPage, limit });
      setItems(res.items || []);
      setPage(res.page);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [date, limit]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const canGoNext = useMemo(() => items.length === limit && !loading, [items.length, limit, loading]);

  async function setAppointmentStatus(appt: Appointment, next: "Scheduled" | "Arrived" | "Completed") {
    const status = next === "Completed" ? "completed" : "scheduled";
    
    try {
      await updateAppointment(appt.id, {
        appointment_status: next,
        status,
      });
      toast.success(`Status: ${next}`);
      fetchData(page); 
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="relative w-full space-y-6">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group w-full md:w-64">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 w-full rounded-2xl border border-white bg-white/80 px-4 text-xs font-bold shadow-soft-xl outline-none focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-sm transition-all cursor-pointer"
            />
          </div>
          <button
            onClick={() => fetchData(1)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-soft-xl text-slate-400 hover:text-cyan-500 transition-all active:scale-90"
          >
            <FontAwesomeIcon icon={faSyncAlt} spin={loading} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-soft-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Live Schedule
          </span>
        </div>
      </div>

      {/* MAIN TABLE */}
      <DataTableWrapper title={`Appointments for ${date}`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Email</th>
                <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Actions</th>
              </tr>
            </TableHead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center text-[10px] font-black uppercase text-slate-300 animate-pulse">
                    Synchronizing...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20">
                    <EmptyState
                      message="No Appointments"
                      icon={faCheckCircle}
                      description="Your schedule is clear for this date."
                    />
                  </td>
                </tr>
              ) : (
                items.map((appt, idx) => {
                  const anyAppt = appt as any;
                  return (
                    <tr key={appt.id} className="group transition-all hover:bg-slate-50/50">
                      <TableCell isLastRow={idx === items.length - 1} className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:text-cyan-500 transition-all shadow-soft-xxs">
                            <FontAwesomeIcon icon={faClock} className="text-xs" />
                          </div>
                          <span className="text-sm font-black text-slate-700">{appt.time}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell isLastRow={idx === items.length - 1}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                            <FontAwesomeIcon icon={faUser} className="text-xs" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">
                              {anyAppt.patient_email || "Walk-in Patient"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                              Ref: {appt.patient_id.split('-')[0]}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell isLastRow={idx === items.length - 1} className="text-center">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase text-white shadow-soft-sm
                          ${appt.appointment_status === 'Completed' ? 'bg-emerald-500' : 
                            appt.appointment_status === 'Arrived' ? 'bg-cyan-500' : 
                            'bg-slate-400'}`}>
                          {appt.appointment_status ?? "Scheduled"}
                        </span>
                      </TableCell>

                      <TableCell isLastRow={idx === items.length - 1} className="px-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setAppointmentStatus(appt, "Arrived")}
                            className="rounded-xl px-3 py-1.5 text-[9px] font-black uppercase text-slate-500 hover:text-cyan-500 hover:bg-white transition-all shadow-soft-xxs border border-transparent hover:border-slate-100"
                          >
                            Arrived
                          </button>
                          <button
                            onClick={() => setAppointmentStatus(appt, "Completed")}
                            className="rounded-xl px-3 py-1.5 text-[9px] font-black uppercase bg-gradient-to-r from-slate-800 to-slate-900 text-slate-400 hover:text-white shadow-soft-md transition-all active:scale-95"
                          >
                            Finish
                          </button>
                          <button 
                            onClick={() => setAppointmentStatus(appt, "Scheduled")}
                            className="ml-2 h-7 w-7 rounded-xl flex items-center justify-center text-slate-200 hover:text-rose-400 transition-colors"
                            title="Reset Status"
                          >
                            <FontAwesomeIcon icon={faSyncAlt} className="text-[10px]" />
                          </button>
                        </div>
                      </TableCell>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {/* FOOTER PAGINATION */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/30 rounded-b-3xl">
          <span className="text-[10px] font-black uppercase text-slate-300">
            Schedule Page {page}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1 || loading} 
              onClick={() => fetchData(page - 1)} 
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white shadow-soft-xxs text-slate-400 hover:text-cyan-500 disabled:opacity-30 transition-all"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button 
              disabled={!canGoNext || loading} 
              onClick={() => fetchData(page + 1)} 
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white shadow-soft-xxs text-slate-400 hover:text-cyan-500 disabled:opacity-30 transition-all"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </DataTableWrapper>
    </div>
  );
};