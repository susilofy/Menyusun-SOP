import React, { useState, useEffect } from "react";
import {
  Building2,
  User,
  FileText,
  Upload,
  RotateCcw,
  Save,
  Check,
  CheckCircle2,
  Star,
  Sparkles,
  ArrowRight,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import { SchoolProfile } from "../types";
import { DEFAULT_SCHOOL_PROFILE } from "../data/initialData";

interface SchoolProfileViewProps {
  profile: SchoolProfile;
  onSave: (updated: SchoolProfile, setAsDefault?: boolean) => void;
  onGoToTab?: (tab: any) => void;
}

export const SchoolProfileView: React.FC<SchoolProfileViewProps> = ({
  profile,
  onSave,
  onGoToTab,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  const handleChange = (field: keyof SchoolProfile, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleResetToExampleDefault = () => {
    if (
      window.confirm(
        "Muat data profil identitas sekolah default contoh (SD Negeri 3 Loloan Timur)?"
      )
    ) {
      setFormData({ ...DEFAULT_SCHOOL_PROFILE });
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoSekolahUrl" | "logoPemdaUrl" | "tandaTanganUrl" | "stempelUrl"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange(field, event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, setAsDefault);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  // Generate dynamic live sample SOP number
  const sampleSopNumber = (() => {
    const pattern = formData.formatNomorSop || "SOP/SD/{NOMOR}/{BULAN}/{TAHUN}";
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    return pattern
      .replace("{NOMOR}", "001")
      .replace("{BULAN}", currentMonth)
      .replace("{TAHUN}", currentYear);
  })();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Header Bar */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Pengaturan Master
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                  Data Baku Otomatis
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Profil Satuan Pendidikan
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Data resmi identitas sekolah ini otomatis digunakan di seluruh dokumen SOP, kop surat, lembar pengesahan, dan ekspor Word & PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={handleResetToExampleDefault}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Muat data SD Negeri 3 Loloan Timur sebagai contoh"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Data Contoh Bawaan</span>
              <span className="sm:hidden">Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-2 cursor-pointer ${
                savedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow"
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Profil Berhasil Disimpan!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in duration-200">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <div>
              <strong>Perubahan berhasil disimpan!</strong> Seluruh dokumen SOP dan pratinjau cetak kini telah diperbarui dengan data satuan pendidikan terbaru.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identitas Sekolah */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Identitas Resmi Satuan Pendidikan
                  </h2>
                  <p className="text-xs text-slate-500">
                    Informasi nama resmi, NPSN, dan alamat lembaga pendidikan
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Nama Satuan Pendidikan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaSekolah}
                  onChange={(e) => handleChange("namaSekolah", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  placeholder="Contoh: SD Negeri 3 Loloan Timur"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  NPSN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.npsn}
                  onChange={(e) => handleChange("npsn", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  placeholder="Contoh: 50100957"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Status Sekolah
                </label>
                <select
                  value={formData.statusSekolah}
                  onChange={(e) => handleChange("statusSekolah", e.target.value as any)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                >
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Jenjang Pendidikan
                </label>
                <input
                  type="text"
                  value={formData.jenjang}
                  onChange={(e) => handleChange("jenjang", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  placeholder="Sekolah Dasar (SD)"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  value={formData.tahunPelajaran}
                  onChange={(e) => handleChange("tahunPelajaran", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  placeholder="2025/2026"
                />
              </div>

              {/* Alamat Lengkap */}
              <div className="md:col-span-3 pt-2">
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Alamat Jalan Lengkap
                </label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => handleChange("alamat", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  placeholder="Jalan Krakatau, Loloan Timur"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Desa / Kelurahan
                </label>
                <input
                  type="text"
                  value={formData.desaKelurahan}
                  onChange={(e) => handleChange("desaKelurahan", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  placeholder="Loloan Timur"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.kecamatan}
                  onChange={(e) => handleChange("kecamatan", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  placeholder="Kec. Jembrana"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={formData.kabupatenKota}
                  onChange={(e) => handleChange("kabupatenKota", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  placeholder="Kab. Jembrana"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={formData.provinsi}
                  onChange={(e) => handleChange("provinsi", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  placeholder="Bali"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={formData.kodePos}
                  onChange={(e) => handleChange("kodePos", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  placeholder="82218"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={formData.nomorTelepon}
                  onChange={(e) => handleChange("nomorTelepon", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  placeholder="0365-41234"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Email Resmi Sekolah
                </label>
                <input
                  type="email"
                  value={formData.emailSekolah}
                  onChange={(e) => handleChange("emailSekolah", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  placeholder="sdnegeri3loloantimur@gmail.com"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pimpinan & Pembina */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Pimpinan & Pembina Sekolah
                </h2>
                <p className="text-xs text-slate-500">
                  Data pejabat penetap SOP dan instansi pembina
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Nama Kepala Sekolah (Lengkap dengan Gelar) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaKepalaSekolah}
                  onChange={(e) => handleChange("namaKepalaSekolah", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  placeholder="Susilo Fitri Yatmoko, M.Pd."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.nip}
                  onChange={(e) => handleChange("nip", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  placeholder="19840528 200803 1 002"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Nomor SK Pengangkatan Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.nomorSkKepalaSekolah}
                  onChange={(e) => handleChange("nomorSkKepalaSekolah", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  placeholder="Contoh: 821.2/123/BKPSDM/2024"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Nama Pengawas Pembina Sekolah
                </label>
                <input
                  type="text"
                  value={formData.namaPengawasSekolah}
                  onChange={(e) => handleChange("namaPengawasSekolah", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  placeholder="Contoh: I Ketut Suardana, M.Pd."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Nama Dinas Pendidikan yang Menaungi
                </label>
                <input
                  type="text"
                  value={formData.namaDinasPendidikan}
                  onChange={(e) => handleChange("namaDinasPendidikan", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  placeholder="Dinas Pendidikan Kepemudaan dan Olahraga Kabupaten Jembrana"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Format Penomoran SOP */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Format Penomoran Baku Dokumen SOP
                </h2>
                <p className="text-xs text-slate-500">
                  Struktur kode penomoran otomatis saat membuat SOP baru
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Pola Penomoran Dokumen
                </label>
                <input
                  type="text"
                  value={formData.formatNomorSop}
                  onChange={(e) => handleChange("formatNomorSop", e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-indigo-700 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-semibold"
                  placeholder="SOP/SDN3LT/{NOMOR}/{BULAN}/{TAHUN}"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-indigo-900 block">
                    Pratinjau Hasil Nomor SOP Otomatis:
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-700">
                    {sampleSopNumber}
                  </span>
                </div>
                <div className="text-[11px] text-indigo-700/80">
                  Variabel: <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">&#123;NOMOR&#125;</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">&#123;BULAN&#125;</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">&#123;TAHUN&#125;</code>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Logo & Kop Surat */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Logo Resmi & Kop Surat SOP
                </h2>
                <p className="text-xs text-slate-500">
                  Gambar logo yang dicantumkan pada kop surat dan halaman depan SOP
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Logo Sekolah */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <p className="font-bold text-slate-800 mb-1">Logo Sekolah / Tut Wuri Handayani</p>
                <p className="text-[11px] text-slate-500 mb-3">Tampil di sisi kiri/kanan kop surat dokumen SOP</p>

                {formData.logoSekolahUrl ? (
                  <div className="space-y-2">
                    <img
                      src={formData.logoSekolahUrl}
                      alt="Logo Sekolah"
                      className="w-20 h-20 object-contain mx-auto border border-slate-200 rounded-xl p-1.5 bg-white shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange("logoSekolahUrl", "")}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                    >
                      Hapus Logo Sekolah
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex flex-col items-center justify-center p-3 border border-indigo-200 rounded-xl bg-white hover:bg-indigo-50 text-indigo-600 transition-colors">
                    <Upload size={20} className="mb-1 text-indigo-500" />
                    <span className="font-semibold text-xs">Pilih Gambar Logo Sekolah (PNG/JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "logoSekolahUrl")}
                    />
                  </label>
                )}
              </div>

              {/* Logo Pemda */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <p className="font-bold text-slate-800 mb-1">Logo Pemda / Dinas (Opsional)</p>
                <p className="text-[11px] text-slate-500 mb-3">Lambang Pemerintah Daerah Kabupaten/Kota</p>

                {formData.logoPemdaUrl ? (
                  <div className="space-y-2">
                    <img
                      src={formData.logoPemdaUrl}
                      alt="Logo Pemda"
                      className="w-20 h-20 object-contain mx-auto border border-slate-200 rounded-xl p-1.5 bg-white shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange("logoPemdaUrl", "")}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                    >
                      Hapus Logo Pemda
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex flex-col items-center justify-center p-3 border border-indigo-200 rounded-xl bg-white hover:bg-indigo-50 text-indigo-600 transition-colors">
                    <Upload size={20} className="mb-1 text-indigo-500" />
                    <span className="font-semibold text-xs">Pilih Gambar Logo Pemda (PNG/JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "logoPemdaUrl")}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Tetapkan Sebagai Default & Tombol Simpan Bawah */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-start sm:items-center space-x-3 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="mt-0.5 sm:mt-0 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
              />
              <span className="leading-relaxed">
                Tetapkan dan kunci data ini sebagai <strong>Default Utama Satuan Pendidikan</strong> (tersimpan di server & peramban).
              </span>
            </label>

            <button
              type="submit"
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer shrink-0 ${
                savedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md"
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Profil Berhasil Disimpan!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Simpan Seluruh Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
