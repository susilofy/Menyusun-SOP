import React, { useState } from "react";
import { Scale, Search, Plus, ExternalLink, CheckCircle2, Shield, BookOpen } from "lucide-react";
import { OfficialRegulation } from "../types";
import { OFFICIAL_REGULATIONS } from "../data/initialData";

export const RegulationsView: React.FC = () => {
  const [regulations, setRegulations] = useState<OfficialRegulation[]>(OFFICIAL_REGULATIONS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newReg, setNewReg] = useState<Partial<OfficialRegulation>>({
    namaRegulasi: "",
    nomor: "",
    tahun: "2025",
    tentang: "",
    instansiPenerbit: "Kementerian Pendidikan Dasar dan Menengah RI",
    kategoriTerkait: "B. Kurikulum & Pembelajaran",
    statusVerifikasi: "Terverifikasi Resmi",
  });

  const filtered = regulations.filter((r) => {
    const matchSearch =
      search === "" ||
      r.namaRegulasi.toLowerCase().includes(search.toLowerCase()) ||
      r.tentang.toLowerCase().includes(search.toLowerCase()) ||
      r.nomor.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "ALL" || r.kategoriTerkait === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleAddRegulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg.namaRegulasi || !newReg.tentang) return;

    const item: OfficialRegulation = {
      id: `reg-${Date.now()}`,
      namaRegulasi: newReg.namaRegulasi!,
      nomor: newReg.nomor || "-",
      tahun: newReg.tahun || "2025",
      tentang: newReg.tentang!,
      instansiPenerbit: newReg.instansiPenerbit || "Kementerian Pendidikan",
      kategoriTerkait: newReg.kategoriTerkait || "Umum",
      statusVerifikasi: "Terverifikasi Resmi",
      sumber: newReg.sumber || "JDIH Kemendikbudristek",
    };

    setRegulations((prev) => [item, ...prev]);
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-100">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Scale size={16} />
            <span>Bank Data Regulasi & Dasar Hukum Resmi</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Katalog Peraturan Perundang-undangan Pendidikan Dasar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sumber acuan hukum sah (UU Sisdiknas, PP Standar Nasional Pendidikan, Permendikdasmen, Kepmenpan RB).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-2xs transition-all"
        >
          <Plus size={14} />
          <span>Tambah Regulasi Resmi</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari regulasi, nomor, atau tentang..."
            className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <span className="text-xs text-slate-500">
          Menampilkan {filtered.length} dari {regulations.length} regulasi resmi
        </span>
      </div>

      {/* Regulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((reg) => (
          <div
            key={reg.id}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {reg.kategoriTerkait}
                </span>
                <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 size={12} />
                  <span>{reg.statusVerifikasi}</span>
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                {reg.namaRegulasi}
              </h3>

              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Tentang:</span> {reg.tentang}
              </p>

              <div className="text-[11px] text-slate-500">
                Penerbit: {reg.instansiPenerbit} ({reg.tahun})
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-mono">ID: {reg.id}</span>
              <span className="text-indigo-600 font-medium">Baku untuk SOP SD</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Regulation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 text-xs animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
              Tambah Regulasi Resmi Baru
            </h3>
            <form onSubmit={handleAddRegulation} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Regulasi Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Permendikdasmen Nomor 12 Tahun 2024"
                  value={newReg.namaRegulasi}
                  onChange={(e) => setNewReg({ ...newReg, namaRegulasi: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Regulasi</label>
                  <input
                    type="text"
                    value={newReg.nomor}
                    onChange={(e) => setNewReg({ ...newReg, nomor: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Terbit</label>
                  <input
                    type="text"
                    value={newReg.tahun}
                    onChange={(e) => setNewReg({ ...newReg, tahun: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tentang / Perihal</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kurikulum pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Menengah"
                  value={newReg.tentang}
                  onChange={(e) => setNewReg({ ...newReg, tentang: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instansi Penerbit</label>
                <input
                  type="text"
                  value={newReg.instansiPenerbit}
                  onChange={(e) => setNewReg({ ...newReg, instansiPenerbit: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                >
                  Simpan Regulasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
