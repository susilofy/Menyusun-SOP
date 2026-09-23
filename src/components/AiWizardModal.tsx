import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  FileText,
  Loader2,
  ChevronRight,
  Layers,
  Building,
  School,
  FileCheck,
  Search,
} from "lucide-react";
import { SchoolProfile, SopDocument } from "../types";
import { RECOMMENDATION_CATEGORIES } from "../data/initialData";
import { buildFallbackSopDocument } from "../data/sopGeneratorFallback";

// Helper: Auto-detect standard SD category from title keywords
const detectCategoryFromTitle = (title: string): string | null => {
  const t = title.toLowerCase();
  if (t.includes("bos") || t.includes("bosp") || t.includes("arkas") || t.includes("siplah") || t.includes("keuangan") || t.includes("anggaran") || t.includes("rkas")) {
    return "G. Keuangan";
  }
  if (t.includes("bully") || t.includes("kekerasan") || t.includes("ppksp") || t.includes("pelecehan") || t.includes("perlindungan")) {
    return "D. Perlindungan Anak";
  }
  if (t.includes("kurikulum") || t.includes("modul ajar") || t.includes("asesmen") || t.includes("ksp") || t.includes("ujian") || t.includes("pembelajaran") || t.includes("penilaian") || t.includes("remedial")) {
    return "B. Kurikulum dan Pembelajaran";
  }
  if (t.includes("ppdb") || t.includes("mpls") || t.includes("mutasi") || t.includes("siswa") || t.includes("peserta didik") || t.includes("kesiswaan") || t.includes("ekstrakurikuler")) {
    return "C. Kesiswaan";
  }
  if (t.includes("guru") || t.includes("tendik") || t.includes("supervisi") || t.includes("cuti") || t.includes("pkg") || t.includes("kinerja") || t.includes("pembagian tugas")) {
    return "E. Guru dan Tenaga Kependidikan";
  }
  if (t.includes("gedung") || t.includes("sarpras") || t.includes("sarana") || t.includes("chromebook") || t.includes("inventaris") || t.includes("laboratorium") || t.includes("ruang kelas")) {
    return "F. Sarana dan Prasarana";
  }
  if (t.includes("dapodik") || t.includes("surat") || t.includes("persuratan") || t.includes("arsip") || t.includes("tata usaha") || t.includes("administrasi")) {
    return "H. Administrasi/Tata Usaha";
  }
  if (t.includes("uks") || t.includes("kesehatan") || t.includes("pertolongan pertama") || t.includes("imunisasi") || t.includes("kebersihan")) {
    return "I. UKS dan Kesehatan";
  }
  if (t.includes("komite") || t.includes("paguyuban") || t.includes("orang tua") || t.includes("masyarakat") || t.includes("humas")) {
    return "J. Hubungan Masyarakat & Komite";
  }
  if (t.includes("satpam") || t.includes("keamanan") || t.includes("ketertiban") || t.includes("tamu") || t.includes("gerbang")) {
    return "K. Keamanan dan Ketertiban";
  }
  if (t.includes("perpustakaan") || t.includes("buku") || t.includes("literasi") || t.includes("peminjaman buku")) {
    return "L. Perpustakaan Sekolah";
  }
  if (t.includes("bencana") || t.includes("gempa") || t.includes("evakuasi") || t.includes("kebakaran") || t.includes("mitigasi") || t.includes("darurat")) {
    return "M. Tanggap Darurat & Mitigasi Bencana";
  }
  if (t.includes("rkjm") || t.includes("rkt") || t.includes("eds") || t.includes("rapor pendidikan") || t.includes("manajemen")) {
    return "A. Manajemen Sekolah";
  }
  return null;
};

