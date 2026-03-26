"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  faSyncAlt, 
  faPlus,
  faTimes,
  faEdit,
  faTrashAlt,
  faFileUpload,
  faFileImage,
  faEye,
  faExternalLinkAlt,
  faSearch,
  faCopy,
  faNotesMedical,
  faCapsules,
  faChevronLeft,
  faChevronRight,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { 
  DataTableWrapper, 
  Table, 
  TableCell, 
  TableHead 
} from "@/components/ui/table";

import {
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  listMedicalRecordsByDentist,
  type MedicalRecord,
} from "@/lib/api/medicalRecords";
import { uploadOne, listUploads, type Upload } from "@/lib/api/uploads";
import { getApiErrorMessage } from "@/lib/api/errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
const truncateId = (id: string) => id?.length > 8 ? `${id.substring(0, 8)}...` : id;

function toPublicUrl(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export const DentistProjectTable = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modals & Gallery
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<Upload[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // Expanded State
  const [expandedText, setExpandedText] = useState<Record<string, boolean>>({});

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activePatientEmail, setActivePatientEmail] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadKind, setUploadKind] = useState("xray");
  const [isUploading, setIsUploading] = useState(false);

  const [patientEmail, setPatientEmail] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");

  const fetchRecords = useCallback(async (nextPage = 1) => {
    setLoading(true);
    try {
      const res = await listMedicalRecordsByDentist({ page: nextPage, limit });
      setRecords(res.items || []);
      setPage(res.page);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  const filteredRecords = useMemo(() => {
    return records.filter(rec => 
      (rec as any).patient_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [records, searchQuery]);

  const canGoNext = useMemo(() => records.length === limit && !loading, [records.length, limit, loading]);

  const toggleExpand = (id: string, field: string) => {
    const key = `${id}-${field}`;
    setExpandedText(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const renderExpandableText = (text: string | null, id: string, field: string) => {
    if (!text) return <span className="text-slate-300 italic text-[10px]">No entry</span>;
    const key = `${id}-${field}`;
    const isExpanded = expandedText[key];
    const shouldTruncate = text.length > 40;

    return (
      <div className="flex flex-col gap-1 max-w-[200px]">
        <span className={`text-[11px] font-bold leading-relaxed transition-all ${field === 'notes' ? 'text-slate-400' : 'text-slate-600'}`}>
          {isExpanded || !shouldTruncate ? text : `${text.substring(0, 40)}...`}
        </span>
        {shouldTruncate && (
          <button 
            onClick={() => toggleExpand(id, field)}
            className="text-[9px] font-black uppercase text-cyan-600 hover:text-cyan-800 w-fit"
          >
            {isExpanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    );
  };

  // Actions
  const handleOpenUpload = (pEmail: string) => {
    setActivePatientEmail(pEmail);
    setUploadFile(null);
    setIsUploadModalOpen(true);
  };

  const handleOpenGallery = async (pEmail: string) => {
    setActivePatientEmail(pEmail);
    setIsGalleryOpen(true);
    setLoadingGallery(true);
    try {
      // Assuming listUploads can also filter by email
      const res = await listUploads({ patient_email: pEmail, limit: 50 } as any);
      setGalleryFiles(res.items || []);
    } catch (err) {
      toast.error("Failed to load imaging");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleEdit = (rec: MedicalRecord) => {
    const anyRec = rec as any;
    setEditingId(rec.id);
    setPatientEmail(anyRec.patient_email || "");
    setDiagnosis(rec.diagnosis);
    setTreatment(rec.treatment);
    setNotes(rec.notes || "");
    setPrescription(rec.prescription || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this clinical record?")) return;
    try {
      await deleteMedicalRecord(id);
      toast.success("Record purged");
      fetchRecords(page);
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  async function onUploadFile() {
    if (!uploadFile) return toast.error("Select file");
    setIsUploading(true);
    try {
      await uploadOne({ file: uploadFile, kind: uploadKind, patient_email: activePatientEmail } as any);
      toast.success("Upload successful");
      setIsUploadModalOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmitEntry() {
    if (!patientEmail.trim() || !diagnosis.trim()) return toast.error("Required fields missing");
    setSubmitting(true);
    try {
      if (editingId) {
        await updateMedicalRecord(editingId, { diagnosis, treatment, notes, prescription });
      } else {
        await createMedicalRecord({ 
          patient_email: patientEmail.trim(), 
          diagnosis, 
          treatment, 
          notes, 
          prescription 
        } as any);
      }
      setIsModalOpen(false); 
      fetchRecords(editingId ? page : 1);
      toast.success(editingId ? "Clinical record updated" : "New record saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative w-full space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft-xl text-cyan-500">
            <FontAwesomeIcon icon={faNotesMedical} className="text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Clinical Database</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secure Records</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 max-w-md w-full relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-cyan-500 transition-colors">
            <FontAwesomeIcon icon={faSearch} className="text-xs" />
          </span>
          <input 
            type="text" 
            placeholder="Search Patient Email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-transparent shadow-soft-xl text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => fetchRecords(1)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft-xl text-slate-400 hover:text-cyan-500 transition-all active:scale-90">
            <FontAwesomeIcon icon={faSyncAlt} spin={loading} />
          </button>
          <button 
            onClick={() => { setEditingId(null); setPatientEmail(""); setDiagnosis(""); setTreatment(""); setNotes(""); setPrescription(""); setIsModalOpen(true); }} 
            className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-slate-400 shadow-soft-lg hover:shadow-soft-xl transition-all active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
            <span className="text-[10px] font-black uppercase tracking-widest">New Entry</span>
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <DataTableWrapper title="Patient History Timeline">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Email</th>
                <th className="py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Evaluation</th>
                <th className="py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Prescription</th>
                <th className="py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Notes</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Manage</th>
              </tr>
            </TableHead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center text-[10px] font-black uppercase text-slate-300 animate-pulse tracking-widest">
                    Retrieving Clinical Data...
                  </td>
                </tr>
              ) : filteredRecords.map((rec, idx) => {
                const isLast = idx === filteredRecords.length - 1;
                const anyRec = rec as any;
                return (
                  <tr key={rec.id} className="group border-b border-slate-50/50 hover:bg-slate-50/40 transition-colors">
                    <TableCell isLastRow={isLast} className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700">{new Date(rec.created_at).toLocaleDateString()}</span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">Automated Timestamp</span>
                      </div>
                    </TableCell>
                    <TableCell isLastRow={isLast}>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-50 w-fit group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                        <span className="text-[11px] font-black text-cyan-600 font-mono tracking-tighter">{truncateId(anyRec.patient_email || "N/A")}</span>
                        <button onClick={() => copyToClipboard(anyRec.patient_email)} className="text-slate-300 hover:text-cyan-500 transition-colors">
                          <FontAwesomeIcon icon={faCopy} className="text-[9px]" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell isLastRow={isLast}>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{rec.diagnosis}</span>
                        <span className="text-[10px] font-bold text-slate-400 italic mt-1">{rec.treatment}</span>
                      </div>
                    </TableCell>
                    <TableCell isLastRow={isLast}>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faCapsules} className="mt-1 text-[10px] text-slate-200" />
                        {renderExpandableText(rec.prescription, rec.id, 'prescription')}
                      </div>
                    </TableCell>
                    <TableCell isLastRow={isLast}>
                      {renderExpandableText(rec.notes, rec.id, 'notes')}
                    </TableCell>
                    <TableCell isLastRow={isLast} className="px-6 text-right">
                      <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenGallery(anyRec.patient_email)} className="h-9 w-9 rounded-xl bg-white text-amber-500 shadow-soft-sm hover:bg-amber-500 hover:text-white transition-all" title="Gallery"><FontAwesomeIcon icon={faEye} className="text-[10px]" /></button>
                        <button onClick={() => handleOpenUpload(anyRec.patient_email)} className="h-9 w-9 rounded-xl bg-white text-cyan-500 shadow-soft-sm hover:bg-cyan-500 hover:text-white transition-all" title="Upload"><FontAwesomeIcon icon={faFileUpload} className="text-[10px]" /></button>
                        <button onClick={() => handleEdit(rec)} className="h-9 w-9 rounded-xl bg-white text-slate-600 shadow-soft-sm hover:bg-slate-800 hover:text-white transition-all"><FontAwesomeIcon icon={faEdit} className="text-[10px]" /></button>
                        <button onClick={() => handleDelete(rec.id)} className="h-9 w-9 rounded-xl bg-white text-rose-400 shadow-soft-sm hover:bg-rose-500 hover:text-white transition-all"><FontAwesomeIcon icon={faTrashAlt} className="text-[10px]" /></button>
                      </div>
                    </TableCell>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* FOOTER PAGINATION */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/30">
          <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">
            Database Page {page}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1 || loading} 
              onClick={() => fetchRecords(page - 1)} 
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white shadow-soft-xxs text-slate-400 hover:text-cyan-500 disabled:opacity-30 transition-all border border-slate-100"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            </button>
            <button 
              disabled={!canGoNext || loading} 
              onClick={() => fetchRecords(page + 1)} 
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white shadow-soft-xxs text-slate-400 hover:text-cyan-500 disabled:opacity-30 transition-all border border-slate-100"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>
          </div>
        </div>
      </DataTableWrapper>

      {/* GALLERY */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md transition-all">
          <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border border-white/20">
            <div className="px-8 py-6 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-amber-500 text-slate-400 flex items-center justify-center shadow-soft-md"><FontAwesomeIcon icon={faFileImage} /></div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Clinical Imaging Gallery</h3>
              </div>
              <button onClick={() => setIsGalleryOpen(false)} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors"><FontAwesomeIcon icon={faTimes} className="text-slate-400" /></button>
            </div>
            <div className="p-8 overflow-y-auto">
              {loadingGallery ? (
                <div className="py-24 text-center animate-pulse text-slate-300 font-black uppercase text-[10px] tracking-widest">Decrypting Images...</div>
              ) : galleryFiles.length === 0 ? (
                <div className="py-24 text-center">
                  <FontAwesomeIcon icon={faFileImage} className="text-slate-100 text-5xl mb-4" />
                  <p className="text-xs font-bold text-slate-400">No clinical images found for this patient.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {galleryFiles.map((file) => (
                    <div key={file.id} className="group relative aspect-square rounded-[32px] bg-slate-50 border border-slate-100 overflow-hidden shadow-soft-sm">
                      <img src={toPublicUrl(file.url) || ""} alt="clinical" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                        <a href={toPublicUrl(file.url) || ""} target="_blank" className="h-12 w-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-2xl active:scale-90 transition-all"><FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" /></a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-[40px] p-10 space-y-8 shadow-2xl border border-white/20">
            <div className="text-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Secure File Upload</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2">Patient Email: {activePatientEmail}</p>
            </div>
            <div 
              className={`group rounded-[32px] border-2 border-dashed transition-all p-10 text-center cursor-pointer 
                ${uploadFile ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
              onClick={() => document.getElementById('file-up')?.click()}
            >
              <input type="file" id="file-up" className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              <div className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all shadow-soft-sm
                ${uploadFile ? 'bg-emerald-500 text-slate-400' : 'bg-white text-slate-200 group-hover:text-cyan-500'}`}>
                <FontAwesomeIcon icon={faFileUpload} className="text-xl" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-tight">
                {uploadFile ? uploadFile.name : "Select Image/Document"}
              </p>
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Classification</label>
              <select value={uploadKind} onChange={(e) => setUploadKind(e.target.value)} className="w-full h-12 rounded-2xl bg-slate-50 px-6 text-xs font-bold border-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                <option value="xray">X-Ray (Intraoral)</option>
                <option value="pano">OPG / Panoramic</option>
                <option value="photo">Clinical Photo</option>
                <option value="other">Other Documents</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
              <button disabled={isUploading || !uploadFile} onClick={onUploadFile} className="flex-[2] h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-soft-lg active:scale-95 disabled:opacity-50">
                {isUploading ? "Encrypting..." : "Commit Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENTRY FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 space-y-8 max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tl from-slate-800 to-slate-700 text-slate-400 shadow-lg">
                   <FontAwesomeIcon icon={faNotesMedical} className="text-xs" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{editingId ? "Update Evaluation" : "New Clinical Entry"}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Fill in the clinical findings below</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors"><FontAwesomeIcon icon={faTimes} className="text-slate-300" /></button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2 group">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Patient Email</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300" />
                  <input 
                    type="email"
                    disabled={!!editingId} 
                    value={patientEmail} 
                    onChange={(e) => setPatientEmail(e.target.value)} 
                    placeholder="patient@example.com" 
                    className="w-full h-12 bg-slate-50 rounded-2xl pl-10 pr-6 text-xs font-bold border-none focus:ring-4 focus:ring-cyan-500/10 transition-all disabled:opacity-50" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Diagnosis</label>
                  <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Pulpitis" className="w-full h-12 bg-slate-50 rounded-2xl px-6 text-xs font-bold border-none focus:ring-4 focus:ring-cyan-500/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Treatment Plan</label>
                  <input value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="e.g. RCT" className="w-full h-12 bg-slate-50 rounded-2xl px-6 text-xs font-bold border-none focus:ring-4 focus:ring-cyan-500/10 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Prescription</label>
                <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Dosage and instructions..." className="w-full h-24 bg-slate-50 rounded-[24px] p-6 text-xs font-bold border-none resize-none focus:ring-4 focus:ring-cyan-500/10 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Internal Clinical Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Confidential provider notes..." className="w-full h-24 bg-slate-50 rounded-[24px] p-6 text-xs font-bold border-none resize-none focus:ring-4 focus:ring-cyan-500/10 transition-all" />
              </div>
            </div>
            <button onClick={onSubmitEntry} disabled={submitting} className="w-full h-16 bg-gradient-to-r from-slate-800 to-slate-900 text-slate-400 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-soft-lg active:scale-95 transition-all disabled:opacity-50">
              {submitting ? <FontAwesomeIcon icon={faSyncAlt} spin className="mr-2" /> : (editingId ? "Finalize Update" : "Confirm Entry")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};