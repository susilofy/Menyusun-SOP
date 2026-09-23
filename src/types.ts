export type UserRole = "KEPALA_SEKOLAH" | "EDITOR" | "VIEWER";

export type SopStatus =
  | "DRAFT"
  | "REVIEW"
  | "REVISI"
  | "DISETUJUI"
  | "DISAHKAN"
  | "AKTIF"
  | "PERLU_DITINJAU"
  | "ARSIP";

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  statusSekolah: "Negeri" | "Swasta";
  jenjang: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  namaKepalaSekolah: string;
  nip: string;
  nomorSkKepalaSekolah: string;
  emailSekolah: string;
  nomorTelepon: string;
  tahunPelajaran: string;
  namaPengawasSekolah: string;
  namaDinasPendidikan: string;
  logoSekolahUrl?: string;
  logoPemdaUrl?: string;
  tandaTanganUrl?: string;
  stempelUrl?: string;
  formatNomorSop: string; // e.g. "SOP/{KODE}/{NOMOR}/{TAHUN}"
}

export interface DasarHukumItem {
  id: string;
  namaRegulasi: string;
  nomor: string;
  tahun: string;
  tentang: string;
  statusVerifikasi: "Terverifikasi Resmi" | "Perlu Verifikasi Kepala Sekolah";
  sumber: string;
  tanggalPemeriksaan?: string;
  instansiPenerbit?: string;
  kategoriTerkait?: string;
}

export interface PencatatanPendataan {
  dokumenBukti: string[];
  penanggungJawabArsip: string;
  mediaPenyimpanan: string;
  periodePenyimpanan: string;
  lokasiPenyimpanan?: string;
}

export type FlowType = "start" | "process" | "decision" | "end" | "check";

export interface PelaksanaMutuBakuStep {
  id: string;
  no: number;
  uraianProsedur: string;
  pelaksanaChecks: Record<string, boolean | FlowType>;
  persyaratan: string;
  waktu: string;
  output: string;
  activePelaksanaIndex?: number;
  flowType?: FlowType;
}

export interface ChecklistKelengkapan {
  namaSopTersedia: boolean;
  nomorSopTersedia: boolean;
  tanggalTersedia: boolean;
  kepalaSekolahTersedia: boolean;
  nipTersedia: boolean;
  dasarHukumTersedia: boolean;
  dasarHukumTerverifikasi: boolean;
  kualifikasiPelaksanaTersedia: boolean;
  keterkaitanTersedia: boolean;
  peralatanTersedia: boolean;
  peringatanTersedia: boolean;
  pencatatanTersedia: boolean;
  alurProsedurJelas: boolean;
  semuaLangkahMemilikiPelaksana: boolean;
  semuaLangkahMemilikiOutput: boolean;
  waktuTersedia: boolean;
  dokumenPendukungTersedia: boolean;
  tidakAdaLangkahAmbigu: boolean;
  tidakAdaPengulangan: boolean;
  skorAdministratif: number;
  catatanPerbaikan: string[];
}

export interface RevisionRecord {
  version: string;
  tanggal: string;
  diubahOleh: string;
  peran: string;
  bagianDiubah: string;
  alasanRevisi: string;
  snapshotSop?: Partial<SopDocument>;
}

export interface SopDocument {
  id: string;
  kategori: string;
  kategoriCode?: string;
  identitas: {
    namaSop: string;
    nomorSop: string;
    tanggalPembuatan: string;
    tanggalRevisi: string;
    tanggalPengesahan: string;
    disahkanOleh: string;
    namaKepalaSekolah: string;
    nip: string;
    unitKerja: string;
  };
  dasarHukum: DasarHukumItem[];
  kualifikasiPelaksana: string[];
  keterkaitan: string[];
  peralatanPerlengkapan: string[];
  peringatan: string[];
  pencatatanPendataan: PencatatanPendataan;
  pelaksanaList: string[]; // List of dynamic roles for columns
  tabelPelaksanaMutuBaku: PelaksanaMutuBakuStep[];
  checklistKelengkapan: ChecklistKelengkapan;
  status: SopStatus;
  versi: string;
  riwayatRevisi: RevisionRecord[];
  tanggalReviewBerikutnya: string;
  penanggungJawab: string;
  tandaTanganDisahkan?: ApprovalSignature;
  createdAt: string;
  updatedAt: string;
}

