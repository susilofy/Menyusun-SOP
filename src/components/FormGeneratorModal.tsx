import React, { useState } from "react";
import { X, Sparkles, Printer, FileSpreadsheet, Loader2, Download, FileDown } from "lucide-react";
import { SopDocument, SchoolProfile, GeneratedFormDoc } from "../types";
import { exportFormToDocx } from "../utils/docxExport";

interface FormGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SopDocument;
  schoolProfile: SchoolProfile;
}

export const FormGeneratorModal: React.FC<FormGeneratorModalProps> = ({
  isOpen,
  onClose,
  sop,
  schoolProfile,
}) => {
  const [selectedFormName, setSelectedFormName] = useState<string>(
    sop.pencatatanPendataan?.dokumenBukti?.[0] || "Formulir Pelaksanaan Prosedur"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<GeneratedFormDoc | null>(null);

  if (!isOpen) return null;

  const handleDownloadDoc = async () => {
    if (!generatedForm) return;
    setIsDownloadingDoc(true);
    try {
      await exportFormToDocx(generatedForm, sop, schoolProfile);
    } catch (err) {
      console.error("Gagal mengunduh file DOC formulir:", err);
    } finally {
      setIsDownloadingDoc(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formName: selectedFormName,
          sopTitle: sop.identitas.namaSop,
          schoolProfile,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedForm(data);
        return;
      }
      // Fallback standardized form
      setGeneratedForm({
        namaFormulir: selectedFormName,
        fields: [
          { label: "Hari / Tanggal Pelaksanaan", type: "text", wajib: true, placeholder: "Contoh: Senin, 10 Januari" },
          { label: "Nama Petugas / Guru Pelaksana", type: "text", wajib: true, placeholder: "Nama lengkap dan gelar" },
          { label: "Uraian Hasil Kegiatan / Tindakan", type: "textarea", wajib: true, placeholder: "Deskripsi rinci hasil kegiatan" },
          { label: "Catatan Tindak Lanjut", type: "textarea", wajib: false, placeholder: "Rekomendasi atau catatan khusus" },
          { label: "Status Verifikasi", type: "text", wajib: true, placeholder: "Sesuai Prosedur / Perlu Perbaikan" },
        ],
      });
    } catch {
      // Fallback on error
      setGeneratedForm({
        namaFormulir: selectedFormName,
        fields: [
          { label: "Hari / Tanggal Pelaksanaan", type: "text", wajib: true, placeholder: "Contoh: Senin, 10 Januari" },
          { label: "Nama Petugas / Guru Pelaksana", type: "text", wajib: true, placeholder: "Nama lengkap dan gelar" },
          { label: "Uraian Hasil Kegiatan / Tindakan", type: "textarea", wajib: true, placeholder: "Deskripsi rinci hasil kegiatan" },
          { label: "Catatan Tindak Lanjut", type: "textarea", wajib: false, placeholder: "Rekomendasi atau catatan khusus" },
          { label: "Status Verifikasi", type: "text", wajib: true, placeholder: "Sesuai Prosedur / Perlu Perbaikan" },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintForm = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="text-indigo-400" size={20} />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Generator Formulir & Bukti Administrasi Pendukung
              </h2>
              <p className="text-xs text-slate-400">Terkait langsung dengan {sop.identitas.namaSop}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white rounded-md p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Form Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 uppercase tracking-wide">
              Pilih Dokumen Bukti yang Ingin Dibuat:
            </label>
            <div className="flex space-x-2">
              <select
                value={selectedFormName}
                onChange={(e) => setSelectedFormName(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg p-2 bg-white font-medium"
              >
                {(sop.pencatatanPendataan?.dokumenBukti || []).map((dok, i) => (
                  <option key={i} value={dok}>
                    {dok}
                  </option>
                ))}
                <option value="Berita Acara Pelaksanaan Prosedur">Berita Acara Pelaksanaan Prosedur</option>
                <option value="Tanda Terima Berkas & Dokumen">Tanda Terima Berkas & Dokumen</option>
              </select>

              <button
                disabled={isLoading}
                onClick={handleGenerate}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-2xs"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>Buat Formulir dengan AI</span>
              </button>
            </div>
          </div>

          {/* Form Preview */}
          {generatedForm ? (
            <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
              {/* Kop Sekolah */}
              <div className="border-b-2 border-black pb-2 text-center space-y-0.5">
                <div className="font-bold text-xs uppercase tracking-wider">{schoolProfile.namaSekolah}</div>
                <div className="text-[10px] text-slate-600">{schoolProfile.alamat}, {schoolProfile.kabupatenKota}</div>
                <div className="font-bold text-sm uppercase underline pt-2">{generatedForm.namaFormulir}</div>
                <div className="text-[10px] font-mono text-slate-500">Lampiran SOP: {sop.identitas.nomorSop}</div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {generatedForm.fields.map((field: { label: string; wajib?: boolean }, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      {field.label} {field.wajib && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      type="text"
                      placeholder={`................................................`}
                      className="w-full border-b border-slate-400 bg-transparent py-1 text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Table section if available */}
              {generatedForm.tabel && (
                <div className="pt-2">
                  <div className="font-semibold text-slate-800 mb-1">{generatedForm.tabel.judul}</div>
                  <table className="w-full border-collapse border border-black text-[11px]">
                    <thead>
                      <tr className="bg-slate-100">
                        {generatedForm.tabel.kolom.map((col: string, i: number) => (
                          <th key={i} className="border border-black p-1 text-center font-bold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((rowNum) => (
                        <tr key={rowNum}>
                          {generatedForm.tabel!.kolom.map((_: string, colIdx: number) => (
                            <td key={colIdx} className="border border-black p-1.5 h-6 text-center">
                              {colIdx === 0 ? rowNum : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-6 flex justify-between text-center text-[11px]">
                <div className="w-48">
                  <div>Mengetahui,</div>
                  <div className="font-semibold">Kepala {schoolProfile.namaSekolah}</div>
                  <div className="h-14" />
                  <div className="font-bold underline">{schoolProfile.namaKepalaSekolah}</div>
                  <div>NIP. {schoolProfile.nip}</div>
                </div>

                <div className="w-48">
                  <div>{schoolProfile.kabupatenKota}, .................... 2026</div>
                  <div className="font-semibold">Petugas Pelaksana / Pemohon</div>
                  <div className="h-14" />
                  <div className="font-bold underline">(...............................................)</div>
                  <div>NIP/NUPTK: -</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 border border-dashed rounded-xl">
              Pilih salah satu dokumen bukti di atas dan klik <strong>"Buat Formulir dengan AI"</strong> untuk meng-generate format instrumen siap cetak.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Tutup
          </button>
          {generatedForm && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrintForm}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Cetak langsung ke printer atau simpan PDF"
              >
                <Printer size={14} />
                <span>Cetak Formulir</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadDoc}
                disabled={isDownloadingDoc}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Unduh Formulir Administrasi dalam format Microsoft Word (.docx)"
              >
                {isDownloadingDoc ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileDown size={14} />
                )}
                <span>Unduh File Doc</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
