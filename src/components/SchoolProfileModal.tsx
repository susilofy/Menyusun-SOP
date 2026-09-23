import React, { useState, useEffect } from "react";
import { X, Save, Building2, User, FileText, Check, Upload, RotateCcw } from "lucide-react";
import { SchoolProfile } from "../types";
import { DEFAULT_SCHOOL_PROFILE } from "../data/initialData";

interface SchoolProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  onSave: (updated: SchoolProfile, setAsDefault?: boolean) => void;
}

export const SchoolProfileModal: React.FC<SchoolProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Keep form data synchronized whenever profile or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...profile });
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleChange = (field: keyof SchoolProfile, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleResetToExampleDefault = () => {
    if (window.confirm("Muat data profil identitas sekolah default contoh (SD Negeri 3 Loloan Timur)?")) {
      setFormData({ ...DEFAULT_SCHOOL_PROFILE });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logoSekolahUrl" | "logoPemdaUrl") => {
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
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Building2 className="text-indigo-400" size={20} />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Profil Satuan Pendidikan SD</h2>
              <p className="text-xs text-slate-400">Data otomatis terhubung ke seluruh dokumen SOP sekolah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-md p-1 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Identitas Sekolah */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5">
              <div className="flex items-center space-x-2">
                <Building2 size={15} className="text-indigo-600" />
                <span>1. Identitas Satuan Pendidikan</span>
              </div>
              <button
                type="button"
                onClick={handleResetToExampleDefault}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center space-x-1 cursor-pointer normal-case tracking-normal"
                title="Muat profil SD Negeri 3 Loloan Timur sebagai acuan default contoh"
              >
                <RotateCcw size={12} />
                <span>Muat Data Default Contoh</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  required
                  value={formData.namaSekolah}
                  onChange={(e) => handleChange("namaSekolah", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="Contoh: SD Negeri 3 Loloan Timur"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NPSN</label>
                <input
                  type="text"
                  required
                  value={formData.npsn}
                  onChange={(e) => handleChange("npsn", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="Contoh: 50100957"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status Sekolah</label>
                <select
                  value={formData.statusSekolah}
                  onChange={(e) => handleChange("statusSekolah", e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                >
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jenjang</label>
                <input
                  type="text"
                  value={formData.jenjang}
                  onChange={(e) => handleChange("jenjang", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tahun Pelajaran</label>
                <input
                  type="text"
                  value={formData.tahunPelajaran}
                  onChange={(e) => handleChange("tahunPelajaran", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  placeholder="2025/2026"
                />
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="md:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">Alamat Jalan</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => handleChange("alamat", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  placeholder="Jl. Rajawali No. 12"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Desa / Kelurahan</label>
                <input
                  type="text"
                  value={formData.desaKelurahan}
                  onChange={(e) => handleChange("desaKelurahan", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={formData.kecamatan}
                  onChange={(e) => handleChange("kecamatan", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={formData.kabupatenKota}
                  onChange={(e) => handleChange("kabupatenKota", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Provinsi</label>
                <input
                  type="text"
                  value={formData.provinsi}
                  onChange={(e) => handleChange("provinsi", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kode Pos</label>
                <input
                  type="text"
                  value={formData.kodePos}
                  onChange={(e) => handleChange("kodePos", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={formData.nomorTelepon}
                  onChange={(e) => handleChange("nomorTelepon", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Email Resmi Sekolah</label>
                <input
                  type="email"
                  value={formData.emailSekolah}
                  onChange={(e) => handleChange("emailSekolah", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pimpinan & Pengawas */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5">
              <User size={15} className="text-indigo-600" />
              <span>2. Pimpinan & Pembina Sekolah</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Kepala Sekolah (Lengkap Gelar)</label>
                <input
                  type="text"
                  required
                  value={formData.namaKepalaSekolah}
                  onChange={(e) => handleChange("namaKepalaSekolah", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  placeholder="I Ketut Putra Yasa, S.Pd"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={formData.nip}
                  onChange={(e) => handleChange("nip", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  placeholder="19840528 200803 1 002"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor SK Pengangkatan Kepala Sekolah</label>
                <input
                  type="text"
                  value={formData.nomorSkKepalaSekolah}
                  onChange={(e) => handleChange("nomorSkKepalaSekolah", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Pengawas Pembina Sekolah</label>
                <input
                  type="text"
                  value={formData.namaPengawasSekolah}
                  onChange={(e) => handleChange("namaPengawasSekolah", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Nama Dinas Pendidikan yang Menaungi</label>
                <input
                  type="text"
                  value={formData.namaDinasPendidikan}
                  onChange={(e) => handleChange("namaDinasPendidikan", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5"
                  placeholder="Dinas Pendidikan Pemuda dan Olahraga Kabupaten Jembrana"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Format Penomoran SOP */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5">
              <FileText size={15} className="text-indigo-600" />
              <span>3. Format Penomoran Baku Dokumen SOP</span>
            </div>
            <div className="text-xs">
              <label className="block text-slate-700 font-semibold mb-1">Pola Penomoran Otomatis</label>
              <input
                type="text"
                value={formData.formatNomorSop}
                onChange={(e) => handleChange("formatNomorSop", e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-xs text-indigo-700 bg-indigo-50/50"
                placeholder="SOP/SDN3YK/{NOMOR}/{BULAN}/{TAHUN}"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Gunakan variabel: <code className="bg-slate-100 px-1 rounded">&#123;NOMOR&#125;</code>, <code className="bg-slate-100 px-1 rounded">&#123;BULAN&#125;</code>, <code className="bg-slate-100 px-1 rounded">&#123;TAHUN&#125;</code>.
              </p>
            </div>
          </div>

          {/* Section 4: Logo */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5">
              <Upload size={15} className="text-indigo-600" />
              <span>4. Logo Sekolah & Pemda (Untuk Kop Surat SOP)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center">
                <p className="font-semibold text-slate-700 mb-1">Logo Sekolah</p>
                {formData.logoSekolahUrl ? (
                  <div className="relative inline-block">
                    <img src={formData.logoSekolahUrl} alt="Logo Sekolah" className="w-16 h-16 object-contain mx-auto mb-2 border rounded p-1" />
                    <button
                      type="button"
                      onClick={() => handleChange("logoSekolahUrl", "")}
                      className="text-[10px] text-red-600 underline block"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block text-indigo-600 hover:underline">
                    <span>Pilih Gambar PNG/JPG</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "logoSekolahUrl")} />
                  </label>
                )}
              </div>

              <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center">
                <p className="font-semibold text-slate-700 mb-1">Logo Pemda (Opsional)</p>
                {formData.logoPemdaUrl ? (
                  <div className="relative inline-block">
                    <img src={formData.logoPemdaUrl} alt="Logo Pemda" className="w-16 h-16 object-contain mx-auto mb-2 border rounded p-1" />
                    <button
                      type="button"
                      onClick={() => handleChange("logoPemdaUrl", "")}
                      className="text-[10px] text-red-600 underline block"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block text-indigo-600 hover:underline">
                    <span>Pilih Gambar PNG/JPG</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "logoPemdaUrl")} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-800">
                Kunci dan tetapkan profil ini sebagai <strong>Default Baku Satuan Pendidikan</strong>
              </span>
            </label>
            <div className="flex space-x-2 self-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check size={14} />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Simpan Profil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
