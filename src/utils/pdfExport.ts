import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SopDocument, SchoolProfile } from "../types";

export function generateSopPdfDoc(sop: SopDocument, schoolProfile: SchoolProfile): jsPDF {
  // A4 Landscape is 297mm x 210mm
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 10;
  let currentY = 10;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`SOP : ${sop.identitas.namaSop.toUpperCase()}`, pageWidth / 2, currentY, { align: "center" });
  currentY += 5;

  // Identitas Table (2 column layout like the preview)
  const leftColWidth = 138;
  const rightColWidth = 139;

  const identitasBody = [
    // Row 1: Left = Kop Sekolah, Right = Meta Nomor & Tgl
    [
      {
        content: `${schoolProfile.namaSekolah.toUpperCase()}\n${schoolProfile.alamat}\n${schoolProfile.kabupatenKota}, ${schoolProfile.provinsi}\n${schoolProfile.nomorTelepon ? `Telp: ${schoolProfile.nomorTelepon}` : ""}`,
        styles: { fontStyle: "bold", halign: "center", valign: "middle", fillColor: [248, 250, 252] },
      },
      {
        content: `Nomor SOP            : ${sop.identitas.nomorSop || "03/April/2026"}\nTanggal Pembuatan : ${sop.identitas.tanggalPembuatan || "-"}\nTanggal Revisi        : ${sop.identitas.tanggalRevisi || "0"}\nTanggal Pengesahan: ${sop.identitas.tanggalPengesahan || "-"}\nDisahkan Oleh        : ${sop.identitas.disahkanOleh || `Kepala ${schoolProfile.namaSekolah}`}\n\n\n\n\n${sop.identitas.namaKepalaSekolah || schoolProfile.namaKepalaSekolah}\nNIP. ${sop.identitas.nip || schoolProfile.nip}`,
        styles: { fontStyle: "normal", valign: "top" },
      },
    ],
    // Row 2: Nama SOP
    [
      {
        content: "NAMA SOP",
        styles: { fontStyle: "bold", fillColor: [241, 245, 249], halign: "center" },
      },
      {
        content: sop.identitas.namaSop.toUpperCase(),
        styles: { fontStyle: "bold" },
      },
    ],
    // Row 3: Dasar Hukum vs Kualifikasi Pelaksana
    [
      {
        content: `DASAR HUKUM:\n${(sop.dasarHukum || []).map((dh, i) => `${i + 1}. ${dh.namaRegulasi} tentang ${dh.tentang}`).join("\n")}`,
      },
      {
        content: `KUALIFIKASI PELAKSANA:\n${(sop.kualifikasiPelaksana || []).map((kp, i) => `${i + 1}. ${kp}`).join("\n")}`,
      },
    ],
    // Row 4: Keterkaitan vs Peralatan / Perlengkapan
    [
      {
        content: `KETERKAITAN:\n${(sop.keterkaitan || []).map((k, i) => `${i + 1}. ${k}`).join("\n")}`,
      },
      {
        content: `PERALATAN / PERLENGKAPAN:\n${(sop.peralatanPerlengkapan || []).map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
      },
    ],
    // Row 5: Peringatan vs Pencatatan dan Pendataan
    [
      {
        content: `PERINGATAN:\n${(sop.peringatan || []).map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
      },
      {
        content: `PENCATATAN DAN PENDATAAN:\n${(sop.pencatatanPendataan?.dokumenBukti || []).map((d, i) => `${i + 1}. ${d}`).join("\n")}\n\nPengelola: ${sop.pencatatanPendataan?.penanggungJawabArsip || "-"} | Media: ${sop.pencatatanPendataan?.mediaPenyimpanan || "-"} | Retensi: ${sop.pencatatanPendataan?.periodePenyimpanan || "-"}`,
      },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: leftColWidth },
      1: { cellWidth: rightColWidth },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      valign: "top",
      textColor: [0, 0, 0],
    },
    body: identitasBody as any,
    theme: "plain",
    didDrawPage: () => {
      // Page 1 Footer
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`Standar Operasional Prosedur ${schoolProfile.namaSekolah}`, margin, pageHeight - 6);
      doc.text("Halaman 1 dari 2", pageWidth - margin, pageHeight - 6, { align: "right" });
    },
  });

  // ================= PAGE 2: TABEL PELAKSANA MUTU BAKU =================
  doc.addPage("a4", "landscape");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`PELAKSANA MUTU BAKU : ${sop.identitas.namaSop.toUpperCase()}`, pageWidth / 2, 10, { align: "center" });

  const pelaksanaList = sop.pelaksanaList || ["Dinas Pendidikan", "Komite Sekolah", "Kepala Sekolah", "Tim BOS", "Guru/Tendik"];
  const pelaksanaCount = pelaksanaList.length;

  // Header rows
  const headRows: any[] = [
    [
      { content: "NO", rowSpan: 2, styles: { halign: "center", valign: "middle" } },
      { content: "URAIAN PROSEDUR", rowSpan: 2, styles: { halign: "center", valign: "middle" } },
      { content: "PELAKSANA", colSpan: pelaksanaCount, styles: { halign: "center" } },
      { content: "MUTU BAKU", colSpan: 3, styles: { halign: "center" } },
    ],
    [
      ...pelaksanaList.map((p) => ({ content: p, styles: { halign: "center", fontSize: 6.5 } })),
      { content: "Persyaratan/Perlengkapan", styles: { halign: "center", fontSize: 6.5 } },
      { content: "Waktu", styles: { halign: "center", fontSize: 6.5 } },
      { content: "Output", styles: { halign: "center", fontSize: 6.5 } },
    ],
    [
      { content: "1", styles: { halign: "center", fontSize: 6, fontStyle: "normal" } },
      { content: "2", styles: { halign: "center", fontSize: 6, fontStyle: "normal" } },
      ...pelaksanaList.map((_, i) => ({ content: String(3 + i), styles: { halign: "center", fontSize: 6, fontStyle: "normal" } })),
      { content: String(3 + pelaksanaCount), styles: { halign: "center", fontSize: 6, fontStyle: "normal" } },
      { content: String(4 + pelaksanaCount), styles: { halign: "center", fontSize: 6, fontStyle: "normal" } },
      { content: String(5 + pelaksanaCount), styles: { halign: "center", fontSize: 6, fontStyle: "normal" } },
    ],
  ];

  const totalSteps = (sop.tabelPelaksanaMutuBaku || []).length;
  const bodyRows = (sop.tabelPelaksanaMutuBaku || []).map((step, idx) => {
    const isLast = idx === totalSteps - 1;
    const flow = step.flowType || (idx === 0 ? "start" : isLast ? "end" : "process");

    const checkedCols = pelaksanaList
      .map((p, i) => (step.pelaksanaChecks?.[p] ? i : -1))
      .filter((i) => i !== -1);
    const primaryCol =
      step.activePelaksanaIndex !== undefined && checkedCols.includes(step.activePelaksanaIndex)
        ? step.activePelaksanaIndex
        : checkedCols.length > 0
        ? checkedCols[0]
        : 0;

    const nextStep = !isLast ? (sop.tabelPelaksanaMutuBaku || [])[idx + 1] : null;
    const nextCheckedCols = nextStep
      ? pelaksanaList.map((p, i) => (nextStep.pelaksanaChecks?.[p] ? i : -1)).filter((i) => i !== -1)
      : [];
    const nextPrimaryCol = nextStep
      ? (nextStep.activePelaksanaIndex !== undefined && nextCheckedCols.includes(nextStep.activePelaksanaIndex)
          ? nextStep.activePelaksanaIndex
          : nextCheckedCols[0] ?? 0)
      : -1;

    const checks = pelaksanaList.map((p, pIdx) => {
      const isChecked = !!step.pelaksanaChecks?.[p];
      if (!isChecked) {
        // Horizontal transit line when transitioning across columns
        if (!isLast && flow !== "end") {
          const minCol = Math.min(primaryCol, nextPrimaryCol);
          const maxCol = Math.max(primaryCol, nextPrimaryCol);
          if (pIdx > minCol && pIdx < maxCol) {
            return "────────►";
          }
          if (pIdx === nextPrimaryCol && primaryCol !== nextPrimaryCol) {
            return "    │\n    ▼";
          }
        }
        return "";
      }

      if (pIdx === primaryCol) {
        let transitionArrow = "  │\n  ▼";
        if (!isLast && primaryCol !== nextPrimaryCol) {
          transitionArrow = primaryCol < nextPrimaryCol ? "  └───►" : "◄───┘";
        }
        if (flow === "start") return `(MULAI)\n${transitionArrow}`;
        if (flow === "decision") return `<KEPUTUSAN>\n${transitionArrow} (Ya)`;
        if (flow === "end") return "(SELESAI)";
        if (flow === "check") return "[ ✓ ]";
        return isLast ? "[PROSES]" : `[PROSES]\n${transitionArrow}`;
      } else {
        return "── [PROSES] ──\n  (Bersama)";
      }
    });

    return [
      step.no || idx + 1,
      step.uraianProsedur,
      ...checks,
      step.persyaratan || "-",
      step.waktu || "-",
      step.output || "-",
    ];
  });

  autoTable(doc, {
    startY: 13,
    margin: { left: margin, right: margin, bottom: 42 },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      valign: "middle",
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [229, 231, 235],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 9 },
      1: { cellWidth: 70 },
      // Mutu baku widths
      [2 + pelaksanaCount]: { cellWidth: 42 },
      [3 + pelaksanaCount]: { halign: "center", cellWidth: 18 },
      [4 + pelaksanaCount]: { cellWidth: 38 },
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253],
    },
    head: headRows,
    body: bodyRows,
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`Standar Operasional Prosedur ${schoolProfile.namaSekolah}`, margin, pageHeight - 6);
      doc.text("Halaman 2 dari 2", pageWidth - margin, pageHeight - 6, { align: "right" });
    },
  });

  // Render Legend and Signature Block below table
  const finalY = Math.min((doc as any).lastAutoTable?.finalY || 140, 155);

  // Keterangan Simbol Alur
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Keterangan Alur: (MULAI)/(SELESAI) = Titik Awal/Akhir  |  [PROSES] = Aktivitas  |  <KEPUTUSAN> = Titik Keputusan  |  | v = Garis Alur Panah", margin, finalY + 5);
  doc.setFont("helvetica", "normal");
  doc.text("Format Baku Permenpan RB No. 35 / Kemendikbudristek", margin, finalY + 9);

  // Titimangsa & Tanda Tangan Kepala Sekolah (Kanan Bawah)
  const signX = pageWidth - margin - 60;
  let signY = finalY + 4;
  if (signY > 170) signY = 170;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`${schoolProfile.kabupatenKota}, ${sop.identitas.tanggalPengesahan || ".................. 2026"}`, signX, signY, { align: "center" });
  signY += 4;
  doc.setFont("helvetica", "bold");
  doc.text(`Kepala ${schoolProfile.namaSekolah}`, signX, signY, { align: "center" });

  // 4 spaces (~16mm) for physical signature and official seal
  signY += 16;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(sop.identitas.namaKepalaSekolah || schoolProfile.namaKepalaSekolah, signX, signY, { align: "center" });
  // Underline
  const textW = doc.getTextWidth(sop.identitas.namaKepalaSekolah || schoolProfile.namaKepalaSekolah);
  doc.line(signX - textW / 2, signY + 0.5, signX + textW / 2, signY + 0.5);

  signY += 4;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`NIP. ${sop.identitas.nip || schoolProfile.nip}`, signX, signY, { align: "center" });

  return doc;
}

