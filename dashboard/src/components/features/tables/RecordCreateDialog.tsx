"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNotesMedical, faTimes } from "@fortawesome/free-solid-svg-icons";

interface RecordCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (draft: {
    diagnosis: string;
    treatment: string;
    notes?: string | null;
    prescription?: string | null;
  }) => Promise<void>;
  loading: boolean;
}

export const RecordCreateDialog = ({
  open,
  onOpenChange,
  onCreate,
  loading,
}: RecordCreateDialogProps) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setDiagnosis("");
      setTreatment("");
      setNotes("");
      setPrescription("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      diagnosis,
      treatment,
      notes: notes || null,
      prescription: prescription || null,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-soft-2xl outline-none animate-in fade-in zoom-in duration-200">
          
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-soft-blue600-cyan400 shadow-soft-md text-surface">
                <FontAwesomeIcon icon={faNotesMedical} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-dark">
                  New Medical Record
                </Dialog.Title>
                <Dialog.Description className="text-xxs font-bold uppercase text-disabled">
                  Clinical Documentation
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="rounded-lg p-2 text-disabled hover:bg-slate-100 transition-colors">
              <FontAwesomeIcon icon={faTimes} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-dark ml-1 uppercase opacity-70">
                Diagnosis *
              </label>
              <textarea
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Describe the patient's condition..."
                className="min-h-[80px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-dark ml-1 uppercase opacity-70">
                Treatment Plan *
              </label>
              <textarea
                required
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Procedures or steps taken..."
                className="min-h-[80px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-dark ml-1 uppercase opacity-70">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes..."
                  className="min-h-[60px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none text-xxs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-dark ml-1 uppercase opacity-70">
                  Prescription
                </label>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Medication details..."
                  className="min-h-[60px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none text-xxs"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-6 py-2.5 text-xs font-bold uppercase text-disabled hover:text-dark transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-soft-blue600-cyan400 text-surface text-xs font-bold uppercase py-2.5 px-8 rounded-1.8 shadow-soft-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};