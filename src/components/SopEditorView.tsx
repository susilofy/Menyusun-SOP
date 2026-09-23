import React, { useState } from "react";
import {
  Save,
  Sparkles,
  Eye,
  Plus,
  Trash2,
  FileDown,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  History,
  Scale,
  Shield,
  Layers,
  FileText,
  UserCheck,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  GitMerge,
  CheckSquare,
  AlertTriangle,
  X,
  ListOrdered,
  Minus,
  Search,
  BookOpen,
} from "lucide-react";
import { SopDocument, SchoolProfile, PelaksanaMutuBakuStep, FlowType, SopStatus, UserRole } from "../types";
import { officialRegulationsCatalog } from "../data/initialData";
import { exportSopToDocx } from "../utils/docxExport";
import { exportSopToPdf } from "../utils/pdfExport";
import { FlowchartPelaksanaCell } from "./FlowchartPelaksanaCell";

interface SopEditorViewProps {
  sop: SopDocument;
  schoolProfile: SchoolProfile;
  role: UserRole;
  onSave: (updated: SopDocument) => void;
  onPreview: (sop: SopDocument) => void;
  onOpenChecklist: (sop: SopDocument) => void;
  onOpenApproval: (sop: SopDocument) => void;
  onDeleteSop?: (id: string) => void;
  onBack?: () => void;
}

const COMMON_SCHOOL_ROLES = [
  "Komite Sekolah",
  "Bendahara BOS",
  "Petugas UKS",
  "Pustakawan",
  "Wali Kelas",
  "Penjaga Sekolah",
  "Operator Dapodik",
  "Koordinator Kurikulum",
];

