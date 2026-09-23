import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit3,
  FileDown,
  Download,
  Trash2,
  Sparkles,
  CheckCircle2,
  FileCheck,
  Plus,
  AlertTriangle,
  X,
  FileText,
  Award,
} from "lucide-react";
import { SopDocument, SchoolProfile, SopStatus } from "../types";
import { exportSopToDocx } from "../utils/docxExport";
import { exportSopToPdf } from "../utils/pdfExport";

interface SopListViewProps {
  sops: SopDocument[];
  schoolProfile: SchoolProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onPreviewSop: (sop: SopDocument) => void;
  onEditSop: (sop: SopDocument) => void;
  onDeleteSop: (id: string) => void;
  onOpenCreateWizard: () => void;
  onOpenChecklist: (sop: SopDocument) => void;
  onClearAllSops?: () => void;
  onOpenNeedsAnalysis?: () => void;
  initialStatusFilter?: string;
}

export const SopListView: React.FC<SopListViewProps> = ({
  sops,
  schoolProfile,
  searchQuery,
  onSearchChange,
  onPreviewSop,
  onEditSop,
  onDeleteSop,
  onOpenCreateWizard,
  onOpenChecklist,
  onClearAllSops,
  onOpenNeedsAnalysis,
  initialStatusFilter,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || "ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sopToDelete, setSopToDelete] = useState<SopDocument | null>(null);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);
  const [deletedNotification, setDeletedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  const counts = {
    ALL: sops.length,
    DISAHKAN: sops.filter((s) => s.status === "DISAHKAN" || s.status === "AKTIF").length,
    DRAFT: sops.filter((s) => s.status === "DRAFT" || s.status === "REVIEW").length,
    REVISI: sops.filter((s) => s.status === "REVISI").length,
    PERLU_DITINJAU: sops.filter((s) => s.status === "PERLU_DITINJAU").length,
  };

  const categories = Array.from(new Set(sops.map((s) => s.kategori)));

  const filtered = sops.filter((s) => {
    const matchesSearch =
      searchQuery === "" ||
      s.identitas.namaSop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.identitas.nomorSop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pelaksanaList.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "DISAHKAN" && (s.status === "DISAHKAN" || s.status === "AKTIF")) ||
      (statusFilter === "DRAFT" && (s.status === "DRAFT" || s.status === "REVIEW")) ||
      s.status === statusFilter;

    const matchesCategory = categoryFilter === "ALL" || s.kategori === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-100 relative">
      {/* Toast / Notification Banner */}
      {deletedNotification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{deletedNotification}</span>
          </div>
          <button
            onClick={() => setDeletedNotification(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header & New SOP Button */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Daftar Seluruh Standar Operasional Prosedur (SOP)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen dokumen tata kelola {schoolProfile.namaSekolah} ({filtered.length} SOP ditampilkan)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCreateWizard}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Buat SOP Baru dengan AI</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs with Live Count Badges */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {[
              { id: "ALL", label: "Semua", count: counts.ALL },
              { id: "DISAHKAN", label: "Disahkan & Aktif", count: counts.DISAHKAN },
              { id: "DRAFT", label: "Draf & Review", count: counts.DRAFT },
              { id: "REVISI", label: "Revisi", count: counts.REVISI },
              { id: "PERLU_DITINJAU", label: "Perlu Ditinjau", count: counts.PERLU_DITINJAU },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center space-x-1.5 ${
                  statusFilter === tab.id ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id
                      ? "bg-slate-100 text-slate-700"
                      : "bg-slate-200/70 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white font-medium"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama, nomor, pelaksana..."
            className="w-full border border-slate-300 rounded-lg pl-8 pr-7 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              title="Bersihkan pencarian"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Table or Empty State */}
      {sops.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Daftar Dokumen SOP Masih Kosong</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Seluruh daftar SOP telah berhasil dikosongkan. Satuan pendidikan <strong>{schoolProfile.namaSekolah}</strong> siap memulai penyusunan SOP baru yang terstandarisasi sesuai Permenpan RB No. 35 Tahun 2012 secara mandiri atau dibantu AI.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenCreateWizard}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Sparkles size={15} />
                <span>Buat Dokumen SOP dengan AI</span>
              </button>
              {onOpenNeedsAnalysis && (
                <button
                  type="button"
                  onClick={onOpenNeedsAnalysis}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 border border-slate-200 transition-all cursor-pointer active:scale-95"
                >
                  <Award size={15} className="text-indigo-600" />
                  <span>Katalog Analisis Kebutuhan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Nama SOP</th>
                  <th className="p-3">Nomor Registrasi</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Pelaksana</th>
                  <th className="p-3">Versi</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                      Tidak ada SOP yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sop, idx) => (
                    <tr key={sop.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>

                      <td className="p-3">
                        <div
                          onClick={() => onPreviewSop(sop)}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {sop.identitas.namaSop}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Dibuat: {sop.identitas.tanggalPembuatan || "-"} • Disahkan: {sop.identitas.tanggalPengesahan || "Belum"}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-slate-700">
                        {sop.identitas.nomorSop || "-"}
                      </td>

                      <td className="p-3">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                          {sop.kategori}
                        </span>
                      </td>

                      <td className="p-3 text-[11px] text-slate-600 max-w-xs truncate">
                        {sop.pelaksanaList.join(", ")}
                      </td>

                      <td className="p-3 font-mono text-slate-600">v{sop.versi}</td>

                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            sop.status === "DISAHKAN" || sop.status === "AKTIF"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : sop.status === "DISETUJUI"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : sop.status === "REVISI"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          }`}
                        >
                          {sop.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onPreviewSop(sop)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Preview Format A4 Landscape"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => onEditSop(sop)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Buka Editor & 8 Perintah AI"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => onOpenChecklist(sop)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Audit 19 Poin Kelengkapan"
                          >
                            <CheckCircle2 size={15} />
                          </button>

                          <button
                            onClick={() => exportSopToDocx(sop, schoolProfile)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Unduh Word (.docx)"
                          >
                            <FileDown size={15} />
                          </button>

                          <button
                            onClick={() => exportSopToPdf(sop, schoolProfile)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Unduh PDF A4 Landscape"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSopToDelete(sop);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus SOP (Bak Sampah)"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus SOP (Bak Sampah) */}
      {sopToDelete && (
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
                onClick={() => setSopToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 text-sm">{sopToDelete.identitas.namaSop}</div>
              <div className="text-slate-600 font-mono text-[11px]">Nomor: {sopToDelete.identitas.nomorSop}</div>
              <div className="text-slate-600">
                Kategori: <span className="font-semibold text-slate-800">{sopToDelete.kategori}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p>
                Apakah Anda yakin ingin menghapus SOP ini? Dokumen ini akan dihapus dari daftar tata kelola sekolah.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSopToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const nama = sopToDelete.identitas.namaSop;
                  const id = sopToDelete.id;
                  onDeleteSop(id);
                  setSopToDelete(null);
                  setDeletedNotification(`Dokumen SOP "${nama}" berhasil dihapus.`);
                  setTimeout(() => {
                    setDeletedNotification(null);
                  }, 4000);
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
      {/* Modal Konfirmasi Kosongkan Seluruh SOP */}
      {isConfirmClearAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kosongkan Seluruh Daftar SOP</h3>
                  <p className="text-xs text-slate-500">Hapus semua ({sops.length}) dokumen SOP yang tersimpan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-start space-x-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs leading-relaxed">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <p>
                Apakah Anda yakin ingin <strong>mengosongkan seluruh daftar SOP</strong> saat ini? Tindakan ini akan menghapus semua dokumen SOP dari tabel dan memulihkan ruang kerja menjadi bersih.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearAllOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmClearAllOpen(false);
                  if (onClearAllSops) onClearAllSops();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Ya, Kosongkan Semua</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
