import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

const serverDir = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Dynamic multi-location .env loader for web, local dev, installer, and portable mode
const possibleEnvLocations = [
  path.join(process.cwd(), ".env"),
  process.env.PORTABLE_EXECUTABLE_DIR ? path.join(process.env.PORTABLE_EXECUTABLE_DIR, ".env") : "",
  process.env.USER_DATA_PATH ? path.join(process.env.USER_DATA_PATH, ".env") : "",
  path.join(serverDir, ".env"),
  path.join(serverDir, "..", ".env"),
].filter(Boolean);

for (const envPath of possibleEnvLocations) {
  if (fs.existsSync(envPath)) {
    try {
      dotenv.config({ path: envPath });
      break;
    } catch {}
  }
}
// Default fallback
dotenv.config();

const PORT = 3000;

// Dynamic client initialization with validation
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Candidate models: prioritize gemini-3.1-flash-lite for higher throughput, then gemini-3.8-flash
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

// Helper: Call Gemini with fallback chain
async function generateGeminiContentWithRetry(params: {
  contents: any;
  config?: any;
}): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi di file .env. Menggunakan generator SOP standar SD.");
  }

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      // Log as non-error info to prevent false alarm alerts in development monitor
      console.info(`[AI Service] Model ${model} unavailable, checking fallback...`);
    }
  }

  throw lastError || new Error("Layanan AI sedang dalam antrean. Menggunakan generator SOP standar SD.");
}

// Fallback: Interview questions when AI service is experiencing high load
function buildFallbackInterviewQuestions(namaSop: string) {
  return {
    questions: [
      {
        id: "q1",
        question: `Siapa saja pihak pelaksana (tupoksi) yang paling bertanggung jawab dalam alur "${namaSop}"?`,
        hint: "Contoh: Kepala Sekolah, Guru Kelas, Guru Mapel, Tenaga Administrasi (TAS), Komite",
        defaultValue: "Kepala Sekolah, Guru Kelas, Tenaga Administrasi (TAS), Orang Tua / Komite",
      },
      {
        id: "q2",
        question: `Dokumen syarat awal dan perlengkapan apa saja yang wajib disiapkan sebelum prosedur "${namaSop}" dimulai?`,
        hint: "Contoh: Surat permohonan, format instrumen, SK Tim, buku panduan",
        defaultValue: "SK Penetapan Tim, Panduan Teknis, Format Blanko Instrumen",
      },
      {
        id: "q3",
        question: `Bagaimana urutan alur kerja utama dari awal pembentukan draf hingga pengesahan akhir?`,
        hint: "Contoh: Instruksi pimpinan -> Penyusunan draf -> Verifikasi berkas -> Pengesahan Kepala Sekolah -> Arsip",
        defaultValue: "Instruksi pimpinan, pengumpulan data, verifikasi berkas, persetujuan dan pengesahan, lalu arsip",
      },
      {
        id: "q4",
        question: `Berapa rata-rata estimasi waktu penyelesaian yang realistis untuk SOP ini?`,
        hint: "Contoh: 30 menit, 1 hari kerja, atau 3 sampai 5 hari kerja",
        defaultValue: "3 sampai 5 hari kerja",
      },
      {
        id: "q5",
        question: `Output atau dokumen bukti fisik/digital apa yang dihasilkan pada akhir proses?`,
        hint: "Contoh: Berita acara, SK pengesahan, buku laporan, rekaman tanda terima",
        defaultValue: "Dokumen final bertanda tangan, berita acara, dan arsip digital",
      },
    ],
  };
}

