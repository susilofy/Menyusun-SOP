import React, { useState } from "react";
import { X, CheckSquare, Printer, Sparkles, Loader2, FileDown } from "lucide-react";
import { SopDocument, SchoolProfile, GeneratedChecklistDoc } from "../types";
import { exportChecklistToDocx } from "../utils/docxExport";

interface ChecklistGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SopDocument;
  schoolProfile: SchoolProfile;
}

export const ChecklistGeneratorModal: React.FC<ChecklistGeneratorModalProps> = ({
  isOpen,
  onClose,
  sop,
  schoolProfile,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);
  const [checklistData, setChecklistData] = useState<GeneratedChecklistDoc | null>(null);

  if (!isOpen) return null;

  const handleDownloadDoc = async () => {
    if (!checklistData) return;
    setIsDownloadingDoc(true);
    try {
      await exportChecklistToDocx(checklistData, sop, schoolProfile);
    } catch (err) {
      console.error("Gagal mengunduh file DOC checklist:", err);
    } finally {
      setIsDownloadingDoc(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/generate-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sopData: sop,
          schoolProfile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChecklistData(data);
        return;
      }
      // Fallback using direct SOP steps
      const fallbackChecklist = {
        judulChecklist: `Lembar Kendali Mutu & Monitoring: ${sop.identitas?.namaSop || "SOP Sekolah"}`,
        sasaranUnit: schoolProfile.namaSekolah || "Satuan Pendidikan SD",
        items: (sop.tabelPelaksanaMutuBaku || []).map((step, idx) => ({
          no: step.no || idx + 1,
          uraianLangkah: step.uraianProsedur || `Langkah operasional ke-${idx + 1} (Output: ${step.output || "-"})`,
          pelaksana: Object.keys(step.pelaksanaChecks || {})[0] || "Tim Pelaksana",
        })),
      };
      setChecklistData(fallbackChecklist);
    } catch {
      // Fallback on error
      const fallbackChecklist = {
        judulChecklist: `Lembar Kendali Mutu & Monitoring: ${sop.identitas?.namaSop || "SOP Sekolah"}`,
        sasaranUnit: schoolProfile.namaSekolah || "Satuan Pendidikan SD",
        items: (sop.tabelPelaksanaMutuBaku || []).map((step, idx) => ({
          no: step.no || idx + 1,
          uraianLangkah: step.uraianProsedur || `Langkah operasional ke-${idx + 1} (Output: ${step.output || "-"})`,
          pelaksana: Object.keys(step.pelaksanaChecks || {})[0] || "Tim Pelaksana",
        })),
      };
      setChecklistData(fallbackChecklist);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <CheckSquare className="text-emerald-400" size={20} />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Lembar Checklist Monitoring Pelaksanaan SOP
              </h2>
              <p className="text-xs text-slate-400">Instrumen kendali operasional harian / berkala</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white rounded-md p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {!checklistData ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <CheckSquare size={36} className="text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Buat Lembar Checklist Praktis untuk Pelaksana Lapangan
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  AI akan mengekstrak setiap langkah kerja dari SOP <strong>"{sop.identitas.namaSop}"</strong> menjadi format lembar checklist verifikasi lengkap dengan tanggal, status terlaksana, paraf, dan catatan kendala.
                </p>
              </div>
              <button
                disabled={isLoading}
                onClick={handleGenerate}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xs text-xs"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>Buat Lembar Checklist Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-xs space-y-4 print:border-none print:p-0">
              {/* Kop Checklist */}
              <div className="border-b-2 border-black pb-2 text-center">
                <div className="font-bold text-xs uppercase tracking-wider">{schoolProfile.namaSekolah}</div>
                <div className="font-bold text-sm uppercase underline mt-1">{checklistData.judulChecklist}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Lampiran Kendali Mutu SOP: {sop.identitas.namaSop} ({sop.identitas.nomorSop})
                </div>
              </div>

              {/* Meta Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Unit / Sasaran:</span>{" "}
                  <span className="font-semibold text-slate-800">{checklistData.sasaranUnit}</span>
                </div>
                <div>
                  <span className="text-slate-500">Petugas Pemantau:</span>{" "}
                  <span className="font-semibold text-slate-800">Kepala Sekolah / Tim Pengembang</span>
                </div>
                <div>
                  <span className="text-slate-500">Periode Pelaksanaan:</span>{" "}
                  <span className="font-semibold text-slate-800">Tahun Pelajaran {schoolProfile.tahunPelajaran}</span>
                </div>
                <div>
                  <span className="text-slate-500">Tanggal Pengawasan:</span>{" "}
                  <span className="font-semibold text-slate-800">.............................. 2026</span>
                </div>
              </div>

              {/* Table Steps */}
              <table className="w-full border-collapse border border-black text-[10.5px]">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-1.5 w-8">No</th>
                    <th className="border border-black p-1.5 w-64 text-left">Langkah Kerja Terverifikasi</th>
                    <th className="border border-black p-1.5 w-24">Pelaksana</th>
                    <th className="border border-black p-1.5 w-16">Tanggal</th>
                    <th className="border border-black p-1.5 w-16">Terlaksana</th>
                    <th className="border border-black p-1.5 w-14">Paraf</th>
                    <th className="border border-black p-1.5">Catatan Kendala</th>
                  </tr>
                </thead>
                <tbody>
                  {checklistData.items.map((it: { no: number; uraianLangkah: string; pelaksana: string }, idx: number) => (
                    <tr key={idx} className="h-8">
                      <td className="border border-black p-1 text-center font-medium">{it.no}</td>
                      <td className="border border-black p-1.5 leading-snug">{it.uraianLangkah}</td>
                      <td className="border border-black p-1 text-center">{it.pelaksana}</td>
                      <td className="border border-black p-1 text-center text-slate-300">.../.../2026</td>
                      <td className="border border-black p-1 text-center">
                        <div className="flex justify-center space-x-2 text-[9px]">
                          <span>[ ] Ya</span>
                          <span>[ ] Tdk</span>
                        </div>
                      </td>
                      <td className="border border-black p-1 text-center text-slate-300">......</td>
                      <td className="border border-black p-1 text-slate-400"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-4 flex justify-between text-center text-[11px]">
                <div className="w-48">
                  <div>Mengetahui,</div>
                  <div className="font-semibold">Kepala {schoolProfile.namaSekolah}</div>
                  <div className="h-12" />
                  <div className="font-bold underline">{schoolProfile.namaKepalaSekolah}</div>
                  <div>NIP. {schoolProfile.nip}</div>
                </div>

                <div className="w-48">
                  <div>{schoolProfile.kabupatenKota}, .................... 2026</div>
                  <div className="font-semibold">Petugas Verifikator / Guru</div>
                  <div className="h-12" />
                  <div className="font-bold underline">(...............................................)</div>
                  <div>NIP: .......................................</div>
                </div>
              </div>
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
          {checklistData && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Cetak langsung ke printer atau simpan PDF"
              >
                <Printer size={14} />
                <span>Cetak</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadDoc}
                disabled={isDownloadingDoc}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Unduh Lembar Checklist dalam format Microsoft Word (.docx)"
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
