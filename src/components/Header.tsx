import React from "react";
import { Search, Sparkles, Bell, Award, PanelLeftClose, PanelLeftOpen, Building2 } from "lucide-react";
import { SchoolProfile, UserRole } from "../types";

interface HeaderProps {
  schoolProfile: SchoolProfile;
  role: UserRole;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateWizard: () => void;
  onOpenNeedsAnalysis: () => void;
  totalNeedsReview: number;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onSaveCurrentAsDefault?: () => void;
  hasCustomDefault?: boolean;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  schoolProfile,
  role,
  searchQuery,
  onSearchChange,
  onOpenCreateWizard,
  onOpenNeedsAnalysis,
  totalNeedsReview,
  onToggleSidebar,
  isSidebarCollapsed = false,
  onSaveCurrentAsDefault,
  hasCustomDefault = false,
  onOpenProfile,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
      <div className="flex items-center space-x-3">
        {/* Toggle Sidebar Button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Buka Menu Sidebar" : "Tutup Menu Sidebar"}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}

        {/* Search Input */}
        <div className="relative w-56 sm:w-72 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari SOP (nama, nomor, kategori, pelaksana)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {totalNeedsReview > 0 && (
          <div className="flex items-center space-x-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg text-xs font-medium">
            <Bell size={13} className="text-amber-600 animate-pulse" />
            <span className="hidden sm:inline">{totalNeedsReview} Perlu Ditinjau</span>
            <span className="sm:hidden">{totalNeedsReview}</span>
          </div>
        )}

        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            title={`Profil Satuan Pendidikan: ${schoolProfile.namaSekolah} (Klik untuk buka & edit)`}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200 hover:border-indigo-300 cursor-pointer"
          >
            <Building2 size={14} className="text-indigo-600" />
            <span className="hidden md:inline max-w-[130px] lg:max-w-[200px] truncate">
              {schoolProfile.namaSekolah}
            </span>
            <span className="md:hidden">Profil</span>
          </button>
        )}

        <button
          onClick={onOpenNeedsAnalysis}
          className="hidden sm:inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
        >
          <Award size={14} className="text-indigo-600" />
          <span>Analisis Kebutuhan</span>
        </button>

        <button
          onClick={onOpenCreateWizard}
          className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">Asisten AI Menyusun SOP</span>
          <span className="sm:hidden">Asisten AI</span>
        </button>
      </div>
    </header>
  );
};
