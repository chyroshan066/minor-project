"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  faSyncAlt, faPlus, faTimes, faEdit, faTrashAlt, faFileUpload,
  faFileImage, faEye, faExternalLinkAlt, faSearch, faCopy,
  faNotesMedical, faCapsules, faChevronLeft, faChevronRight,
  faEnvelope, faStethoscope, faFileMedicalAlt, faDownload
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-minor-project.vercel.app/api";
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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); 
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<Upload[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const [expandedText, setExpandedText] = useState<Record<string, boolean>>({});

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

  const generatePDF = (record: MedicalRecord) => {
    const doc = new jsPDF();
    const pEmail = (record as any).patient_email || "N/A";
    const date = new Date(record.created_at).toLocaleDateString();

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("Clinical Medical Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Patient ID: ${pEmail}`, 14, 32);
    doc.text(`Issued Date: ${date}`, 14, 38);
    doc.line(14, 42, 196, 42);

    autoTable(doc, {
      startY: 48,
      head: [['Clinical Category', 'Medical Details']],
      body: [
        ['Diagnosis', record.diagnosis],
        ['Treatment Plan', record.treatment],
        ['Prescription', record.prescription || 'No current medication'],
      ],
      headStyles: { fillColor: [15, 118, 110], fontSize: 11, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10, cellPadding: 6 },
      columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } },
      theme: 'grid'
    });

    if (record.notes) {
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("Clinical Observations:", 14, finalY);
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(record.notes, 14, finalY + 8, { maxWidth: 180 });
    }

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Electronic medical record generated by Arthonyx.", 14, 285);

    doc.save(`Record_${pEmail.split('@')[0]}.pdf`);
    toast.success("PDF Downloaded");
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
          <button onClick={() => toggleExpand(id, field)} className="text-[9px] font-black uppercase text-cyan-600 hover:text-cyan-800 w-fit">
            {isExpanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    );
  };

  const handleOpenView = async (rec: MedicalRecord) => {
    setSelectedRecord(rec);
    setIsViewModalOpen(true);
    setLoadingGallery(true);
    try {
      const res = await listUploads({ patient_email: (rec as any).patient_email, limit: 50 } as any);
      setGalleryFiles(res.items || []);
    } catch (err) {
      toast.error("Failed to load imaging");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleOpenUpload = (pEmail: string) => {
    setActivePatientEmail(pEmail);
    setUploadFile(null);
    setIsUploadModalOpen(true);
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
            type="text" placeholder="Search Patient Email..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-transparent shadow-soft-xl text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => fetchRecords(1)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft-xl text-slate-400 hover:text-cyan-500 transition-all active:scale-90">
            <FontAwesomeIcon icon={faSyncAlt} spin={loading} />
          </button>
          <button onClick={() => { setEditingId(null); setPatientEmail(""); setDiagnosis(""); setTreatment(""); setNotes(""); setPrescription(""); setIsModalOpen(true); }} className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-slate-400 shadow-soft-lg hover:shadow-soft-xl transition-all active:scale-95">
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
                  <td colSpan={6} className="py-32 text-center text-[10px] font-black uppercase text-slate-300 animate-pulse tracking-widest">Retrieving Clinical Data...</td>
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
                        <button onClick={() => handleOpenView(rec)} className="h-9 w-9 rounded-xl bg-white text-amber-500 shadow-soft-sm hover:bg-amber-500 hover:text-white transition-all"><FontAwesomeIcon icon={faEye} className="text-[10px]" /></button>
                        <button onClick={() => handleOpenUpload(anyRec.patient_email)} className="h-9 w-9 rounded-xl bg-white text-cyan-500 shadow-soft-sm hover:bg-cyan-500 hover:text-white transition-all"><FontAwesomeIcon icon={faFileUpload} className="text-[10px]" /></button>
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/30">
          <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Database Page {page}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1 || loading} onClick={() => fetchRecords(page - 1)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white shadow-soft-xxs text-slate-400 hover:text-cyan-500 disabled:opacity-30 transition-all border border-slate-100"><FontAwesomeIcon icon={faChevronLeft} /></button>
            <button disabled={!canGoNext || loading} onClick={() => fetchRecords(page + 1)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white shadow-soft-xxs text-slate-400 hover:text-cyan-500 disabled:opacity-30 transition-all border border-slate-100"><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>
        </div>
      </DataTableWrapper>

      {/* FIXED CASE REVIEW MODAL: HIGH Z-INDEX + FULL BACKDROP */}
      {isViewModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-12 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-white/20 relative">
            
            {/* Header */}
            <div className="px-8 py-6 flex justify-between items-center bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-slate-800 text-cyan-400 flex items-center justify-center shadow-lg"><FontAwesomeIcon icon={faFileMedicalAlt} /></div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Clinical Case Review</h3>
                  <p className="text-[10px] font-bold text-slate-400">{(selectedRecord as any).patient_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => generatePDF(selectedRecord)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download PDF
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors text-slate-400"><FontAwesomeIcon icon={faTimes} /></button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Left Column: Details */}
              <div className="w-full lg:w-1/2 p-8 overflow-y-auto space-y-8 bg-white border-r border-slate-50">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-cyan-600 mb-1 tracking-widest">Diagnosis</p>
                      <p className="text-sm font-black text-slate-800">{selectedRecord.diagnosis}</p>
                   </div>
                   <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-amber-600 mb-1 tracking-widest">Treatment Plan</p>
                      <p className="text-sm font-black text-slate-800">{selectedRecord.treatment}</p>
                   </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><FontAwesomeIcon icon={faCapsules} className="text-cyan-500" /> Prescription</p>
                  <div className="p-6 rounded-[32px] bg-cyan-50/30 border border-cyan-100"><p className="text-xs font-bold text-slate-700 whitespace-pre-wrap">{selectedRecord.prescription || "No prescription issued."}</p></div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><FontAwesomeIcon icon={faStethoscope} className="text-rose-400" /> Internal Notes</p>
                  <div className="p-6 rounded-[32px] bg-rose-50/30 border border-rose-100"><p className="text-xs font-bold text-slate-500 italic whitespace-pre-wrap">{selectedRecord.notes || "No internal notes recorded."}</p></div>
                </div>
              </div>

              {/* Right Column: Imaging */}
              <div className="w-full lg:w-1/2 p-8 bg-slate-50/50 overflow-y-auto">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Patient Imaging ({galleryFiles.length})</p>
                {loadingGallery ? (
                  <div className="py-24 text-center text-slate-300 font-black uppercase text-[10px]">Retrieving...</div>
                ) : galleryFiles.length === 0 ? (
                  <div className="py-24 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                    <FontAwesomeIcon icon={faFileImage} className="text-slate-100 text-5xl mb-4" />
                    <p className="text-xs font-bold text-slate-400">No images linked.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {galleryFiles.map((file) => (
                      <div key={file.id} className="group relative aspect-square rounded-[24px] bg-white border border-slate-100 overflow-hidden shadow-soft-sm">
                        <img src={toPublicUrl(file.url) || ""} alt="clinical" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                          <a href={toPublicUrl(file.url) || ""} target="_blank" className="h-10 w-10 rounded-xl bg-white text-slate-900 flex items-center justify-center"><FontAwesomeIcon icon={faExternalLinkAlt} /></a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL - HIGH Z-INDEX */}
      {isUploadModalOpen && (
         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
           <div className="w-full max-w-md bg-white rounded-[40px] p-10 space-y-8 shadow-2xl border border-white/20">
             <div className="text-center">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Secure File Upload</h3>
               <p className="text-[10px] font-bold text-slate-400 mt-2">Patient Email: {activePatientEmail}</p>
             </div>
             <div className={`group rounded-[32px] border-2 border-dashed transition-all p-10 text-center cursor-pointer ${uploadFile ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`} onClick={() => document.getElementById('file-up')?.click()}>
               <input type="file" id="file-up" className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
               <div className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all shadow-soft-sm ${uploadFile ? 'bg-emerald-500 text-white' : 'bg-white text-slate-200 group-hover:text-cyan-500'}`}><FontAwesomeIcon icon={faFileUpload} className="text-xl" /></div>
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-tight">{uploadFile ? uploadFile.name : "Select Image/Document"}</p>
             </div>
             <div className="flex gap-3">
               <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
               <button disabled={isUploading || !uploadFile} onClick={onUploadFile} className="flex-[2] h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-soft-lg active:scale-95 disabled:opacity-50">{isUploading ? "Encrypting..." : "Commit Upload"}</button>
             </div>
           </div>
         </div>
       )}

      {/* NEW ENTRY MODAL - HIGH Z-INDEX */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
          <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 space-y-8 max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tl from-slate-800 to-slate-700 text-slate-400 shadow-lg"><FontAwesomeIcon icon={faNotesMedical} /></div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{editingId ? "Update Evaluation" : "New Clinical Entry"}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-slate-100 transition-colors text-slate-300"><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Patient Email</label><input type="email" disabled={!!editingId} value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="patient@example.com" className="w-full h-12 bg-slate-50 rounded-2xl px-6 text-xs font-bold border-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Diagnosis</label><input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Pulpitis" className="w-full h-12 bg-slate-50 rounded-2xl px-6 text-xs font-bold border-none" /></div>
                <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Treatment Plan</label><input value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="e.g. RCT" className="w-full h-12 bg-slate-50 rounded-2xl px-6 text-xs font-bold border-none" /></div>
              </div>
              <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Prescription</label><textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Dosage..." className="w-full h-32 bg-slate-50 rounded-[24px] p-6 text-xs font-bold border-none resize-none" /></div>
              <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Clinical notes..." className="w-full h-32 bg-slate-50 rounded-[24px] p-6 text-xs font-bold border-none resize-none" /></div>
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