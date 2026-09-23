import React, { useState, useMemo } from "react";
import {
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
  BookOpen,
  RotateCcw,
  ListOrdered,
  Scale,
  Sliders,
  Plus,
  Minus,
  Check,
  CheckSquare,
} from "lucide-react";
import { SchoolProfile, SopDocument } from "../types";
import { RECOMMENDATION_CATEGORIES, officialRegulationsCatalog } from "../data/initialData";
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

export interface AiWizardViewProps {
  schoolProfile: SchoolProfile;
  onSopGenerated: (newSop: SopDocument) => void;
  onCancel?: () => void;
  initialTitle?: string;
  initialCategory?: string;
}

export const AiWizardView: React.FC<AiWizardViewProps> = ({
  schoolProfile,
  onSopGenerated,
  onCancel,
  initialTitle = "",
  initialCategory = "ALL",
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Selected or custom SOP
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "ALL");
  const [sopTitle, setSopTitle] = useState<string>(initialTitle || "");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [titleError, setTitleError] = useState<string | null>(null);

  // If initialTitle provided or changed, update state
  React.useEffect(() => {
    if (initialTitle) {
      setSopTitle(initialTitle);
      if (initialCategory) setSelectedCategory(initialCategory);
    }
  }, [initialTitle, initialCategory]);

  // Step 2: 5 Interview answers
  const [answers, setAnswers] = useState({
    pihakTerlibat: "Kepala Sekolah, Guru Kelas, Guru Mapel, Operator Sekolah",
    alurBerjalan: "Guru menyusun draf berkas, diperiksa oleh tim, lalu diverifikasi dan disahkan oleh Kepala Sekolah.",
    berkasDokumen: "Buku panduan kurikulum, instrumen penilaian, format verifikasi, lembar pengesahan.",
    waktuPenyelesaian: "3 sampai 5 hari kerja",
    kendalaRisiko: "Keterlambatan penyerahan berkas dan perbedaan format antar guru.",
  });

  // Konfigurasi dinamis langkah tabel mutu baku & dasar hukum
  const [targetStepsCount, setTargetStepsCount] = useState<number>(5);
  const [targetDasarHukumCount, setTargetDasarHukumCount] = useState<number>(3);
  const [dasarHukumMode, setDasarHukumMode] = useState<"ai_auto" | "custom_select">("ai_auto");
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>(["reg-1", "reg-2", "reg-10"]);
  const [regSearchQuery, setRegSearchQuery] = useState("");

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSop, setGeneratedSop] = useState<SopDocument | null>(null);

  // Filter katalog regulasi resmi
  const filteredCatalogRegulations = useMemo(() => {
    const q = regSearchQuery.trim().toLowerCase();
    if (!q) return officialRegulationsCatalog;
    return officialRegulationsCatalog.filter(
      (r) =>
        r.namaRegulasi.toLowerCase().includes(q) ||
        r.tentang.toLowerCase().includes(q) ||
        r.nomor.toLowerCase().includes(q) ||
        (r.sumber && r.sumber.toLowerCase().includes(q))
    );
  }, [regSearchQuery]);

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

  // Handle typing in title field with intelligent category suggestion
  const handleTitleChange = (newTitle: string) => {
    setSopTitle(newTitle);
    if (titleError) setTitleError(null);

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

    const effectiveDhCount =
      dasarHukumMode === "custom_select"
        ? Math.max(1, selectedRegIds.length)
        : targetDasarHukumCount;

    const chosenRegs =
      dasarHukumMode === "custom_select" && selectedRegIds.length > 0
        ? officialRegulationsCatalog.filter((r) => selectedRegIds.includes(r.id))
        : undefined;

    const requestPayload = {
      sopTitle,
      namaSop: sopTitle,
      kategori: selectedCategory,
      interviewAnswers: answers,
      schoolProfile,
      targetStepsCount,
      targetDasarHukumCount: effectiveDhCount,
      selectedDasarHukum: chosenRegs,
    };

    const fallbackOptions = {
      targetStepsCount,
      targetDasarHukumCount: effectiveDhCount,
      selectedDasarHukum: chosenRegs,
    };

    try {
      const res = await fetch("/api/gemini/generate-sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      clearInterval(progressTimer);
      setGenerationProgress(100);

      if (res.ok) {
        const sopData: SopDocument = await res.json();
        setGeneratedSop(sopData);
        setStep(4);
        return;
      }
      const fallbackSop = buildFallbackSopDocument(
        sopTitle,
        selectedCategory,
        schoolProfile,
        answers,
        fallbackOptions
      );
      setGeneratedSop(fallbackSop);
      setStep(4);
    } catch {
      clearInterval(progressTimer);
      setGenerationProgress(100);
      const fallbackSop = buildFallbackSopDocument(
        sopTitle,
        selectedCategory,
        schoolProfile,
        answers,
        fallbackOptions
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
    }
  };

  const handleReset = () => {
    setStep(1);
    setSopTitle("");
    setGeneratedSop(null);
    setTitleError(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Main Header Card */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Kemendikdasmen AI Engine
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                  Format Mutu Baku SD
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Asisten AI Menyusun SOP
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Penyusunan sistematis berbasis regulasi resmi, wawancara operasional & format Pelaksana Mutu Baku untuk {schoolProfile.namaSekolah}.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 self-start md:self-auto">
            {step > 1 && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Mulai Dari Awal"
              >
                <RotateCcw size={14} />
                <span>Mulai Baru</span>
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Kembali
              </button>
            )}
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 md:px-6 md:py-3.5 flex items-center justify-between text-xs overflow-x-auto gap-2">
          <div className="flex items-center space-x-2 shrink-0">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-indigo-600 text-white shadow-2xs" : "bg-slate-200 text-slate-600"
              }`}
            >
              1
            </span>
            <span className={step === 1 ? "font-bold text-indigo-700" : "text-slate-500"}>
              Pilih / Ketik SOP
            </span>
          </div>

          <ChevronRight size={14} className="text-slate-300 shrink-0" />

          <div className="flex items-center space-x-2 shrink-0">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-indigo-600 text-white shadow-2xs" : "bg-slate-200 text-slate-600"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "font-bold text-indigo-700" : "text-slate-500"}>
              Wawancara Kontekstual AI
            </span>
          </div>

          <ChevronRight size={14} className="text-slate-300 shrink-0" />

          <div className="flex items-center space-x-2 shrink-0">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? "bg-indigo-600 text-white shadow-2xs" : "bg-slate-200 text-slate-600"
              }`}
            >
              3
            </span>
            <span className={step === 3 ? "font-bold text-indigo-700" : "text-slate-500"}>
              Penyusunan Draft
            </span>
          </div>

          <ChevronRight size={14} className="text-slate-300 shrink-0" />

          <div className="flex items-center space-x-2 shrink-0">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 4 ? "bg-emerald-600 text-white shadow-2xs" : "bg-slate-200 text-slate-600"
              }`}
            >
              4
            </span>
            <span className={step === 4 ? "font-bold text-emerald-700" : "text-slate-500"}>
              Draft Jadi & Verifikasi
            </span>
          </div>
        </div>

        {/* Content Card Body */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6">
          {/* ================= STEP 1: PILIH SOP ================= */}
          {step === 1 && (
            <div className="space-y-6">
              {/* 1. Input Judul SOP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
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
                    className={`w-full border rounded-xl pl-3.5 pr-20 py-3 text-sm font-semibold text-slate-900 focus:ring-2 shadow-2xs transition-colors ${
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
                        className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded bg-slate-100"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
                {titleError && (
                  <p className="text-xs text-rose-600 mt-1 font-semibold">{titleError}</p>
                )}
              </div>

              {/* 2. Filter Kategori */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Pilih / Saring Kategori SOP Satuan Pendidikan SD:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === "ALL"
                        ? "bg-indigo-600 text-white font-bold shadow-2xs"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {RECOMMENDATION_CATEGORIES.map((cat) => {
                    const label = `${cat.code}. ${cat.categoryName || cat.name}`;
                    const isSelected =
                      selectedCategory === label || selectedCategory.startsWith(`${cat.code}.`);
                    return (
                      <button
                        key={cat.code}
                        type="button"
                        onClick={() => setSelectedCategory(label)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white font-bold shadow-2xs"
                            : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Daftar Saran Cepat */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                    <BookOpen size={14} className="text-indigo-600" />
                    <span>Rekomendasi Dokumen SOP Baku Sekolah Dasar:</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Klik judul untuk memilih langsung
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto p-1">
                  {filteredSuggestions.slice(0, 16).map((item, idx) => {
                    const isCurrent = sopTitle.toLowerCase() === item.title.toLowerCase();
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(item.title, item.categoryStr)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isCurrent
                            ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-2xs"
                            : "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-xs text-slate-900 leading-snug">
                            {item.title}
                          </div>
                          {item.priority === "Tinggi" && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                              Wajib
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.objective}
                        </div>
                        <div className="text-[10px] font-medium text-indigo-600 mt-1.5">
                          {item.categoryStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: WAWANCARA KONTEKSTUAL AI ================= */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start space-x-3">
                <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                    SOP Target: {sopTitle}
                  </h3>
                  <p className="text-xs text-indigo-800/90 leading-relaxed">
                    Jawab 5 poin kontekstual di bawah sesuai kebiasaan operasional di{" "}
                    <strong>{schoolProfile.namaSekolah}</strong>. Data ini akan diselaraskan AI dengan regulasi resmi Permendikbudristek / Kepmendikdasmen.
                  </p>
                </div>
              </div>

              {isLoadingQuestions && (
                <div className="flex items-center space-x-2 text-xs text-indigo-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                  <Loader2 size={15} className="animate-spin" />
                  <span>Asisten AI sedang menyusun rekomendasi wawancara kontekstual...</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* 1. Pelaksana */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    1. Siapa saja pihak / pelaksana yang terlibat langsung?
                  </label>
                  <input
                    type="text"
                    value={answers.pihakTerlibat}
                    onChange={(e) => setAnswers({ ...answers, pihakTerlibat: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-medium"
                    placeholder="Contoh: Kepala Sekolah, Guru Kelas, Operator Sekolah, Komite"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Akan dipetakan otomatis ke dalam 4 s.d 5 kolom Pelaksana Mutu Baku Flowchart.
                  </p>
                </div>

                {/* 2. Alur */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    2. Bagaimana gambaran alur / langkah kerja yang selama ini berjalan?
                  </label>
                  <textarea
                    rows={3}
                    value={answers.alurBerjalan}
                    onChange={(e) => setAnswers({ ...answers, alurBerjalan: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    placeholder="Contoh: Dimulai dari pembentukan panitia, rapat kerja, verifikasi berkas, pelaksanaan di lapangan, hingga laporan tertulis dan evaluasi."
                  />
                </div>

                {/* 3. Berkas / Dokumen Kelengkapan */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    3. Berkas, formulir, atau dokumen apa saja yang digunakan?
                  </label>
                  <input
                    type="text"
                    value={answers.berkasDokumen}
                    onChange={(e) => setAnswers({ ...answers, berkasDokumen: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    placeholder="Contoh: Formulir Pendaftaran, Kuitansi Belanja, Jurnal Pembelajaran, SK Kepala Sekolah"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Dokumen ini akan mengisi kolom &quot;Kelengkapan&quot; dan &quot;Output&quot; pada tabel mutu baku.
                  </p>
                </div>

                {/* 4. Waktu */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    4. Berapa lama perkiraan durasi penyelesaian prosedur ini?
                  </label>
                  <input
                    type="text"
                    value={answers.waktuPenyelesaian}
                    onChange={(e) => setAnswers({ ...answers, waktuPenyelesaian: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    placeholder="Contoh: 3 hari kerja, 1 minggu, atau situasional"
                  />
                </div>

                {/* 5. Kendala / Risiko */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    5. Risiko apa yang mungkin terjadi jika SOP ini tidak dipatuhi?
                  </label>
                  <input
                    type="text"
                    value={answers.kendalaRisiko}
                    onChange={(e) => setAnswers({ ...answers, kendalaRisiko: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    placeholder="Contoh: Keterlambatan laporan dana BOS, berkas murid tercecer, atau komplain dari wali murid"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Akan dirumuskan ke dalam bagian &quot;Peringatan&quot; pada identitas dokumen SOP.
                  </p>
                </div>

                {/* ================= KONFIGURASI SESUAI KEPERLUAN ================= */}
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="p-3 bg-gradient-to-r from-indigo-50/80 via-blue-50/80 to-slate-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
                        <Sliders size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          Penyesuaian Jumlah Langkah & Dasar Hukum Sesuai Keperluan
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Atur jumlah langkah tabel mutu baku dan jumlah payung hukum resmi sesuai kebutuhan operasional sekolah Anda
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 1. Pengaturan Jumlah Langkah Pelaksana Mutu Baku */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <ListOrdered size={16} className="text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">
                            Jumlah Langkah Tabel Pelaksana Mutu Baku
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Pilih jumlah langkah flowchart dari koordinasi awal hingga pengarsipan
                          </span>
                        </div>
                      </div>

                      {/* Stepper counter */}
                      <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setTargetStepsCount((p) => Math.max(3, p - 1))}
                          disabled={targetStepsCount <= 3}
                          className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded font-bold transition-colors cursor-pointer"
                          title="Kurangi 1 langkah"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2.5 font-bold text-xs text-indigo-700 min-w-[70px] text-center">
                          {targetStepsCount} Langkah
                        </span>
                        <button
                          type="button"
                          onClick={() => setTargetStepsCount((p) => Math.min(15, p + 1))}
                          disabled={targetStepsCount >= 15}
                          className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded font-bold transition-colors cursor-pointer"
                          title="Tambah 1 langkah"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Pilihan Cepat:</span>
                      {[
                        { count: 3, label: "3 Langkah (Ringkas)" },
                        { count: 4, label: "4 Langkah" },
                        { count: 5, label: "5 Langkah (Standar Baku)" },
                        { count: 6, label: "6 Langkah" },
                        { count: 7, label: "7 Langkah" },
                        { count: 8, label: "8 Langkah (Lengkap)" },
                        { count: 10, label: "10 Langkah" },
                        { count: 12, label: "12 Langkah" },
                      ].map((preset) => (
                        <button
                          key={preset.count}
                          type="button"
                          onClick={() => setTargetStepsCount(preset.count)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            targetStepsCount === preset.count
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Structure indicator */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-600 flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                      <div>
                        <strong>Struktur Alur {targetStepsCount} Langkah:</strong> Langkah 1 (Mulai/Pengarahan), Langkah 2 s.d {Math.max(2, targetStepsCount - 2)} (Pelaksanaan & Pencatatan Lapangan), Langkah {targetStepsCount - 1} (Verifikasi/Keputusan & Pengesahan Kepala Sekolah), Langkah {targetStepsCount} (Pengarsipan & Sosialisasi Hasil).
                      </div>
                    </div>
                  </div>

                  {/* 2. Pengaturan Dasar Hukum & Regulasi Resmi */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Scale size={16} className="text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">
                            Dasar Hukum & Regulasi Resmi (JDIH Kemendikdasmen / BPK RI)
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Tentukan jumlah regulasi atau pilih langsung regulasi resmi yang diinginkan
                          </span>
                        </div>
                      </div>

                      {/* Mode Switcher */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setDasarHukumMode("ai_auto")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                            dasarHukumMode === "ai_auto"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Pilih Otomatis AI
                        </button>
                        <button
                          type="button"
                          onClick={() => setDasarHukumMode("custom_select")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                            dasarHukumMode === "custom_select"
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Pilih dari Katalog ({selectedRegIds.length})
                        </button>
                      </div>
                    </div>

                    {/* Sub-Panel: Mode AI Otomatis Berdasarkan Jumlah */}
                    {dasarHukumMode === "ai_auto" ? (
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 font-medium mr-1">Jumlah Regulasi:</span>
                          {[
                            { count: 2, label: "2 Regulasi" },
                            { count: 3, label: "3 Regulasi (Standar)" },
                            { count: 4, label: "4 Regulasi" },
                            { count: 5, label: "5 Regulasi" },
                            { count: 6, label: "6 Regulasi" },
                            { count: 8, label: "8 Regulasi" },
                          ].map((preset) => (
                            <button
                              key={preset.count}
                              type="button"
                              onClick={() => setTargetDasarHukumCount(preset.count)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                targetDasarHukumCount === preset.count
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}

                          {/* Stepper */}
                          <div className="flex items-center space-x-1 ml-auto bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setTargetDasarHukumCount((p) => Math.max(1, p - 1))}
                              disabled={targetDasarHukumCount <= 1}
                              className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded font-bold cursor-pointer"
                              title="Kurangi 1 regulasi"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 font-bold text-xs text-indigo-700 min-w-[24px] text-center">
                              {targetDasarHukumCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTargetDasarHukumCount((p) => Math.min(10, p + 1))}
                              disabled={targetDasarHukumCount >= 10}
                              className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded font-bold cursor-pointer"
                              title="Tambah 1 regulasi"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                          AI akan mencarikan <strong>{targetDasarHukumCount} regulasi resmi</strong> yang paling cocok untuk topik SOP ini (mengutamakan UU 20/2003 Sisdiknas, PP 57/2021 jo PP 4/2022 SNP, Permendikdasmen terkait, dan Permenpan RB 35/2012).
                        </p>
                      </div>
                    ) : (
                      /* Sub-Panel: Mode Pilih Mandiri dari Katalog Resmi */
                      <div className="space-y-2.5 pt-1">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                          <div className="relative flex-1">
                            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                            <input
                              type="text"
                              value={regSearchQuery}
                              onChange={(e) => setRegSearchQuery(e.target.value)}
                              placeholder="Cari regulasi (misal: BOSP, Kurikulum, PPKSP, PPDB, Penilaian, Sarpras)..."
                              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setSelectedRegIds(["reg-1", "reg-2", "reg-10"])}
                              className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                            >
                              Pilih Standar (3)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedRegIds(officialRegulationsCatalog.map((r) => r.id))}
                              className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
                            >
                              Pilih Semua
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedRegIds([])}
                              className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded border border-slate-200 cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {/* List of regulations with checkboxes */}
                        <div className="border border-slate-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                          {filteredCatalogRegulations.map((reg) => {
                            const isChecked = selectedRegIds.includes(reg.id);
                            return (
                              <label
                                key={reg.id}
                                className={`p-2.5 flex items-start space-x-2.5 hover:bg-indigo-50/40 cursor-pointer transition-colors ${
                                  isChecked ? "bg-indigo-50/30" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedRegIds((prev) => prev.filter((id) => id !== reg.id));
                                    } else {
                                      setSelectedRegIds((prev) => [...prev, reg.id]);
                                    }
                                  }}
                                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-slate-800 text-[11px] truncate">
                                      {reg.namaRegulasi}
                                    </span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 shrink-0">
                                      {reg.statusVerifikasi}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 line-clamp-1">
                                    Tentang: {reg.tentang}
                                  </p>
                                  <span className="text-[9px] text-slate-400 block">
                                    Sumber: {reg.sumber}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                          <span>Total Regulasi Terpilih: <strong>{selectedRegIds.length} regulasi</strong></span>
                          <span>Regulasi akan dicantumkan utuh pada dokumen SOP</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: ANIMASI PROGRES ================= */}
          {step === 3 && (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-md">
                  <Sparkles size={36} className="animate-spin text-indigo-600" style={{ animationDuration: "3s" }} />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-base font-bold text-slate-900">
                  Asisten AI Sedang Menyusun Dokumen SOP
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Menyelaraskan struktur format Pelaksana Mutu Baku, menambahkan dasar hukum resmi Kemendikdasmen, kualifikasi pelaksana, serta langkah kerja flowchart untuk:
                </p>
                <div className="font-semibold text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 inline-block">
                  {sopTitle}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md space-y-1.5">
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>Merumuskan Matriks Mutu Baku</span>
                  <span>{generationProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: SELESAI & PRATINJAU HASIL ================= */}
          {step === 4 && generatedSop && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3">
                <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    Dokumen SOP Berhasil Disusun oleh Asisten AI!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Dokumen telah diformat sesuai standar Pelaksana Mutu Baku resmi Kemendikdasmen, lengkap dengan identitas dokumen, dasar hukum, kualifikasi, peringatan, dan {generatedSop.tabelPelaksanaMutuBaku?.length || 0} langkah kerja.
                  </p>
                </div>
              </div>

              {/* Overview Box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 font-medium block">Nomor SOP:</span>
                    <span className="font-bold text-slate-900 font-mono">{generatedSop.identitas?.nomorSop || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Judul Prosedur:</span>
                    <span className="font-bold text-slate-900">{generatedSop.identitas?.namaSop || "SOP Baru"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Kategori:</span>
                    <span className="font-semibold text-indigo-700">{generatedSop.kategori || "-"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">
                      Dasar Hukum Resmi ({generatedSop.dasarHukum?.length || 0} Regulasi):
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] max-h-32 overflow-y-auto pr-1">
                      {generatedSop.dasarHukum?.map((dh, i) => (
                        <li key={i} className="leading-snug">
                          {typeof dh === "string" ? dh : `${dh.namaRegulasi} ${dh.nomor}/${dh.tahun} (${dh.tentang})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Daftar Pelaksana Prosedur:</span>
                    <div className="flex flex-wrap gap-1">
                      {generatedSop.pelaksanaList?.map((pel: string, i: number) => (
                        <span key={i} className="bg-white border border-slate-200 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {pel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Steps Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Pratinjau {generatedSop.tabelPelaksanaMutuBaku?.length || 0} Langkah Prosedur Kerja:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Dapat disunting bebas setelah disimpan ke Editor
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="p-2.5 w-12 text-center">No</th>
                        <th className="p-2.5">Aktivitas / Kegiatan</th>
                        <th className="p-2.5 w-32">Waktu</th>
                        <th className="p-2.5 w-40">Kelengkapan</th>
                        <th className="p-2.5 w-40">Output</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {generatedSop.tabelPelaksanaMutuBaku?.map((st, i) => (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="p-2.5 text-center font-bold text-slate-500">{st.no}</td>
                          <td className="p-2.5 text-slate-800 font-medium">{st.uraianProsedur}</td>
                          <td className="p-2.5 text-slate-600">{st.waktu}</td>
                          <td className="p-2.5 text-slate-600">{st.persyaratan}</td>
                          <td className="p-2.5 text-slate-600">{st.output}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex items-center justify-between">
          {step === 1 && (
            <>
              <div className="text-xs text-slate-500">
                Pilih atau ketik judul SOP, lalu klik lanjut untuk wawancara AI.
              </div>
              <button
                type="button"
                onClick={handleGoToInterview}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Lanjut ke Wawancara AI</span>
                <ArrowRight size={15} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Susun SOP Sekarang</span>
              </button>
            </>
          )}

          {step === 3 && (
            <div className="w-full text-center text-xs text-slate-400 italic py-1">
              Mohon tunggu beberapa detik sementara AI merumuskan dokumen resmi...
            </div>
          )}

          {step === 4 && (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Atur Ulang Wawancara
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Simpan & Buka di Editor SOP</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
