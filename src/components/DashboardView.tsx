import React from "react";
import {
  FileText,
  FileCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  Eye,
  Edit3,
  FileDown,
  Download,
  Building,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  Globe,
  ExternalLink,
} from "lucide-react";
import { SopDocument, SchoolProfile } from "../types";
import { exportSopToDocx } from "../utils/docxExport";
import { exportSopToPdf } from "../utils/pdfExport";

interface DashboardViewProps {
  sops: SopDocument[];
  schoolProfile: SchoolProfile;
  onOpenCreateWizard: () => void;
  onOpenNeedsAnalysis: () => void;
  onSelectSop: (sop: SopDocument) => void;
  onPreviewSop: (sop: SopDocument) => void;
  onEditSop: (sop: SopDocument) => void;
  onGoToTab: (tab: any, statusFilter?: string) => void;
  onOpenProfile?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sops,
  schoolProfile,
  onOpenCreateWizard,
  onOpenNeedsAnalysis,
  onSelectSop,
  onPreviewSop,
  onEditSop,
  onGoToTab,
  onOpenProfile,
}) => {
  const totalSops = sops.length;
  const draftSops = sops.filter((s) => s.status === "DRAFT" || s.status === "REVIEW").length;
  const approvedSops = sops.filter((s) => s.status === "DISAHKAN" || s.status === "AKTIF").length;
  const needsReviewSops = sops.filter((s) => s.status === "PERLU_DITINJAU" || s.status === "REVISI").length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-1 rounded-full text-indigo-300 text-xs font-semibold">
              <Sparkles size={13} />
              <span>SOP SMART SCHOOL — Sistem Manajemen Dokumen SD</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Panel Pengendalian SOP {schoolProfile.namaSekolah}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Selamat datang Bapak/Ibu <strong>{schoolProfile.namaKepalaSekolah}</strong>. Kelola seluruh Standar Operasional Prosedur sekolah secara baku, terintegrasi dengan regulasi resmi, siap audit, serta siap cetak dokumen format A4 Landscape.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer backdrop-blur-xs"
                title="Kelola Profil Satuan Pendidikan"
              >
                <Building2 size={15} className="text-indigo-300" />
                <span>Profil Sekolah</span>
              </button>
            )}

            <button
              onClick={onOpenNeedsAnalysis}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center space-x-2 transition-all"
            >
              <Award size={15} className="text-indigo-400" />
              <span>Analisis Kebutuhan</span>
            </button>

            <button
              onClick={onOpenCreateWizard}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Sparkles size={15} />
              <span>Asisten AI Menyusun SOP</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* School Profile Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Building2 size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Profil Satuan Pendidikan</span>
              {schoolProfile.npsn && (
                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded border border-slate-200">
                  NPSN: {schoolProfile.npsn}
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {schoolProfile.namaSekolah}
            </div>
            <div className="text-xs text-slate-500 truncate">
              Kepala Sekolah: <span className="font-semibold text-slate-700">{schoolProfile.namaKepalaSekolah}</span> (NIP: {schoolProfile.nip || "-"}) • {schoolProfile.kabupatenKota}, {schoolProfile.provinsi}
            </div>
          </div>
        </div>

        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className="inline-flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-indigo-200 transition-colors cursor-pointer shrink-0"
          >
            <Building2 size={14} />
            <span>Kelola Profil Lengkap</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SOP */}
        <div
          onClick={() => onGoToTab("daftar-sop", "ALL")}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Koleksi SOP</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{totalSops}</span>
            <span className="text-xs text-slate-500">dokumen resmi</span>
          </div>
          <div className="mt-3 text-[11px] text-indigo-600 font-semibold flex items-center space-x-1">
            <span>Lihat seluruh daftar</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* SOP Disahkan / Aktif */}
        <div
          onClick={() => onGoToTab("daftar-sop", "DISAHKAN")}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Disahkan & Aktif</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileCheck size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{approvedSops}</span>
            <span className="text-xs text-emerald-600 font-semibold">Berlaku sah</span>
          </div>
          <div className="mt-3 text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
            <span>Arsip dokumen berkekuatan hukum</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* SOP Draft / Review */}
        <div
          onClick={() => onGoToTab("daftar-sop", "DRAFT")}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Draf Menunggu Review</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{draftSops}</span>
            <span className="text-xs text-amber-600 font-semibold">Perlu telaah</span>
          </div>
          <div className="mt-3 text-[11px] text-amber-700 font-semibold flex items-center space-x-1">
            <span>Buka daftar draf</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Perlu Ditinjau / Revisi */}
        <div
          onClick={() => onGoToTab("arsip")}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Jadwal Review Tahunan</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{needsReviewSops}</span>
            <span className="text-xs text-rose-600 font-semibold">Tinjau regulasi</span>
          </div>
          <div className="mt-3 text-[11px] text-rose-700 font-semibold flex items-center space-x-1">
            <span>Audit kesesuaian SOP</span>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>

      {/* Main Table: Daftar SOP Terbaru */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Dokumen SOP Sekolah ({sops.length})
            </h3>
            <p className="text-xs text-slate-500">
              Format baku Pelaksana Mutu Baku siap cetak A4 Landscape & unduh Word
            </p>
          </div>

          <button
            onClick={() => onGoToTab("daftar-sop")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>Buka Seluruh Tabel</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Nama Dokumen SOP</th>
                <th className="p-3">Nomor SOP</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Versi</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="max-w-md mx-auto space-y-3 py-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                        <FileText size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Daftar SOP Masih Kosong</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Belum ada dokumen SOP yang dibuat. Mulai susun SOP pertama sekolah Anda dengan asisten AI atau buka analisis kebutuhan.
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={onOpenCreateWizard}
                          className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          <Sparkles size={13} />
                          <span>Asisten AI Menyusun SOP</span>
                        </button>
                        <button
                          type="button"
                          onClick={onOpenNeedsAnalysis}
                          className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                        >
                          <Award size={13} className="text-indigo-600" />
                          <span>Analisis Kebutuhan</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sops.map((sop, idx) => (
                <tr key={sop.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>

                  <td className="p-3">
                    <div
                      onClick={() => onSelectSop(sop)}
                      className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                    >
                      {sop.identitas.namaSop}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
                      {sop.pelaksanaList.join(" • ")}
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
                        title="Buka Editor & AI Assistant"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => exportSopToDocx(sop, schoolProfile)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Download Word (.docx)"
                      >
                        <FileDown size={15} />
                      </button>

                      <button
                        onClick={() => exportSopToPdf(sop, schoolProfile)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Download PDF"
                      >
                        <Download size={15} />
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

      {/* Developer Attribution Card & Web Link */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Globe size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Pengembang Aplikasi</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Pendidik & Pengembang
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              Susilo Fitri Yatmoko, M.Pd
            </h4>
          </div>
        </div>
        <a
          href="https://www.gurumerangkum.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer shrink-0 group"
          title="Kunjungi https://www.gurumerangkum.com/"
        >
          <Globe size={15} className="text-indigo-400 group-hover:text-white transition-colors" />
          <span>Kunjungi Web Pengembang</span>
          <ExternalLink size={13} className="text-slate-400 group-hover:text-white transition-colors" />
        </a>
      </div>
    </div>
  );
};