// Helper: Provide tailored interview defaults based on selected topic
const getContextualAnswers = (title: string, category: string) => {
  const t = (title + " " + category).toLowerCase();
  if (t.includes("bos") || t.includes("keuangan") || t.includes("anggaran") || t.includes("arkas")) {
    return {
      pihakTerlibat: "Kepala Sekolah, Bendahara BOSP, Tim Manajemen BOS Sekolah, Komite Sekolah",
      alurBerjalan: "Penyusunan alokasi belanja di ARKAS, verifikasi kuitansi dan nota, pembelanjaan resmi melalui SIPLah, pembuatan SPJ, dan pengesahan Kepala Sekolah.",
      berkasDokumen: "RKAS BOSP, Buku Kas Umum (BKU), Kuitansi dan Nota Resmi, Berita Acara Penerimaan Barang, Lembar Verifikasi SPJ",
      waktuPenyelesaian: "3 sampai 7 hari kerja",
      kendalaRisiko: "Keterlambatan pelaporan pajak, ketidaksesuaian kode belanja ARKAS, atau kehilangan bukti fisik transaksi.",
    };
  }
  if (t.includes("bully") || t.includes("kekerasan") || t.includes("ppksp") || t.includes("perlindungan")) {
    return {
      pihakTerlibat: "Kepala Sekolah, Tim TPPK Satuan Pendidikan, Guru Kelas, Guru Pendamping, Orang Tua/Wali, Siswa Terkait",
      alurBerjalan: "Penerimaan laporan tertutup, identifikasi fakta dan pengamanan korban di ruang aman, mediasi klarifikasi terpisah, penyusunan komitmen tertulis, serta pemantauan konseling.",
      berkasDokumen: "Formulir Laporan Pengaduan, Berita Acara Mediasi TPPK, Lembar Rekomendasi Rujukan Konseling, Jurnal Pemantauan Berkala",
      waktuPenyelesaian: "1 hari (tindakan awal tanggap) s.d 14 hari pemantauan",
      kendalaRisiko: "Kebocoran privasi identitas anak, intimidasi lanjutan, atau penolakan kesepakatan oleh pihak keluarga.",
    };
  }
  if (t.includes("supervisi") || t.includes("kinerja guru") || t.includes("tendik") || t.includes("cuti")) {
    return {
      pihakTerlibat: "Kepala Sekolah, Guru Kelas / Guru Mapel yang Disupervisi, Pengawas Sekolah",
      alurBerjalan: "Pra-observasi telaah instrumen & modul ajar, pelaksanaan observasi di ruang kelas, temu balikan (pasca observasi), pemberian rekomendasi tindak lanjut, dan dokumentasi penilaian.",
      berkasDokumen: "Instrumen Supervisi Akademik, Modul Ajar/RPP, Lembar Catatan Observasi, Rencana Tindak Lanjut Supervisi",
      waktuPenyelesaian: "1 hari kerja per guru",
      kendalaRisiko: "Perbedaan persepsi indikator mutu ajar atau ketidaksiapan guru saat jadwal observasi tiba.",
    };
  }
  if (t.includes("ppdb") || t.includes("mpls") || t.includes("mutasi") || t.includes("siswa")) {
    return {
      pihakTerlibat: "Kepala Sekolah, Panitia PPDB / Tim Kesiswaan, Operator Dapodik, Orang Tua/Wali Calon Murid",
      alurBerjalan: "Sosialisasi juknis, penerimaan & verifikasi berkas persyaratan, seleksi pemeringkatan usia/zonasi, pengumuman kelulusan resmi, dan daftar ulang siswa.",
      berkasDokumen: "Formulir Pendaftaran, Akta Kelahiran, Kartu Keluarga, Tanda Terima Berkas, SK Kepala Sekolah Penetapan Siswa",
      waktuPenyelesaian: "5 sampai 10 hari kerja",
      kendalaRisiko: "Berkas domisili tidak lengkap, kelebihan kuota rombongan belajar, atau ketidaksesuaian data Dapodik.",
    };
  }
  return {
    pihakTerlibat: "Kepala Sekolah, Guru Kelas, Guru Mapel, Operator Sekolah, Tenaga Administrasi",
    alurBerjalan: "Penyusunan draf prosedur, verifikasi oleh tim penjamin mutu sekolah, sosialisasi pelaksana, dan pengesahan resmi oleh Kepala Sekolah.",
    berkasDokumen: "Instrumen penilaian / formulir kerja, format verifikasi mutu, lembar pengesahan Kepala Sekolah",
    waktuPenyelesaian: "3 sampai 5 hari kerja",
    kendalaRisiko: "Keterlambatan penyelesaian tugas dan ketidakkonsistenan format antar petugas pelaksana.",
  };
};

