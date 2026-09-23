import React, { useRef, useState } from "react";
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Check,
  Info,
  Star,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Trash2,
  Globe,
  ExternalLink,
  User,
  Monitor,
  Copy,
  Terminal,
} from "lucide-react";
import { SopDocument, SchoolProfile } from "../types";
import { SAMPLE_SOPS, DEFAULT_SCHOOL_PROFILE } from "../data/initialData";

interface SettingsViewProps {
  sops: SopDocument[];
  schoolProfile: SchoolProfile;
  onRestoreData: (newSops: SopDocument[], newProfile?: SchoolProfile) => void;
  onOpenProfile: () => void;
  onSaveCurrentAsDefault?: () => void;
  onRestoreCustomDefault?: () => void;
  onClearAllSops?: () => void;
  hasCustomDefault?: boolean;
  customDefaultMetadata?: {
    savedAt?: string;
    totalSops?: number;
    namaSekolah?: string;
  } | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  sops,
  schoolProfile,
  onRestoreData,
  onOpenProfile,
  onSaveCurrentAsDefault,
  onRestoreCustomDefault,
  onClearAllSops,
  hasCustomDefault,
  customDefaultMetadata,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState<"reset-factory" | "restore-default" | "clear-all" | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  // Backup all data as a downloadable JSON
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      schoolProfile,
      sops,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOP_BACKUP_${schoolProfile.namaSekolah.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restore data from JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.sops && Array.isArray(parsed.sops)) {
            onRestoreData(parsed.sops, parsed.schoolProfile);
            alert("Data berhasil dipulihkan dari file backup JSON!");
          } else {
            alert("Format file cadangan tidak valid.");
          }
        } catch (err: any) {
          alert("Gagal membaca file: " + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTriggerSaveDefault = () => {
    if (onSaveCurrentAsDefault) {
      onSaveCurrentAsDefault();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
          <Settings size={16} />
          <span>Pengaturan & Pemeliharaan Sistem</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Penyimpanan Data, Cadangan & Panduan Regulasi
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola data default sekolah, cadangan offline dokumen, dan periksa kesesuaian standar sistem.
        </p>
      </div>

      {/* SECTION BARU: Jadikan Data Default Sistem */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookmarkCheck size={140} />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg border border-amber-400/30">
                <Star size={18} className="fill-amber-400" />
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-wide text-white">
                  Data Acuan Baku / Default Satuan Pendidikan
                </h3>
                <p className="text-xs text-indigo-200">
                  Kunci data yang Anda input saat ini agar selalu menjadi standar default utama sekolah.
                </p>
              </div>
            </div>

            {hasCustomDefault && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                <CheckCircle2 size={13} />
                <span>Default Tersimpan & Aktif</span>
              </span>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-indigo-200 text-[11px] block">Satuan Pendidikan:</span>
              <strong className="text-white text-sm font-semibold">{schoolProfile.namaSekolah}</strong>
              <span className="block text-[11px] text-indigo-300">NPSN: {schoolProfile.npsn}</span>
            </div>
            <div>
              <span className="text-indigo-200 text-[11px] block">Kepala Sekolah:</span>
              <strong className="text-white font-medium">{schoolProfile.namaKepalaSekolah}</strong>
              <span className="block text-[11px] text-indigo-300">NIP: {schoolProfile.nip}</span>
            </div>
            <div>
              <span className="text-indigo-200 text-[11px] block">Total SOP Tersedia:</span>
              <strong className="text-white text-sm font-bold">{sops.length} Dokumen SOP</strong>
              <span className="block text-[11px] text-indigo-300">
                {customDefaultMetadata?.savedAt
                  ? `Pembaruan: ${new Date(customDefaultMetadata.savedAt).toLocaleDateString("id-ID")}`
                  : "Data aktif saat ini"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTriggerSaveDefault}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-2 cursor-pointer ${
                saveSuccess
                  ? "bg-emerald-500 text-white scale-98"
                  : "bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white ring-2 ring-indigo-300/30"
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>✓ Berhasil Ditetapkan Sebagai Default!</span>
                </>
              ) : (
                <>
                  <Star size={16} className="fill-white" />
                  <span>Jadikan Data Saat Ini Sebagai Default</span>
                </>
              )}
            </button>

            {onRestoreCustomDefault && hasCustomDefault && (
              <button
                type="button"
                onClick={() => setConfirmModal("restore-default")}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Terapkan / Muat Ulang Default Ini</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-indigo-200/80 leading-relaxed">
            * Tombol di atas akan menyimpan Profil Sekolah dan {sops.length} Dokumen SOP yang aktif saat ini sebagai baseline sistem (tersimpan di server dan peramban). Saat peramban dibuka ulang atau dilakukan pemulihan, data inilah yang akan digunakan sebagai default resmi sekolah.
          </p>
        </div>
      </div>

      {/* Profil Sekolah Link */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Profil Satuan Pendidikan SD
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nama Sekolah: <strong>{schoolProfile.namaSekolah}</strong> | Kepala Sekolah:{" "}
            <strong>{schoolProfile.namaKepalaSekolah}</strong> (NIP: {schoolProfile.nip})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Muat profil identitas sekolah default contoh (SD Negeri 3 Loloan Timur)?")) {
                onRestoreData(sops, DEFAULT_SCHOOL_PROFILE);
              }
            }}
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer flex items-center space-x-1"
            title="Muat profil default contoh bawaan (SD Negeri 3 Loloan Timur)"
          >
            <RotateCcw size={13} />
            <span>Reset Profil Contoh</span>
          </button>
          <button
            onClick={onOpenProfile}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Edit Profil Lengkap
          </button>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b pb-2">
          Cadangan & Pemulihan Arsip (Offline Backup)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Download size={15} className="text-indigo-600" />
                <span>Ekspor File Cadangan JSON</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Unduh seluruh data profil sekolah dan {sops.length} dokumen SOP ke dalam satu file berkas terenkripsi untuk pengamanan arsip.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="mt-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-3 rounded-lg text-center cursor-pointer"
            >
              Unduh File Backup (.json)
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Upload size={15} className="text-indigo-600" />
                <span>Pulihkan dari File Cadangan</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Unggah file JSON cadangan yang pernah diunduh sebelumnya untuk memulihkan seluruh dokumen ke kondisi semula.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold py-2 px-3 rounded-lg text-center cursor-pointer"
              >
                Pilih File Cadangan (.json)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            {onClearAllSops && (
              <button
                type="button"
                onClick={() => setConfirmModal("clear-all")}
                className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center space-x-1 font-semibold cursor-pointer"
                title="Kosongkan seluruh dokumen SOP yang tersimpan"
              >
                <Trash2 size={13} />
                <span>Kosongkan Seluruh Daftar SOP</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setConfirmModal("reset-factory")}
            className="text-xs text-slate-500 hover:text-slate-800 hover:underline flex items-center space-x-1 font-medium cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset ke Dokumen Bawaan Contoh Awal</span>
          </button>
        </div>
      </div>

      {/* Regulatory Standards Info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs text-slate-600">
        <h3 className="font-bold text-slate-800 uppercase tracking-wide border-b pb-2 flex items-center space-x-2">
          <Info size={15} className="text-indigo-600" />
          <span>Rujukan Standar Format & Peraturan</span>
        </h3>
        <p>
          Aplikasi <strong>SOP SMART SCHOOL</strong> dirancang khusus mematuhi:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
          <li>
            <strong>Permenpan RB Nomor 35 Tahun 2012</strong> tentang Pedoman Penyusunan Standar Operasional Prosedur Administrasi Pemerintahan (Format Pelaksana Mutu Baku, lambang diagram alur flow, kualifikasi, peringatan).
          </li>
          <li>
            <strong>Standar Nasional Pendidikan (SNP)</strong> jenjang Sekolah Dasar (PP No. 57 Tahun 2021 jo. PP No. 4 Tahun 2022).
          </li>
          <li>
            <strong>Pedoman Tata Kelola Satuan Pendidikan</strong> Kementerian Pendidikan Dasar dan Menengah RI.
          </li>
          <li>
            <strong>Standar Ukuran Cetak:</strong> A4 Landscape (297 mm × 210 mm) dengan batas margin resmi dan kop sekolah terintegrasi.
          </li>
        </ul>
      </div>

      {/* Windows Desktop (.EXE) Electron Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
              <Monitor size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Aplikasi Desktop Windows (.exe) dengan Electron
              </h3>
              <p className="text-xs text-slate-500">
                Aplikasi ini sudah dikonfigurasi penuh dengan Electron & electron-builder untuk di-compile menjadi installer (.exe).
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check size={12} />
            <span>Electron Siap Digunakan</span>
          </span>
        </div>

        {/* 1-Click BAT Feature Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider">
                Metode 1-Klik Paling Mudah
              </span>
              <span className="text-xs font-bold text-emerald-900">
                File: buat-program-exe.bat
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              Cukup ekstrak file ZIP proyek ini di laptop Windows Anda, lalu <strong>klik 2x file buat-program-exe.bat</strong>. Seluruh proses instalasi dependensi dan perakitan ke file .exe akan berjalan otomatis!
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => copyToClipboard("buat-program-exe.bat", "bat")}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              {copiedCmd === "bat" ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span>Nama File Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Salin Nama File</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Terminal size={14} className="text-indigo-600" />
                <span>1. Uji Coba Mode Desktop</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard("npm run electron:dev", "dev")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200"
              >
                {copiedCmd === "dev" ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-600">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Menjalankan aplikasi langsung dalam jendela desktop Windows mandiri sebelum di-compile:
            </p>
            <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
              npm run electron:dev
            </pre>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Terminal size={14} className="text-indigo-600" />
                <span>2. Buat File Installer .EXE Windows</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard("npm run electron:build:win", "build")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200"
              >
                {copiedCmd === "build" ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-600">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Mengompilasi proyek menjadi file installer setup (.exe) & portable (.exe) di folder <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">release/</code>:
            </p>
            <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
              npm run electron:build:win
            </pre>
          </div>
        </div>

        <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
          <p className="font-semibold flex items-center space-x-1.5 text-indigo-800">
            <Info size={14} />
            <span>Catatan Persiapan di Windows:</span>
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-indigo-950/80">
            <li>Pastikan laptop/komputer sudah terpasang <strong>Node.js (v20+ LTS)</strong> dari nodejs.org.</li>
            <li>Hasil build menghasilkan 2 file di folder <strong>release/</strong>: <em>Setup Installer</em> dan <em>Portable EXE</em>.</li>
            <li>Panduan lengkap langkah demi langkah tersedia di berkas <strong>PANDUAN_BUILD_EXE_WINDOWS.md</strong> pada direktori utama.</li>
          </ul>
        </div>
      </div>

      {/* Developer Information Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b pb-2 flex items-center space-x-2">
          <User size={15} className="text-indigo-600" />
          <span>Informasi Pengembang Aplikasi</span>
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-900">
                Susilo Fitri Yatmoko, M.Pd
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                Pengembang Aplikasi
              </span>
            </div>
            <p className="text-xs text-slate-500">
              SOP SMART SCHOOL — Sistem Terpadu Penyusunan & Manajemen SOP Satuan Pendidikan Sekolah Dasar.
            </p>
          </div>
          <a
            href="https://www.gurumerangkum.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer shrink-0 group"
            title="Kunjungi Website Pengembang: https://www.gurumerangkum.com/"
          >
            <Globe size={14} className="text-indigo-400 group-hover:text-white transition-colors" />
            <span>Kunjungi www.gurumerangkum.com</span>
            <ExternalLink size={12} className="text-slate-400 group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>

      {/* Modal Dialog Konfirmasi Reset / Pulihkan / Kosongkan */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    confirmModal === "clear-all"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {confirmModal === "clear-all" ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {confirmModal === "reset-factory"
                      ? "Reset ke Contoh Bawaan Awal"
                      : confirmModal === "clear-all"
                      ? "Kosongkan Seluruh Daftar SOP"
                      : "Muat Ulang Data Default Sekolah"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {confirmModal === "reset-factory"
                      ? "Mengembalikan sistem ke draf template contoh awal."
                      : confirmModal === "clear-all"
                      ? `Hapus semua (${sops.length}) dokumen SOP yang tersimpan.`
                      : "Menerapkan data default sekolah yang telah Anda tetapkan sebelumnya."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {confirmModal === "reset-factory"
                ? "Seluruh dokumen yang sedang aktif akan digantikan dengan dokumen draf contoh sistem awal. Pastikan Anda telah mengekspor cadangan berkas jika diperlukan."
                : confirmModal === "clear-all"
                ? "Apakah Anda yakin ingin mengosongkan seluruh daftar SOP? Semua dokumen SOP yang ada akan dihapus sehingga ruang kerja menjadi bersih untuk menyusun SOP baru."
                : "Dokumen yang sedang aktif akan diperbarui sesuai dengan data acuan baku default sekolah yang telah disimpan."}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal === "reset-factory") {
                    onRestoreData(SAMPLE_SOPS, DEFAULT_SCHOOL_PROFILE);
                  } else if (confirmModal === "restore-default" && onRestoreCustomDefault) {
                    onRestoreCustomDefault();
                  } else if (confirmModal === "clear-all" && onClearAllSops) {
                    onClearAllSops();
                  }
                  setConfirmModal(null);
                }}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer ${
                  confirmModal === "reset-factory" || confirmModal === "clear-all"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {confirmModal === "clear-all" ? (
                  <>
                    <Trash2 size={14} />
                    <span>Ya, Kosongkan Semua</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>
                      {confirmModal === "reset-factory" ? "Ya, Reset Contoh" : "Ya, Terapkan Default"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