export interface SopSuggestedItem {
  title: string;
  priority: "Tinggi" | "Sedang" | "Rendah";
  objective: string;
}

export interface SopCategory {
  code: string;
  name: string;
  iconName: string;
  description: string;
  categoryName?: string;
  suggestedSops?: SopSuggestedItem[];
}

export type OfficialRegulation = DasarHukumItem;
export type CompletenessChecklist = ChecklistKelengkapan;

export interface ApprovalSignature {
  tipe: "manual" | "gambar" | "digital" | "upload";
  tandaTanganUrl?: string;
  barcodeUrl?: string;
  tanggal?: string;
  tanggalPengesahan?: string;
  namaKepalaSekolah?: string;
  oleh?: string;
  nip?: string;
  jabatan?: string;
  catatanPengesahan?: string;
  catatan?: string;
}

export interface SopNeedsAnalysisInput {
  fokusPrioritas?: string;
  catatanKhusus?: string;
  jumlahSiswa?: number;
  jumlahRombel?: number;
  jumlahGuruPns?: number;
  jumlahGuruPppk?: number;
  jumlahGuruHonorer?: number;
  jumlahTendik?: number;
  jumlahSatpamPenjaga?: number;
  fasilitasUks?: boolean;
  fasilitasKantin?: boolean;
  fasilitasPerpustakaan?: boolean;
  fasilitasLabKomputer?: boolean;
  kondisiSanitasi?: string;
  programUnggulan?: string;
  kegiatanRutin?: string;
  ekstrakurikuler?: string;
  kondisiKhusus?: string;
  masalahSeringTerjadi?: string;
  risikoDicegah?: string;
}

export interface SopRecommendationItem {
  id: string;
  categoryCode: string;
  categoryName?: string;
  namaSop?: string;
  title?: string;
  tujuan?: string;
  objective?: string;
  alasanDiperlukan?: string;
  reason?: string;
  risikoJikaTidakAda?: string;
  riskIfNotAvailable?: string;
  prioritas?: "Tinggi" | "Sedang" | "Rendah";
  priority?: "Tinggi" | "Sedang" | "Rendah";
  pihakTerlibat?: string[];
  partiesInvolved?: string[];
  primaryLegalBasis?: string;
  status?: "Belum Ada" | "Draft" | "Sudah Ada" | "Perlu Revisi";
  rekomendasiTindakan?: string;
}

export interface GeneratedFormDoc {
  namaFormulir: string;
  fields: Array<{
    label: string;
    type?: string;
    wajib?: boolean;
    placeholder?: string;
  }>;
  tabel?: {
    judul: string;
    kolom: string[];
  };
}

export interface GeneratedChecklistDoc {
  judulChecklist: string;
  sasaranUnit: string;
  items: Array<{
    no: number;
    uraianLangkah: string;
    pelaksana: string;
  }>;
}

export interface RecommendedSop {
  id: string;
  categoryCode: string;
  namaSop: string;
  tujuan: string;
  alasanDiperlukan: string;
  risikoJikaTidakAda: string;
  prioritas: "Tinggi" | "Sedang" | "Rendah";
  pihakTerlibat: string[];
  status: "Belum Ada" | "Draft" | "Sudah Ada" | "Perlu Revisi";
}

export interface GeneratedFormDraft {
  judul: string;
  kodeFormulir: string;
  keterangan: string;
  fields: Array<{
    label: string;
    type: "text" | "textarea" | "date" | "number";
    placeholder?: string;
  }>;
  tandaTangan: {
    kiri: string;
    kanan: string;
  };
}

export interface GeneratedChecklistDraft {
  judulChecklist: string;
  petunjuk: string;
  items: Array<{
    no: number;
    indikator: string;
    buktiFisik: string;
    penanggungJawab: string;
  }>;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}
