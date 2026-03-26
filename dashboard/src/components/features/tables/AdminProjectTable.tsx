"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { faHistory, faSearch, faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  DataTableWrapper,
  Table,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";

// Ensure these paths match your project structure
import { listAuditLogs, type AuditLog } from "@/lib/api/auditLogs";
import { getApiErrorMessage } from "@/lib/api/errors";

export const AdminProjectTable = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  
  // Filters
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");

  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData(nextPage = 1) {
    setLoading(true);
    try {
      const res = await listAuditLogs({
        page: nextPage,
        limit,
        action: action.trim() || undefined,
        resource: resource.trim() || undefined,
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
    fetchData(1);
  }, []);

  const canGoNext = useMemo(() => items.length === limit && !loading, [items.length, limit, loading]);

  return (
    <DataTableWrapper title="System Audit Logs">
      {/* Soft UI Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 px-6 py-4">
        <div className="flex flex-col gap-1">
          <label className="ml-1 text-xxs font-bold uppercase text-slate-400">Action</label>
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. USER_LOGIN"
            className="h-10 w-[200px] rounded-xl border border-slate-200 bg-white px-3 text-xs shadow-soft-xxs outline-none focus:border-cyan-400 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="ml-1 text-xxs font-bold uppercase text-slate-400">Resource</label>
          <input
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            placeholder="patients..."
            className="h-10 w-[200px] rounded-xl border border-slate-200 bg-white px-3 text-xs shadow-soft-xxs outline-none focus:border-cyan-400 transition-all"
          />
        </div>
        <button
          onClick={() => fetchData(1)}
          className="h-10 rounded-xl bg-gradient-to-tl from-blue-600 to-cyan-400 px-6 text-xs font-bold uppercase text-slate-400 shadow-soft-md transition-all hover:scale-105 active:opacity-85"
        >
          <FontAwesomeIcon icon={faSearch} className="mr-2" /> Filter
        </button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <th className="table-header px-6 text-left uppercase text-xxs font-bold opacity-70">Event / Action</th>
            <th className="table-header text-left uppercase text-xxs font-bold opacity-70">Resource</th>
            <th className="table-header text-center uppercase text-xxs font-bold opacity-70">Timestamp</th>
            <th className="table-header text-right px-6 uppercase text-xxs font-bold opacity-70">Details</th>
          </tr>
        </TableHead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="py-20 text-center text-disabled text-xs uppercase font-bold animate-pulse">Syncing logs...</td></tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-12">
                <EmptyState
                  message="No logs found"
                  icon={faHistory}
                  description="Try adjusting your filters to see more results."
                />
              </td>
            </tr>
          ) : (
            items.map((log, index) => (
              <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell isLastRow={index === items.length - 1} className="px-6">
                  <div className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shadow-soft-xxs mr-3 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                      <FontAwesomeIcon icon={faMicrochip} className="text-xs" />
                    </div>
                    <div className="flex flex-col">
                      <h6 className="mb-0 text-sm font-bold leading-normal text-slate-700">
                        {log.action}
                      </h6>
                      <span className="text-xxs font-semibold text-slate-400">
                        ID: {log.user_id?.substring(0, 18)}...
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell isLastRow={index === items.length - 1}>
                  <span className="rounded-2xl bg-gradient-to-tl from-slate-600 to-slate-300 px-2.5 py-1.5 text-center align-baseline text-xxs font-bold uppercase leading-none text-slate-400">
                    {log.resource}
                  </span>
                </TableCell>

                <TableCell isLastRow={index === items.length - 1} className="text-center">
                  <p className="mb-0 text-xs font-semibold text-dark">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </p>
                  <p className="mb-0 text-xxs text-disabled">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </TableCell>

                <TableCell isLastRow={index === items.length - 1} className="px-6 text-right">
                  <button 
                    onClick={() => {
                        console.log("Log Metadata:", log.metadata);
                        toast.info("Check console for full JSON payload");
                    }}
                    className="text-xxs font-bold uppercase text-cyan-500 hover:text-cyan-700 transition-colors"
                  >
                    View JSON
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
          Page <span className="text-dark font-black">{page}</span>
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => fetchData(page - 1)}
            className="px-4 py-1.5 text-xxs font-bold uppercase border border-border rounded-lg bg-white shadow-soft-xxs hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            Prev
          </button>
          <button
            disabled={!canGoNext}
            onClick={() => fetchData(page + 1)}
            className="px-4 py-1.5 text-xxs font-bold uppercase border border-border rounded-lg bg-white shadow-soft-xxs hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </DataTableWrapper>
  );
};