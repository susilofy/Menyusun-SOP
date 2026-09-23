import React, { useState } from "react";
import {
  X,
  UserCheck,
  CheckCircle,
  FileCheck,
  Upload,
  QrCode,
  PenTool,
  ShieldCheck,
} from "lucide-react";
import { SopDocument, SchoolProfile, ApprovalSignature } from "../types";

interface ApprovalSectionProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SopDocument;
  schoolProfile: SchoolProfile;
  onApprove: (updatedSop: SopDocument) => void;
}

export const ApprovalSection: React.FC<ApprovalSectionProps> = ({
  isOpen,
  onClose,
  sop,
  schoolProfile,
  onApprove,
}) => {
  const [sigType, setSigType] = useState<"manual" | "gambar" | "digital">("digital");
  const [sigImageUrl, setSigImageUrl] = useState<string>("");
  const [tanggalPengesahan, setTanggalPengesahan] = useState<string>(
    new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  );
  const [catatanPengesahan, setCatatanPengesahan] = useState<string>(
    "SOP telah diperiksa dan disetujui untuk diberlakukan secara resmi di lingkungan satuan pendidikan."
  );

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSigImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmApproval = () => {
    const sigData: ApprovalSignature = {
      tipe: sigType,
      tandaTanganUrl: sigImageUrl,
      barcodeUrl: sigType === "digital" ? `VERIF-${sop.id}-${Date.now()}` : undefined,
      tanggalPengesahan,
      namaKepalaSekolah: sop.identitas.namaKepalaSekolah || schoolProfile.namaKepalaSekolah,
      nip: sop.identitas.nip || schoolProfile.nip,
      jabatan: `Kepala ${schoolProfile.namaSekolah}`,
      catatanPengesahan,
    };

    const approvedSop: SopDocument = {
      ...sop,
      status: "DISAHKAN",
      identitas: {
        ...sop.identitas,
        tanggalPengesahan,
        disahkanOleh: `Kepala ${schoolProfile.namaSekolah}`,
      },
      tandaTanganDisahkan: sigData,
      riwayatRevisi: [
        ...(sop.riwayatRevisi || []),
        {
          version: sop.versi,
          tanggal: tanggalPengesahan,
          diubahOleh: schoolProfile.namaKepalaSekolah,
          peran: "Kepala Sekolah",
          bagianDiubah: "Pengesahan Resmi Dokumen",
          alasanRevisi: `Pengesahan resmi SOP oleh Kepala Sekolah: ${catatanPengesahan}`,
        },
      ],
    };

    onApprove(approvedSop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="text-emerald-400" size={20} />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Pengesahan Resmi Dokumen SOP</h2>
              <p className="text-xs text-slate-400">Otoritas Kepala Sekolah Dasar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white rounded-md p-1">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="text-slate-500 font-medium">SOP yang akan disahkan:</div>
            <div className="font-bold text-slate-900 text-sm">{sop.identitas.namaSop}</div>
            <div className="text-[11px] text-slate-500 font-mono">Nomor: {sop.identitas.nomorSop}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tanggal Pengesahan</label>
              <input
                type="text"
                value={tanggalPengesahan}
                onChange={(e) => setTanggalPengesahan(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Jabatan Pengesah</label>
              <input
                type="text"
                disabled
                value={`Kepala ${schoolProfile.namaSekolah}`}
                className="w-full border border-slate-200 bg-slate-100 rounded-lg p-2 font-medium text-slate-600"
              />
            </div>
          </div>

          {/* Signature Type Tabs */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Metode Tanda Tangan & Validasi:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSigType("digital")}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  sigType === "digital"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-500"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck size={18} />
                <span className="text-[11px]">Validasi Digital</span>
              </button>

              <button
                type="button"
                onClick={() => setSigType("gambar")}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  sigType === "gambar"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-500"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Upload size={18} />
                <span className="text-[11px]">Upload TTD</span>
              </button>

              <button
                type="button"
                onClick={() => setSigType("manual")}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  sigType === "manual"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-500"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <PenTool size={18} />
                <span className="text-[11px]">Cetak Manual</span>
              </button>
            </div>
          </div>

          {/* Type specific config */}
          {sigType === "digital" && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Validasi Keaslian Dokumen Digital</span>
              </div>
              <p>
                Dokumen akan dibubuhi cap verifikasi sistem resmi sekolah dan status SOP langsung diubah menjadi <strong>DISAHKAN & AKTIF</strong>.
              </p>
            </div>
          )}

          {sigType === "gambar" && (
            <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center">
              {sigImageUrl ? (
                <div>
                  <img src={sigImageUrl} alt="Tanda Tangan" className="h-16 mx-auto object-contain mb-2" />
                  <button
                    type="button"
                    onClick={() => setSigImageUrl("")}
                    className="text-[10px] text-red-600 underline"
                  >
                    Ganti Gambar
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block text-indigo-600 hover:underline">
                  <span>Pilih file gambar TTD (PNG transparan)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          )}

          {sigType === "manual" && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px]">
              Tersedia ruang tanda tangan kosong untuk dibubuhi tanda tangan basah Kepala Sekolah dan stempel cap dinas sekolah setelah dicetak.
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Catatan Pengesahan</label>
            <textarea
              rows={2}
              value={catatanPengesahan}
              onChange={(e) => setCatatanPengesahan(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmApproval}
            className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <CheckCircle size={14} />
            <span>Sahkan Dokumen Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
