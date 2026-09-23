import React, { useState } from "react";
import {
  ClipboardList,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Building,
  Users,
  ShieldAlert,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Filter,
} from "lucide-react";
import { SchoolProfile, SopNeedsAnalysisInput, SopRecommendationItem } from "../types";
import { RECOMMENDATION_CATEGORIES } from "../data/initialData";

interface AiNeedsAnalysisViewProps {
  schoolProfile: SchoolProfile;
  onDraftWithAi: (sopTitle: string, category: string) => void;
}

export const AiNeedsAnalysisView: React.FC<AiNeedsAnalysisViewProps> = ({
  schoolProfile,
  onDraftWithAi,
}) => {
  const [formData, setFormData] = useState<SopNeedsAnalysisInput>({
    jumlahSiswa: 240,
    jumlahRombel: 6,
    jumlahGuruPns: 4,
    jumlahGuruPppk: 2,
    jumlahGuruHonorer: 2,
    jumlahTendik: 2,
    jumlahSatpamPenjaga: 1,
    fasilitasUks: true,
    fasilitasKantin: true,
    fasilitasPerpustakaan: true,
    fasilitasLabKomputer: false,
    kondisiSanitasi: "Cukup baik, air lancar, 4 toilet siswa terpisah",
    programUnggulan: "Sekolah Ramah Anak, Budaya Literasi Pagi, Adiwiyata Tingkat Kabupaten",
    kegiatanRutin: "Upacara bendera Senin, senam pagi Jumat, doa bersama, ekstrakurikuler Pramuka",
    ekstrakurikuler: "Pramuka, Tari Tradisional, Drumband, Pencak Silat, Dokter Kecil",
    kondisiKhusus: "Sekolah berada di dekat jalan raya antar-desa, pagar sekolah belum sepenuhnya tertutup.",
    masalahSeringTerjadi: "Keterlambatan pengembalian buku perpustakaan, pencatatan izin sakit siswa belum seragam, koordinasi kegiatan mendadak dengan wali murid.",
    risikoDicegah: "Kekerasan/bullying antar murid, kecelakaan saat menyeberang jalan, temuan administrasi SPJ BOS, kehilangan arsip buku induk.",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<SopRecommendationItem[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Run AI Needs Analysis via Gemini backend
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/analyze-needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationalData: formData,
          schoolProfile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          return;
        }
      }
      // Fallback to rich curated recommendations from master catalog
      const fallbackList: SopRecommendationItem[] = RECOMMENDATION_CATEGORIES.flatMap((c) =>
        (c.suggestedSops || []).map((s) => ({
          id: `rec-${Math.random()}`,
          categoryCode: c.code,
          categoryName: c.categoryName || c.name,
          title: s.title,
          priority: s.priority,
          objective: s.objective,
          reason: `Dibutuhkan berdasarkan kondisi ${schoolProfile.namaSekolah} (${formData.jumlahSiswa} siswa, ${formData.jumlahRombel} rombel).`,
          riskIfNotAvailable: "Ketidakpastian alur kerja dan risiko temuan audit atau masalah operasional.",
          partiesInvolved: ["Kepala Sekolah", "Guru", "Tendik"],
          primaryLegalBasis: "Permendikdasmen RI",
        }))
      );
      setRecommendations(fallbackList);
    } catch {
      // Graceful fallback without blocking alert
      const fallbackList: SopRecommendationItem[] = RECOMMENDATION_CATEGORIES.flatMap((c) =>
        (c.suggestedSops || []).map((s) => ({
          id: `rec-${Math.random()}`,
          categoryCode: c.code,
          categoryName: c.categoryName || c.name,
          title: s.title,
          priority: s.priority,
          objective: s.objective,
          reason: `Dibutuhkan berdasarkan kondisi ${schoolProfile.namaSekolah} (${formData.jumlahSiswa} siswa, ${formData.jumlahRombel} rombel).`,
          riskIfNotAvailable: "Ketidakpastian alur kerja dan risiko temuan audit atau masalah operasional.",
          partiesInvolved: ["Kepala Sekolah", "Guru", "Tendik"],
          primaryLegalBasis: "Permendikdasmen RI",
        }))
      );
      setRecommendations(fallbackList);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredList = recommendations.length > 0
    ? recommendations.filter((item) => {
        const matchPriority = filterPriority === "ALL" || item.priority === filterPriority;
        const matchCategory = activeCategoryFilter === "ALL" || item.categoryCode === activeCategoryFilter;
        return matchPriority && matchCategory;
      })
    : [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <ClipboardList size={16} />
            <span>Modul Analisis Kebutuhan SOP Satuan Pendidikan SD</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Analisis Matriks 13 Bidang Operasional Sekolah Dasar
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            AI menganalisis data riil {schoolProfile.namaSekolah} (siswa, pendidik, fasilitas, kegiatan, dan risiko) untuk memberikan rekomendasi prioritas SOP yang wajib, penting, dan perlu segera disusun.
          </p>
        </div>

        <button
          onClick={() => setIsFormExpanded(!isFormExpanded)}
          className="flex items-center space-x-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold px-3 py-2 rounded-lg border border-slate-300 transition-colors"
        >
          <span>{isFormExpanded ? "Sembunyikan Form Kondisi" : "Buka / Ubah Form Kondisi Sekolah"}</span>
          {isFormExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Input Form (Collapsible) */}
      {isFormExpanded && (
        <form onSubmit={handleAnalyze} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Data Kondisi Riil {schoolProfile.namaSekolah}
            </h3>
            <span className="text-[11px] text-slate-500">
              Isikan data ini agar AI menganalisis secara presisi
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Jumlah Siswa</label>
              <input
                type="number"
                value={formData.jumlahSiswa}
                onChange={(e) => setFormData({ ...formData, jumlahSiswa: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Jumlah Rombel</label>
              <input
                type="number"
                value={formData.jumlahRombel}
                onChange={(e) => setFormData({ ...formData, jumlahRombel: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Guru PNS / PPPK</label>
              <div className="flex space-x-1">
                <input
                  type="number"
                  placeholder="PNS"
                  value={formData.jumlahGuruPns}
                  onChange={(e) => setFormData({ ...formData, jumlahGuruPns: Number(e.target.value) })}
                  className="w-1/2 border border-slate-300 rounded-lg p-2"
                />
                <input
                  type="number"
                  placeholder="PPPK"
                  value={formData.jumlahGuruPppk}
                  onChange={(e) => setFormData({ ...formData, jumlahGuruPppk: Number(e.target.value) })}
                  className="w-1/2 border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Guru Honorer / Tendik</label>
              <div className="flex space-x-1">
                <input
                  type="number"
                  placeholder="Honorer"
                  value={formData.jumlahGuruHonorer}
                  onChange={(e) => setFormData({ ...formData, jumlahGuruHonorer: Number(e.target.value) })}
                  className="w-1/2 border border-slate-300 rounded-lg p-2"
                />
                <input
                  type="number"
                  placeholder="Tendik"
                  value={formData.jumlahTendik}
                  onChange={(e) => setFormData({ ...formData, jumlahTendik: Number(e.target.value) })}
                  className="w-1/2 border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>

          {/* Fasilitas Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Fasilitas Sekolah yang Ada:</label>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fasilitasUks}
                  onChange={(e) => setFormData({ ...formData, fasilitasUks: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <span>Ruang UKS</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fasilitasKantin}
                  onChange={(e) => setFormData({ ...formData, fasilitasKantin: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <span>Kantin Sekolah</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fasilitasPerpustakaan}
                  onChange={(e) => setFormData({ ...formData, fasilitasPerpustakaan: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <span>Perpustakaan</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fasilitasLabKomputer}
                  onChange={(e) => setFormData({ ...formData, fasilitasLabKomputer: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <span>Lab Komputer / Chrome Book</span>
              </label>
            </div>
          </div>

          {/* Contextual Textareas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Kondisi Khusus / Lingkungan Sekolah:
              </label>
              <textarea
                rows={2}
                value={formData.kondisiKhusus}
                onChange={(e) => setFormData({ ...formData, kondisiKhusus: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
                placeholder="Contoh: Dekat sungai, pinggir jalan raya utama, kawasan padat penduduk..."
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Masalah / Kendala yang Sering Terjadi:
              </label>
              <textarea
                rows={2}
                value={formData.masalahSeringTerjadi}
                onChange={(e) => setFormData({ ...formData, masalahSeringTerjadi: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
                placeholder="Contoh: Keterlambatan SPJ BOS, penanganan murid demam, izin meninggalkan kelas..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Risiko Utama yang Ingin Dicegah oleh Kepala Sekolah:
              </label>
              <input
                type="text"
                value={formData.risikoDicegah}
                onChange={(e) => setFormData({ ...formData, risikoDicegah: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2"
                placeholder="Contoh: Bullying/kekerasan anak, penyelewengan dana, kecelakaan di lingkungan sekolah, sengketa aset..."
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-xs flex items-center space-x-2 shadow-sm transition-all"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>Jalankan Analisis AI Berdasarkan Data Ini</span>
            </button>
          </div>
        </form>
      )}

      {/* Analysis Results Filter & Overview */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Katalog Rekomendasi SOP 13 Bidang Standar Sekolah Dasar
            </h3>
            <p className="text-xs text-slate-500">
              {filteredList.length > 0
                ? `Menampilkan ${filteredList.length} SOP hasil analisis terstruktur.`
                : "Klik tombol 'Jalankan Analisis' atau lihat katalog standar di bawah."}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1 text-slate-600 font-medium">
              <Filter size={13} />
              <span>Prioritas:</span>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-white font-semibold"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="Tinggi">Wajib / Prioritas Tinggi</option>
              <option value="Sedang">Prioritas Sedang</option>
              <option value="Rendah">Rekomendasi / Rendah</option>
            </select>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setActiveCategoryFilter("ALL")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              activeCategoryFilter === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua (13 Bidang)
          </button>
          {RECOMMENDATION_CATEGORIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setActiveCategoryFilter(c.code)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeCategoryFilter === c.code
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.code}. {c.categoryName || c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(filteredList.length > 0 ? filteredList : RECOMMENDATION_CATEGORIES.flatMap((c) =>
          (c.suggestedSops || []).map((s) => ({
            id: `rec-${c.code}-${s.title}`,
            categoryCode: c.code,
            categoryName: c.categoryName || c.name,
            title: s.title,
            priority: s.priority,
            objective: s.objective,
            reason: `Kebutuhan operasional penting bagi SD (${schoolProfile.namaSekolah}).`,
            riskIfNotAvailable: "Penyimpangan alur kerja, ketidakjelasan tupoksi, risiko temuan pengawas/auditor.",
            partiesInvolved: ["Kepala Sekolah", "Guru", "Tendik"],
            primaryLegalBasis: "Peraturan Kemendikdasmen & PP SNP",
          }))
        )).filter((item) => {
          const matchPriority = filterPriority === "ALL" || item.priority === filterPriority;
          const matchCategory = activeCategoryFilter === "ALL" || item.categoryCode === activeCategoryFilter;
          return matchPriority && matchCategory;
        }).map((item) => (
          <div
            key={item.id || item.title}
            className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all p-4 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {item.categoryCode}. {item.categoryName}
                </span>
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    item.priority === "Tinggi"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : item.priority === "Sedang"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-100 text-slate-700 border border-slate-300"
                  }`}
                >
                  {item.priority === "Tinggi" ? "Wajib / Tinggi" : item.priority}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {item.title}
              </h4>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Tujuan:</span> {item.objective}
              </p>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10.5px] space-y-1 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">Risiko bila nihil:</span>{" "}
                  {item.riskIfNotAvailable}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Pihak Terlibat:</span>{" "}
                  {Array.isArray(item.partiesInvolved) ? item.partiesInvolved.join(", ") : item.partiesInvolved}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 italic">
                Regulasi: {item.primaryLegalBasis || "Standar Nasional SD"}
              </span>
              <button
                onClick={() => onDraftWithAi((item as any).title || (item as any).namaSop || "SOP Baru", `${item.categoryCode}. ${(item as any).categoryName || ""}`)}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-all active:scale-95"
              >
                <Sparkles size={13} />
                <span>Susun SOP Ini</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
