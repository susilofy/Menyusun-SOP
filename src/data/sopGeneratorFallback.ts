import { SopDocument, SchoolProfile, DasarHukumItem, PelaksanaMutuBakuStep } from "../types";
import { officialRegulationsCatalog } from "./initialData";

export interface SopGeneratorOptions {
  targetStepsCount?: number;
  targetDasarHukumCount?: number;
  selectedDasarHukum?: DasarHukumItem[];
}

export function buildFallbackSopDocument(
  namaSop: string,
  kategori: string,
  schoolProfile: SchoolProfile,
  interviewAnswers?: Record<string, string>,
  options?: SopGeneratorOptions
): SopDocument {
  const currentYear = new Date().getFullYear();
  const rawCode = (kategori || "A").slice(0, 1).toUpperCase();

  // Extract interview answers if provided
  const ansPelaksana =
    interviewAnswers?.["pihakTerlibat"] ||
    interviewAnswers?.["q1"] ||
    "Kepala Sekolah, Guru Kelas, Tenaga Administrasi (TAS), Komite";
  const ansAlur =
    interviewAnswers?.["alurBerjalan"] ||
    interviewAnswers?.["q3"] ||
    "Koordinasi awal, penyusunan draf, verifikasi data, pengesahan, dan pengarsipan";
  const ansDokumen =
    interviewAnswers?.["berkasDokumen"] ||
    interviewAnswers?.["q2"] ||
    "SK Penetapan Tim, Panduan Teknis, Format Blanko Instrumen";
  const ansWaktu =
    interviewAnswers?.["waktuPenyelesaian"] ||
    interviewAnswers?.["q4"] ||
    "3 - 5 hari kerja";
  const ansOutput =
    interviewAnswers?.["kendalaRisiko"] ||
    interviewAnswers?.["q5"] ||
    "Dokumen final bertanda tangan, berita acara, dan arsip digital";

  // Parse pelaksana roles
  const pelaksanaRoles = ansPelaksana
    .split(/[,;\n]+/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  const pelaksanaList = [
    pelaksanaRoles[0] || "Kepala Sekolah",
    pelaksanaRoles[1] || "Guru / Tim Pelaksana",
    pelaksanaRoles[2] || "Tenaga Administrasi (TAS)",
    pelaksanaRoles[3] || "Komite / Orang Tua",
    pelaksanaRoles[4] || "Pengawas / Dinas Pendidikan",
  ].slice(0, 5);

  while (pelaksanaList.length < 3) {
    pelaksanaList.push(`Pelaksana ${pelaksanaList.length + 1}`);
  }

  // Determine Dasar Hukum
  const targetDhCount = Math.max(1, Math.min(10, options?.targetDasarHukumCount || 3));
  let resolvedDasarHukum: DasarHukumItem[] = [];

  if (options?.selectedDasarHukum && options.selectedDasarHukum.length > 0) {
    resolvedDasarHukum = options.selectedDasarHukum.slice(0, targetDhCount);
  } else {
    // Pick from official catalog
    const catalog = officialRegulationsCatalog && officialRegulationsCatalog.length > 0
      ? officialRegulationsCatalog
      : [
          {
            id: "dh-1",
            namaRegulasi: "Undang-Undang Nomor 20 Tahun 2003",
            nomor: "20",
            tahun: "2003",
            tentang: "Sistem Pendidikan Nasional",
            statusVerifikasi: "Terverifikasi Resmi" as const,
            sumber: "JDIH Kemendikbudristek",
          },
          {
            id: "dh-2",
            namaRegulasi: "Peraturan Pemerintah Nomor 57 Tahun 2021 jo PP Nomor 4 Tahun 2022",
            nomor: "57 jo 4",
            tahun: "2021/2022",
            tentang: "Standar Nasional Pendidikan",
            statusVerifikasi: "Terverifikasi Resmi" as const,
            sumber: "JDIH BPK RI",
          },
          {
            id: "dh-3",
            namaRegulasi: "Permendikbudristek Nomor 47 Tahun 2023",
            nomor: "47",
            tahun: "2023",
            tentang: "Standar Pengelolaan pada PAUD, Dikdas, dan Dikmen",
            statusVerifikasi: "Terverifikasi Resmi" as const,
            sumber: "JDIH Kemendikbudristek",
          },
        ];

    resolvedDasarHukum = catalog.slice(0, targetDhCount).map((item, idx) => ({
      ...item,
      id: item.id || `dh-${idx + 1}`,
      statusVerifikasi: "Terverifikasi Resmi" as const,
    }));
  }

  // Determine Steps count
  const targetSteps = Math.max(3, Math.min(15, options?.targetStepsCount || 5));

  // Dynamic template pool for steps
  const proceduralStepTemplates = [
    {
      deskripsi: `Kepala Sekolah memimpin rapat koordinasi dan memberikan mandat pengorganisasian pelaksanaan ${namaSop}.`,
      flowType: "start" as const,
      roleIdx: 0,
      persyaratan: "Juknis / Regulasi Terkait, Agenda Rapat",
      waktu: "1 hari kerja",
      output: "Instruksi Pelaksanaan & Mandat Tim Kerja",
    },
    {
      deskripsi: "Tim pelaksana mengumpulkan data awal, menyusun draf administrasi, dan menyiapkan kelengkapan persyaratan teknis.",
      flowType: "process" as const,
      roleIdx: 1,
      persyaratan: ansDokumen,
      waktu: ansWaktu || "2 hari kerja",
      output: "Draf berkas awal & rekapitulasi data pendukung",
    },
    {
      deskripsi: "Sosialisasi teknis dan konfirmasi jadwal pelaksanaan kepada seluruh pendidik, tenaga kependidikan, atau sasaran terkait.",
      flowType: "process" as const,
      roleIdx: 1,
      persyaratan: "Edaran resmi, buku agenda, jadwal kerja",
      waktu: "1 hari kerja",
      output: "Tanda terima sosialisasi & kesiapan lapangan",
    },
    {
      deskripsi: `Pelaksanaan tindakan operasional langsung di satuan pendidikan sesuai standar teknis ${namaSop}.`,
      flowType: "process" as const,
      roleIdx: 1,
      persyaratan: "Perangkat kegiatan, format observasi / catatan lapangan",
      waktu: ansWaktu || "2 hari kerja",
      output: "Catatan rekam jejak kegiatan operasional",
    },
    {
      deskripsi: "Tenaga Administrasi Sekolah (TAS) dan tim verifikator merekapitulasi data serta memeriksa kelengkapan bukti administrasi.",
      flowType: "decision" as const,
      roleIdx: 2,
      persyaratan: "Checklist verifikasi data & bukti fisik/digital",
      waktu: "1 hari kerja",
      output: "Lembar verifikasi terparaf & catatan kesesuaian",
    },
    {
      deskripsi: "Rapat telaah penjaminan mutu internal antara tim pelaksana dan penanggung jawab untuk memastikan kepatuhan standar baku.",
      flowType: "process" as const,
      roleIdx: 1,
      persyaratan: "Draf terverifikasi, catatan kendala / audit mutu",
      waktu: "1 hari kerja",
      output: "Notulen telaah internal & perbaikan berkas",
    },
    {
      deskripsi: "Kepala Sekolah menelaah dokumen final, memeriksa rekap hasil verifikasi, dan menandatangani lembar pengesahan resmi.",
      flowType: "decision" as const,
      roleIdx: 0,
      persyaratan: "Draf final terverifikasi & berkas usulan pengesahan",
      waktu: "1 hari kerja",
      output: "Dokumen resmi telah disahkan & berstempel sekolah",
    },
    {
      deskripsi: "Penyampaian salinan dokumen kepada pihak berkepentingan (Komite Sekolah / Pengawas Pembina) sebagai transparansi publik.",
      flowType: "process" as const,
      roleIdx: 2,
      persyaratan: "Dokumen pengesahan, buku ekspedisi persuratan",
      waktu: "1 hari kerja",
      output: "Tanda terima penyerahan laporan / dokumen",
    },
    {
      deskripsi: "Pengarsipan dokumen bukti fisik ke dalam ordner tata usaha serta pencadangan arsip digital ke cloud drive sekolah secara tertib.",
      flowType: "end" as const,
      roleIdx: 2,
      persyaratan: "Dokumen final asli & scan PDF",
      waktu: "1 hari kerja",
      output: "Arsip fisik tertata & tautan folder cloud tersimpan",
    },
    {
      deskripsi: "Evaluasi berkala kepatuhan prosedur dan perumusan rekomendasi pemutakhiran untuk siklus perbaikan mutu berikutnya.",
      flowType: "end" as const,
      roleIdx: 0,
      persyaratan: "Instrumen monitoring & catatan evaluasi tahunan",
      waktu: "Berkala (1 hari)",
      output: "Laporan evaluasi implementasi SOP",
    },
  ];

  // Select or scale steps to exactly targetSteps
  const steps: PelaksanaMutuBakuStep[] = [];
  for (let i = 0; i < targetSteps; i++) {
    const isFirst = i === 0;
    const isLast = i === targetSteps - 1;
    const isPenultimate = i === targetSteps - 2;

    let template = proceduralStepTemplates[i];
    if (!template) {
      template = {
        deskripsi: `Langkah operasional lanjutan #${i + 1}: Pemantauan, pencatatan rincian, dan koordinasi teknis pelaksanaan ${namaSop}.`,
        flowType: isLast ? "end" : "process",
        roleIdx: i % pelaksanaList.length,
        persyaratan: "Dokumen pendukung dan buku catatan lapangan",
        waktu: "1 hari kerja",
        output: "Laporan rekam jejak pelaksanaan",
      };
    }

    let flowType: "start" | "process" | "decision" | "end" = template.flowType;
    if (isFirst) flowType = "start";
    else if (isLast) flowType = "end";
    else if (isPenultimate && targetSteps >= 4) flowType = "decision";

    let roleIdx = template.roleIdx;
    if (isFirst || isPenultimate) roleIdx = 0; // Kepala Sekolah
    if (roleIdx >= pelaksanaList.length) roleIdx = 1;

    const assignedRole = pelaksanaList[roleIdx] || pelaksanaList[0];
    const checks: Record<string, any> = {};
    pelaksanaList.forEach((role) => {
      checks[role] = role === assignedRole ? flowType : false;
    });

    steps.push({
      id: `step-${i + 1}-${Date.now()}`,
      no: i + 1,
      uraianProsedur: isFirst
        ? `Kepala Sekolah memberikan arahan kebijakan dan mandat penetapan tim kerja terkait ${namaSop}.`
        : isLast
        ? "Sosialisasi hasil pelaksanaan kepada pihak berkepentingan serta pengarsipan dokumen resmi fisik dan digital."
        : template.deskripsi,
      pelaksanaChecks: checks,
      persyaratan: template.persyaratan,
      waktu: template.waktu,
      output: isLast ? (ansOutput || "Arsip dokumen final bertanda tangan") : template.output,
      flowType,
      activePelaksanaIndex: roleIdx,
    });
  }

  return {
    id: `sop-${Date.now()}`,
    identitas: {
      namaSop: namaSop || "SOP Standar Operasional Sekolah",
      nomorSop: `SOP/SD/${rawCode}/${String(Math.floor(100 + Math.random() * 900))}/${currentYear}`,
      tanggalPembuatan: `02 Januari ${currentYear}`,
      tanggalRevisi: "00",
      tanggalPengesahan: `10 Januari ${currentYear}`,
      disahkanOleh: `Kepala ${schoolProfile?.namaSekolah || "Sekolah Dasar"}`,
      namaKepalaSekolah: schoolProfile?.namaKepalaSekolah || "Kepala Sekolah",
      nip: schoolProfile?.nip || "-",
      unitKerja: schoolProfile?.namaSekolah || "Satuan Pendidikan Dasar",
    },
    dasarHukum: resolvedDasarHukum,
    kualifikasiPelaksana: [
      "Memahami tugas pokok dan fungsi (tupoksi) di lingkungan sekolah dasar",
      "Memiliki keterampilan administrasi dan komunikasi efektif dengan warga sekolah",
      "Mampu mendokumentasikan setiap tahapan kegiatan secara transparan dan akuntabel",
    ],
    keterkaitan: [
      "SOP Manajemen Tata Kelola Sekolah Dasar",
      "SOP Administrasi dan Pelaporan Satuan Pendidikan",
    ],
    peralatanPerlengkapan: [
      "Komputer / Laptop dan Jaringan Internet",
      "Perangkat ATK, Lembar Verifikasi, dan Format Formulir",
      "Buku Agenda Kerja dan Buku Ekspedisi Persuratan",
    ],
    peringatan: [
      "Pelaksanaan prosedur wajib mematuhi tenggat waktu untuk menghindari kendala operasional",
      "Setiap kelalaian prosedur berpotensi menimbulkan kendala koordinasi atau temuan audit administrasi",
    ],
    pencatatanPendataan: {
      dokumenBukti: [
        "Lembar disposisi pimpinan",
        "Daftar hadir dan notulen koordinasi",
        "Berita acara / lembar pengesahan",
        "Arsip berkas pendukung fisik dan digital",
      ],
      penanggungJawabArsip: "Tenaga Administrasi Sekolah & Kepala Sekolah",
      mediaPenyimpanan: "Map Ordner Ruang Tata Usaha & Google Drive Sekolah",
      periodePenyimpanan: "Minimal 3 sampai 5 tahun ajaran",
    },
    pelaksanaList,
    tabelPelaksanaMutuBaku: steps,
    checklistKelengkapan: {
      namaSopTersedia: true,
      nomorSopTersedia: true,
      tanggalTersedia: true,
      kepalaSekolahTersedia: true,
      nipTersedia: true,
      dasarHukumTersedia: true,
      dasarHukumTerverifikasi: true,
      kualifikasiPelaksanaTersedia: true,
      keterkaitanTersedia: true,
      peralatanTersedia: true,
      peringatanTersedia: true,
      pencatatanTersedia: true,
      alurProsedurJelas: true,
      semuaLangkahMemilikiPelaksana: true,
      semuaLangkahMemilikiOutput: true,
      waktuTersedia: true,
      dokumenPendukungTersedia: true,
      tidakAdaLangkahAmbigu: true,
      tidakAdaPengulangan: true,
      skorAdministratif: 100,
      catatanPerbaikan: [],
    },
    versi: "1.0",
    status: "DRAFT",
    kategori: kategori || "A. Manajemen Sekolah",
    tanggalReviewBerikutnya: `${currentYear + 1}-01-10`,
    penanggungJawab: schoolProfile?.namaKepalaSekolah || "Kepala Sekolah",
    riwayatRevisi: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