export function exportSopToPdf(sop: SopDocument, schoolProfile: SchoolProfile): void {
  const doc = generateSopPdfDoc(sop, schoolProfile);
  const cleanFilename = `SOP_${sop.identitas.namaSop.replace(/[^a-zA-Z0-9]/g, "_")}_A4_Landscape.pdf`;
  doc.save(cleanFilename);
}

/**
 * Creates an auto-print PDF blob and attempts direct hardware print triggering.
 * Returns the blob URL so it can also be opened directly in a new tab if iframe sandboxing restricts print dialogs.
 */
export function printSopPdfDirectly(sop: SopDocument, schoolProfile: SchoolProfile): { blobUrl: string; triggerDirectPrint: () => boolean } {
  const doc = generateSopPdfDoc(sop, schoolProfile);
  // Embed PDF auto-print action
  doc.autoPrint({ variant: "non-conform" });
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  const triggerDirectPrint = () => {
    try {
      const iframeId = "sop-pdf-hidden-print-frame";
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
      if (iframe) {
        iframe.remove();
      }
      iframe = document.createElement("iframe");
      iframe.id = iframeId;
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe?.contentWindow?.focus();
            iframe?.contentWindow?.print();
          } catch (e) {
            console.warn("Iframe direct print blocked by sandbox policy:", e);
          }
        }, 300);
      };
      return true;
    } catch (err) {
      console.error("Direct PDF print triggering failed:", err);
      return false;
    }
  };

  return { blobUrl, triggerDirectPrint };
}