export const SopEditorView: React.FC<SopEditorViewProps> = ({
  sop: initialSop,
  schoolProfile,
  role,
  onSave,
  onPreview,
  onOpenChecklist,
  onOpenApproval,
  onDeleteSop,
  onBack,
}) => {
  const [sop, setSop] = useState<SopDocument>(JSON.parse(JSON.stringify(initialSop)));
  const [activeTab, setActiveTab] = useState<"identitas" | "pelaksana" | "tabel" | "ai" | "versi">("tabel");
  const [newRoleInput, setNewRoleInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [customAiPrompt, setCustomAiPrompt] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [tableDisplayMode, setTableDisplayMode] = useState<"flowchart" | "edit">("flowchart");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  // Set exact target step count dynamically
  const handleSetTargetStepCount = (target: number) => {
    if (target < 1) return;
    const currentLen = sop.tabelPelaksanaMutuBaku.length;
    if (target === currentLen) return;

    if (target < currentLen) {
      setSop((prev) => {
        const updated = prev.tabelPelaksanaMutuBaku
          .slice(0, target)
          .map((step, i) => ({ ...step, no: i + 1 }));
        return { ...prev, tabelPelaksanaMutuBaku: updated };
      });
      return;
    }

    const addedCount = target - currentLen;
    const newSteps: PelaksanaMutuBakuStep[] = [];
    for (let i = 0; i < addedCount; i++) {
      const stepNo = currentLen + i + 1;
      const initialChecks: Record<string, boolean> = {};
      if (sop.pelaksanaList.length > 0) {
        initialChecks[sop.pelaksanaList[Math.min(i, sop.pelaksanaList.length - 1)]] = true;
      }
      newSteps.push({
        id: `step-${Date.now()}-${i}`,
        no: stepNo,
        uraianProsedur: `Melaksanakan tindak lanjut dan administrasi tahapan ke-${stepNo}`,
        pelaksanaChecks: initialChecks,
        activePelaksanaIndex: 0,
        flowType: stepNo === target ? "end" : "process",
        persyaratan: "Dokumen kelengkapan dan format pendukung",
        waktu: "1 hari",
        output: "Hasil verifikasi / arsip dokumen",
      });
    }

    setSop((prev) => ({
      ...prev,
      tabelPelaksanaMutuBaku: [...prev.tabelPelaksanaMutuBaku, ...newSteps],
    }));
  };

  // Helper to update identity
  const handleIdentitasChange = (field: string, val: string) => {
    setSop((prev) => ({
      ...prev,
      identitas: { ...prev.identitas, [field]: val },
    }));
  };

  // Add/Remove dynamic role
  const handleAddRole = (roleToAdd?: string) => {
    const rawRole = typeof roleToAdd === "string" ? roleToAdd : newRoleInput;
    const trimmed = rawRole.trim();
    if (!trimmed) {
      setEditorNotice("Silakan ketik nama pihak / pelaksana terlebih dahulu (contoh: Komite Sekolah, Bendahara BOS, Petugas UKS).");
      setTimeout(() => setEditorNotice(null), 3500);
      return;
    }
    if (sop.pelaksanaList.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setEditorNotice(`Pihak/Pelaksana "${trimmed}" sudah terdaftar dalam kolom SOP ini.`);
      setTimeout(() => setEditorNotice(null), 3500);
      return;
    }

    const updatedList = [...sop.pelaksanaList, trimmed];
    const updatedSteps = sop.tabelPelaksanaMutuBaku.map((step) => ({
      ...step,
      pelaksanaChecks: { ...step.pelaksanaChecks, [trimmed]: false },
    }));

    const updatedSop = {
      ...sop,
      pelaksanaList: updatedList,
      tabelPelaksanaMutuBaku: updatedSteps,
    };
    setSop(updatedSop);
    onSave(updatedSop);
    setNewRoleInput("");
    setEditorNotice(`✓ Kolom pelaksana "${trimmed}" berhasil diaktifkan dan ditambahkan ke tabel.`);
    setTimeout(() => setEditorNotice(null), 3000);
  };

  const handleRemoveRole = (roleName: string) => {
    if (sop.pelaksanaList.length <= 2) {
      setEditorNotice("Peringatan: SOP standar Permenpan RB minimal memerlukan 2 pelaksana.");
      setTimeout(() => setEditorNotice(null), 4000);
      return;
    }
    const updatedList = sop.pelaksanaList.filter((r) => r !== roleName);
    const updatedSteps = sop.tabelPelaksanaMutuBaku.map((step) => {
      const checks = { ...step.pelaksanaChecks };
      delete checks[roleName];
      return { ...step, pelaksanaChecks: checks };
    });
    const updatedSop = {
      ...sop,
      pelaksanaList: updatedList,
      tabelPelaksanaMutuBaku: updatedSteps,
    };
    setSop(updatedSop);
    onSave(updatedSop);
    setEditorNotice(`Kolom pelaksana "${roleName}" berhasil dihapus.`);
    setTimeout(() => setEditorNotice(null), 3000);
  };

  // Step Operations
  const handleAddStep = () => {
    const newStepNo = sop.tabelPelaksanaMutuBaku.length + 1;
    const initialChecks: Record<string, boolean> = {};
    sop.pelaksanaList.forEach((r) => {
      initialChecks[r] = false;
    });

    const newStep: PelaksanaMutuBakuStep = {
      id: `step-${Date.now()}`,
      no: newStepNo,
      uraianProsedur: "Memeriksa dan menindaklanjuti berkas...",
      pelaksanaChecks: initialChecks,
      persyaratan: "Format instrumen, dokumen sekolah",
      waktu: "1 hari",
      output: "Dokumen terverifikasi",
      flowType: "process",
    };

    setSop((prev) => ({
      ...prev,
      tabelPelaksanaMutuBaku: [...prev.tabelPelaksanaMutuBaku, newStep],
    }));
  };

  const handleRemoveStep = (idx: number) => {
    if (sop.tabelPelaksanaMutuBaku.length <= 1) {
      setEditorNotice("Peringatan: Dokumen SOP minimal harus memiliki 1 langkah kerja.");
      setTimeout(() => setEditorNotice(null), 4000);
      return;
    }
    setSop((prev) => {
      const updated = prev.tabelPelaksanaMutuBaku
        .filter((_, i) => i !== idx)
        .map((step, i) => ({ ...step, no: i + 1 }));
      return { ...prev, tabelPelaksanaMutuBaku: updated };
    });
  };

  const handleStepChange = (idx: number, field: keyof PelaksanaMutuBakuStep, val: any) => {
    setSop((prev) => {
      const updated = [...prev.tabelPelaksanaMutuBaku];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, tabelPelaksanaMutuBaku: updated };
    });
  };

  const handleTogglePelaksanaCheck = (stepIdx: number, roleName: string) => {
    setSop((prev) => {
      const updated = [...prev.tabelPelaksanaMutuBaku];
      const curChecks = { ...(updated[stepIdx].pelaksanaChecks || {}) };
      const wasChecked = !!curChecks[roleName];
      curChecks[roleName] = !wasChecked;

      // Update activePelaksanaIndex if activated
      const roleIdx = (prev.pelaksanaList || []).indexOf(roleName);
      let activeIdx = updated[stepIdx].activePelaksanaIndex;
      if (!wasChecked && roleIdx !== -1) {
        activeIdx = roleIdx;
      } else if (wasChecked) {
        // Find next remaining checked role if any
        const remainingIdx = (prev.pelaksanaList || []).findIndex((p) => curChecks[p]);
        activeIdx = remainingIdx !== -1 ? remainingIdx : 0;
      }

      updated[stepIdx] = {
        ...updated[stepIdx],
        pelaksanaChecks: curChecks,
        activePelaksanaIndex: activeIdx,
      };
      return { ...prev, tabelPelaksanaMutuBaku: updated };
    });
  };

  // Save changes
  const handleSaveDocument = (newStatus?: SopStatus) => {
    const updatedSop: SopDocument = {
      ...sop,
      status: newStatus || sop.status,
      updatedAt: new Date().toISOString(),
    };
    setSop(updatedSop);
    onSave(updatedSop);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Execute AI Commands
  const runAiCommand = async (commandName: string, customText?: string) => {
    setAiLoading(true);
    setAiMessage(`AI sedang memproses: "${commandName}"...`);
    try {
      const res = await fetch("/api/gemini/refine-sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: commandName,
          sopData: sop,
          userInstruction: customText || customAiPrompt,
          schoolProfile,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menjalankan perintah AI");
      }

      const refinedSop = await res.json();
      if (refinedSop.identitas) {
        // Keep ID and version
        const merged: SopDocument = {
          ...refinedSop,
          id: sop.id,
          versi: `${parseFloat(sop.versi || "1.0") + 0.1}`.slice(0, 3),
          status: "REVISI",
          riwayatRevisi: [
            ...(sop.riwayatRevisi || []),
            {
              version: `${parseFloat(sop.versi || "1.0") + 0.1}`.slice(0, 3),
              tanggal: new Date().toLocaleDateString("id-ID"),
              diubahOleh: schoolProfile.namaKepalaSekolah,
              peran: "Kepala Sekolah (Asistensi AI)",
              bagianDiubah: commandName,
              alasanRevisi: `Penyempurnaan otomatis via perintah AI: ${commandName}`,
            },
          ],
        };
        setSop(merged);
        onSave(merged);
        setAiMessage(`Berhasil diperbaiki dengan perintah AI: "${commandName}". Versi baru disimpan.`);
      }
    } catch (err: any) {
      setAiMessage(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Top Banner: Status & Quick Action */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800 tracking-tight">STATUS:</span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                sop.status === "DISAHKAN" || sop.status === "AKTIF"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : sop.status === "DISETUJUI"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : sop.status === "REVISI"
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {sop.status === "DRAFT" ? "DRAFT — MENUNGGU REVIEW KEPALA SEKOLAH" : sop.status}
            </span>
          </div>

          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-medium text-slate-600">Versi {sop.versi}</span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500 font-mono">{sop.identitas.nomorSop}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenChecklist(sop)}
            className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-medium border border-slate-300 transition-colors"
          >
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Audit Kelengkapan</span>
          </button>

          <button
            onClick={() => onPreview(sop)}
            className="flex items-center space-x-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md font-semibold border border-indigo-200 transition-colors"
          >
            <Eye size={14} />
            <span>Preview Cetak A4</span>
          </button>

          <button
            onClick={() => exportSopToDocx(sop, schoolProfile)}
            className="flex items-center space-x-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-md font-medium transition-colors"
            title="Download Word (.docx) A4 Landscape"
          >
            <FileDown size={14} />
            <span>Word</span>
          </button>

          <button
            onClick={() => exportSopToPdf(sop, schoolProfile)}
            className="flex items-center space-x-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-md font-medium transition-colors"
            title="Download PDF A4 Landscape"
          >
            <Download size={14} />
            <span>PDF</span>
          </button>

          {onDeleteSop && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer"
              title="Hapus SOP Ini (Bak Sampah)"
            >
              <Trash2 size={14} />
              <span>Hapus SOP</span>
            </button>
          )}

          {role === "KEPALA_SEKOLAH" && sop.status !== "DISAHKAN" && (
            <button
              onClick={() => onOpenApproval(sop)}
              className="flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md font-semibold shadow-xs transition-colors"
            >
              <UserCheck size={14} />
              <span>Sahkan SOP</span>
            </button>
          )}

          <button
            onClick={() => handleSaveDocument()}
            className="flex items-center space-x-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-md font-semibold shadow-xs transition-colors"
          >
            <Save size={14} />
            <span>{isSaved ? "Tersimpan!" : "Simpan Draf"}</span>
          </button>
        </div>
      </div>

      {/* Editor Warning / Notice Banner */}
      {editorNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs font-semibold text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <span>{editorNotice}</span>
          </div>
          <button
            onClick={() => setEditorNotice(null)}
            className="text-amber-700 hover:text-amber-900 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editor Sub-Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center space-x-6 text-xs font-semibold shrink-0">
        <button
          onClick={() => setActiveTab("tabel")}
          className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === "tabel"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers size={14} />
          <span>Tabel Pelaksana Mutu Baku ({sop.tabelPelaksanaMutuBaku.length} Langkah)</span>
        </button>

        <button
          onClick={() => setActiveTab("identitas")}
          className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === "identitas"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText size={14} />
          <span>Identitas & Dasar Hukum ({sop.dasarHukum.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pelaksana")}
          className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === "pelaksana"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Scale size={14} />
          <span>Kualifikasi, Peralatan & Arsip</span>
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 text-indigo-600 ${
            activeTab === "ai"
              ? "border-indigo-600 text-indigo-700 font-bold"
              : "border-transparent hover:text-indigo-800"
          }`}
        >
          <Sparkles size={14} />
          <span>8 Perintah Asisten AI</span>
        </button>

        <button
          onClick={() => setActiveTab("versi")}
          className={`py-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === "versi"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History size={14} />
          <span>Riwayat Revisi ({sop.riwayatRevisi?.length || 1})</span>
        </button>
      </div>

      {/* AI Notification Banner */}
      {aiMessage && (
        <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-2 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center space-x-2">
            {aiLoading ? <Loader2 size={14} className="animate-spin text-indigo-600" /> : <Sparkles size={14} className="text-indigo-600" />}
            <span>{aiMessage}</span>
          </div>
          <button onClick={() => setAiMessage(null)} className="text-indigo-500 hover:text-indigo-800 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ================= TAB 1: TABEL PELAKSANA MUTU BAKU ================= */}
        {activeTab === "tabel" && (
          <div className="space-y-6">
            {/* Dynamic Roles Pill Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Kolom Pihak / Pelaksana (Dinamis Sesuai SOP)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Hanya tampilkan pihak yang relevan untuk SOP ini (Kepala Sekolah, Guru, Tim BOS, dll).
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newRoleInput}
                    onChange={(e) => setNewRoleInput(e.target.value)}
                    placeholder="Nama pelaksana / jabatan baru..."
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 w-52 bg-white text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
                    onKeyDown={(e) => e.key === "Enter" && handleAddRole()}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddRole()}
                    title="Aktifkan dan tambahkan pihak pelaksana baru ke tabel SOP"
                    className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Quick Suggestion Chips for School Roles */}
              {COMMON_SCHOOL_ROLES.filter((r) => !sop.pelaksanaList.includes(r)).length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-3 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                    Saran Cepat:
                  </span>
                  {COMMON_SCHOOL_ROLES.filter((r) => !sop.pelaksanaList.includes(r))
                    .slice(0, 5)
                    .map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleAddRole(suggestion)}
                        title={`Klik untuk menambahkan "${suggestion}" ke kolom tabel`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all cursor-pointer active:scale-95"
                      >
                        <Plus size={10} className="stroke-[2.5]" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {sop.pelaksanaList.map((pelaksana) => (
                  <div
                    key={pelaksana}
                    className="flex items-center space-x-1.5 bg-slate-100 border border-slate-300 text-slate-700 text-xs px-2.5 py-1 rounded-md"
                  >
                    <span className="font-medium">{pelaksana}</span>
                    <button
                      onClick={() => handleRemoveRole(pelaksana)}
                      className="text-slate-400 hover:text-red-600 p-0.5"
                      title="Hapus kolom ini"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Langkah Kerja Prosedur Mutu Baku
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gunakan kata kerja operasional (menerima, memeriksa, menyusun, memverifikasi, mengesahkan, dsb).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Step counter and target selector */}
                  <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-300 text-xs">
                    <span className="text-[11px] text-slate-500 font-semibold pl-1.5 hidden sm:inline">
                      Jumlah Langkah:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetTargetStepCount(Math.max(1, sop.tabelPelaksanaMutuBaku.length - 1))}
                      disabled={sop.tabelPelaksanaMutuBaku.length <= 1}
                      className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded font-bold transition-colors cursor-pointer"
                      title="Kurangi langkah terakhir"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-2 font-bold text-xs text-indigo-700 min-w-[65px] text-center">
                      {sop.tabelPelaksanaMutuBaku.length} Langkah
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetTargetStepCount(Math.min(20, sop.tabelPelaksanaMutuBaku.length + 1))}
                      disabled={sop.tabelPelaksanaMutuBaku.length >= 20}
                      className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded font-bold transition-colors cursor-pointer"
                      title="Tambah 1 langkah baru"
                    >
                      <Plus size={12} />
                    </button>

                    {/* Quick Preset Dropdown */}
                    <select
                      value={sop.tabelPelaksanaMutuBaku.length}
                      onChange={(e) => handleSetTargetStepCount(Number(e.target.value))}
                      className="text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-700 font-medium cursor-pointer"
                      title="Pilih jumlah langkah sesuai keperluan"
                    >
                      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15].map((n) => (
                        <option key={n} value={n}>
                          {n} Langkah
                        </option>
                      ))}
                      {![3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15].includes(sop.tabelPelaksanaMutuBaku.length) && (
                        <option value={sop.tabelPelaksanaMutuBaku.length}>
                          {sop.tabelPelaksanaMutuBaku.length} Langkah
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-300 flex items-center text-xs">
                    <button
                      type="button"
                      onClick={() => setTableDisplayMode("flowchart")}
                      className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1 transition-all ${
                        tableDisplayMode === "flowchart"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Tampilkan garis hubung langsung dan panah alur terstruktur pada pelaksana"
                    >
                      <GitMerge size={13} />
                      <span>Bagan Alir Berpanah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableDisplayMode("edit")}
                      className={`px-2.5 py-1 rounded-md font-medium flex items-center space-x-1 transition-all ${
                        tableDisplayMode === "edit"
                          ? "bg-white text-slate-800 shadow-xs border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Tampilkan mode checkbox sederhana"
                    >
                      <CheckSquare size={13} />
                      <span>Mode Checkbox</span>
                    </button>
                  </div>
                  <button
                    onClick={handleAddStep}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Tambah Langkah</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3 w-72">Uraian Prosedur</th>
                      <th className="p-3 w-28 text-center">Simbol Alur</th>
                      {sop.pelaksanaList.map((p) => (
                        <th key={p} className="p-2 text-center min-w-[70px] border-l border-slate-200">
                          {p}
                        </th>
                      ))}
                      <th className="p-3 min-w-[150px] border-l border-slate-200">Persyaratan / Perlengkapan</th>
                      <th className="p-3 w-28 border-l border-slate-200">Waktu</th>
                      <th className="p-3 min-w-[150px] border-l border-slate-200">Output</th>
                      <th className="p-3 w-12 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sop.tabelPelaksanaMutuBaku.map((step, idx) => (
                      <tr key={step.id || idx} className="hover:bg-slate-50/70 align-top">
                        {/* No */}
                        <td className="p-3 text-center font-bold text-slate-700 pt-4">
                          {step.no || idx + 1}
                        </td>

                        {/* Uraian Prosedur */}
                        <td className="p-2">
                          <textarea
                            rows={3}
                            value={step.uraianProsedur}
                            onChange={(e) => handleStepChange(idx, "uraianProsedur", e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                          />
                        </td>

                        {/* Flow Type Selector */}
                        <td className="p-2 text-center">
                          <select
                            value={step.flowType || "process"}
                            onChange={(e) => handleStepChange(idx, "flowType", e.target.value as FlowType)}
                            className="w-full border border-slate-300 rounded p-1 text-[11px] bg-white font-medium text-slate-700"
                          >
                            <option value="start">Mulai (Start)</option>
                            <option value="process">Proses (✓)</option>
                            <option value="decision">Keputusan (?)</option>
                            <option value="end">Selesai (End)</option>
                            <option value="check">Centang Saja</option>
                          </select>
                        </td>

                        {/* Pelaksana Columns: Flowchart vs Checkbox */}
                        {tableDisplayMode === "flowchart" ? (
                          sop.pelaksanaList.map((pelaksanaName, pIdx) => (
                            <FlowchartPelaksanaCell
                              key={pelaksanaName}
                              step={step}
                              stepIdx={idx}
                              totalSteps={sop.tabelPelaksanaMutuBaku.length}
                              pelaksanaName={pelaksanaName}
                              pelaksanaIdx={pIdx}
                              pelaksanaList={sop.pelaksanaList}
                              allSteps={sop.tabelPelaksanaMutuBaku}
                              isPrintMode={false}
                              onClick={() => handleTogglePelaksanaCheck(idx, pelaksanaName)}
                            />
                          ))
                        ) : (
                          sop.pelaksanaList.map((pelaksanaName) => {
                            const isChecked = !!step.pelaksanaChecks?.[pelaksanaName];
                            return (
                              <td
                                key={pelaksanaName}
                                className="p-2 text-center border-l border-slate-200 pt-4"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePelaksanaCheck(idx, pelaksanaName)}
                                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer focus:ring-indigo-500"
                                />
                              </td>
                            );
                          })
                        )}

                        {/* Persyaratan */}
                        <td className="p-2 border-l border-slate-200">
                          <textarea
                            rows={2}
                            value={step.persyaratan}
                            onChange={(e) => handleStepChange(idx, "persyaratan", e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Waktu */}
                        <td className="p-2 border-l border-slate-200">
                          <input
                            type="text"
                            value={step.waktu}
                            onChange={(e) => handleStepChange(idx, "waktu", e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs text-center focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. 1 hari"
                          />
                        </td>

                        {/* Output */}
                        <td className="p-2 border-l border-slate-200">
                          <textarea
                            rows={2}
                            value={step.output}
                            onChange={(e) => handleStepChange(idx, "output", e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Actions */}
                        <td className="p-2 text-center pt-4">
                          <button
                            onClick={() => handleRemoveStep(idx)}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Hapus baris langkah"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend & Guide Bar */}
              <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
                <div className="flex items-center space-x-4 flex-wrap">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Bagan Alir Terstruktur:
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full border border-black bg-white text-[9px] font-bold text-black">
                      Mulai/Selesai
                    </span>
                    <span>Awal / Akhir Prosedur</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 border border-black bg-white text-[9px] font-bold text-black">
                      Proses
                    </span>
                    <span>Pelaksanaan Kegiatan</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 rotate-45 border border-black bg-white inline-flex items-center justify-center text-[7.5px] font-bold text-black">
                      <span className="-rotate-45">?</span>
                    </span>
                    <span>Keputusan (Ya/Tdk)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="flex items-center">
                      <div className="w-5 h-[2px] bg-black" />
                      <svg width="6" height="6" viewBox="0 0 6 6" className="-ml-1">
                        <polygon points="0,0 6,3 0,6" fill="#000" />
                      </svg>
                    </div>
                    <span>Garis Alur Berpanah Langsung</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  Klik pada sel pelaksana untuk mengalihkan rute alur panah secara langsung
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: IDENTITAS & DASAR HUKUM ================= */}
        {activeTab === "identitas" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Identitas Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b pb-2">
                Identitas Dokumen SOP
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Nama SOP</label>
                  <input
                    type="text"
                    value={sop.identitas.namaSop}
                    onChange={(e) => handleIdentitasChange("namaSop", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor SOP</label>
                  <input
                    type="text"
                    value={sop.identitas.nomorSop}
                    onChange={(e) => handleIdentitasChange("nomorSop", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-indigo-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kategori</label>
                  <input
                    type="text"
                    value={sop.kategori}
                    onChange={(e) => setSop((p) => ({ ...p, kategori: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Pembuatan</label>
                  <input
                    type="text"
                    value={sop.identitas.tanggalPembuatan}
                    onChange={(e) => handleIdentitasChange("tanggalPembuatan", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Pengesahan</label>
                  <input
                    type="text"
                    value={sop.identitas.tanggalPengesahan}
                    onChange={(e) => handleIdentitasChange("tanggalPengesahan", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={sop.identitas.namaKepalaSekolah}
                    onChange={(e) => handleIdentitasChange("namaKepalaSekolah", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={sop.identitas.nip}
                    onChange={(e) => handleIdentitasChange("nip", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Dasar Hukum Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2.5 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Dasar Hukum & Regulasi Resmi
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      {sop.dasarHukum.length} Regulasi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Regulasi resmi pemerintah (JDIH, Kemendikdasmen, BPK RI). Gunakan katalog terverifikasi atau tambahkan manual.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCatalogModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Buka katalog regulasi resmi JDIH Kemendikdasmen"
                  >
                    <BookOpen size={13} />
                    <span>Pilih dari Katalog Resmi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSop((p) => ({
                        ...p,
                        dasarHukum: [
                          ...p.dasarHukum,
                          {
                            id: `dh-${Date.now()}`,
                            namaRegulasi: "Peraturan Menteri Pendidikan...",
                            nomor: "...",
                            tahun: "2025",
                            tentang: "...",
                            statusVerifikasi: "Perlu Verifikasi Kepala Sekolah",
                            sumber: "Dinas Pendidikan / JDIH",
                          },
                        ],
                      }))
                    }
                    className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Tambah Manual</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {sop.dasarHukum.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Regulasi #{idx + 1}</span>
                      <div className="flex items-center space-x-2">
                        <select
                          value={item.statusVerifikasi}
                          onChange={(e) => {
                            const updated = [...sop.dasarHukum];
                            updated[idx].statusVerifikasi = e.target.value as any;
                            setSop((prev) => ({ ...prev, dasarHukum: updated }));
                          }}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            item.statusVerifikasi === "Terverifikasi Resmi"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          <option value="Terverifikasi Resmi">Terverifikasi Resmi</option>
                          <option value="Perlu Verifikasi Kepala Sekolah">Perlu Verifikasi Kepala Sekolah</option>
                        </select>
                        <button
                          onClick={() => {
                            setSop((prev) => ({
                              ...prev,
                              dasarHukum: prev.dasarHukum.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={item.namaRegulasi}
                        onChange={(e) => {
                          const updated = [...sop.dasarHukum];
                          updated[idx].namaRegulasi = e.target.value;
                          setSop((prev) => ({ ...prev, dasarHukum: updated }));
                        }}
                        className="border border-slate-300 rounded px-2 py-1 bg-white font-medium"
                        placeholder="Nama Regulasi (e.g. Undang-Undang Nomor 20 Tahun 2003)"
                      />
                      <input
                        type="text"
                        value={item.tentang}
                        onChange={(e) => {
                          const updated = [...sop.dasarHukum];
                          updated[idx].tentang = e.target.value;
                          setSop((prev) => ({ ...prev, dasarHukum: updated }));
                        }}
                        className="border border-slate-300 rounded px-2 py-1 bg-white md:col-span-2"
                        placeholder="Tentang (e.g. Sistem Pendidikan Nasional)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: KUALIFIKASI, PERALATAN & ARSIP ================= */}
        {activeTab === "pelaksana" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Kualifikasi Pelaksana */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b pb-2">
                Kualifikasi Pelaksana
              </h3>
              <div className="space-y-2 text-xs">
                {sop.kualifikasiPelaksana.map((kp, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={kp}
                      onChange={(e) => {
                        const updated = [...sop.kualifikasiPelaksana];
                        updated[idx] = e.target.value;
                        setSop((prev) => ({ ...prev, kualifikasiPelaksana: updated }));
                      }}
                      className="flex-1 border border-slate-300 rounded px-3 py-1.5"
                    />
                    <button
                      onClick={() =>
                        setSop((prev) => ({
                          ...prev,
                          kualifikasiPelaksana: prev.kualifikasiPelaksana.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setSop((prev) => ({
                      ...prev,
                      kualifikasiPelaksana: [...prev.kualifikasiPelaksana, "Kualifikasi baru..."],
                    }))
                  }
                  className="text-indigo-600 hover:underline text-xs flex items-center space-x-1 font-semibold pt-1"
                >
                  <Plus size={13} />
                  <span>Tambah Kualifikasi</span>
                </button>
              </div>
            </div>

            {/* Peralatan & Peringatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Peralatan / Perlengkapan */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b pb-2">
                  Peralatan / Perlengkapan
                </h3>
                <div className="space-y-2">
                  {sop.peralatanPerlengkapan.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...sop.peralatanPerlengkapan];
                          updated[idx] = e.target.value;
                          setSop((prev) => ({ ...prev, peralatanPerlengkapan: updated }));
                        }}
                        className="flex-1 border border-slate-300 rounded px-2.5 py-1"
                      />
                      <button
                        onClick={() =>
                          setSop((prev) => ({
                            ...prev,
                            peralatanPerlengkapan: prev.peralatanPerlengkapan.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setSop((prev) => ({
                        ...prev,
                        peralatanPerlengkapan: [...prev.peralatanPerlengkapan, "Peralatan baru..."],
                      }))
                    }
                    className="text-indigo-600 hover:underline text-xs flex items-center space-x-1 font-semibold pt-1"
                  >
                    <Plus size={13} />
                    <span>Tambah Peralatan</span>
                  </button>
                </div>
              </div>

              {/* Peringatan */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b pb-2">
                  Peringatan & Batas Kritis
                </h3>
                <div className="space-y-2">
                  {sop.peringatan.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...sop.peringatan];
                          updated[idx] = e.target.value;
                          setSop((prev) => ({ ...prev, peringatan: updated }));
                        }}
                        className="flex-1 border border-slate-300 rounded px-2.5 py-1"
                      />
                      <button
                        onClick={() =>
                          setSop((prev) => ({
                            ...prev,
                            peringatan: prev.peringatan.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setSop((prev) => ({
                        ...prev,
                        peringatan: [...prev.peringatan, "Peringatan baru..."],
                      }))
                    }
                    className="text-indigo-600 hover:underline text-xs flex items-center space-x-1 font-semibold pt-1"
                  >
                    <Plus size={13} />
                    <span>Tambah Peringatan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pencatatan & Pendataan */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b pb-2">
                Pencatatan dan Pendataan (Bukti Audit & Kearsipan)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Penanggung Jawab Arsip</label>
                  <input
                    type="text"
                    value={sop.pencatatanPendataan.penanggungJawabArsip}
                    onChange={(e) =>
                      setSop((p) => ({
                        ...p,
                        pencatatanPendataan: { ...p.pencatatanPendataan, penanggungJawabArsip: e.target.value },
                      }))
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Media Penyimpanan</label>
                  <input
                    type="text"
                    value={sop.pencatatanPendataan.mediaPenyimpanan}
                    onChange={(e) =>
                      setSop((p) => ({
                        ...p,
                        pencatatanPendataan: { ...p.pencatatanPendataan, mediaPenyimpanan: e.target.value },
                      }))
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Periode Retensi Arsip</label>
                  <input
                    type="text"
                    value={sop.pencatatanPendataan.periodePenyimpanan}
                    onChange={(e) =>
                      setSop((p) => ({
                        ...p,
                        pencatatanPendataan: { ...p.pencatatanPendataan, periodePenyimpanan: e.target.value },
                      }))
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: 8 TOMBOL PERINTAH AI ================= */}
        {activeTab === "ai" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-xl shadow-md space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles size={20} className="text-indigo-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  Panel Asisten AI Editor SOP (Prompt Engine Satuan Pendidikan SD)
                </h3>
              </div>
              <p className="text-xs text-indigo-200">
                Pilih salah satu dari 8 perintah operasional di bawah untuk memerintahkan AI menyempurnakan dokumen SOP ini sesuai kaidah tata kelola sekolah dasar.
              </p>
            </div>

            {/* Custom Instruction Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Instruksi Khusus Kepala Sekolah (Opsional):</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customAiPrompt}
                  onChange={(e) => setCustomAiPrompt(e.target.value)}
                  placeholder="Contoh: Tambahkan langkah koordinasi dengan Komite Sekolah dan perjelas output berita acara..."
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
                <button
                  disabled={aiLoading}
                  onClick={() => runAiCommand("Perintah Khusus Kepala Sekolah", customAiPrompt)}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 text-xs shadow-xs"
                >
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Jalankan</span>
                </button>
              </div>
            </div>

            {/* 8 AI Action Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Perbaiki SOP */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>1. Perbaiki SOP</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Memperbaiki kelemahan kalimat, alur kerja yang melompat, atau data pendukung yang belum optimal.
                  </p>
                </div>
                <button
                  disabled={aiLoading}
                  onClick={() => runAiCommand("Perbaiki SOP")}
                  className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg text-center"
                >
                  Eksekusi: Perbaiki SOP
                </button>
              </div>

              {/* 2. Buat Lebih Operasional */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>2. Buat Lebih Operasional</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Mengubah kalimat pasif/deskriptif menjadi tindakan kerja kata kerja operasional terukur (menerima, memeriksa, menyetujui).
                  </p>
                </div>
                <button
                  disabled={aiLoading}
                  onClick={() => runAiCommand("Buat lebih operasional")}
                  className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg text-center"
                >
                  Eksekusi: Lebih Operasional
                </button>
              </div>

              {/* 3. Periksa Kelengkapan */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>3. Periksa Kelengkapan</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Mengaudit 19 poin kelengkapan administratif dan mengisi otomatis data wajib yang masih kosong.
                  </p>
                </div>
                <button
                  disabled={aiLoading}
                  onClick={() => runAiCommand("Periksa kelengkapan")}
                  className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg text-center"
                >
                  Eksekusi: Periksa Kelengkapan
                </button>
              </div>

              {/* 4. Periksa Konsistensi */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>4. Periksa Konsistensi</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Menghilangkan konflik antara pihak pelaksana di identitas dengan baris langkah di tabel mutu baku.
                  </p>
                </div>
                <button
                  disabled={aiLoading}
                  onClick={() => runAiCommand("Periksa konsistensi")}
                  className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg text-center"
                >
                  Eksekusi: Periksa Konsistensi
                </button>
              </div>

              {/* 5. Periksa Dasar Hukum */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>5. Periksa Dasar Hukum</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Memverifikasi nomor, tahun, dan judul UU Sisdiknas, PP SNP, dan juknis resmi Kemendikdasmen.
                  </p>
                </div>
                <button
                  disabled={aiLoading}
                  onClick={() => runAiCommand("Periksa dasar hukum")}
                  className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg text-center"
                >
                  Eksekusi: Periksa Dasar Hukum
                </button>
              </div>

              {/* 6. Sederhanakan */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>6. Sederhanakan</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Membuat langkah lebih ringkas dan to the point tanpa menghilangkan poin akuntabilitas dan audit.
                  </p>
                </div>
                <button
                  disabled={aiLoading}
                  onClick={() => runAiCommand("Sederhanakan")}
                  className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg text-center"
                >
                  Eksekusi: Sederhanakan
                </button>
              </div>

              {/* 7. Tambahkan Bukti Administrasi */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>7. Tambahkan Bukti Administrasi</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Menyertakan secara detail formulir, notulen, berita acara, tanda terima, dan laporan fisik/digital.
                  </p>
                </div>
                <button
                  disabled={aiLoading}
                  onClick={() => runAiCommand("Tambahkan bukti administrasi")}
                  className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg text-center"
                >
                  Eksekusi: Bukti Administrasi
                </button>
              </div>

              {/* 8. Sesuaikan dengan Sekolah Saya */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>8. Sesuaikan dengan Sekolah Saya</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sinkronisasikan identitas {schoolProfile.namaSekolah}, Kepala Sekolah {schoolProfile.namaKepalaSekolah}, NIP, dan jenjang SD.
                  </p>
                </div>
                <button
                  disabled={aiLoading}
                  onClick={() => runAiCommand("Sesuaikan dengan sekolah saya")}
                  className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg text-center"
                >
                  Eksekusi: Sesuaikan Profil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: RIWAYAT REVISI & VERSION CONTROL ================= */}
        {activeTab === "versi" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Riwayat Versi & Audit Perubahan SOP
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Setiap revisi terdokumentasi rapi tanpa menghapus jejak versi sebelumnya.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                  Versi Aktif: v{sop.versi}
                </span>
              </div>

              <div className="relative border-l-2 border-slate-200 pl-4 space-y-4 text-xs">
                {(sop.riwayatRevisi || []).map((rev, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span className="font-bold text-indigo-700">Versi {rev.version}</span>
                        <span className="text-slate-400 font-normal">{rev.tanggal}</span>
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Oleh:</span> {rev.diubahOleh} ({rev.peran})
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium">Bagian:</span> {rev.bagianDiubah}
                      </div>
                      <div className="text-slate-700 italic">
                        "{rev.alasanRevisi}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus SOP (Bak Sampah) dari Editor */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hapus Dokumen SOP</h3>
                  <p className="text-xs text-slate-500">Pindahkan dokumen ke bak sampah / hapus permanen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 text-sm">{sop.identitas.namaSop}</div>
              <div className="text-slate-600 font-mono text-[11px]">Nomor: {sop.identitas.nomorSop}</div>
              <div className="text-slate-600">
                Kategori: <span className="font-semibold text-slate-800">{sop.kategori}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p>
                Apakah Anda yakin ingin menghapus SOP ini? Dokumen ini akan ditutup dan dihapus dari daftar tata kelola sekolah.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  if (onDeleteSop) {
                    onDeleteSop(sop.id);
                  }
                  if (onBack) {
                    onBack();
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Hapus SOP</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Pilih dari Katalog Regulasi Resmi Kemendikdasmen (JDIH) */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Katalog Regulasi Resmi Pendidikan</h3>
                  <p className="text-xs text-slate-500">
                    Pilih dasar hukum valid sesuai Permendikdasmen & JDIH Kemendikdasmen untuk SOP ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search and Info */}
            <div className="space-y-2 shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Cari regulasi (nomor, tahun, permen, kurikulum, bos, ppdb, inklusi, guru, sarpras)..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Total regulasi resmi tersedia:{" "}
                  <strong className="text-indigo-700">{officialRegulationsCatalog.length}</strong> peraturan
                </span>
                <span>
                  Terpilih dalam SOP ini:{" "}
                  <strong className="text-indigo-700">{sop.dasarHukum.length}</strong> peraturan
                </span>
              </div>
            </div>

            {/* Regulation List */}
            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {officialRegulationsCatalog
                .filter((reg) => {
                  if (!catalogSearch.trim()) return true;
                  const q = catalogSearch.toLowerCase();
                  return (
                    reg.namaRegulasi.toLowerCase().includes(q) ||
                    reg.nomor.toLowerCase().includes(q) ||
                    reg.tahun.toLowerCase().includes(q) ||
                    reg.tentang.toLowerCase().includes(q) ||
                    (reg.kategoriTerkait || "").toLowerCase().includes(q)
                  );
                })
                .map((reg) => {
                  const isAdded = sop.dasarHukum.some(
                    (dh) =>
                      dh.namaRegulasi.toLowerCase().trim() === reg.namaRegulasi.toLowerCase().trim() &&
                      dh.nomor.trim() === reg.nomor.trim() &&
                      dh.tahun.trim() === reg.tahun.trim()
                  );

                  return (
                    <div
                      key={reg.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isAdded
                          ? "bg-indigo-50/50 border-indigo-200"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-bold text-slate-900">
                              {reg.namaRegulasi} {reg.nomor}/{reg.tahun}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                              {reg.kategoriTerkait || "Regulasi Sekolah"}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                              {reg.statusVerifikasi}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-snug">{reg.tentang}</p>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Sumber: {reg.sumber}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              // Remove it
                              setSop((prev) => ({
                                ...prev,
                                dasarHukum: prev.dasarHukum.filter(
                                  (dh) =>
                                    !(
                                      dh.namaRegulasi.toLowerCase().trim() === reg.namaRegulasi.toLowerCase().trim() &&
                                      dh.nomor.trim() === reg.nomor.trim() &&
                                      dh.tahun.trim() === reg.tahun.trim()
                                    )
                                ),
                              }));
                            } else {
                              // Add it
                              setSop((prev) => ({
                                ...prev,
                                dasarHukum: [
                                  ...prev.dasarHukum,
                                  {
                                    id: `dh-${reg.id}-${Date.now()}`,
                                    namaRegulasi: reg.namaRegulasi,
                                    nomor: reg.nomor,
                                    tahun: reg.tahun,
                                    tentang: reg.tentang,
                                    statusVerifikasi: "Terverifikasi Resmi",
                                    sumber: reg.sumber,
                                    tanggalPemeriksaan: reg.tanggalPemeriksaan,
                                  },
                                ],
                              }));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all flex items-center space-x-1 ${
                            isAdded
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <X size={12} />
                              <span>Hapus</span>
                            </>
                          ) : (
                            <>
                              <Plus size={12} />
                              <span>+ Tambah</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
              <span className="text-xs text-slate-500">
                {sop.dasarHukum.length} regulasi telah ditambahkan ke dokumen
              </span>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Selesai & Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
