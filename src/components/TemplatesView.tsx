import React from "react";
import { Layers, Sparkles, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { SchoolProfile, SopDocument } from "../types";
import { REFERENCE_TEMPLATE_SOPS } from "../data/initialData";

interface TemplatesViewProps {
  schoolProfile: SchoolProfile;
  onUseTemplate: (sop: SopDocument) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  schoolProfile,
  onUseTemplate,
}) => {
  // Collection of pre-configured standard SD templates
  const templates: SopDocument[] = [
    ...REFERENCE_TEMPLATE_SOPS,
    {
      id: "tpl-bullying",
      identitas: {
        namaSop: "SOP Penanganan Kasus Bullying dan Pencegahan Kekerasan (PPKSP)",
        nomorSop: `SOP/PPKSP/04/${new Date().getFullYear()}`,
        tanggalPembuatan: "02 Januari 2026",
        tanggalRevisi: "0",
        tanggalPengesahan: "10 Januari 2026",
        disahkanOleh: `Kepala ${schoolProfile.namaSekolah}`,
        namaKepalaSekolah: schoolProfile.namaKepalaSekolah,
        nip: schoolProfile.nip,
        unitKerja: schoolProfile.namaSekolah,
      },
      dasarHukum: [
        {
          id: "dh-1",
          namaRegulasi: "Permendikbudristek Nomor 46 Tahun 2023",
          nomor: "46",
          tahun: "2023",
          tentang: "Pencegahan dan Penanganan Kekerasan di Lingkungan Satuan Pendidikan (PPKSP)",
          statusVerifikasi: "Terverifikasi Resmi",
          sumber: "JDIH Kemendikbudristek",
        },
        {
          id: "dh-2",
          namaRegulasi: "Undang-Undang Nomor 35 Tahun 2014",
          nomor: "35",
          tahun: "2014",
          tentang: "Perlindungan Anak",
          statusVerifikasi: "Terverifikasi Resmi",
          sumber: "JDIH BPK RI",
        },
      ],
      kualifikasiPelaksana: [
        "Memiliki kepekaan psikologis anak dan pemahaman konvensi hak anak",
        "Mampu menjaga kerahasiaan identitas korban dan saksi (prinsip nondiskriminasi)",
        "Memahami pedoman penanganan kasus kekerasan sekolah dasar",
      ],
      keterkaitan: ["SOP Bimbingan Konseling SD", "SOP Komunikasi dengan Orang Tua / Wali"],
      peralatanPerlengkapan: [
        "Buku Catatan Pengaduan Kasus",
        "Formulir Penerimaan Laporan Kejadian",
        "Ruang Konseling / Mediasi Khusus yang Aman",
        "Nomor Kontak Layanan SAPA 129 / UPTD PPA",
      ],
      peringatan: [
        "Keterlambatan respons dapat memperparah trauma psikologis anak",
        "Dilarang menyebarluaskan identitas atau rekaman kasus kepada pihak luar",
      ],
      pencatatanPendataan: {
        dokumenBukti: [
          "Formulir Pengaduan Kekerasan",
          "Berita Acara Pemeriksaan Fakta Kasus",
          "Surat Kesepakatan / Rujukan Konseling Psikolog",
        ],
        penanggungJawabArsip: "Ketua TPPK / Guru Kelas",
        mediaPenyimpanan: "Map Dokumen Rahasia TPPK & Folder Terenkripsi",
        periodePenyimpanan: "5 tahun setelah siswa lulus",
      },
      pelaksanaList: ["Siswa/Pelapor", "Guru Kelas", "Tim TPPK", "Kepala Sekolah", "Orang Tua/Wali"],
      tabelPelaksanaMutuBaku: [
        {
          id: "step-1",
          no: 1,
          uraianProsedur: "Menerima laporan dugaan kekerasan/perundungan secara langsung atau melalui kotak aduan.",
          pelaksanaChecks: { "Siswa/Pelapor": true, "Guru Kelas": true },
          persyaratan: "Laporan lisan / tertulis",
          waktu: "15 menit",
          output: "Catatan awal pengaduan",
          flowType: "start",
        },
        {
          id: "step-2",
          no: 2,
          uraianProsedur: "Melakukan verifikasi awal dan mengamankan siswa korban di ruang UKS/konseling yang tenang.",
          pelaksanaChecks: { "Guru Kelas": true, "Tim TPPK": true },
          persyaratan: "Ruang aman, pendampingan empati",
          waktu: "30 menit",
          output: "Lembar verifikasi fakta",
          flowType: "process",
        },
        {
          id: "step-3",
          no: 3,
          uraianProsedur: "Melaporkan secara tertutup kepada Kepala Sekolah untuk penentuan tingkat penanganan kasus.",
          pelaksanaChecks: { "Tim TPPK": true, "Kepala Sekolah": true },
          persyaratan: "Resume kasus",
          waktu: "1 jam",
          output: "Disposisi arahan penanganan",
          flowType: "decision",
        },
        {
          id: "step-4",
          no: 4,
          uraianProsedur: "Memanggil orang tua korban dan pelaku secara terpisah untuk mediasi dan pemulihan psikologis.",
          pelaksanaChecks: { "Tim TPPK": true, "Kepala Sekolah": true, "Orang Tua/Wali": true },
          persyaratan: "Undangan tertutup, berita acara",
          waktu: "1 hari",
          output: "Berita acara kesepakatan / rujukan",
          flowType: "process",
        },
        {
          id: "step-5",
          no: 5,
          uraianProsedur: "Melakukan pemantauan berkala kondisi korban di kelas untuk memastikan tidak ada pengulangan.",
          pelaksanaChecks: { "Guru Kelas": true, "Tim TPPK": true },
          persyaratan: "Jurnal observasi harian",
          waktu: "14 hari",
          output: "Laporan tuntas penanganan",
          flowType: "end",
        },
      ],
      versi: "1.0",
      status: "DRAFT",
      kategori: "J. Penanganan Masalah & Perlindungan Anak",
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
      tanggalReviewBerikutnya: "2027-01-10",
      penanggungJawab: "Ketua TPPK",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      riwayatRevisi: [],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-100">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Layers size={16} />
            <span>Koleksi Template Baku Siap Pakai</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Template SOP Standar Satuan Pendidikan SD
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih template baku yang telah disusun rapi sesuai regulasi Kemendikdasmen dan sesuaikan langsung untuk {schoolProfile.namaSekolah}.
          </p>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                {tpl.kategori}
              </span>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {tpl.identitas.namaSop}
              </h3>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">Pelaksana:</span>{" "}
                  {tpl.pelaksanaList.join(", ")}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Langkah Kerja:</span>{" "}
                  {tpl.tabelPelaksanaMutuBaku.length} Prosedur Mutu Baku
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Dasar Hukum:</span>{" "}
                  {tpl.dasarHukum.map((d) => d.namaRegulasi).join(", ")}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Format Baku Kepmenpan RB</span>
              <button
                onClick={() => {
                  const cloned: SopDocument = {
                    ...tpl,
                    id: `sop-${Date.now()}`,
                    identitas: {
                      ...tpl.identitas,
                      namaKepalaSekolah: schoolProfile.namaKepalaSekolah,
                      nip: schoolProfile.nip,
                      disahkanOleh: `Kepala ${schoolProfile.namaSekolah}`,
                    },
                    status: "DRAFT",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  onUseTemplate(cloned);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95"
              >
                <Sparkles size={13} />
                <span>Gunakan Template Ini</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
