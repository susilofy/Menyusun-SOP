import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Eye,
  FileCheck,
  CheckSquare,
} from "lucide-react";
import { SopDocument, SchoolProfile, CompletenessChecklist } from "../types";

interface ChecklistInspectionViewProps {
  sop: SopDocument;
  schoolProfile: SchoolProfile;
  onBack: () => void;
  onFixWithAi: () => void;
  onOpenPreview: () => void;
}

export const ChecklistInspectionView: React.FC<ChecklistInspectionViewProps> = ({
  sop,
  schoolProfile,
  onBack,
  onFixWithAi,
  onOpenPreview,
}) => {
  // Compute the 19 checklist items based on actual SOP content
  const items = [
    {
      id: 1,
      title: "Identitas sekolah lengkap",
      desc: "Nama sekolah, alamat, dan jenjang terpasang pada kop",
      passed: !!schoolProfile.namaSekolah && !!schoolProfile.alamat,
    },
    {
      id: 2,
      title: "Judul SOP jelas dan operasional",
      desc: "Menyebutkan tindakan operasional spesifik",
      passed: !!sop.identitas.namaSop && sop.identitas.namaSop.length > 5,
    },
    {
      id: 3,
      title: "Nomor SOP tersedia dan sesuai format baku",
      desc: "Memiliki nomor registrasi dokumen",
      passed: !!sop.identitas.nomorSop && sop.identitas.nomorSop !== "-",
    },
    {
      id: 4,
      title: "Tanggal pembuatan terisi",
      desc: "Tanggal penyusunan draf awal tercatat",
      passed: !!sop.identitas.tanggalPembuatan && sop.identitas.tanggalPembuatan !== "-",
    },
    {
      id: 5,
      title: "Tanggal revisi terisi",
      desc: "Mencatat nomor versi revisi (0 atau tanggal)",
      passed: !!sop.identitas.tanggalRevisi,
    },
    {
      id: 6,
      title: "Tanggal pengesahan terisi",
      desc: "Tanggal penetapan resmi oleh Kepala Sekolah",
      passed: !!sop.identitas.tanggalPengesahan && sop.identitas.tanggalPengesahan !== "-",
    },
    {
      id: 7,
      title: "Nama dan NIP Kepala Sekolah sesuai profil",
      desc: "Tercantum nama lengkap dengan gelar dan NIP resmi",
      passed: !!sop.identitas.namaKepalaSekolah && !!sop.identitas.nip,
    },
    {
      id: 8,
      title: "Ruang tanda tangan / validasi pengesahan",
      desc: "Tersedia kolom tanda tangan Kepala Sekolah",
      passed: !!sop.identitas.disahkanOleh,
    },
    {
      id: 9,
      title: "Dasar hukum relevan dan terverifikasi",
      desc: "Mengacu pada UU, PP, dan Permendikdasmen resmi (minimal 2)",
      passed: sop.dasarHukum.length >= 2,
    },
    {
      id: 10,
      title: "Kualifikasi pelaksana realistis",
      desc: "Syarat kompetensi pelaksana disebutkan secara wajar",
      passed: sop.kualifikasiPelaksana.length >= 1,
    },
    {
      id: 11,
      title: "Keterkaitan antar SOP teridentifikasi",
      desc: "Menyebutkan SOP lain yang berhubungan",
      passed: sop.keterkaitan.length >= 1,
    },
    {
      id: 12,
      title: "Peralatan / perlengkapan spesifik",
      desc: "Menyebutkan alat, sarana, format, dan sistem yang dipakai",
      passed: sop.peralatanPerlengkapan.length >= 1,
    },
    {
      id: 13,
      title: "Peringatan / batas kritis terdefinisi",
      desc: "Menjelaskan dampak negatif jika SOP tidak dipatuhi",
      passed: (sop.peringatan?.length || 0) >= 1,
    },
    {
      id: 14,
      title: "Pencatatan dan pendataan arsip jelas",
      desc: "Menentukan penanggung jawab, media simpan, dan retensi",
      passed: !!sop.pencatatanPendataan?.penanggungJawabArsip && (sop.pencatatanPendataan?.dokumenBukti?.length || 0) >= 1,
    },
    {
      id: 15,
      title: "Kolom pelaksana mutu baku lengkap",
      desc: "Memiliki tabel dengan kolom pihak pelaksana yang dinamis",
      passed: (sop.pelaksanaList?.length || 0) >= 2,
    },
    {
      id: 16,
      title: "Kalimat uraian menggunakan kata kerja operasional",
      desc: "Menggunakan kata kerja tindakan (menerima, mencatat, memvalidasi)",
      passed: (sop.tabelPelaksanaMutuBaku?.length || 0) >= 3,
    },
    {
      id: 17,
      title: "Waktu penyelesaian terukur",
      desc: "Setiap langkah memiliki durasi jelas (menit/jam/hari)",
      passed: (sop.tabelPelaksanaMutuBaku || []).every((s) => !!s.waktu && s.waktu !== "-"),
    },
    {
      id: 18,
      title: "Output tiap langkah terdefinisi konkret",
      desc: "Hasil setiap langkah jelas (formulir, berkas, berita acara)",
      passed: (sop.tabelPelaksanaMutuBaku || []).every((s) => !!s.output && s.output !== "-"),
    },
    {
      id: 19,
      title: "Dokumen bukti / formulir pendukung terhubung",
      desc: "Tercantum bukti administratif tertulis yang dapat diaudit",
      passed: (sop.pencatatanPendataan?.dokumenBukti?.length || 0) >= 2,
    },
  ];

  const passedCount = items.filter((i) => i.passed).length;
  const scorePercent = Math.round((passedCount / items.length) * 100);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <FileCheck size={15} />
              <span>Modul Audit & Pemeriksaan Kelengkapan SOP (19 Indikator)</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{sop.identitas.namaSop}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenPreview}
            className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-300"
          >
            <Eye size={14} />
            <span>Lihat Preview Dokumen</span>
          </button>

          <button
            onClick={onFixWithAi}
            className="flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-2xs"
          >
            <Sparkles size={14} />
            <span>Perbaiki Kekurangan dengan AI</span>
          </button>
        </div>
      </div>

      {/* Score Meter Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold border-4 ${
              scorePercent >= 90
                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                : scorePercent >= 75
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-rose-500 bg-rose-50 text-rose-800"
            }`}
          >
            <span className="text-xl leading-none">{scorePercent}%</span>
            <span className="text-[9px] uppercase tracking-wider mt-1 font-semibold">Skor</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tingkat Kelengkapan Administratif: {scorePercent >= 90 ? "Sangat Baik (Siap Sah)" : scorePercent >= 75 ? "Cukup (Perlu Sedikit Perbaikan)" : "Belum Lengkap"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {passedCount} dari 19 indikator administratif baku telah terpenuhi sesuai Kepmenpan RB & Kemendikdasmen.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 size={16} />
            <span>{passedCount} Terpenuhi</span>
          </div>
          <div className="flex items-center space-x-1.5 text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
            <XCircle size={16} />
            <span>{items.length - passedCount} Belum Lengkap</span>
          </div>
        </div>
      </div>

      {/* 19 Checklist Items Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Daftar 19 Indikator Kelayakan SOP Sekolah Dasar
          </span>
          <span className="text-[11px] text-slate-500">
            Standar Akreditasi & Tata Kelola Administrasi SD
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                item.passed ? "hover:bg-slate-50/50" : "bg-rose-50/30 hover:bg-rose-50/50"
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {item.id}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center space-x-2">
                {item.passed ? (
                  <div className="flex items-center space-x-1 text-emerald-700 text-xs font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    <CheckCircle2 size={14} />
                    <span>Lengkap</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-rose-700 text-xs font-semibold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                    <XCircle size={14} />
                    <span>Perlu Dilengkapi</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