interface AiWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolProfile: SchoolProfile;
  onSopGenerated: (newSop: SopDocument) => void;
}

export const AiWizardModal: React.FC<AiWizardModalProps> = ({
  isOpen,
  onClose,
  schoolProfile,
  onSopGenerated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Selected or custom SOP
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sopTitle, setSopTitle] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [titleError, setTitleError] = useState<string | null>(null);

  // Step 2: 5 Interview answers
  const [answers, setAnswers] = useState({
    pihakTerlibat: "Kepala Sekolah, Guru Kelas, Guru Mapel, Operator Sekolah",
    alurBerjalan: "Guru menyusun draf berkas, diperiksa oleh tim, lalu diverifikasi dan disahkan oleh Kepala Sekolah.",
    berkasDokumen: "Buku panduan kurikulum, instrumen penilaian, format verifikasi, lembar pengesahan.",
    waktuPenyelesaian: "3 sampai 5 hari kerja",
    kendalaRisiko: "Keterlambatan penyerahan berkas dan perbedaan format antar guru.",
  });

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSop, setGeneratedSop] = useState<SopDocument | null>(null);

  // Filter recommendations based on selected category and sopTitle
  const filteredSuggestions = useMemo(() => {
    const list: Array<{ title: string; objective: string; priority: string; categoryStr: string }> = [];

    RECOMMENDATION_CATEGORIES.forEach((c) => {
      const catStr = `${c.code}. ${c.categoryName || c.name}`;
      const categoryMatches =
        selectedCategory === "ALL" ||
        selectedCategory === catStr ||
        selectedCategory.startsWith(`${c.code}.`) ||
        catStr.toLowerCase().includes(selectedCategory.toLowerCase());

      if (categoryMatches && c.suggestedSops) {
        c.suggestedSops.forEach((sopItem) => {
          list.push({
            title: sopItem.title,
            objective: sopItem.objective,
            priority: sopItem.priority,
            categoryStr: catStr,
          });
        });
      }
    });

    const query = sopTitle.trim().toLowerCase();
    if (query.length > 0) {
      return list.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.objective.toLowerCase().includes(query) ||
          item.categoryStr.toLowerCase().includes(query)
      );
    }

    return list;
  }, [selectedCategory, sopTitle]);

  if (!isOpen) return null;

  // Handle typing in title field with intelligent category suggestion
  const handleTitleChange = (newTitle: string) => {
    setSopTitle(newTitle);
    if (titleError) setTitleError(null);

    // Auto-detect category if user types strong keywords
    const detected = detectCategoryFromTitle(newTitle);
    if (detected) {
      const match = RECOMMENDATION_CATEGORIES.find(
        (c) =>
          `${c.code}. ${c.categoryName || c.name}`.toLowerCase() === detected.toLowerCase() ||
          detected.toLowerCase().includes(c.code.toLowerCase())
      );
      if (match) {
        setSelectedCategory(`${match.code}. ${match.categoryName || match.name}`);
      }
    }
  };

  // Quick select an SOP suggestion
  const handleSelectSuggestion = (title: string, category: string) => {
    setSopTitle(title);
    setSelectedCategory(category);
    setTitleError(null);
    setAnswers(getContextualAnswers(title, category));
  };

  // Move to Step 2: Fetch tailored interview questions from AI
  const handleGoToInterview = async () => {
    if (!sopTitle.trim()) {
      setTitleError("Silakan ketik nama SOP atau pilih dari rekomendasi bank SOP di bawah.");
      return;
    }
    setTitleError(null);

    // Contextualize answers for interview
    setAnswers(getContextualAnswers(sopTitle, selectedCategory));

    setStep(2);
    setIsLoadingQuestions(true);
    try {
      const res = await fetch("/api/gemini/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sopTitle,
          namaSop: sopTitle,
          kategori: selectedCategory === "ALL" ? "B. Kurikulum dan Pembelajaran" : selectedCategory,
          schoolProfile,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setCustomQuestions(data.questions);
        }
      }
    } catch (e) {
      console.warn("Using default interview questions", e);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Generate full SOP with AI
  const handleGenerate = async () => {
    setStep(3);
    setIsGenerating(true);
    setGenerationProgress(15);

    const progressTimer = setInterval(() => {
      setGenerationProgress((p) => {
        if (p < 85) return p + 12;
        return p;
      });
    }, 450);

    try {
      const res = await fetch("/api/gemini/generate-sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sopTitle,
          namaSop: sopTitle,
          kategori: selectedCategory,
          interviewAnswers: answers,
          schoolProfile,
        }),
      });

      clearInterval(progressTimer);
      setGenerationProgress(100);

      if (res.ok) {
        const sopData: SopDocument = await res.json();
        setGeneratedSop(sopData);
        setStep(4);
        return;
      }
      // If server responded with error (e.g. 404 on Vercel without serverless), fall back to standard template
      const fallbackSop = buildFallbackSopDocument(
        sopTitle,
        selectedCategory,
        schoolProfile,
        answers
      );
      setGeneratedSop(fallbackSop);
      setStep(4);
    } catch {
      clearInterval(progressTimer);
      setGenerationProgress(100);
      // Offline / network fallback: produce structured standard SD SOP
      const fallbackSop = buildFallbackSopDocument(
        sopTitle,
        selectedCategory,
        schoolProfile,
        answers
      );
      setGeneratedSop(fallbackSop);
      setStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = () => {
    if (generatedSop) {
      onSopGenerated(generatedSop);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Asisten AI Menyusun SOP
              </h2>
              <p className="text-xs text-slate-400">
                Penyusunan sistematis berbasis regulasi resmi & format Pelaksana Mutu Baku
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-md p-1 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              1
            </span>
            <span className={step === 1 ? "font-bold text-indigo-700" : "text-slate-500"}>
              Pilih / Ketik SOP
            </span>
          </div>

          <ChevronRight size={14} className="text-slate-400" />

          <div className="flex items-center space-x-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "font-bold text-indigo-700" : "text-slate-500"}>
              Wawancara Kontekstual AI
            </span>
          </div>

          <ChevronRight size={14} className="text-slate-400" />

          <div className="flex items-center space-x-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              3
            </span>
            <span className={step === 3 ? "font-bold text-indigo-700" : "text-slate-500"}>
              Penyusunan Draft
            </span>
          </div>

          <ChevronRight size={14} className="text-slate-400" />

          <div className="flex items-center space-x-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 4 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              4
            </span>
            <span className={step === 4 ? "font-bold text-emerald-700" : "text-slate-500"}>
              Draft Jadi & Verifikasi
            </span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ================= STEP 1: PILIH SOP ================= */}
          {step === 1 && (
            <div className="space-y-6">
              {/* 1. Input Judul SOP */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Ketik Judul SOP yang Ingin Disusun:
                  </label>
                  {sopTitle && (
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      {filteredSuggestions.length > 0
                        ? `${filteredSuggestions.length} saran cocok`
                        : "Format Judul Kustom"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={sopTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleGoToInterview();
                      }
                    }}
                    placeholder="Contoh: SOP Pelaksanaan Penilaian Sumatif Akhir Semester, SOP Pengelolaan Dana BOS, SOP Penanganan Bullying"
                    className={`w-full border rounded-lg pl-3 pr-20 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 shadow-2xs transition-colors ${
                      titleError
                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20"
                        : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20 bg-white"
                    }`}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
                    {sopTitle && (
                      <button
                        type="button"
                        onClick={() => {
                          setSopTitle("");
                          setTitleError(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="Hapus judul"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <Sparkles className="text-indigo-500" size={16} />
                  </div>
                </div>
                {titleError ? (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center space-x-1">
                    <span>⚠️ {titleError}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Tekan <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-700">Enter</kbd> untuk lanjut atau pilih bank rekomendasi di bawah</span>
                    {sopTitle && (
                      <span className="text-emerald-600 font-semibold text-[10px]">
                        ✓ Siap dianalisis
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* 2. Category Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Kategori Standar Pendidikan (13 Bidang SD):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {selectedCategory === "ALL"
                      ? "Menampilkan semua bidang"
                      : "Menyaring rekomendasi ke bidang terpilih"}
                  </span>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer shadow-2xs"
                >
                  <option value="ALL">Semua Kategori (13 Bidang Standar Sekolah Dasar)</option>
                  {RECOMMENDATION_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={`${cat.code}. ${cat.categoryName || cat.name}`}>
                      {cat.code}. {cat.categoryName || cat.name} ({cat.suggestedSops?.length || 0} SOP)
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Filtered Bank SOP Recommendations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Bank SOP Rekomendasi Kepala Sekolah SD</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {filteredSuggestions.length} Tersedia
                    </span>
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Klik kartu untuk memilih otomatis
                  </span>
                </div>

                {filteredSuggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs max-h-56 overflow-y-auto pr-1">
                    {filteredSuggestions.map((item) => {
                      const isSelected = sopTitle.trim().toLowerCase() === item.title.trim().toLowerCase();
                      return (
                        <div
                          key={item.title}
                          onClick={() => handleSelectSuggestion(item.title, item.categoryStr)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xs"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-slate-800 text-xs truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.objective}</p>
                            <span className="inline-block mt-1 text-[9px] text-slate-400 font-medium">
                              {item.categoryStr}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                              item.priority === "Tinggi"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-slate-700">
                      Tidak ada rekomendasi bawaan yang cocok dengan pencarian / filter ini.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                      Anda dapat tetap memakai judul kustom:{" "}
                      <span className="font-bold text-indigo-700">"{sopTitle}"</span>.
                      AI akan menyusun draf operasional lengkap berdasarkan Permenpan RB dan standar SD.
                    </p>
                    {selectedCategory !== "ALL" && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("ALL")}
                        className="mt-2 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                      >
                        Tampilkan Semua Kategori (13 Bidang)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: WAWANCARA SINGKAT AI ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-lg flex items-start space-x-3 text-xs text-indigo-950">
                <HelpCircle size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    Wawancara Operasional untuk: <span className="underline">{sopTitle}</span>
                  </p>
                  <p className="text-indigo-800 text-[11px] mt-0.5">
                    AI telah menyiapkan jawaban awal standar sekolah. Bapak/Ibu Kepala Sekolah dapat menyesuaikan jawaban berikut agar SOP presisi sesuai kondisi nyata sekolah.
                  </p>
                </div>
              </div>

              {isLoadingQuestions ? (
                <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-500 space-y-2">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                  <span>AI sedang menyesuaikan pertanyaan cerdas...</span>
                </div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  {/* Pertanyaan 1 */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      1. Siapa saja pihak yang terlibat dalam pelaksanaan prosedur ini?
                    </label>
                    <input
                      type="text"
                      value={answers.pihakTerlibat}
                      onChange={(e) => setAnswers({ ...answers, pihakTerlibat: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Kepala Sekolah, Guru Kelas, Bendahara BOS, Komite Sekolah"
                    />
                  </div>

                  {/* Pertanyaan 2 */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      2. Bagaimana gambaran alur kerja dari awal sampai selesai?
                    </label>
                    <textarea
                      rows={2}
                      value={answers.alurBerjalan}
                      onChange={(e) => setAnswers({ ...answers, alurBerjalan: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Pertanyaan 3 */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      3. Berkas atau dokumen bukti apa yang digunakan / dihasilkan?
                    </label>
                    <input
                      type="text"
                      value={answers.berkasDokumen}
                      onChange={(e) => setAnswers({ ...answers, berkasDokumen: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Formulir pengajuan, kuitansi, berita acara, lembar verifikasi"
                    />
                  </div>

                  {/* Pertanyaan 4 */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      4. Berapa rata-rata waktu yang dibutuhkan untuk menyelesaikan prosedur ini?
                    </label>
                    <input
                      type="text"
                      value={answers.waktuPenyelesaian}
                      onChange={(e) => setAnswers({ ...answers, waktuPenyelesaian: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. 1 hari, 3 hari, atau 1 minggu"
                    />
                  </div>

                  {/* Pertanyaan 5 */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      5. Masalah atau kendala apa yang paling sering timbul dan perlu dicegah?
                    </label>
                    <input
                      type="text"
                      value={answers.kendalaRisiko}
                      onChange={(e) => setAnswers({ ...answers, kendalaRisiko: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Dokumen tidak lengkap, keterlambatan pengesahan, selisih data"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: LOADING DRAFT DENGAN AI ================= */}
          {step === 3 && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border-4 border-indigo-200 flex items-center justify-center">
                  <Sparkles className="text-indigo-600 animate-spin" size={28} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Sedang Menyusun Dokumen SOP Standar Mutu Baku
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  Mencocokkan regulasi resmi JDIH/Kemendikdasmen, menyusun tabel pelaksana mutu baku, dan menetapkan peringatan serta retensi arsip...
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-72 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-indigo-700 font-semibold">{generationProgress}% Selesai</span>
            </div>
          )}

          {/* ================= STEP 4: DRAFT JADI PREVIEW RINGKAS ================= */}
          {step === 4 && generatedSop && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 text-xs text-emerald-900">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Draft SOP Berhasil Disusun oleh AI!</h4>
                  <p className="text-emerald-700 text-xs">
                    Format telah disesuaikan dengan contoh baku: Kop Satuan Pendidikan, Dasar Hukum Terverifikasi, dan {generatedSop.tabelPelaksanaMutuBaku?.length || 0} Langkah Pelaksana Mutu Baku.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-slate-800 text-sm">{generatedSop.identitas?.namaSop || "SOP Satuan Pendidikan"}</span>
                  <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border">
                    {generatedSop.identitas?.nomorSop || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Kategori:</span>
                    <span className="font-semibold text-slate-800">{generatedSop.kategori || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dasar Hukum:</span>
                    <span className="font-semibold text-slate-800">{generatedSop.dasarHukum?.length || 0} Regulasi Resmi</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pihak Pelaksana:</span>
                    <span className="font-semibold text-slate-800">{generatedSop.pelaksanaList?.length || 0} Pihak Terlibat</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Langkah Prosedur:</span>
                    <span className="font-semibold text-slate-800">{generatedSop.tabelPelaksanaMutuBaku?.length || 0} Langkah Kerja</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t text-[11px] text-slate-600">
                  <span className="font-semibold">Peringatan:</span>{" "}
                  {Array.isArray(generatedSop.peringatan)
                    ? (generatedSop.peringatan[0] || "Tidak ada peringatan khusus.")
                    : (typeof generatedSop.peringatan === "string" ? generatedSop.peringatan : "Tidak ada peringatan khusus.")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleGoToInterview}
                className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <span>Lanjut ke Wawancara AI</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-1"
              >
                <ArrowLeft size={14} />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Sparkles size={14} />
                <span>Susun SOP Sekarang</span>
              </button>
            </>
          )}

          {step === 3 && (
            <div className="w-full text-center text-xs text-slate-400 italic">
              Mohon tunggu beberapa detik sementara AI merumuskan dokumen resmi...
            </div>
          )}

          {step === 4 && (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Atur Ulang Wawancara
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <CheckCircle2 size={14} />
                <span>Buka di Editor & Cetak</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
