import React from "react";
import { Archive, AlertTriangle, Clock, RefreshCw, Eye, Edit3, Calendar, CheckCircle2 } from "lucide-react";
import { SopDocument, SchoolProfile } from "../types";

interface ArchiveAndReviewViewProps {
  sops: SopDocument[];
  schoolProfile: SchoolProfile;
  onPreviewSop: (sop: SopDocument) => void;
  onEditSop: (sop: SopDocument) => void;
}

export const ArchiveAndReviewView: React.FC<ArchiveAndReviewViewProps> = ({
  sops,
  schoolProfile,
  onPreviewSop,
  onEditSop,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-100">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Archive size={16} />
            <span>Manajemen Siklus Hidup & Jadwal Review SOP</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Pemantauan Kepatuhan, Jadwal Review Tahunan & Arsip Dokumen
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SOP wajib ditinjau secara berkala (minimal 1 tahun sekali) sesuai dinamika regulasi dan kondisi sekolah.
          </p>
        </div>
      </div>

      {/* Review Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>SOP Aktif Berlaku</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {sops.filter((s) => s.status === "DISAHKAN" || s.status === "AKTIF").length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Masa berlaku masih optimal untuk tahun pelajaran {schoolProfile.tahunPelajaran}.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Perlu Ditinjau Segera</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {sops.filter((s) => s.status === "PERLU_DITINJAU" || s.status === "REVISI").length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Mendekati masa evaluasi 12 bulan atau mengalami revisi regulasi.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Draf Dalam Penyusunan</span>
            <Clock size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-2">
            {sops.filter((s) => s.status === "DRAFT" || s.status === "REVIEW").length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Belum disahkan oleh Kepala Sekolah.
          </p>
        </div>
      </div>

      {/* Review Tracking Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-xs uppercase tracking-wide text-slate-800">
          Daftar Siklus Evaluasi Seluruh SOP
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                <th className="p-3">Nama Dokumen SOP</th>
                <th className="p-3">Nomor Registrasi</th>
                <th className="p-3">Tanggal Pengesahan</th>
                <th className="p-3">Jadwal Review Tahunan</th>
                <th className="p-3">Status Dokumen</th>
                <th className="p-3 text-right">Aksi Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sops.map((sop, idx) => (
                <tr key={sop.id || idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{sop.identitas.namaSop}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">{sop.identitas.nomorSop}</td>
                  <td className="p-3 text-slate-600">{sop.identitas.tanggalPengesahan || "-"}</td>
                  <td className="p-3 text-slate-700 font-medium flex items-center space-x-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Desember {new Date().getFullYear()}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        sop.status === "DISAHKAN" || sop.status === "AKTIF"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {sop.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onPreviewSop(sop)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 rounded"
                        title="Preview"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => onEditSop(sop)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 rounded"
                        title="Tinjau Ulang & Revisi"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