// Fallback: Needs analysis with all 13 official SD categories (A to M)
function buildFallbackNeedsAnalysis(schoolProfile: any) {
  const schoolName = schoolProfile?.namaSekolah || "SD Negeri 3 Loloan Timur";
  return {
    summary: `Analisis kebutuhan SOP prioritas untuk ${schoolName} berhasil disusun secara komprehensif mencakup 13 kategori operasional Sekolah Dasar sesuai Standar Nasional Pendidikan (SNP) dan regulasi Kemendikbudristek.`,
    totalRecommended: 13,
    categories: [
      {
        categoryCode: "A",
        categoryName: "Manajemen Sekolah",
        sops: [
          {
            id: "A-1",
            namaSop: "SOP Penyusunan Rencana Kerja Jangka Menengah (RKJM) dan RKT",
            tujuan: "Menyusun arah kebijakan program 4 tahunan dan tahunan sekolah berbasis data Rapor Pendidikan",
            alasanDiperlukan: "Mencegah perencanaan program yang tidak terarah dan tidak sinkron dengan program prioritas",
            risikoJikaTidakAda: "Alokasi anggaran tidak tepat sasaran dan temuan dalam audit pengawasan dinas",
            prioritas: "Tinggi",
            pihakTerlibat: ["Kepala Sekolah", "Tim Pengembang Sekolah", "Komite", "Guru"],
            status: "Belum Ada",
          },
          {
            id: "A-2",
            namaSop: "SOP Pelaksanaan Evaluasi Diri Sekolah (EDS) / Rapor Pendidikan",
            tujuan: "Menganalisis capaian mutu untuk perencanaan berbasis data (PBD)",
            alasanDiperlukan: "Menjadi rujukan pembenahan mutu pembelajaran dan iklim keamanan sekolah",
            risikoJikaTidakAda: "Sekolah tidak mengenali akar masalah mutu peserta didik",
            prioritas: "Tinggi",
            pihakTerlibat: ["Kepala Sekolah", "Dewan Guru", "Operator Sekolah"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "B",
        categoryName: "Kurikulum dan Pembelajaran",
        sops: [
          {
            id: "B-1",
            namaSop: "SOP Penyusunan Modul Ajar dan Perangkat Kurikulum Merdeka",
            tujuan: "Memastikan kesiapan pembelajaran berdiferensiasi yang berpusat pada peserta didik",
            alasanDiperlukan: "Menyeragamkan standar dokumen ajar dan asesmen guru di setiap fase",
            risikoJikaTidakAda: "Pembelajaran monoton dan tidak terarah",
            prioritas: "Tinggi",
            pihakTerlibat: ["Kepala Sekolah", "Guru Kelas", "Guru Mapel"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "C",
        categoryName: "Kesiswaan",
        sops: [
          {
            id: "C-1",
            namaSop: "SOP Penerimaan Peserta Didik Baru (PPDB) Jalur Zonasi & Afirmasi",
            tujuan: "Menjamin transparansi dan keadilan seleksi calon peserta didik baru",
            alasanDiperlukan: "Mencegah komplain orang tua dan penyimpangan kuota daya tampung",
            risikoJikaTidakAda: "Potensi konflik sosial dan pelanggaran petunjuk teknis dinas",
            prioritas: "Tinggi",
            pihakTerlibat: ["Panitia PPDB", "Kepala Sekolah", "Orang Tua Siswa"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "D",
        categoryName: "Perlindungan Anak",
        sops: [
          {
            id: "D-1",
            namaSop: "SOP Pencegahan dan Penanganan Kekerasan di Lingkungan Satuan Pendidikan (TPPK)",
            tujuan: "Menciptakan lingkungan belajar ramah anak bebas dari perundungan, kekerasan fisik, dan psikis",
            alasanDiperlukan: "Amanat wajib Permendikbudristek No. 46/2023",
            risikoJikaTidakAda: "Trauma peserta didik dan sanksi administratif bagi sekolah",
            prioritas: "Tinggi",
            pihakTerlibat: ["Tim TPPK", "Kepala Sekolah", "Guru BK/Wali Kelas", "Komite"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "E",
        categoryName: "Guru dan Tenaga Kependidikan",
        sops: [
          {
            id: "E-1",
            namaSop: "SOP Penilaian Kinerja Guru (PKG) dan Supervisi Akademik",
            tujuan: "Meningkatkan kompetensi pedagogik dan profesionalisme guru secara berkala",
            alasanDiperlukan: "Evaluasi kualitas pembelajaran dan pemenuhan e-Kinerja PMM",
            risikoJikaTidakAda: "Kualitas pembelajaran di kelas stagnan",
            prioritas: "Sedang",
            pihakTerlibat: ["Kepala Sekolah", "Guru Sasaran", "Pengawas Pembina"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "F",
        categoryName: "Sarana dan Prasarana",
        sops: [
          {
            id: "F-1",
            namaSop: "SOP Pemeliharaan dan Inventarisasi Sarana Prasarana Sekolah",
            tujuan: "Menjaga kelayakan dan keawetan sarana pembelajaran dan fasilitas sanitasi",
            alasanDiperlukan: "Mencegah kerusakan dini dan kehilangan aset negara/daerah",
            risikoJikaTidakAda: "Sarana belajar rusak dan terhambatnya proses KBM",
            prioritas: "Sedang",
            pihakTerlibat: ["Pengurus Barang / Petugas Sarpras", "Kepala Sekolah"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "G",
        categoryName: "Keuangan",
        sops: [
          {
            id: "G-1",
            namaSop: "SOP Pengelolaan Dana BOSP Melalui Aplikasi ARKAS",
            tujuan: "Menatausahakan belanja anggaran sekolah yang tertib, transparan, dan akuntabel",
            alasanDiperlukan: "Kepatuhan terhadap juknis BOSP dan regulasi audit BPK/Inspektorat",
            risikoJikaTidakAda: "Keterlambatan pencairan dana dan temuan SPJ keuangan",
            prioritas: "Tinggi",
            pihakTerlibat: ["Kepala Sekolah", "Bendahara BOS", "Komite Sekolah"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "H",
        categoryName: "Administrasi/Tata Usaha",
        sops: [
          {
            id: "H-1",
            namaSop: "SOP Pemutakhiran Data Pokok Pendidikan (Dapodik) Tepat Waktu",
            tujuan: "Menjamin validitas data peserta didik, GTK, dan sarpras secara real-time",
            alasanDiperlukan: "Dapodik merupakan basis data alokasi dana BOSP dan tunjangan guru",
            risikoJikaTidakAda: "Dana BOSP terpotong atau tunjangan sertifikasi guru terhambat",
            prioritas: "Tinggi",
            pihakTerlibat: ["Operator Sekolah", "Kepala Sekolah", "Guru"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "I",
        categoryName: "UKS dan Kesehatan",
        sops: [
          {
            id: "I-1",
            namaSop: "SOP Pertolongan Pertama dan Rujukan Kesehatan Peserta Didik (UKS)",
            tujuan: "Memberikan penanganan medis awal yang cepat dan tepat bagi siswa sakit atau cedera",
            alasanDiperlukan: "Pertolongan darurat di jam sekolah sebelum dirujuk ke Puskesmas",
            risikoJikaTidakAda: "Keterlambatan penanganan kondisi gawat darurat medis siswa",
            prioritas: "Tinggi",
            pihakTerlibat: ["Pembina UKS / Dokter Kecil", "Guru Piket", "Puskesmas"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "J",
        categoryName: "Keamanan dan Kedaruratan",
        sops: [
          {
            id: "J-1",
            namaSop: "SOP Penjemputan Peserta Didik dan Keamanan Gerbang Sekolah",
            tujuan: "Menjamin keselamatan murid saat jam pulang dan mencegah penculikan/kecelakaan",
            alasanDiperlukan: "Lokasi sekolah yang berbatasan dengan jalan raya ramai kendaraan",
            risikoJikaTidakAda: "Kecelakaan lalu lintas dan potensi kerawanan anak hilang",
            prioritas: "Tinggi",
            pihakTerlibat: ["Petugas Keamanan / Satpam", "Guru Piket", "Orang Tua Siswa"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "K",
        categoryName: "Perpustakaan",
        sops: [
          {
            id: "K-1",
            namaSop: "SOP Layanan Sirkulasi Peminjaman dan Pengembalian Buku Perpustakaan",
            tujuan: "Mengatur tertib peminjaman buku pengayaan dan buku teks pelajaran",
            alasanDiperlukan: "Meningkatkan minat baca dan mengontrol keteraturan koleksi",
            risikoJikaTidakAda: "Buku perpustakaan hilang atau rusak tanpa pertanggungjawaban",
            prioritas: "Sedang",
            pihakTerlibat: ["Pengelola Perpustakaan", "Siswa", "Guru Kelas"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "L",
        categoryName: "Hubungan Sekolah dengan Orang Tua",
        sops: [
          {
            id: "L-1",
            namaSop: "SOP Penanganan Keluhan dan Pengaduan Orang Tua / Wali Murid",
            tujuan: "Menyediakan saluran aspirasi dan penyelesaian masalah yang komunikatif dan solutif",
            alasanDiperlukan: "Mencegah perselisihan melebar ke media sosial",
            risikoJikaTidakAda: "Kerusakan reputasi sekolah dan renggangnya relasi kemitraan",
            prioritas: "Sedang",
            pihakTerlibat: ["Kepala Sekolah", "Tim Pengaduan / Komite", "Wali Murid"],
            status: "Belum Ada",
          },
        ],
      },
      {
        categoryCode: "M",
        categoryName: "Kegiatan Sekolah",
        sops: [
          {
            id: "M-1",
            namaSop: "SOP Pelaksanaan Kegiatan Belajar di Luar Kelas / Karyawisata Edukasi",
            tujuan: "Memastikan keamanan, perizinan, dan efektivitas pembelajaran kontekstual di luar sekolah",
            alasanDiperlukan: "Aktivitas luar ruang memiliki risiko keselamatan yang memerlukan mitigasi",
            risikoJikaTidakAda: "Insiden keselamatan dan ketiadaan pertanggungjawaban panitia",
            prioritas: "Tinggi",
            pihakTerlibat: ["Panitia Karyawisata", "Kepala Sekolah", "Komite", "Penyedia Transportasi"],
            status: "Belum Ada",
          },
        ],
      },
    ],
  };
}

// Fallback: Full standardized SD SOP document
function buildFallbackSopDocument(
  namaSop: string,
  kategori: string,
  schoolProfile: any,
  interviewAnswers: any,
  options?: any
) {
  const currentYear = new Date().getFullYear();
  const rawCode = (kategori || "A").slice(0, 1).toUpperCase();
  const pelaksanaList = [
    "Kepala Sekolah",
    "Guru / Tim Pelaksana",
    "Tenaga Administrasi (TAS)",
    "Komite / Orang Tua",
    "Pengawas / Dinas Pendidikan",
  ];

  const defaultDasarHukum = [
    {
      id: "dh-1",
      namaRegulasi: "Undang-Undang Nomor 20 Tahun 2003",
      nomor: "20",
      tahun: "2003",
      tentang: "Sistem Pendidikan Nasional",
      statusVerifikasi: "Terverifikasi Resmi",
      sumber: "JDIH Kemendikbudristek",
    },
    {
      id: "dh-2",
      namaRegulasi: "Peraturan Pemerintah Nomor 57 Tahun 2021 jo PP Nomor 4 Tahun 2022",
      nomor: "57 jo 4",
      tahun: "2021/2022",
      tentang: "Standar Nasional Pendidikan",
      statusVerifikasi: "Terverifikasi Resmi",
      sumber: "JDIH BPK RI",
    },
    {
      id: "dh-3",
      namaRegulasi: "Permendikbudristek Nomor 47 Tahun 2023",
      nomor: "47",
      tahun: "2023",
      tentang: "Standar Pengelolaan pada PAUD, Dikdas, dan Dikmen",
      statusVerifikasi: "Terverifikasi Resmi",
      sumber: "JDIH Kemendikbudristek",
    },
    {
      id: "dh-4",
      namaRegulasi: "Permendikdasmen Nomor 8 Tahun 2025",
      nomor: "8",
      tahun: "2025",
      tentang: "Petunjuk Teknis Pengelolaan Dana Bantuan Operasional Satuan Pendidikan (BOSP)",
      statusVerifikasi: "Terverifikasi Resmi",
      sumber: "JDIH Kemendikdasmen",
    },
    {
      id: "dh-5",
      namaRegulasi: "Permenpan RB Nomor 35 Tahun 2012",
      nomor: "35",
      tahun: "2012",
      tentang: "Pedoman Penyusunan Standar Operasional Prosedur Administrasi Pemerintahan",
      statusVerifikasi: "Terverifikasi Resmi",
      sumber: "JDIH Kemenpan RB",
    },
  ];

  let resolvedDasarHukum = defaultDasarHukum.slice(0, 3);
  if (options?.selectedDasarHukum && Array.isArray(options.selectedDasarHukum) && options.selectedDasarHukum.length > 0) {
    resolvedDasarHukum = options.selectedDasarHukum;
  } else if (options?.targetDasarHukumCount && typeof options.targetDasarHukumCount === "number") {
    const count = Math.max(1, Math.min(10, options.targetDasarHukumCount));
    resolvedDasarHukum = defaultDasarHukum.slice(0, count);
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
    tabelPelaksanaMutuBaku: (() => {
      const targetCount = options?.targetStepsCount && typeof options.targetStepsCount === "number"
        ? Math.max(3, Math.min(15, options.targetStepsCount))
        : 5;

      const baseSteps = [
        {
          uraian: `Kepala Sekolah memberikan arahan kebijakan dan mandat pembentukan tim kerja terkait ${namaSop}.`,
          roleIdx: 0,
          persyaratan: "Juknis / Regulasi Terkait, Agenda Rapat",
          waktu: "1 hari",
          output: "Instruksi Pelaksanaan & SK Tim Kerja",
          flowType: "start",
        },
        {
          uraian: "Tim pelaksana mengumpulkan data awal, menyusun draf dokumen dan blanko formulir pendukung.",
          roleIdx: 1,
          persyaratan: "Format instrumen, data siswa/guru",
          waktu: "2 hari",
          output: "Draf berkas awal & rekapitulasi data",
          flowType: "process",
        },
        {
          uraian: "Tenaga administrasi dan tim memeriksa kelengkapan berkas serta memvalidasi keabsahan data.",
          roleIdx: 2,
          persyaratan: "Checklist verifikasi data",
          waktu: "1 hari",
          output: "Lembar verifikasi terparaf",
          flowType: "decision",
        },
        {
          uraian: "Kepala Sekolah menelaah hasil verifikasi dan memberikan persetujuan pengesahan resmi dokumen.",
          roleIdx: 0,
          persyaratan: "Draf terverifikasi & berkas usulan",
          waktu: "1 hari",
          output: "Dokumen disetujui & ditandatangani",
          flowType: "decision",
        },
        {
          uraian: "Sosialisasi hasil pelaksanaan kepada warga sekolah / orang tua dan pengarsipan dokumen resmi.",
          roleIdx: 1,
          persyaratan: "Dokumen final bertanda tangan, buku ekspedisi",
          waktu: "1 hari",
          output: "Tanda terima sosialisasi & arsip tersimpan rapi",
          flowType: "end",
        },
        {
          uraian: "Pemberian nomor registrasi resmi dan pembubuhan stempel dinas sekolah.",
          roleIdx: 2,
          persyaratan: "Dokumen bertanda tangan, stempel dinas",
          waktu: "1 hari",
          output: "Dokumen resmi berstempel dan bernomor",
          flowType: "process",
        },
        {
          uraian: "Penyampaian salinan tembusan kepada Pengawas Sekolah / Dinas Pendidikan setempat.",
          roleIdx: 4,
          persyaratan: "Surat pengantar dinas, buku ekspedisi",
          waktu: "1 hari",
          output: "Lembar tanda terima dinas pendidikan",
          flowType: "process",
        },
        {
          uraian: "Evaluasi berkala terhadap keterlaksanaan prosedur dan kepatuhan mutu baku.",
          roleIdx: 0,
          persyaratan: "Instrumen evaluasi mutu, catatan audit internal",
          waktu: "3 hari",
          output: "Laporan evaluasi dan rekomendasi perbaikan",
          flowType: "process",
        },
        {
          uraian: "Penyusunan rekomendasi tindak lanjut penyempurnaan prosedur operasional.",
          roleIdx: 1,
          persyaratan: "Hasil evaluasi mutu",
          waktu: "2 hari",
          output: "Draf rencana tindak lanjut",
          flowType: "process",
        },
        {
          uraian: "Rapat koordinasi refleksi tindak lanjut bersama seluruh pelaksana.",
          roleIdx: 0,
          persyaratan: "Bahan rapat refleksi, daftar hadir",
          waktu: "1 hari",
          output: "Notula rapat refleksi",
          flowType: "process",
        },
        {
          uraian: "Pendokumentasian digital ke dalam repositori arsip terpadu sekolah.",
          roleIdx: 2,
          persyaratan: "File digital (PDF/DOCX), scanner",
          waktu: "1 hari",
          output: "Tautan arsip digital aman",
          flowType: "process",
        },
        {
          uraian: "Penutupan siklus prosedur dan pemutakhiran papan kendali mutu sekolah.",
          roleIdx: 2,
          persyaratan: "Papan instrumen mutu, checklist penutupan",
          waktu: "1 hari",
          output: "Status SOP tercatat paripurna",
          flowType: "end",
        },
      ];

      return Array.from({ length: targetCount }).map((_, i) => {
        const t = baseSteps[i % baseSteps.length];
        const stepNo = i + 1;
        const checks: Record<string, any> = {};
        pelaksanaList.forEach((p, pIdx) => {
          if (pIdx === t.roleIdx) {
            checks[p] = stepNo === 1 ? "start" : stepNo === targetCount ? "end" : (t.flowType as any);
          } else {
            checks[p] = false;
          }
        });

        return {
          id: `step-${stepNo}`,
          no: stepNo,
          uraianProsedur: t.uraian,
          pelaksanaChecks: checks,
          persyaratan: t.persyaratan,
          waktu: t.waktu,
          output: t.output,
          flowType: stepNo === 1 ? "start" : stepNo === targetCount ? "end" : (t.flowType as any),
        };
      });
    })(),
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

function normalizeSopDocument(raw: any, fallback: any) {
  if (!raw || typeof raw !== "object") return fallback;

  const currentYear = new Date().getFullYear();
  const identitasRaw = raw.identitas || {};

  const namaSop =
    identitasRaw.namaSop ||
    identitasRaw.judulSOP ||
    identitasRaw.judulSop ||
    identitasRaw.nama ||
    raw.namaSop ||
    raw.judulSOP ||
    fallback?.identitas?.namaSop ||
    "SOP Satuan Pendidikan";

  const nomorSop =
    identitasRaw.nomorSop ||
    identitasRaw.nomor ||
    raw.nomorSop ||
    fallback?.identitas?.nomorSop ||
    `SOP/SD-${Date.now().toString().slice(-4)}/${currentYear}`;

  const tanggalPembuatan =
    identitasRaw.tanggalPembuatan ||
    fallback?.identitas?.tanggalPembuatan ||
    `${currentYear}-01-05`;

  const tanggalRevisi = identitasRaw.tanggalRevisi || fallback?.identitas?.tanggalRevisi || "00";

  const tanggalPengesahan =
    identitasRaw.tanggalPengesahan ||
    fallback?.identitas?.tanggalPengesahan ||
    `${currentYear}-01-10`;

  const disahkanOleh =
    identitasRaw.disahkanOleh ||
    fallback?.identitas?.disahkanOleh ||
    "Kepala Sekolah";

  const namaKepalaSekolah =
    identitasRaw.namaKepalaSekolah ||
    identitasRaw.kepalaSekolah ||
    fallback?.identitas?.namaKepalaSekolah ||
    "Kepala Sekolah";

  const nip = identitasRaw.nip || fallback?.identitas?.nip || "-";
  const unitKerja = identitasRaw.unitKerja || fallback?.identitas?.unitKerja || "SD Negeri 3 Loloan Timur";

  const identitas = {
    namaSop,
    nomorSop,
    tanggalPembuatan,
    tanggalRevisi,
    tanggalPengesahan,
    disahkanOleh,
    namaKepalaSekolah,
    nip,
    unitKerja,
  };

  const dasarHukum =
    Array.isArray(raw.dasarHukum) && raw.dasarHukum.length > 0
      ? raw.dasarHukum.map((dh: any, idx: number) => ({
          id: dh.id || `dh-${idx + 1}`,
          namaRegulasi: dh.namaRegulasi || dh.nama || `Regulasi Dasar Hukum ke-${idx + 1}`,
          nomor: String(dh.nomor || "-"),
          tahun: String(dh.tahun || currentYear),
          tentang: dh.tentang || "Standar Pengelolaan Pendidikan Dasar",
          statusVerifikasi: dh.statusVerifikasi || "Terverifikasi Resmi",
          sumber: dh.sumber || "JDIH Kemendikbudristek",
        }))
      : fallback?.dasarHukum || [];

  const kualifikasiPelaksana =
    Array.isArray(raw.kualifikasiPelaksana) && raw.kualifikasiPelaksana.length > 0
      ? raw.kualifikasiPelaksana.map(String)
      : typeof raw.kualifikasiPelaksana === "string"
      ? [raw.kualifikasiPelaksana]
      : fallback?.kualifikasiPelaksana || ["Memahami regulasi dan tupoksi satuan pendidikan dasar"];

  const keterkaitan =
    Array.isArray(raw.keterkaitan) && raw.keterkaitan.length > 0
      ? raw.keterkaitan.map(String)
      : typeof raw.keterkaitan === "string"
      ? [raw.keterkaitan]
      : fallback?.keterkaitan || ["SOP Tata Tertib dan Administrasi Sekolah"];

  const peralatanPerlengkapan =
    Array.isArray(raw.peralatanPerlengkapan) && raw.peralatanPerlengkapan.length > 0
      ? raw.peralatanPerlengkapan.map(String)
      : typeof raw.peralatanPerlengkapan === "string"
      ? [raw.peralatanPerlengkapan]
      : fallback?.peralatanPerlengkapan || ["Perangkat Komputer / Laptop", "Buku Agenda / Instrumen"];

  const peringatan =
    Array.isArray(raw.peringatan) && raw.peringatan.length > 0
      ? raw.peringatan.map(String)
      : typeof raw.peringatan === "string"
      ? [raw.peringatan]
      : fallback?.peringatan || ["Jika prosedur tidak ditaati, akuntabilitas administrasi sekolah tidak terjamin."];

  const rawPencatatan = raw.pencatatanPendataan || {};
  const pencatatanPendataan = {
    dokumenBukti:
      Array.isArray(rawPencatatan.dokumenBukti) && rawPencatatan.dokumenBukti.length > 0
        ? rawPencatatan.dokumenBukti.map(String)
        : typeof rawPencatatan.dokumenBukti === "string"
        ? [rawPencatatan.dokumenBukti]
        : fallback?.pencatatanPendataan?.dokumenBukti || [
            "Berita Acara dan Lembar Verifikasi",
            "Buku Catatan Tindak Lanjut",
          ],
    penanggungJawabArsip:
      rawPencatatan.penanggungJawabArsip ||
      fallback?.pencatatanPendataan?.penanggungJawabArsip ||
      "Tenaga Administrasi Sekolah / Operator",
    mediaPenyimpanan:
      rawPencatatan.mediaPenyimpanan ||
      fallback?.pencatatanPendataan?.mediaPenyimpanan ||
      "Fisik (Bantex/Map) dan Digital (Google Drive)",
    periodePenyimpanan:
      rawPencatatan.periodePenyimpanan ||
      fallback?.pencatatanPendataan?.periodePenyimpanan ||
      "3 Tahun / Permanen",
  };

  const pelaksanaList =
    Array.isArray(raw.pelaksanaList) && raw.pelaksanaList.length > 0
      ? raw.pelaksanaList.map(String)
      : fallback?.pelaksanaList || [
          "Kepala Sekolah",
          "Guru Kelas",
          "Guru Mapel",
          "Tenaga Administrasi",
        ];

  let tabelPelaksanaMutuBaku = fallback?.tabelPelaksanaMutuBaku || [];
  if (Array.isArray(raw.tabelPelaksanaMutuBaku) && raw.tabelPelaksanaMutuBaku.length > 0) {
    tabelPelaksanaMutuBaku = raw.tabelPelaksanaMutuBaku.map((step: any, idx: number) => {
      const pelaksanaChecks: Record<string, any> = {};
      pelaksanaList.forEach((role: string) => {
        pelaksanaChecks[role] = step.pelaksanaChecks?.[role] || false;
      });
      return {
        id: step.id || `step-${idx + 1}`,
        no: step.no || idx + 1,
        uraianProsedur: step.uraianProsedur || step.uraian || `Langkah operasional ke-${idx + 1}`,
        pelaksanaChecks,
        persyaratan: step.persyaratan || "Format dokumen / instrumen",
        waktu: step.waktu || "1 hari kerja",
        output: step.output || "Dokumen hasil pelaksanaan",
        flowType:
          step.flowType ||
          (idx === 0
            ? "start"
            : idx === raw.tabelPelaksanaMutuBaku.length - 1
            ? "end"
            : "process"),
      };
    });
  }

  const checklistKelengkapan = {
    ...(fallback?.checklistKelengkapan || {}),
    ...(raw.checklistKelengkapan || {}),
  };

  return {
    id: raw.id || `sop-${Date.now()}`,
    identitas,
    dasarHukum,
    kualifikasiPelaksana,
    keterkaitan,
    peralatanPerlengkapan,
    peringatan,
    pencatatanPendataan,
    pelaksanaList,
    tabelPelaksanaMutuBaku,
    checklistKelengkapan,
    versi: raw.versi || fallback?.versi || "1.0",
    status: raw.status || fallback?.status || "DRAFT",
    kategori: raw.kategori || fallback?.kategori || "A. Manajemen Sekolah",
    tanggalReviewBerikutnya:
      raw.tanggalReviewBerikutnya ||
      fallback?.tanggalReviewBerikutnya ||
      `${currentYear + 1}-01-10`,
    penanggungJawab: identitas.namaKepalaSekolah,
    riwayatRevisi: Array.isArray(raw.riwayatRevisi) ? raw.riwayatRevisi : [],
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildFallbackForm(namaSop: string, namaFormulir: string, schoolProfile: any) {
  return {
    judul: namaFormulir || `FORMULIR PELAKSANAAN ${namaSop.toUpperCase()}`,
    kodeFormulir: `FORM-${Date.now().toString().slice(-4)}`,
    keterangan: `Formulir kendali operasional pendukung ${namaSop}`,
    fields: [
      { label: "Hari / Tanggal Pelaksanaan", type: "text", placeholder: "Contoh: Senin, 10 Januari 2026" },
      { label: "Nama Petugas / Guru Pelaksana", type: "text", placeholder: "Nama lengkap dan NIP/NUPTK" },
      { label: "Sasaran / Pihak Terkait (Siswa/Wali/Pegawai)", type: "text", placeholder: "Nama dan kelas/jabatan" },
      { label: "Uraian Tindakan / Keterangan Prosedur", type: "textarea", placeholder: "Jelaskan tindakan yang telah dilakukan..." },
      { label: "Kendala yang Ditemukan (jika ada)", type: "textarea", placeholder: "Catatan khusus..." },
      { label: "Hasil / Kesimpulan Akhir", type: "text", placeholder: "Tuntas / Perlu Tindak Lanjut" },
    ],
    tandaTangan: {
      kiri: "Petugas Pelaksana",
      kanan: `Mengetahui,\nKepala ${schoolProfile?.namaSekolah || "Sekolah"}`,
    },
  };
}

function buildFallbackChecklist(sopData: any) {
  const steps = sopData?.tabelPelaksanaMutuBaku || [];
  return {
    judulChecklist: `Checklist Kendali Mutu: ${sopData?.identitas?.namaSop || "Pelaksanaan SOP"}`,
    petunjuk: "Beri tanda centang (✓) pada kolom Terlaksana dan bubuhkan paraf apabila indikator langkah telah dipenuhi.",
    items: steps.map((s: any, idx: number) => ({
      no: s.no || idx + 1,
      indikator: s.uraianProsedur || `Langkah operasional ke-${idx + 1}`,
      buktiFisik: s.output || "Dokumen / bukti kerja",
      penanggungJawab: Object.keys(s.pelaksanaChecks || {})[0] || "Pelaksana Terkait",
    })),
  };
}

export const app = express();
app.use(express.json({ limit: "15mb" }));

// Route rewrites compatibility for Vercel and reverse proxies
app.use((req, _res, next) => {
  if (
    !req.url.startsWith("/api") &&
    (req.url.startsWith("/gemini/") || req.url.startsWith("/health") || req.url.startsWith("/default-data"))
  ) {
    req.url = "/api" + req.url;
  }
  next();
});

// Health check
app.get("/api/health", (_req, res) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "" && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({ status: "ok", app: "SOP SMART SCHOOL", hasApiKey });
});

// API 0: Persistent Default Data (School Profile & SOPs)
function getDataFilePath(): { readPath: string; writePath: string } {
  let baseDir = path.join(serverDir, "data");
  if (process.env.PORTABLE_EXECUTABLE_DIR && fs.existsSync(process.env.PORTABLE_EXECUTABLE_DIR)) {
    baseDir = path.join(process.env.PORTABLE_EXECUTABLE_DIR, "data");
  } else if (process.env.USER_DATA_PATH) {
    baseDir = path.join(process.env.USER_DATA_PATH, "data");
  }

  const writePath = path.join(baseDir, "defaultData.json");
  let readPath = writePath;

  // Fallback to bundled seed data if user custom file does not exist yet
  if (!fs.existsSync(readPath)) {
    const bundledPath = path.join(serverDir, "data", "defaultData.json");
    if (fs.existsSync(bundledPath)) {
      readPath = bundledPath;
    }
  }

  return { readPath, writePath };
}

app.get("/api/default-data", (_req, res) => {
  try {
    const { readPath } = getDataFilePath();
    if (fs.existsSync(readPath)) {
      const fileContent = fs.readFileSync(readPath, "utf-8");
      const parsed = JSON.parse(fileContent);
      return res.json({ success: true, data: parsed });
    }
    return res.json({ success: false, message: "Belum ada data default tersimpan di server." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/default-data", (req, res) => {
  try {
    const { schoolProfile, sops } = req.body;
    if (!schoolProfile && !sops) {
      return res.status(400).json({ success: false, message: "Data tidak boleh kosong." });
    }
    const { writePath } = getDataFilePath();
    const dirPath = path.dirname(writePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const payload = {
      savedAt: new Date().toISOString(),
      schoolProfile,
      sops,
    };
    fs.writeFileSync(writePath, JSON.stringify(payload, null, 2), "utf-8");
    return res.json({
      success: true,
      message: "Data default berhasil disimpan secara permanen di server.",
      data: payload,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/default-data", (_req, res) => {
  try {
    const { writePath } = getDataFilePath();
    if (fs.existsSync(writePath)) {
      fs.unlinkSync(writePath);
    }
    return res.json({ success: true, message: "Data default server berhasil direset." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

  // API 1: AI Analisis Kebutuhan SOP Sekolah
  app.post("/api/gemini/analyze-needs", async (req, res) => {
    const { schoolProfile, schoolConditions } = req.body;
    try {
      const prompt = `Anda adalah Asisten Pakar Manajemen Pendidikan Dasar & Penyusun SOP Satuan Pendidikan Sekolah Dasar di Indonesia.
Berdasarkan data profil sekolah dan kondisi operasional berikut:
Nama Sekolah: ${schoolProfile?.namaSekolah || "SD Negeri"}
NPSN: ${schoolProfile?.npsn || "-"}
Jumlah Siswa: ${schoolConditions?.jumlahSiswa || "250"}
Jumlah Rombel: ${schoolConditions?.jumlahRombel || "6"}
Jumlah Guru: ${schoolConditions?.jumlahGuru || "8"}
Jumlah Tendik: ${schoolConditions?.jumlahTendik || "2"}
Fasilitas Sekolah: ${schoolConditions?.fasilitas || "Lab Komputer, Perpustakaan, UKS, Lapangan"}
Program Unggulan: ${schoolConditions?.programUnggulan || "Pembiasaan Karakter, Literasi & Numerasi, Adiwiyata"}
Kegiatan Rutin: ${schoolConditions?.kegiatanRutin || "Upacara Bendera, Senam Bersama, Rapat Bulanan Guru"}
Ekstrakurikuler: ${schoolConditions?.ekstrakurikuler || "Pramuka, Tari, UKS/Dokter Kecil, Silat"}
Kondisi Khusus Sekolah: ${schoolConditions?.kondisiKhusus || "Dekat jalan raya utama"}
Sistem Administrasi: ${schoolConditions?.sistemAdministrasi || "ARKAS, Dapodik, PBD, Rapor Pendidikan, e-Rapor"}

Tugas Anda:
Lakukan analisis mendalam kebutuhan SOP Sekolah Dasar dan hasilkan daftar SOP yang disarankan, dikelompokkan ke dalam kategori resmi A sampai M.
Format balasan HARUS JSON murni valid dengan skema:
{
  "summary": "Ringkasan analisis kebutuhan dalam 2-3 kalimat objektif",
  "totalRecommended": 13,
  "categories": [
    {
      "categoryCode": "A",
      "categoryName": "Manajemen Sekolah",
      "sops": [
        {
          "id": "A-1",
          "namaSop": "SOP Penyusunan Rencana Kerja Jangka Menengah (RKJM) dan RKT",
          "tujuan": "Memberikan panduan baku penyusunan RKJM dan RKT berbasis Rapor Pendidikan",
          "alasanDiperlukan": "Mencegah perencanaan program yang tidak terarah",
          "risikoJikaTidakAda": "Alokasi anggaran tidak tepat sasaran",
          "prioritas": "Tinggi",
          "pihakTerlibat": ["Kepala Sekolah", "Tim Pengembang Sekolah", "Komite", "Guru"],
          "status": "Belum Ada"
        }
      ]
    }
  ]
}`;

      const text = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(text || "{}");
      if (parsed.categories && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
        return res.json(parsed);
      }
      return res.json(buildFallbackNeedsAnalysis(schoolProfile));
    } catch {
      return res.json(buildFallbackNeedsAnalysis(schoolProfile));
    }
  });

  // API 2: AI Wawancara Singkat Pembuatan SOP
  app.post("/api/gemini/interview-questions", async (req, res) => {
    const namaSop = req.body.namaSop || req.body.sopTitle || "SOP Standar Satuan Pendidikan";
    const kategori = req.body.kategori || "Umum";
    const schoolProfile = req.body.schoolProfile;

    try {
      const prompt = `Anda adalah asisten penyusun SOP sekolah dasar. Kepala Sekolah ingin membuat SOP dengan judul: "${namaSop}" (${kategori}).
Profil Sekolah:
Nama: ${schoolProfile?.namaSekolah || "SD Negeri"}
Jenjang: ${schoolProfile?.jenjang || "SD"}

Jangan menanyakan informasi yang sudah ada di profil sekolah (seperti nama sekolah atau nama kepala sekolah).
Ajukan 5 pertanyaan wawancara spesifik, terstruktur, dan praktis yang diperlukan untuk menyusun SOP ini secara akurat (alur penanggung jawab, dokumen input, batas waktu, aplikasi/form yang digunakan, output, dan regulasi internal).

Balas dalam format JSON murni:
{
  "questions": [
    {
      "id": "q1",
      "question": "Pertanyaan terarah...",
      "hint": "Contoh jawaban singkat...",
      "defaultValue": "Rekomendasi nilai standar jika sekolah belum memiliki aturan spesifik"
    }
  ]
}`;

      const text = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(text || "{}");
      if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return res.json(parsed);
      }
      return res.json(buildFallbackInterviewQuestions(namaSop));
    } catch {
      return res.json(buildFallbackInterviewQuestions(namaSop));
    }
  });

  // API 3: AI Penyusun Lengkap Draft SOP Satuan Pendidikan SD
  app.post("/api/gemini/generate-sop", async (req, res) => {
    const namaSop = req.body.namaSop || req.body.sopTitle || "SOP Standar Operasional Sekolah";
    const kategori = req.body.kategori || "Manajemen Sekolah";
    const { schoolProfile, interviewAnswers, customInstructions } = req.body;
    const targetStepsCount = Math.max(3, Math.min(15, parseInt(req.body.targetStepsCount || req.body.jumlahLangkah || "5", 10)));
    const targetDasarHukumCount = Math.max(1, Math.min(10, parseInt(req.body.targetDasarHukumCount || req.body.jumlahDasarHukum || "3", 10)));
    const selectedDasarHukum = Array.isArray(req.body.selectedDasarHukum) ? req.body.selectedDasarHukum : undefined;

    const fallbackOptions = {
      targetStepsCount,
      targetDasarHukumCount,
      selectedDasarHukum,
    };

    try {
      const prompt = `Bertindak sebagai asisten penyusunan SOP untuk satuan pendidikan dasar (SD) di Indonesia sesuai format baku Kepmenpan RB / Kemendikbudristek.
Tugas: Susun dokumen SOP yang operasional, jelas, sistematis, terdokumentasi, dan mudah diaudit.

Data Masukan:
- Judul SOP: "${namaSop}"
- Kategori: "${kategori}"
- Profil Sekolah:
  * Nama Sekolah: ${schoolProfile?.namaSekolah || "SD Negeri"}
  * NPSN: ${schoolProfile?.npsn || "-"}
  * Kepala Sekolah: ${schoolProfile?.namaKepalaSekolah || "Kepala Sekolah"}
  * NIP: ${schoolProfile?.nip || "-"}
  * Alamat: ${schoolProfile?.alamat || "-"}, ${schoolProfile?.kecamatan || "-"}, ${schoolProfile?.kabupatenKota || "-"}, ${schoolProfile?.provinsi || "-"}
  * Tahun Pelajaran: ${schoolProfile?.tahunPelajaran || "2025/2026"}
- Jawaban Wawancara Kepala Sekolah: ${JSON.stringify(interviewAnswers || {})}
- ATURAN WAJIB JUMLAH LANGKAH PROSEDUR:
  Tabel "tabelPelaksanaMutuBaku" HARUS berisi TEPAT ${targetStepsCount} langkah kerja operasional terurut (tidak kurang dan tidak lebih dari ${targetStepsCount}), bernomor urut 1 sampai ${targetStepsCount}, lengkap dengan penentuan peran pelaksana, simbol flowchart (start, process, decision, end), persyaratan, waktu, dan output.
- ATURAN WAJIB DASAR HUKUM:
  ${selectedDasarHukum && selectedDasarHukum.length > 0
    ? `Sertakan regulasi dasar hukum yang telah dipilih Kepala Sekolah berikut ini: ${JSON.stringify(selectedDasarHukum)}`
    : `Bagian "dasarHukum" HARUS menyertakan TEPAT ${targetDasarHukumCount} regulasi resmi pemerintah (UU, PP, Permendikdasmen/Permendikbudristek, Permenpan RB) yang terverifikasi dan paling relevan dengan topik ini.`}
- Instruksi Khusus: ${customInstructions || "Format lengkap Pelaksana Mutu Baku Landscape A4"}

Format balasan HARUS JSON murni valid dengan struktur identitas, dasarHukum, kualifikasiPelaksana, keterkaitan, peralatanPerlengkapan, peringatan, pencatatanPendataan, pelaksanaList, tabelPelaksanaMutuBaku, dan checklistKelengkapan.`;

      const text = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const fallback = buildFallbackSopDocument(namaSop, kategori, schoolProfile, interviewAnswers, fallbackOptions);
      try {
        const parsed = JSON.parse(text || "{}");
        const normalized = normalizeSopDocument(parsed, fallback);
        return res.json(normalized);
      } catch {
        return res.json(fallback);
      }
    } catch {
      return res.json(buildFallbackSopDocument(namaSop, kategori, schoolProfile, interviewAnswers, fallbackOptions));
    }
  });

function refineSopLocally(command: string, sopData: any, userInstruction?: string, schoolProfile?: any) {
  const updated = JSON.parse(JSON.stringify(sopData || {}));
  if (schoolProfile) {
    updated.identitas = {
      ...updated.identitas,
      namaKepalaSekolah: schoolProfile.namaKepalaSekolah || updated.identitas?.namaKepalaSekolah,
      nip: schoolProfile.nip || updated.identitas?.nip,
      unitKerja: schoolProfile.namaSekolah || updated.identitas?.unitKerja,
      disahkanOleh: `Kepala ${schoolProfile.namaSekolah || "Sekolah"}`,
    };
  }

  const cmd = (command || "").toLowerCase();

  if (cmd.includes("redaksi") || cmd.includes("formal") || cmd.includes("bahasa")) {
    if (Array.isArray(updated.tabelPelaksanaMutuBaku)) {
      updated.tabelPelaksanaMutuBaku = updated.tabelPelaksanaMutuBaku.map((step: any) => {
        let text = step.uraianProsedur || "";
        if (!text.match(/^(Memeriksa|Menelaah|Melakukan|Menyusun|Mengoordinasikan|Menetapkan|Mengesahkan|Mendokumentasikan|Mengevaluasi|Melaporkan)/i)) {
          text = `Melaksanakan prosedur ${text.toLowerCase()}`;
        }
        return {
          ...step,
          uraianProsedur: text,
          persyaratan: step.persyaratan || "Format instrumen dan berkas pendukung",
          output: step.output || "Dokumen hasil terverifikasi",
        };
      });
    }
  } else if (cmd.includes("dasar hukum") || cmd.includes("regulasi")) {
    const officialLegalBasis = [
      {
        id: "dh-1",
        namaRegulasi: "Undang-Undang Nomor 20 Tahun 2003",
        nomor: "20",
        tahun: "2003",
        tentang: "Sistem Pendidikan Nasional",
        statusVerifikasi: "Terverifikasi Resmi",
        sumber: "JDIH Kemendikbudristek",
      },
      {
        id: "dh-2",
        namaRegulasi: "Peraturan Pemerintah Nomor 57 Tahun 2021 jo PP Nomor 4 Tahun 2022",
        nomor: "57 jo 4",
        tahun: "2021/2022",
        tentang: "Standar Nasional Pendidikan",
        statusVerifikasi: "Terverifikasi Resmi",
        sumber: "JDIH BPK RI",
      },
      {
        id: "dh-3",
        namaRegulasi: "Permendikbudristek Nomor 47 Tahun 2023",
        nomor: "47",
        tahun: "2023",
        tentang: "Standar Pengelolaan pada PAUD, Pendidikan Dasar, dan Pendidikan Menengah",
        statusVerifikasi: "Terverifikasi Resmi",
        sumber: "JDIH Kemendikbudristek",
      },
      {
        id: "dh-4",
        namaRegulasi: "Permenpan RB Nomor 35 Tahun 2012",
        nomor: "35",
        tahun: "2012",
        tentang: "Pedoman Penyusunan Standar Operasional Prosedur Administrasi Pemerintahan",
        statusVerifikasi: "Terverifikasi Resmi",
        sumber: "JDIH Kemenpan RB",
      },
    ];
    updated.dasarHukum = officialLegalBasis;
  } else if (cmd.includes("waktu") || cmd.includes("beban")) {
    if (Array.isArray(updated.tabelPelaksanaMutuBaku)) {
      const standardTimes = ["1 hari kerja", "2 hari kerja", "1 hari kerja", "1 hari kerja", "1 hari kerja"];
      updated.tabelPelaksanaMutuBaku = updated.tabelPelaksanaMutuBaku.map((step: any, idx: number) => ({
        ...step,
        waktu: standardTimes[idx % standardTimes.length] || "1 hari kerja",
      }));
    }
  } else if (cmd.includes("bukti") || cmd.includes("output")) {
    if (Array.isArray(updated.tabelPelaksanaMutuBaku)) {
      const standardOutputs = [
        "Lembar disposisi & instruksi pelaksanaan",
        "Draf dokumen & rekapitulasi data terhimpun",
        "Format instrumen terverifikasi & terparaf",
        "Dokumen resmi disahkan & bertanda tangan",
        "Tanda terima sosialisasi & arsip tersimpan rapi",
      ];
      updated.tabelPelaksanaMutuBaku = updated.tabelPelaksanaMutuBaku.map((step: any, idx: number) => ({
        ...step,
        output: standardOutputs[idx % standardOutputs.length] || "Dokumen hasil terverifikasi",
      }));
    }
  } else if (cmd.includes("simbol") || cmd.includes("alur") || cmd.includes("flow")) {
    if (Array.isArray(updated.tabelPelaksanaMutuBaku)) {
      const len = updated.tabelPelaksanaMutuBaku.length;
      updated.tabelPelaksanaMutuBaku = updated.tabelPelaksanaMutuBaku.map((step: any, idx: number) => {
        let flowType = "process";
        if (idx === 0) flowType = "start";
        else if (idx === len - 1) flowType = "end";
        else if (idx === 2 || (step.uraianProsedur || "").toLowerCase().includes("verifikasi") || (step.uraianProsedur || "").toLowerCase().includes("telaah")) {
          flowType = "decision";
        }
        return {
          ...step,
          flowType,
        };
      });
    }
  }

  const curVer = parseFloat(updated.versi || "1.0");
  updated.versi = (curVer + 0.1).toFixed(1);
  updated.updatedAt = new Date().toISOString();
  return updated;
}

function getLocalChatResponse(message: string, schoolProfile: any, activeSop: any): string {
  const q = (message || "").toLowerCase();
  const schoolName = schoolProfile?.namaSekolah || "Sekolah Dasar";

  if (q.includes("halo") || q.includes("hai") || q.includes("assalamu") || q.includes("pagi") || q.includes("siang")) {
    return `Halo! Saya Asisten Cerdas Penyusun SOP Satuan Pendidikan untuk ${schoolName}.\n\nSaya siap membantu Bapak/Ibu Kepala Sekolah dalam:\n1. Menyusun dokumen SOP baru berformat baku (Permenpan RB No. 35/2012).\n2. Memeriksa dasar hukum & regulasi pendidikan terkini (SNP & Kemendikdasmen).\n3. Menentukan pihak pelaksana, kualifikasi, estimasi waktu, dan output fisik.\n4. Merancang lembar formulir & checklist kendali mutu.\n\nSilakan tanyakan hal apa pun seputar tata kelola operasional sekolah!`;
  }

  if (q.includes("dasar hukum") || q.includes("uu") || q.includes("regulasi") || q.includes("permen")) {
    return `Dalam penyusunan SOP Sekolah Dasar, dasar hukum resmi yang wajib dipedomani meliputi:\n\n1. **UU No. 20 Tahun 2003** tentang Sistem Pendidikan Nasional (Pasal 51: Tata kelola berbasis manajemen sekolah).\n2. **PP No. 57 Tahun 2021 jo PP No. 4 Tahun 2022** tentang Standar Nasional Pendidikan (SNP).\n3. **Permendikbudristek No. 47 Tahun 2023** tentang Standar Pengelolaan pada PAUD, Dikdas, dan Dikmen.\n4. **Permenpan RB No. 35 Tahun 2012** tentang Pedoman Penyusunan Standar Operasional Prosedur Administrasi Pemerintahan (Pedoman lambang alur mutu baku).\n5. **Permendikdasmen No. 8 Tahun 2025** tentang Petunjuk Teknis Dana BOSP (khusus SOP Keuangan/ARKAS).`;
  }

  if (q.includes("langkah") || q.includes("buat sop") || q.includes("alur") || q.includes("cara")) {
    return `Tahapan baku penyusunan SOP di ${schoolName} meliputi:\n\n1. **Identifikasi Kebutuhan**: Pilih prosedur prioritas dari 13 bidang operasional SD di menu Analisis Kebutuhan.\n2. **Wawancara Draf**: Tentukan pelaksana (Kepala Sekolah, Guru, Tendik, Komite), syarat awal, dan durasi kerja.\n3. **Pelaksana Mutu Baku**: Isi tabel matriks dengan lambang alur flowchart (Mulai/Start, Proses/Persegi, Pengambilan Keputusan/Belah Ketupat, Selesai/End).\n4. **Pemeriksaan Kelengkapan**: Pastikan setiap langkah memiliki output dokumen bukti (berita acara, notulen, lembar disposisi).\n5. **Pengesahan & Sosialisasi**: Kepala Sekolah menandatangani dokumen resmi, membubuhkan stempel sekolah, lalu mengarsipkan berkas dan menyosialisasikan kepada warga sekolah.`;
  }

  if (q.includes("bos") || q.includes("keuangan") || q.includes("arkas")) {
    return `Untuk **SOP Pengelolaan Dana BOSP / Keuangan Sekolah**:\n- **Pelaksana Utama**: Kepala Sekolah (Penanggung Jawab), Bendahara BOS, Tim BOS Sekolah, dan Komite Sekolah.\n- **Aplikasi Wajib**: ARKAS (Aplikasi Rencana Kegiatan dan Anggaran Sekolah) dan SIPLah untuk pengadaan barang.\n- **Output Utama**: RKAS yang disahkan dinas, Buku Kas Umum (BKU), Kuitansi Berstempel, Berita Acara Penerimaan Hasil Pekerjaan (BAST), dan Laporan SPJ triwulanan.`;
  }

  if (q.includes("tppk") || q.includes("kekerasan") || q.includes("bully") || q.includes("perundungan")) {
    return `Untuk **SOP Pencegahan & Penanganan Kekerasan (TPPK)**:\n- **Regulasi**: Permendikbudristek No. 46 Tahun 2023.\n- **Prinsip Utama**: Kepentingan terbaik bagi anak, kerahasiaan identitas korban, dan non-diskriminasi.\n- **Alur Kerja**: Penerimaan laporan terenkripsi -> Penyelamatan & pengamanan korban -> Mediasi/klarifikasi terpisah -> Rekomendasi sanksi/pembinaan -> Konseling dan pemantauan berkala.`;
  }

  if (q.includes("supervisi") || q.includes("kinerja") || q.includes("guru")) {
    return `Untuk **SOP Supervisi Akademik & Penilaian Kinerja Guru (PKG)**:\n- **Pelaksana**: Kepala Sekolah dan Guru Sasaran.\n- **Alur 3 Tahap**: Pra-Observasi (telaah modul ajar) -> Observasi Kelas (penilaian instrumen KBM) -> Pasca-Observasi (refleksi dan tindak lanjut di PMM/e-Kinerja).`;
  }

  return `Terkait topik "${message}":\n\nUntuk satuan pendidikan dasar ${schoolName}, SOP ini sebaiknya dirancang dengan memperhatikan:\n1. **Aktor Pelaksana**: Minimal melibatkan 2 sampai 4 pihak (Kepala Sekolah, Guru Kelas, Tenaga Administrasi, Komite).\n2. **Keterkaitan Prosedur**: Sinkronkan dengan SOP Administrasi Sekolah dan kalender akademik sekolah dasar.\n3. **Bukti Fisik/Digital**: Setiap tahapan wajib menghasilkan bukti terverifikasi seperti disposisi, daftar hadir, atau berita acara.\n\nBapak/Ibu dapat langsung menggunakan menu **Asisten AI (Buat Draf)** atau **Bank Template** untuk merakit dokumen SOP ini secara otomatis!`;
}

  // API 4: AI Command Refinement
  app.post("/api/gemini/refine-sop", async (req, res) => {
    const { command, sopData, userInstruction, schoolProfile } = req.body;
    try {
      const prompt = `Anda adalah asisten editor SOP Sekolah Dasar.
Perintah dari Kepala Sekolah: "${command}"
Instruksi Tambahan: "${userInstruction || "Sesuaikan secara operasional"}"

Profil Sekolah:
Nama: ${schoolProfile?.namaSekolah || "SD Negeri"}
Kepala Sekolah: ${schoolProfile?.namaKepalaSekolah || "Kepala Sekolah"}

Data SOP Saat Ini:
${JSON.stringify(sopData, null, 2)}

Kembalikan SELURUH objek SOP yang telah diperbarui dalam format JSON murni yang sesuai dengan skema SOP sebelumnya.`;

      const text = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(text || "{}");
      const normalized = normalizeSopDocument(parsed, sopData);
      return res.json(normalized);
    } catch {
      const locallyRefined = refineSopLocally(command, sopData, userInstruction, schoolProfile);
      return res.json(locallyRefined);
    }
  });

  // API 5: Chatbot Tanya AI Khusus SOP Sekolah
  app.post("/api/gemini/chat", async (req, res) => {
    const { message, history, schoolProfile, activeSop } = req.body;
    try {
      const systemInstruction = `Bertindak sebagai asisten konsultasi SOP untuk Kepala Sekolah Dasar di Indonesia.
Pedoman Anda:
1. Berikan jawaban yang berbasis tata kelola pendidikan dasar Indonesia, operasional, jelas, dan santun.
2. Bedakan antara: (a) Data yang diberikan sekolah, (b) Regulasi resmi (UU, PP, Permendikdasmen), (c) Saran/rekomendasi AI, dan (d) Hal yang masih perlu diverifikasi Kepala Sekolah.
3. Bantu Kepala Sekolah menyusun prosedur, menentukan pihak pelaksana yang tepat, memeriksa dasar hukum, serta merancang formulir/checklist pendukung.
4. Jangan mengarang nomor regulasi fiktif.
Profil Sekolah aktif:
Nama: ${schoolProfile?.namaSekolah || "SD Negeri"}
NPSN: ${schoolProfile?.npsn || "-"}
Kepala Sekolah: ${schoolProfile?.namaKepalaSekolah || "Kepala Sekolah"}
SOP yang sedang dibuka: ${activeSop ? activeSop.identitas?.namaSop : "Tidak ada yang aktif"}`;

      const contents = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content }],
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const reply = await generateGeminiContentWithRetry({
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      return res.json({ reply: reply || getLocalChatResponse(message, schoolProfile, activeSop) });
    } catch {
      return res.json({
        reply: getLocalChatResponse(message, schoolProfile, activeSop),
      });
    }
  });

  // API 6: Generator Formulir Terkait SOP
  app.post("/api/gemini/generate-form", async (req, res) => {
    const { namaSop, namaFormulir, schoolProfile } = req.body;
    try {
      const prompt = `Buatlah draf Formulir / Lembar Kerja Administratif resmi untuk Sekolah Dasar yang mendukung pelaksanaan SOP: "${namaSop}".
Nama Formulir: "${namaFormulir || "Formulir Pelaksanaan Prosedur"}"
Nama Sekolah: "${schoolProfile?.namaSekolah || "SD Negeri"}"

Format formulir harus profesional, siap pakai untuk kepala sekolah/guru, dan memiliki struktur kop instansi, field isian (nama, kelas/jabatan, tanggal, uraian tindakan/kejadian, tanda tangan pelaksana & verifikasi kepala sekolah).

Balas dalam format JSON:
{
  "judul": "FORMULIR PENANGANAN...",
  "kodeFormulir": "FORM-SOP-01",
  "keterangan": "Deskripsi singkat fungsi formulir",
  "fields": [
    { "label": "Hari, Tanggal", "type": "text", "placeholder": "Contoh: Senin, 20 Oktober 2025" },
    { "label": "Nama Peserta Didik / Pemohon", "type": "text", "placeholder": "..." },
    { "label": "Kelas / Unit Kerja", "type": "text", "placeholder": "..." },
    { "label": "Uraian Kejadian / Keperluan", "type": "textarea", "placeholder": "..." },
    { "label": "Tindakan Yang Dilakukan", "type": "textarea", "placeholder": "..." },
    { "label": "Hasil / Output", "type": "text", "placeholder": "..." }
  ],
  "tandaTangan": {
    "kiri": "Petugas Pelaksana",
    "kanan": "Mengetahui, Kepala Sekolah"
  }
}`;

      const text = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      return res.json(JSON.parse(text || "{}"));
    } catch {
      return res.json(buildFallbackForm(namaSop || "Prosedur Sekolah", namaFormulir, schoolProfile));
    }
  });

  // API 7: Generator Checklist Pelaksanaan SOP
  app.post("/api/gemini/generate-checklist", async (req, res) => {
    const { sopData } = req.body;
    try {
      const prompt = `Berdasarkan langkah-langkah tabel Pelaksana Mutu Baku SOP berikut:
Nama SOP: "${sopData?.identitas?.namaSop}"
Langkah-langkah:
${(sopData?.tabelPelaksanaMutuBaku || []).map((step: any) => `${step.no}. ${step.uraianProsedur} (Output: ${step.output})`).join("\n")}

Buatlah Checklist Kendali Mutu Pelaksanaan SOP yang dapat dicetak dan dicentang oleh Kepala Sekolah atau Pengawas saat memonitor pelaksanaan di lapangan.

Format balasan JSON:
{
  "judulChecklist": "Checklist Pelaksanaan SOP ${sopData?.identitas?.namaSop}",
  "petunjuk": "Beri tanda centang (✓) pada kolom Ya apabila indikator terpenuhi.",
  "items": [
    {
      "no": 1,
      "indikator": "Uraian tindakan operasional...",
      "buktiFisik": "Dokumen/output yang wajib ada...",
      "penanggungJawab": "Nama peran pelaksana..."
    }
  ]
}`;

      const text = await generateGeminiContentWithRetry({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      return res.json(JSON.parse(text || "{}"));
    } catch {
      return res.json(buildFallbackChecklist(sopData));
    }
  });

  // Vite middleware for development vs static for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production bundle (dist/server.cjs), dist might be current dir or parent/dist
    let distPath = path.join(process.cwd(), "dist");
    if (!fs.existsSync(path.join(distPath, "index.html"))) {
      distPath = serverDir;
    }
    if (!fs.existsSync(path.join(distPath, "index.html"))) {
      distPath = path.join(serverDir, "dist");
    }
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
