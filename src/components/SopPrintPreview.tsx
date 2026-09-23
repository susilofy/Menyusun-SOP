import React, { useState } from "react";
import {
  Printer,
  FileDown,
  Download,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  FileSpreadsheet,
  CheckSquare,
  ShieldCheck,
  Building,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  HelpCircle,
  X,
  Sparkles,
  Check,
  Sliders,
} from "lucide-react";
import { SopDocument, SchoolProfile } from "../types";
import { exportSopToDocx } from "../utils/docxExport";
import { exportSopToPdf, printSopPdfDirectly } from "../utils/pdfExport";
import { FlowchartPelaksanaCell } from "./FlowchartPelaksanaCell";

interface SopPrintPreviewProps {
  sop: SopDocument;
  schoolProfile: SchoolProfile;
  onBack: () => void;
  onEdit?: () => void;
  onGenerateForm?: () => void;
  onGenerateChecklist?: () => void;
}

export const SopPrintPreview: React.FC<SopPrintPreviewProps> = ({
  sop,
  schoolProfile,
  onBack,
  onEdit,
  onGenerateForm,
  onGenerateChecklist,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Method 1: Open clean dedicated window (bypasses iframe sandbox, connects to all physical USB/Wi-Fi printers)
  const handleOpenCleanPrintTab = () => {
    setIsPrinting(true);
    setPrintNotice("Membuka jendela cetak independen (bebas batasan iframe)...");

    const page1El = document.getElementById("sop-preview-page-1");
    const page2El = document.getElementById("sop-preview-page-2");

    const page1Html = page1El ? page1El.innerHTML : "";
    const page2Html = page2El ? page2El.innerHTML : "";

    const printWin = window.open("", "_blank");
    if (!printWin) {
      exportSopToPdf(sop, schoolProfile);
      setPrintNotice("Pop-up diblokir oleh peramban. Mengunduh berkas PDF A4 Landscape resmi untuk Anda cetak ke printer fisik.");
      setIsPrinting(false);
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cetak SOP - ${sop.identitas.namaSop} - ${schoolProfile.namaSekolah}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-control-bar {
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .print-action-btn {
      background: #059669;
      color: white;
      border: none;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .print-action-btn:hover {
      background: #047857;
    }
    .close-btn {
      background: #334155;
      color: #e2e8f0;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      border-radius: 6px;
      cursor: pointer;
    }
    .close-btn:hover {
      background: #475569;
    }
    .a4-landscape-page {
      width: 100% !important;
      max-width: 1122px;
      margin: 20px auto !important;
      padding: 28px !important;
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      border: 1px solid #cbd5e1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 750px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #000000 !important;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        background: white !important;
      }
      .a4-landscape-page {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        page-break-after: always;
        break-after: page;
        min-height: auto !important;
      }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-100">
  <div class="print-control-bar no-print-bar">
    <div>
      <div style="font-weight: 700; font-size: 14px; display:flex; align-items:center; gap:8px;">
        <span style="font-size:18px;">🖨️</span>
        <span>Jendela Cetak Bebas Sandbox (Koneksi Langsung ke Printer Fisik)</span>
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-top:2px;">
        ${sop.identitas.namaSop} &bull; ${schoolProfile.namaSekolah} &bull; Rekomendasi: Ukuran A4, Orientasi Lanskap
      </div>
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <button class="print-action-btn" onclick="window.print()">
        <span>Mulai Cetak ke Printer Sekarang (Ctrl+P)</span>
      </button>
      <button class="close-btn" onclick="window.close()">
        Tutup Jendela
      </button>
    </div>
  </div>

  <div style="padding: 16px; display:flex; flex-direction:column; align-items:center;">
    <div class="a4-landscape-page">
      ${page1Html}
    </div>
    <div class="a4-landscape-page" style="page-break-before: always; break-before: page; margin-top: 24px;">
      ${page2Html}
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`);

    printWin.document.close();
    setPrintNotice("Jendela cetak khusus telah dibuka. Peramban sekarang langsung terhubung dengan printer lokal Anda (USB/Wi-Fi).");
    setIsPrinting(false);
    setIsPrintModalOpen(false);
  };

  // Method 2: Auto-print PDF (creates PDF blob with auto-print and iframe triggering)
  const handleAutoPrintPdf = () => {
    setIsPrinting(true);
    setPrintNotice("Membuat berkas PDF A4 Landscape presisi dan mengirim perintah cetak...");
    try {
      const { blobUrl, triggerDirectPrint } = printSopPdfDirectly(sop, schoolProfile);
      const triggered = triggerDirectPrint();
      if (!triggered) {
        window.open(blobUrl, "_blank");
      }
      setPrintNotice("Perintah cetak PDF aktif. Jika dialog printer belum muncul karena pembatasan peramban, gunakan opsi 'Buka Tab Cetak Bersih'.");
    } catch (err) {
      console.error("Auto print failed:", err);
      exportSopToPdf(sop, schoolProfile);
      setPrintNotice("Pencetakan dialihkan ke pengunduhan berkas PDF A4 resmi.");
    } finally {
      setIsPrinting(false);
    }
  };

  // Method 3: Direct browser print
  const handleStandardPrint = () => {
    setIsPrinting(true);
    setPrintNotice("Memicu dialog cetak peramban...");
    setTimeout(() => {
      try {
        window.print();
        setPrintNotice("Dialog cetak peramban dipanggil. Jika printer fisik tidak muncul, silakan pilih 'Buka Tab Cetak Bersih'.");
      } catch (err) {
        console.warn("Direct window.print error:", err);
        handleOpenCleanPrintTab();
      } finally {
        setTimeout(() => setIsPrinting(false), 800);
      }
    }, 150);
  };

  const handleDownloadDocx = () => {
    exportSopToDocx(sop, schoolProfile);
  };

  const handleDownloadPdf = () => {
    exportSopToPdf(sop, schoolProfile);
  };

  const pelaksanaList = sop.pelaksanaList || ["Dinas Pendidikan", "Komite Sekolah", "Kepala Sekolah", "Tim BOS", "Guru/Tendik"];

  return (
    <div className="flex flex-col h-full bg-slate-200">
      {/* Top Action Toolbar (hidden during print) */}
      <div className="no-print bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between border-b border-slate-800 gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Kembali</span>
          </button>
          <div className="h-4 w-px bg-slate-700" />
          <div className="text-xs">
            <span className="font-bold text-white">{sop.identitas.namaSop}</span>
            <span className="text-slate-400 ml-2">({sop.identitas.nomorSop || "Belum ada nomor"})</span>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center space-x-2 bg-slate-800 px-2 py-1 rounded-md text-xs">
          <button
            onClick={() => setZoom((z) => Math.max(60, z - 10))}
            className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            title="Perkecil"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-slate-200 font-mono w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(140, z + 10))}
            className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            title="Perbesar"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="text-[10px] text-slate-400 hover:text-indigo-300 px-1 border-l border-slate-700 ml-1 cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Right: Export & Generator Actions */}
        <div className="flex items-center space-x-2">
          {onGenerateForm && (
            <button
              onClick={onGenerateForm}
              className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2.5 py-1.5 rounded-md border border-slate-700 cursor-pointer"
            >
              <FileSpreadsheet size={13} />
              <span>Formulir Terkait</span>
            </button>
          )}

          {onGenerateChecklist && (
            <button
              onClick={onGenerateChecklist}
              className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1.5 rounded-md border border-slate-700 cursor-pointer"
            >
              <CheckSquare size={13} />
              <span>Checklist</span>
            </button>
          )}

          <button
            onClick={handleDownloadDocx}
            className="flex items-center space-x-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer"
            title="Download Dokumen Microsoft Word (A4 Landscape)"
          >
            <FileDown size={14} />
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center space-x-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium px-3 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer"
            title="Unduh PDF Dokumen Resmi"
          >
            <Download size={14} />
            <span>Unduh PDF</span>
          </button>

          <button
            id="btn-print-sop-document"
            onClick={() => setIsPrintModalOpen(true)}
            disabled={isPrinting}
            className="flex items-center space-x-2 text-xs bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold px-3.5 py-1.5 rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ring-1 ring-emerald-400/40 group disabled:opacity-75 disabled:cursor-wait"
            title="Hubungkan ke Printer & Cetak Dokumen A4 Landscape"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-100"></span>
            </span>
            {isPrinting ? (
              <>
                <Loader2 size={14} className="animate-spin text-emerald-100" />
                <span>Menghubungkan...</span>
              </>
            ) : (
              <>
                <Printer size={14} className="transition-transform group-hover:scale-110" />
                <span>Cetak / Hubungkan Printer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optional Print feedback banner */}
      {printNotice && (
        <div className="no-print bg-slate-900 border-b border-indigo-700/60 text-slate-100 text-xs px-6 py-2.5 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{printNotice}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenCleanPrintTab}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded font-medium cursor-pointer"
            >
              Buka Tab Printer Bebas Sandbox
            </button>
            <button
              onClick={() => setPrintNotice(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal Pusat Koneksi & Cetak Printer Fisik */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Pusat Koneksi & Cetak ke Printer Fisik
                  </h3>
                  <p className="text-xs text-slate-300">
                    SOP: {sop.identitas.namaSop} &bull; Standar A4 Lanskap
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-slate-700 text-sm max-h-[75vh] overflow-y-auto">
              {/* Alert explanation regarding iframe sandbox */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start space-x-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-amber-900">
                  <span className="font-semibold">Mengapa printer fisik tidak merespons dialog cetak biasa?</span>
                  <br />
                  Aplikasi ini berjalan di dalam lingkungan *iframe/sandbox* peramban yang membatasi komunikasi langsung ke perangkat keras printer (seperti USB/Wi-Fi Epson, Canon, HP, Brother). Gunakan salah satu opsi koneksi langsung di bawah:
                </div>
              </div>

              {/* 3 Action Cards */}
              <div className="space-y-3">
                {/* Method 1: Clean Tab (Recommended) */}
                <div className="border-2 border-emerald-500/60 bg-emerald-50/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-600 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-emerald-950 text-sm">
                        Opsi 1: Buka Tab Cetak Bebas Sandbox
                      </span>
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Direkomendasikan
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Membuka dokumen pada tab peramban penuh di luar *iframe*, sehingga peramban langsung mendeteksi printer fisik lokal Anda dan memanggil dialog cetak sistem dengan tepat.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCleanPrintTab}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    <span>Buka Tab & Hubungkan Printer</span>
                  </button>
                </div>

                {/* Method 2: Auto-print PDF */}
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-sm">
                      Opsi 2: Kirim via Driver Dokumen PDF A4 Landscape
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Menghasilkan dokumen vektor PDF standar A4 Landscape resmi dan langsung memicu perintah cetak otomatis ke driver cetak peramban.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleAutoPrintPdf();
                      setIsPrintModalOpen(false);
                    }}
                    className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Cetak via PDF Driver</span>
                  </button>
                </div>

                {/* Method 3: Download PDF */}
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-sm">
                      Opsi 3: Unduh Berkas PDF Resmi (Cetak Offline)
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Unduh file PDF dan cetak menggunakan Adobe Acrobat Reader, Foxit Reader, atau aplikasi pembaca PDF komputer Anda (tekan <kbd className="font-mono bg-slate-200 px-1 rounded">Ctrl+P</kbd>).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleDownloadPdf();
                      setIsPrintModalOpen(false);
                    }}
                    className="shrink-0 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Unduh Berkas PDF</span>
                  </button>
                </div>
              </div>

              {/* Troubleshooting Checklist */}
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs mb-2">
                  <Sliders size={14} className="text-indigo-600" />
                  <span>Panduan Pengaturan Dialog Printer Fisik Sekolah</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5 leading-normal">
                  <li>
                    <span className="font-semibold text-slate-700">Ukuran Kertas:</span> Pastikan memilih ukuran <strong>A4</strong>.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700">Tata Letak (Orientation):</span> Pilih <strong>Lanskap / Landscape</strong> (format baku Permenpan RB).
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700">Skala (Scale):</span> Pilih <strong>Sesuaikan ke Kertas (Fit to Page)</strong> atau 100% agar tabel tidak terpotong.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700">Opsi Tambahan:</span> Centang <strong>"Grafik Latar Belakang" (Background graphics)</strong> agar kop, arsir tabel, dan simbol alur tercetak tajam.
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Format baku Permenpan RB No. 35 &amp; Kemendikbudristek</span>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet Container with zoom & print styles */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center">
        {/* Style injection for exact A4 Landscape print */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              html, body, #root, #root > div, main {
                overflow: visible !important;
                height: auto !important;
                min-height: 100% !important;
                max-height: none !important;
              }
              @page {
                size: A4 landscape;
                margin: 8mm 10mm 8mm 10mm;
              }
              body {
                background: white !important;
                color: black !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
              #sop-preview-zoom-wrapper {
                transform: none !important;
              }
              .a4-landscape-page {
                width: 100% !important;
                min-height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                page-break-after: always;
                break-after: page;
              }
              .page-break {
                page-break-before: always;
                break-before: page;
              }
            }
          `
        }} />

        <div
          id="sop-preview-zoom-wrapper"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          className="transition-transform duration-100 flex flex-col gap-8 items-center"
        >
          {/* ================= PAGE 1: IDENTITAS SOP ================= */}
          <div
            id="sop-preview-page-1"
            className="a4-landscape-page bg-white w-[1122px] min-h-[793px] p-8 shadow-xl border border-slate-300 text-black text-xs font-sans flex flex-col justify-between"
          >
            <div>
              {/* Header Title */}
              <div className="text-center font-bold text-sm tracking-wide mb-3 uppercase">
                SOP : {sop.identitas.namaSop}
              </div>

              {/* Box 1: Identitas Table */}
              <table className="w-full border-collapse border border-black text-[11px] leading-tight">
                <tbody>
                  {/* Row 1: Logo & Left Header vs Meta Right */}
                  <tr>
                    <td className="w-[50%] border border-black p-4 align-middle text-center bg-white">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        {schoolProfile.logoSekolahUrl ? (
                          <img
                            src={schoolProfile.logoSekolahUrl}
                            alt="Logo Sekolah"
                            className="w-20 h-20 object-contain mx-auto"
                          />
                        ) : (
                          <div className="w-20 h-20 border-2 border-slate-800 rounded-full flex flex-col items-center justify-center p-1 bg-amber-50">
                            <ShieldCheck size={28} className="text-slate-800" />
                            <span className="text-[8px] font-bold text-center leading-none mt-1">
                              {schoolProfile.namaSekolah}
                            </span>
                          </div>
                        )}
                        <div className="text-[12px] font-bold uppercase tracking-wider text-slate-900">
                          {schoolProfile.namaSekolah}
                        </div>
                        <div className="text-[9px] text-slate-600">
                          {schoolProfile.alamat}, {schoolProfile.kabupatenKota}, {schoolProfile.provinsi}
                        </div>
                      </div>
                    </td>

                    <td className="w-[50%] border border-black p-3 align-top">
                      <table className="w-full text-[11px] border-collapse">
                        <tbody>
                          <tr>
                            <td className="py-1 font-semibold w-36">Nomor SOP</td>
                            <td className="py-1 w-3">:</td>
                            <td className="py-1">{sop.identitas.nomorSop || "03/April/2026"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold">Tanggal Pembuatan</td>
                            <td className="py-1">:</td>
                            <td className="py-1">{sop.identitas.tanggalPembuatan || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold">Tanggal Revisi</td>
                            <td className="py-1">:</td>
                            <td className="py-1">{sop.identitas.tanggalRevisi || "0"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold">Tanggal Pengesahan</td>
                            <td className="py-1">:</td>
                            <td className="py-1">{sop.identitas.tanggalPengesahan || "-"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-semibold">Disahkan Oleh</td>
                            <td className="py-1">:</td>
                            <td className="py-1 font-semibold">{sop.identitas.disahkanOleh || `Kepala ${schoolProfile.namaSekolah}`}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="pt-16 text-center">
                              <div className="font-bold underline text-[12px]">
                                {sop.identitas.namaKepalaSekolah || schoolProfile.namaKepalaSekolah}
                              </div>
                              <div className="text-[10px] text-slate-700">
                                NIP. {sop.identitas.nip || schoolProfile.nip}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Row 2: Nama SOP */}
                  <tr>
                    <td className="border border-black p-2 font-bold bg-slate-100 uppercase">
                      Nama SOP
                    </td>
                    <td className="border border-black p-2 font-bold uppercase">
                      {sop.identitas.namaSop}
                    </td>
                  </tr>

                  {/* Row 3: Dasar Hukum vs Kualifikasi Pelaksana */}
                  <tr>
                    <td className="border border-black p-3 align-top">
                      <div className="font-bold mb-1 uppercase">Dasar Hukum</div>
                      <ol className="list-decimal pl-4 space-y-1 text-[10.5px]">
                        {sop.dasarHukum.map((dh, i) => (
                          <li key={i}>
                            {dh.namaRegulasi} tentang {dh.tentang}
                            {dh.statusVerifikasi === "Perlu Verifikasi Kepala Sekolah" && (
                              <span className="text-amber-700 italic ml-1">(Perlu verifikasi)</span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </td>

                    <td className="border border-black p-3 align-top">
                      <div className="font-bold mb-1 uppercase">Kualifikasi Pelaksana</div>
                      <ol className="list-decimal pl-4 space-y-1 text-[10.5px]">
                        {sop.kualifikasiPelaksana.map((kp, i) => (
                          <li key={i}>{kp}</li>
                        ))}
                      </ol>
                    </td>
                  </tr>

                  {/* Row 4: Keterkaitan vs Peralatan/Perlengkapan */}
                  <tr>
                    <td className="border border-black p-3 align-top">
                      <div className="font-bold mb-1 uppercase">Keterkaitan</div>
                      <ol className="list-decimal pl-4 space-y-1 text-[10.5px]">
                        {sop.keterkaitan.map((k, i) => (
                          <li key={i}>{k}</li>
                        ))}
                      </ol>
                    </td>

                    <td className="border border-black p-3 align-top">
                      <div className="font-bold mb-1 uppercase">Peralatan/Perlengkapan</div>
                      <ol className="list-decimal pl-4 space-y-1 text-[10.5px]">
                        {sop.peralatanPerlengkapan.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ol>
                    </td>
                  </tr>

                  {/* Row 5: Peringatan vs Pencatatan dan Pendataan */}
                  <tr>
                    <td className="border border-black p-3 align-top">
                      <div className="font-bold mb-1 uppercase">Peringatan</div>
                      <ol className="list-decimal pl-4 space-y-1 text-[10.5px]">
                        {sop.peringatan.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ol>
                    </td>

                    <td className="border border-black p-3 align-top">
                      <div className="font-bold mb-1 uppercase">Pencatatan dan Pendataan</div>
                      <ol className="list-decimal pl-4 space-y-1 text-[10.5px]">
                        {(sop.pencatatanPendataan?.dokumenBukti || []).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ol>
                      <div className="mt-2 text-[9.5px] text-slate-600 italic">
                        Pengelola: {sop.pencatatanPendataan?.penanggungJawabArsip || "-"} | Media: {sop.pencatatanPendataan?.mediaPenyimpanan || "-"} | Retensi: {sop.pencatatanPendataan?.periodePenyimpanan || "-"}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Page 1 Footer */}
            <div className="pt-3 border-t border-slate-300 flex justify-between text-[10px] text-slate-500">
              <span>Standar Operasional Prosedur {schoolProfile.namaSekolah}</span>
              <span>Halaman 1 dari 2</span>
            </div>
          </div>

          {/* ================= PAGE 2: TABEL PELAKSANA MUTU BAKU ================= */}
          <div
            id="sop-preview-page-2"
            className="a4-landscape-page bg-white w-[1122px] min-h-[793px] p-8 shadow-xl border border-slate-300 text-black text-xs font-sans flex flex-col justify-between"
          >
            <div>
              {/* Header Title */}
              <div className="text-center font-bold text-sm tracking-wide mb-3 uppercase">
                PELAKSANA MUTU BAKU
              </div>

              {/* Mutu Baku Table */}
              <table className="w-full border-collapse border border-black text-[10.5px]">
                <thead>
                  <tr className="bg-slate-200 text-center font-bold">
                    <th rowSpan={2} className="border border-black p-2 w-10">NO</th>
                    <th rowSpan={2} className="border border-black p-2 w-[28%]">URAIAN PROSEDUR</th>
                    <th colSpan={pelaksanaList.length} className="border border-black p-1">PELAKSANA</th>
                    <th colSpan={3} className="border border-black p-1">MUTU BAKU</th>
                  </tr>
                  <tr className="bg-slate-100 text-center font-bold text-[10px]">
                    {pelaksanaList.map((pelaksana, idx) => (
                      <th key={idx} className="border border-black px-1.5 py-1 min-w-[70px]">
                        {pelaksana}
                      </th>
                    ))}
                    <th className="border border-black p-1.5 w-[18%]">Persyaratan/Perlengkapan</th>
                    <th className="border border-black p-1.5 w-[9%]">Waktu</th>
                    <th className="border border-black p-1.5 w-[16%]">Output</th>
                  </tr>
                  {/* Number row index: 1, 2, 3... */}
                  <tr className="bg-slate-50 text-center text-[9px] text-slate-600 font-mono">
                    <td className="border border-black py-0.5">1</td>
                    <td className="border border-black py-0.5">2</td>
                    {pelaksanaList.map((_, i) => (
                      <td key={i} className="border border-black py-0.5">{3 + i}</td>
                    ))}
                    <td className="border border-black py-0.5">{3 + pelaksanaList.length}</td>
                    <td className="border border-black py-0.5">{4 + pelaksanaList.length}</td>
                    <td className="border border-black py-0.5">{5 + pelaksanaList.length}</td>
                  </tr>
                </thead>

                <tbody>
                  {(sop.tabelPelaksanaMutuBaku || []).map((step, idx) => {
                    return (
                      <tr key={step.id || idx} className="hover:bg-slate-50/50">
                        {/* No */}
                        <td className="border border-black p-1.5 text-center font-semibold align-middle">
                          {step.no || idx + 1}
                        </td>

                        {/* Uraian Prosedur */}
                        <td className="border border-black p-2 align-middle leading-snug">
                          {step.uraianProsedur}
                        </td>

                        {/* Pelaksana Flowchart Columns with Structured Arrows */}
                        {pelaksanaList.map((pelaksanaName, pIdx) => (
                          <FlowchartPelaksanaCell
                            key={pIdx}
                            step={step}
                            stepIdx={idx}
                            totalSteps={(sop.tabelPelaksanaMutuBaku || []).length}
                            pelaksanaName={pelaksanaName}
                            pelaksanaIdx={pIdx}
                            pelaksanaList={pelaksanaList}
                            allSteps={sop.tabelPelaksanaMutuBaku || []}
                            isPrintMode={true}
                          />
                        ))}

                        {/* Persyaratan */}
                        <td className="border border-black p-1.5 align-middle leading-snug">
                          {step.persyaratan || "-"}
                        </td>

                        {/* Waktu */}
                        <td className="border border-black p-1.5 text-center align-middle font-medium">
                          {step.waktu || "-"}
                        </td>

                        {/* Output */}
                        <td className="border border-black p-1.5 align-middle leading-snug">
                          {step.output || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Keterangan Simbol & Alur Bagan Alir (Flowchart Legend) */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-300 text-[9.5px] rounded-xs">
                <div className="flex items-center space-x-4 flex-wrap">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">
                    Keterangan Alur:
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full border border-black bg-white text-[8px] font-bold">
                      Mulai/Selesai
                    </span>
                    <span className="text-slate-600">: Awal / Akhir Prosedur</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 border border-black bg-white text-[8px] font-bold">
                      Proses
                    </span>
                    <span className="text-slate-600">: Aktivitas Pelaksanaan</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3.5 h-3.5 rotate-45 border border-black bg-white inline-flex items-center justify-center text-[6.5px] font-bold">
                      <span className="-rotate-45">?</span>
                    </span>
                    <span className="text-slate-600">: Pengambilan Keputusan (Ya/Tdk)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="flex items-center">
                      <div className="w-5 h-[2px] bg-black" />
                      <svg width="6" height="6" viewBox="0 0 6 6" className="-ml-1">
                        <polygon points="0,0 6,3 0,6" fill="#000" />
                      </svg>
                    </div>
                    <span className="text-slate-600">: Garis Hubung Berpanah Terstruktur</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 italic">
                  Format Baku Permenpan RB No. 35 / Kemendikbud
                </div>
              </div>

              {/* End Sign-off Block */}
              <div className="mt-6 flex justify-end">
                <div className="text-center w-64 text-[11px]">
                  <div>{schoolProfile.kabupatenKota}, {sop.identitas.tanggalPengesahan || ".................. 2026"}</div>
                  <div className="font-semibold mt-1">Kepala {schoolProfile.namaSekolah}</div>
                  <div className="h-16 flex items-center justify-center">
                    {/* Ruang 4 spasi untuk tanda tangan manual dan stempel dinas */}
                  </div>
                  <div className="font-bold underline text-[12px]">
                    {sop.identitas.namaKepalaSekolah || schoolProfile.namaKepalaSekolah}
                  </div>
                  <div className="text-[10px]">
                    NIP. {sop.identitas.nip || schoolProfile.nip}
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 Footer */}
            <div className="pt-3 border-t border-slate-300 flex justify-between text-[10px] text-slate-500">
              <span>Standar Operasional Prosedur {schoolProfile.namaSekolah}</span>
              <span>Halaman 2 dari 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
