"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Table,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  faCheck,
  faFileInvoiceDollar,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// API Imports
import { getApiErrorMessage } from "@/lib/api/errors";
import { listAppointments, type Appointment } from "@/lib/api/appointments";

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const truncateId = (id: string) =>
  id?.length > 8 ? `${id.substring(0, 8)}...` : id;

export const BillingStatusTable = () => {
  const [items, setItems] = useState<Appointment[]>([]);
  const [date, setDate] = useState(todayISO);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchBillingData = useCallback(async (nextPage = 1, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await listAppointments({
        page: nextPage,
        limit,
        date_from: date,
        date_to: date,
      });

      setItems(res.items || []);
      setPage(res.page);
    } catch (err) {
      if (showLoading) toast.error(getApiErrorMessage(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [date, limit]);

  useEffect(() => {
    fetchBillingData(1);
    const intervalId = setInterval(() => {
      fetchBillingData(page, false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [date, page, fetchBillingData]);

  const hasData = items.length > 0;
  const canGoNext = useMemo(
    () => items.length === limit && !loading,
    [items.length, loading, limit]
  );

  return (
    <Card
      outerDivClassName="mb-6 w-full mt-0"
      innerDivClassName="border-black/12.5 shadow-soft-xl bg-surface flex flex-col"
    >
      <CardHeader className="border-black/12.5 border-solid mb-4">
        <div className="flex flex-wrap mt-0 -mx-3">
          <div className="flex-none w-7/12 max-w-full px-3 mt-0 lg:w-1/2 lg:flex-none">
            <h6>Billing Status</h6>
            <p className="mb-0 text-sm leading-normal text-slate-400">
              <FontAwesomeIcon icon={faCheck} className="text-cyan-500" />
              <span className="ml-1 font-semibold text-slate-500">{items.length} records</span> for this day
            </p>
          </div>
          <div className="flex-none w-5/12 max-w-full px-3 my-auto text-right lg:w-1/2 lg:flex-none flex items-center justify-end gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-cyan-400 bg-white text-slate-600 font-medium"
            />
            <button 
              onClick={() => fetchBillingData(1)}
              className="p-2 text-slate-400 hover:text-cyan-500 transition-colors"
            >
              <FontAwesomeIcon icon={faSync} spin={loading} />
            </button>
          </div>
        </div>
      </CardHeader>

      {/* CHANGED: Removed items-center justify-center, added flex-col justify-start */}
      <div className="flex-auto px-0 pt-0 pb-2 flex flex-col justify-start min-h-[400px]">
        {!hasData && !loading ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              message="No billing records"
              icon={faFileInvoiceDollar}
              description="No appointments found for the selected date."
            />
          </div>
        ) : (
          <ScrollArea className="management-table-ps relative overflow-hidden touch-pan-y w-full">
            <div className="p-0">
              <Table>
                <TableHead>
                  <tr className="bg-slate-50/50">
                    <th className="table-header text-left uppercase text-xxs border-b-solid border-b-border px-6 py-4 font-bold text-slate-400">Time</th>
                    <th className="table-header text-left uppercase text-xxs border-b-solid border-b-border px-6 py-4 font-bold text-slate-400">Patient Email</th>
                    <th className="table-header text-center uppercase text-xxs border-b-solid border-b-border px-6 py-4 font-bold text-slate-400">Status</th>
                    <th className="table-header text-center uppercase text-xxs border-b-solid border-b-border px-6 py-4 font-bold text-slate-400">Total</th>
                    <th className="table-header text-center uppercase text-xxs border-b-solid border-b-border px-6 py-4 font-bold text-slate-400">Payment</th>
                    <th className="table-header text-center uppercase text-xxs border-b-solid border-b-border px-6 py-4 font-bold text-slate-400">Created</th>
                  </tr>
                </TableHead>

                <tbody className="bg-white">
                  {loading && items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-32 text-sm font-medium text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                           <span className="uppercase text-xxs font-bold tracking-wider">Syncing...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((appt, index) => {
                      const anyAppt = appt as any;
                      const billing = appt.billing_summary && typeof appt.billing_summary === "object" 
                        ? appt.billing_summary 
                        : null;
                      const isPaid = billing?.paid;

                      return (
                        <tr key={appt.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-b-0">
                          <TableCell isLastRow={index === items.length - 1} className="ps-6">
                            <span className="text-sm font-bold text-slate-700">{appt.time}</span>
                          </TableCell>

                          <TableCell isLastRow={index === items.length - 1}>
                             <div className="flex flex-col">
                               <span className="text-xs font-bold text-slate-700 group-hover:text-cyan-600 transition-colors">
                                 {anyAppt.patient_email || "Walk-in Patient"}
                               </span>
                               <span className="text-[10px] text-slate-400 font-medium">
                                 ID: {truncateId(appt.patient_id)}
                               </span>
                             </div>
                          </TableCell>

                          <TableCell isLastRow={index === items.length - 1} className="text-center">
                            <span className={`rounded-lg px-2.5 py-1 text-xxs font-bold uppercase ${
                              appt.appointment_status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-cyan-50 text-cyan-600'
                            }`}>
                              {appt.appointment_status || "Scheduled"}
                            </span>
                          </TableCell>

                          <TableCell isLastRow={index === items.length - 1} className="text-center">
                            <span className="text-sm font-bold text-slate-700">
                              {billing ? `${billing.currency || "NPR"} ${billing.total}` : "—"}
                            </span>
                          </TableCell>

                          <TableCell isLastRow={index === items.length - 1} className="text-center">
                            <span className={`text-xs font-bold ${isPaid ? "text-emerald-500" : "text-amber-500"}`}>
                              {isPaid ? "Paid" : "Pending"}
                            </span>
                          </TableCell>

                          <TableCell isLastRow={index === items.length - 1} className="text-center">
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">
                              {appt.created_at ? new Date(appt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </span>
                          </TableCell>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between bg-slate-50/30">
          <button
            disabled={page <= 1 || loading}
            onClick={() => fetchBillingData(page - 1)}
            className="text-xs font-bold uppercase disabled:opacity-30 hover:text-cyan-500 transition-colors p-2"
          >
            Prev
          </button>
          <span className="text-xxs font-black uppercase text-slate-400 tracking-tighter bg-white px-3 py-1 rounded-full border border-slate-200">
            Page {page}
          </span>
          <button
            disabled={!canGoNext || loading}
            onClick={() => fetchBillingData(page + 1)}
            className="text-xs font-bold uppercase disabled:opacity-30 hover:text-cyan-500 transition-colors p-2"
          >
            Next
          </button>
      </div>
    </Card>
  );
};