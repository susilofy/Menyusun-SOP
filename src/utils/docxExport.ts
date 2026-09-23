import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  PageOrientation,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} from "docx";
import { SopDocument, SchoolProfile, GeneratedChecklistDoc, GeneratedFormDoc } from "../types";

export async function exportSopToDocx(sop: SopDocument, schoolProfile: SchoolProfile): Promise<void> {
  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  };

  // Helper for cell creation
  const createCell = (text: string | Paragraph[], opts?: { widthPct?: number; bold?: boolean; bg?: string; colSpan?: number; rowSpan?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType] | any }) => {
    const paragraphs = Array.isArray(text)
      ? text
      : [
          new Paragraph({
            alignment: opts?.align || AlignmentType.LEFT,
            spacing: { before: 40, after: 40, line: 220 },
            children: [
              new TextRun({
                text: text || "-",
                bold: opts?.bold || false,
                size: 18, // 9pt
                font: "Arial",
              }),
            ],
          }),
        ];

    return new TableCell({
      width: opts?.widthPct ? { size: opts.widthPct, type: WidthType.PERCENTAGE } : undefined,
      columnSpan: opts?.colSpan,
      rowSpan: opts?.rowSpan,
      shading: opts?.bg ? { fill: opts.bg } : undefined,
      borders: thinBorder,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: paragraphs,
    });
  };

  // Build Identitas Table
  const identitasRows: TableRow[] = [
    // Row 1: Header Title & Meta
    new TableRow({
      children: [
        new TableCell({
          width: { size: 55, type: WidthType.PERCENTAGE },
          borders: thinBorder,
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
              children: [
                new TextRun({
                  text: `${schoolProfile.namaSekolah.toUpperCase()}`,
                  bold: true,
                  size: 20,
                  font: "Arial",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `STANDAR OPERASIONAL PROSEDUR (SOP)`,
                  bold: true,
                  size: 22,
                  font: "Arial",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${sop.identitas.namaSop.toUpperCase()}`,
                  bold: true,
                  size: 20,
                  font: "Arial",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 45, type: WidthType.PERCENTAGE },
          borders: thinBorder,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Nomor SOP            : ", bold: true, size: 18, font: "Arial" }),
                new TextRun({ text: sop.identitas.nomorSop || "-", size: 18, font: "Arial" }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Tanggal Pembuatan : ", bold: true, size: 18, font: "Arial" }),
                new TextRun({ text: sop.identitas.tanggalPembuatan || "-", size: 18, font: "Arial" }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Tanggal Revisi        : ", bold: true, size: 18, font: "Arial" }),
                new TextRun({ text: sop.identitas.tanggalRevisi || "0", size: 18, font: "Arial" }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Tanggal Pengesahan: ", bold: true, size: 18, font: "Arial" }),
                new TextRun({ text: sop.identitas.tanggalPengesahan || "-", size: 18, font: "Arial" }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Disahkan Oleh        : ", bold: true, size: 18, font: "Arial" }),
                new TextRun({ text: sop.identitas.disahkanOleh || `Kepala ${schoolProfile.namaSekolah}`, size: 18, font: "Arial" }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 720, after: 40 }, // 4 lines of space (4 spasi) for signature and official seal
              children: [
                new TextRun({
                  text: sop.identitas.namaKepalaSekolah || schoolProfile.namaKepalaSekolah,
                  bold: true,
                  underline: {},
                  size: 18,
                  font: "Arial",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `NIP. ${sop.identitas.nip || schoolProfile.nip}`,
                  size: 18,
                  font: "Arial",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    // Row 2: Nama SOP Title
    new TableRow({
      children: [
        createCell("NAMA SOP", { widthPct: 55, bold: true, bg: "F3F4F6" }),
        createCell(sop.identitas.namaSop, { widthPct: 45, bold: true }),
      ],
    }),
    // Row 3: Dasar Hukum vs Kualifikasi Pelaksana
    new TableRow({
      children: [
        new TableCell({
          width: { size: 55, type: WidthType.PERCENTAGE },
          borders: thinBorder,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: "DASAR HUKUM:", bold: true, size: 18, font: "Arial" })],
            }),
            ...sop.dasarHukum.map(
              (dh, idx) =>
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [
                    new TextRun({
                      text: `${idx + 1}. ${dh.namaRegulasi} tentang ${dh.tentang}`,
                      size: 17,
                      font: "Arial",
                    }),
                  ],
                })
            ),
          ],
        }),
        new TableCell({
          width: { size: 45, type: WidthType.PERCENTAGE },
          borders: thinBorder,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: "KUALIFIKASI PELAKSANA:", bold: true, size: 18, font: "Arial" })],
            }),
            ...sop.kualifikasiPelaksana.map(
              (kp, idx) =>
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [new TextRun({ text: `${idx + 1}. ${kp}`, size: 17, font: "Arial" })],
                })
            ),
          ],
        }),
      ],
    }),
    // Row 4: Keterkaitan vs Peralatan/Perlengkapan
    new TableRow({
      children: [
        new TableCell({
          width: { size: 55, type: WidthType.PERCENTAGE },
          borders: thinBorder,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: "KETERKAITAN:", bold: true, size: 18, font: "Arial" })],
            }),
            ...sop.keterkaitan.map(
              (item, idx) =>
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 17, font: "Arial" })],
                })
            ),
          ],
        }),
        new TableCell({
          width: { size: 45, type: WidthType.PERCENTAGE },
          borders: thinBorder,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: "PERALATAN / PERLENGKAPAN:", bold: true, size: 18, font: "Arial" })],
            }),
            ...sop.peralatanPerlengkapan.map(
              (item, idx) =>
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 17, font: "Arial" })],
                })
            ),
          ],
        }),
      ],
    }),
    // Row 5: Peringatan vs Pencatatan dan Pendataan
    new TableRow({
      children: [
        new TableCell({
          width: { size: 55, type: WidthType.PERCENTAGE },
          borders: thinBorder,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: "PERINGATAN:", bold: true, size: 18, font: "Arial" })],
            }),
            ...sop.peringatan.map(
              (item, idx) =>
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 17, font: "Arial" })],
                })
            ),
          ],
        }),
        new TableCell({
          width: { size: 45, type: WidthType.PERCENTAGE },
          borders: thinBorder,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: "PENCATATAN DAN PENDATAAN:", bold: true, size: 18, font: "Arial" })],
            }),
            ...(sop.pencatatanPendataan?.dokumenBukti || []).map(
              (item, idx) =>
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [new TextRun({ text: `${idx + 1}. ${item}`, size: 17, font: "Arial" })],
                })
            ),
            new Paragraph({
              spacing: { before: 40 },
              children: [
                new TextRun({
                  text: `Arsip: ${sop.pencatatanPendataan?.penanggungJawabArsip || "-"} | ${sop.pencatatanPendataan?.mediaPenyimpanan || "-"} | Retensi: ${sop.pencatatanPendataan?.periodePenyimpanan || "-"}`,
                  italics: true,
                  size: 16,
                  font: "Arial",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  const identitasTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: identitasRows,
  });

  // Build Pelaksana Mutu Baku Table
  const pelaksanaCols = sop.pelaksanaList || ["Kepala Sekolah", "Guru", "Tendik"];
  const totalPelaksana = pelaksanaCols.length;

  const headerRow1 = new TableRow({
    children: [
      createCell("NO", { bold: true, bg: "D1D5DB", align: AlignmentType.CENTER, rowSpan: 2 }),
      createCell("URAIAN PROSEDUR", { bold: true, bg: "D1D5DB", align: AlignmentType.CENTER, rowSpan: 2 }),
      createCell("PELAKSANA", { bold: true, bg: "D1D5DB", align: AlignmentType.CENTER, colSpan: totalPelaksana }),
      createCell("MUTU BAKU", { bold: true, bg: "D1D5DB", align: AlignmentType.CENTER, colSpan: 3 }),
    ],
  });

  const headerRow2 = new TableRow({
    children: [
      ...pelaksanaCols.map((p) => createCell(p, { bold: true, bg: "E5E7EB", align: AlignmentType.CENTER })),
      createCell("Persyaratan / Perlengkapan", { bold: true, bg: "E5E7EB", align: AlignmentType.CENTER }),
      createCell("Waktu", { bold: true, bg: "E5E7EB", align: AlignmentType.CENTER }),
      createCell("Output", { bold: true, bg: "E5E7EB", align: AlignmentType.CENTER }),
    ],
  });

  const numberIndexRow = new TableRow({
    children: [
      createCell("1", { bg: "F3F4F6", align: AlignmentType.CENTER }),
      createCell("2", { bg: "F3F4F6", align: AlignmentType.CENTER }),
      ...pelaksanaCols.map((_, i) => createCell(String(3 + i), { bg: "F3F4F6", align: AlignmentType.CENTER })),
      createCell(String(3 + totalPelaksana), { bg: "F3F4F6", align: AlignmentType.CENTER }),
      createCell(String(4 + totalPelaksana), { bg: "F3F4F6", align: AlignmentType.CENTER }),
      createCell(String(5 + totalPelaksana), { bg: "F3F4F6", align: AlignmentType.CENTER }),
    ],
  });

  const totalSteps = (sop.tabelPelaksanaMutuBaku || []).length;
  const stepRows: TableRow[] = (sop.tabelPelaksanaMutuBaku || []).map((step, idx) => {
    const isEven = idx % 2 === 1;
    const rowBg = isEven ? "F9FAFB" : "FFFFFF";
    const isLast = idx === totalSteps - 1;
    const flow = step.flowType || (idx === 0 ? "start" : isLast ? "end" : "process");

    const checkedCols = pelaksanaCols
      .map((colName, i) => (step.pelaksanaChecks?.[colName] ? i : -1))
      .filter((i) => i !== -1);
    const primaryCol =
      step.activePelaksanaIndex !== undefined && checkedCols.includes(step.activePelaksanaIndex)
        ? step.activePelaksanaIndex
        : checkedCols.length > 0
        ? checkedCols[0]
        : 0;

    const nextStep = !isLast ? (sop.tabelPelaksanaMutuBaku || [])[idx + 1] : null;
    const nextCheckedCols = nextStep
      ? pelaksanaCols.map((colName, i) => (nextStep.pelaksanaChecks?.[colName] ? i : -1)).filter((i) => i !== -1)
      : [];
    const nextPrimaryCol = nextStep
      ? (nextStep.activePelaksanaIndex !== undefined && nextCheckedCols.includes(nextStep.activePelaksanaIndex)
          ? nextStep.activePelaksanaIndex
          : nextCheckedCols[0] ?? 0)
      : -1;

    const pelaksanaCells = pelaksanaCols.map((colName, pIdx) => {
      const isChecked = !!step.pelaksanaChecks?.[colName];
      let mark = "";
      if (!isChecked) {
        if (!isLast && flow !== "end") {
          const minCol = Math.min(primaryCol, nextPrimaryCol);
          const maxCol = Math.max(primaryCol, nextPrimaryCol);
          if (pIdx > minCol && pIdx < maxCol) {
            mark = "────►";
          } else if (pIdx === nextPrimaryCol && primaryCol !== nextPrimaryCol) {
            mark = "│ ▼";
          }
        }
      } else if (pIdx === primaryCol) {
        let arrow = "▼";
        if (!isLast && primaryCol !== nextPrimaryCol) {
          arrow = primaryCol < nextPrimaryCol ? "►" : "◄";
        }
        if (flow === "start") mark = `[MULAI] ${arrow}`;
        else if (flow === "decision") mark = `[KEPUTUSAN] ${arrow}`;
        else if (flow === "end") mark = "[SELESAI]";
        else if (flow === "check") mark = "✓";
        else mark = isLast ? "[PROSES]" : `[PROSES] ${arrow}`;
      } else {
        mark = "── [PROSES] ──";
      }
      return createCell(mark, { bg: rowBg, align: AlignmentType.CENTER, bold: !!mark });
    });

    return new TableRow({
      children: [
        createCell(String(step.no || idx + 1), { bg: rowBg, align: AlignmentType.CENTER }),
        createCell(step.uraianProsedur || "", { bg: rowBg }),
        ...pelaksanaCells,
        createCell(step.persyaratan || "-", { bg: rowBg }),
        createCell(step.waktu || "-", { bg: rowBg, align: AlignmentType.CENTER }),
        createCell(step.output || "-", { bg: rowBg }),
      ],
    });
  });

  const mutuBakuTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow1, headerRow2, numberIndexRow, ...stepRows],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 16838, // A4 Landscape width in twips (297mm)
              height: 11906, // A4 Landscape height in twips (210mm)
            },
            margin: {
              top: 720, // 0.5 inch
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `DOKUMEN RESMI SOP - ${schoolProfile.namaSekolah.toUpperCase()}`,
                    size: 16,
                    color: "666666",
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Halaman ", size: 16, font: "Arial" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Arial" }),
                  new TextRun({ text: " dari ", size: 16, font: "Arial" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: "Arial" }),
                  new TextRun({ text: ` | SOP SMART SCHOOL SD`, italics: true, size: 16, font: "Arial", color: "888888" }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `SOP : ${sop.identitas.namaSop.toUpperCase()}`,
                bold: true,
                size: 22,
                font: "Arial",
              }),
            ],
          }),
          identitasTable,
          new Paragraph({
            pageBreakBefore: true,
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 140 },
            children: [
              new TextRun({
                text: `PELAKSANA MUTU BAKU : ${sop.identitas.namaSop.toUpperCase()}`,
                bold: true,
                size: 22,
                font: "Arial",
              }),
            ],
          }),
          mutuBakuTable,
          new Paragraph({
            spacing: { before: 80, after: 140 },
            children: [
              new TextRun({
                text: "Keterangan Alur: (MULAI)/(SELESAI) = Titik Awal/Akhir  |  [PROSES] = Aktivitas Pelaksanaan  |  <KEPUTUSAN> = Pengambilan Keputusan  |  | v = Garis Alur Panah\n",
                size: 15,
                color: "555555",
                font: "Arial",
              }),
              new TextRun({
                text: "Format Baku Permenpan RB No. 35 / Kemendikbudristek",
                italics: true,
                size: 15,
                color: "777777",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 160 },
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `${schoolProfile.kabupatenKota}, ${sop.identitas.tanggalPengesahan || ".................. 2026"}\n`, size: 18, font: "Arial" }),
              new TextRun({ text: `Kepala ${schoolProfile.namaSekolah}\n`, bold: true, size: 18, font: "Arial" }),
              new TextRun({
                text: "\n\n\n\n", // 4 spaces for manual signature and seal
                size: 18,
                font: "Arial",
              }),
              new TextRun({ text: `${sop.identitas.namaKepalaSekolah || schoolProfile.namaKepalaSekolah}\n`, bold: true, underline: {}, size: 18, font: "Arial" }),
              new TextRun({ text: `NIP. ${sop.identitas.nip || schoolProfile.nip}`, size: 18, font: "Arial" }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFilename = `SOP_${sop.identitas.namaSop.replace(/[^a-zA-Z0-9]/g, "_")}_A4_Landscape.docx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = cleanFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportChecklistToDocx(
  checklistData: GeneratedChecklistDoc,
  sop: SopDocument,
  schoolProfile: SchoolProfile
): Promise<void> {
  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  };

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const createCell = (
    text: string | Paragraph[],
    opts?: {
      widthPct?: number;
      bold?: boolean;
      bg?: string;
      colSpan?: number;
      align?: (typeof AlignmentType)[keyof typeof AlignmentType] | any;
      fontSize?: number;
    }
  ) => {
    const paragraphs = Array.isArray(text)
      ? text
      : [
          new Paragraph({
            alignment: opts?.align || AlignmentType.LEFT,
            spacing: { before: 30, after: 30, line: 220 },
            children: [
              new TextRun({
                text: text || "-",
                bold: opts?.bold || false,
                size: opts?.fontSize || 18, // default 9pt
                font: "Arial",
              }),
            ],
          }),
        ];

    return new TableCell({
      width: opts?.widthPct ? { size: opts.widthPct, type: WidthType.PERCENTAGE } : undefined,
      columnSpan: opts?.colSpan,
      shading: opts?.bg ? { fill: opts.bg } : undefined,
      borders: thinBorder,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: paragraphs,
    });
  };

  // Meta Table
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        createCell("Unit / Sasaran:", { widthPct: 20, bold: true, bg: "F8FAFC" }),
        createCell(checklistData.sasaranUnit || schoolProfile.namaSekolah || "Satuan Pendidikan SD", { widthPct: 30 }),
        createCell("Petugas Pemantau:", { widthPct: 20, bold: true, bg: "F8FAFC" }),
        createCell("Kepala Sekolah / Tim Pengembang", { widthPct: 30 }),
      ],
    }),
    new TableRow({
      children: [
        createCell("Periode:", { widthPct: 20, bold: true, bg: "F8FAFC" }),
        createCell(`Tahun Pelajaran ${schoolProfile.tahunPelajaran || "2025/2026"}`, { widthPct: 30 }),
        createCell("Tanggal Pengawasan:", { widthPct: 20, bold: true, bg: "F8FAFC" }),
        createCell(".............................. 2026", { widthPct: 30 }),
      ],
    }),
  ];

  // Table items
  const tableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        createCell("No", { widthPct: 6, bold: true, align: AlignmentType.CENTER, bg: "F1F5F9" }),
        createCell("Langkah Kerja Terverifikasi", { widthPct: 40, bold: true, align: AlignmentType.CENTER, bg: "F1F5F9" }),
        createCell("Pelaksana", { widthPct: 18, bold: true, align: AlignmentType.CENTER, bg: "F1F5F9" }),
        createCell("Tanggal", { widthPct: 10, bold: true, align: AlignmentType.CENTER, bg: "F1F5F9" }),
        createCell("Terlaksana", { widthPct: 12, bold: true, align: AlignmentType.CENTER, bg: "F1F5F9" }),
        createCell("Paraf", { widthPct: 14, bold: true, align: AlignmentType.CENTER, bg: "F1F5F9" }),
      ],
    }),
    ...(checklistData.items || []).map(
      (it, idx) =>
        new TableRow({
          children: [
            createCell(String(it.no || idx + 1), { widthPct: 6, align: AlignmentType.CENTER }),
            createCell(it.uraianLangkah || "-", { widthPct: 40 }),
            createCell(it.pelaksana || "-", { widthPct: 18, align: AlignmentType.CENTER }),
            createCell(".../.../2026", { widthPct: 10, align: AlignmentType.CENTER }),
            createCell("[ ] Ya   [ ] Tdk", { widthPct: 12, align: AlignmentType.CENTER }),
            createCell("......", { widthPct: 14, align: AlignmentType.CENTER }),
          ],
        })
    ),
  ];

  // Signature Table (borderless)
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Mengetahui,\n", size: 18, font: "Arial" }),
                  new TextRun({ text: `Kepala ${schoolProfile.namaSekolah}\n\n\n\n`, bold: true, size: 18, font: "Arial" }),
                  new TextRun({ text: `${schoolProfile.namaKepalaSekolah}\n`, bold: true, underline: {}, size: 18, font: "Arial" }),
                  new TextRun({ text: `NIP. ${schoolProfile.nip}`, size: 18, font: "Arial" }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorder,
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${schoolProfile.kabupatenKota}, .................... 2026\n`, size: 18, font: "Arial" }),
                  new TextRun({ text: "Petugas Verifikator / Guru\n\n\n\n", bold: true, size: 18, font: "Arial" }),
                  new TextRun({ text: "(...............................................)\n", bold: true, underline: {}, size: 18, font: "Arial" }),
                  new TextRun({ text: "NIP. .......................................", size: 18, font: "Arial" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000,
            },
          },
        },
        children: [
          // Kop
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `${schoolProfile.namaDinasPendidikan || "PEMERINTAH DAERAH / DINAS PENDIDIKAN"}\n`,
                bold: true,
                size: 20,
                font: "Arial",
              }),
              new TextRun({
                text: `${(schoolProfile.namaSekolah || "SEKOLAH DASAR").toUpperCase()}\n`,
                bold: true,
                size: 24,
                font: "Arial",
              }),
              new TextRun({
                text: `${schoolProfile.alamat || ""}, ${schoolProfile.kecamatan || ""}, ${schoolProfile.kabupatenKota || ""} - ${schoolProfile.provinsi || ""} | Telp: ${schoolProfile.nomorTelepon || "-"}`,
                size: 16,
                color: "555555",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 80, after: 120 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            },
            children: [],
          }),
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: `${(checklistData.judulChecklist || "LEMBAR KENDALI MUTU & MONITORING PELAKSANAAN SOP").toUpperCase()}\n`,
                bold: true,
                underline: {},
                size: 22,
                font: "Arial",
              }),
              new TextRun({
                text: `Lampiran Monitoring SOP: ${sop.identitas?.namaSop || ""} (${sop.identitas?.nomorSop || ""})`,
                italics: true,
                size: 17,
                color: "555555",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 120 }, children: [] }),

          // Meta table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: thinBorder,
            rows: metaRows,
          }),

          new Paragraph({ spacing: { after: 120 }, children: [] }),

          // Checklist table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: thinBorder,
            rows: tableRows,
          }),

          new Paragraph({ spacing: { after: 160 }, children: [] }),

          // Signatures
          signatureTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = (sop.identitas?.namaSop || "SOP").replace(/[^a-zA-Z0-9]/g, "_");
  const cleanFilename = `Checklist_Monitoring_${cleanName}.docx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = cleanFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportFormToDocx(
  formData: GeneratedFormDoc,
  sop: SopDocument,
  schoolProfile: SchoolProfile
): Promise<void> {
  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  };

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const createCell = (
    text: string | Paragraph[],
    opts?: {
      widthPct?: number;
      bold?: boolean;
      bg?: string;
      colSpan?: number;
      align?: (typeof AlignmentType)[keyof typeof AlignmentType] | any;
      fontSize?: number;
      borders?: any;
    }
  ) => {
    const paragraphs = Array.isArray(text)
      ? text
      : [
          new Paragraph({
            alignment: opts?.align || AlignmentType.LEFT,
            spacing: { before: 30, after: 30, line: 220 },
            children: [
              new TextRun({
                text: text || "-",
                bold: opts?.bold || false,
                size: opts?.fontSize || 18, // 9pt
                font: "Arial",
              }),
            ],
          }),
        ];

    return new TableCell({
      width: opts?.widthPct ? { size: opts.widthPct, type: WidthType.PERCENTAGE } : undefined,
      columnSpan: opts?.colSpan,
      shading: opts?.bg ? { fill: opts.bg } : undefined,
      borders: opts?.borders !== undefined ? opts.borders : thinBorder,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: paragraphs,
    });
  };

  // Form Fields Table (Bordered neatly for official school administrative blanko)
  const fieldRows: TableRow[] = (formData.fields || []).map((field) => {
    const isTextarea = field.type === "textarea";
    return new TableRow({
      children: [
        createCell(
          [
            new Paragraph({
              spacing: { before: 30, after: 30 },
              children: [
                new TextRun({
                  text: field.label,
                  bold: true,
                  size: 18,
                  font: "Arial",
                }),
                ...(field.wajib
                  ? [
                      new TextRun({
                        text: " *",
                        bold: true,
                        color: "DC2626",
                        size: 18,
                        font: "Arial",
                      }),
                    ]
                  : []),
              ],
            }),
          ],
          { widthPct: 35, bg: "F8FAFC" }
        ),
        createCell(
          [
            new Paragraph({
              spacing: { before: 30, after: isTextarea ? 60 : 30 },
              children: [
                new TextRun({
                  text: isTextarea
                    ? ".........................................................................................................................................................\n........................................................................................................................................................."
                    : "........................................................................................................................",
                  color: "64748B",
                  size: 18,
                  font: "Arial",
                }),
              ],
            }),
          ],
          { widthPct: 65 }
        ),
      ],
    });
  });

  // Optional Table if form has custom table
  let tableRows: TableRow[] = [];
  if (formData.tabel && formData.tabel.kolom && formData.tabel.kolom.length > 0) {
    const colCount = formData.tabel.kolom.length;
    const colWidth = Math.floor(100 / colCount);

    tableRows.push(
      new TableRow({
        tableHeader: true,
        children: formData.tabel.kolom.map((col) =>
          createCell(col, {
            widthPct: colWidth,
            bold: true,
            align: AlignmentType.CENTER,
            bg: "F1F5F9",
          })
        ),
      })
    );

    // 5 Blank filling rows
    for (let r = 1; r <= 5; r++) {
      tableRows.push(
        new TableRow({
          children: formData.tabel.kolom.map((_, colIdx) =>
            createCell(colIdx === 0 ? String(r) : "", {
              widthPct: colWidth,
              align: colIdx === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
            })
          ),
        })
      );
    }
  }

  // Signature Table (borderless)
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Mengetahui,\n", size: 18, font: "Arial" }),
                  new TextRun({ text: `Kepala ${schoolProfile.namaSekolah}\n\n\n\n`, bold: true, size: 18, font: "Arial" }),
                  new TextRun({ text: `${schoolProfile.namaKepalaSekolah}\n`, bold: true, underline: {}, size: 18, font: "Arial" }),
                  new TextRun({ text: `NIP. ${schoolProfile.nip}`, size: 18, font: "Arial" }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorder,
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `${schoolProfile.kabupatenKota}, .................... 2026\n`, size: 18, font: "Arial" }),
                  new TextRun({ text: "Petugas Pelaksana / Pemohon\n\n\n\n", bold: true, size: 18, font: "Arial" }),
                  new TextRun({ text: "(...............................................)\n", bold: true, underline: {}, size: 18, font: "Arial" }),
                  new TextRun({ text: "NIP/NUPTK: ....................................", size: 18, font: "Arial" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000,
            },
          },
        },
        children: [
          // Kop
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `${schoolProfile.namaDinasPendidikan || "PEMERINTAH DAERAH / DINAS PENDIDIKAN"}\n`,
                bold: true,
                size: 20,
                font: "Arial",
              }),
              new TextRun({
                text: `${(schoolProfile.namaSekolah || "SEKOLAH DASAR").toUpperCase()}\n`,
                bold: true,
                size: 24,
                font: "Arial",
              }),
              new TextRun({
                text: `${schoolProfile.alamat || ""}, ${schoolProfile.kecamatan || ""}, ${schoolProfile.kabupatenKota || ""} - ${schoolProfile.provinsi || ""} | Telp: ${schoolProfile.nomorTelepon || "-"}`,
                size: 16,
                color: "555555",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 80, after: 120 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            },
            children: [],
          }),
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({
                text: `${(formData.namaFormulir || "FORMULIR BUKTI ADMINISTRASI PENDUKUNG").toUpperCase()}\n`,
                bold: true,
                underline: {},
                size: 22,
                font: "Arial",
              }),
              new TextRun({
                text: `Lampiran Pelaksanaan Prosedur: ${sop.identitas?.namaSop || ""} (${sop.identitas?.nomorSop || ""})`,
                italics: true,
                size: 17,
                color: "555555",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 140 }, children: [] }),

          // Form fields table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: thinBorder,
            rows: fieldRows,
          }),

          ...(formData.tabel && tableRows.length > 0
            ? [
                new Paragraph({
                  spacing: { before: 140, after: 60 },
                  children: [
                    new TextRun({
                      text: formData.tabel.judul || "Tabel Rincian Kegiatan:",
                      bold: true,
                      size: 18,
                      font: "Arial",
                    }),
                  ],
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: thinBorder,
                  rows: tableRows,
                }),
              ]
            : []),

          new Paragraph({ spacing: { after: 160 }, children: [] }),

          // Signatures
          signatureTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFormName = (formData.namaFormulir || "Formulir").replace(/[^a-zA-Z0-9]/g, "_");
  const cleanSopName = (sop.identitas?.namaSop || "SOP").replace(/[^a-zA-Z0-9]/g, "_");
  const cleanFilename = `Formulir_${cleanFormName}_${cleanSopName}.docx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = cleanFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
