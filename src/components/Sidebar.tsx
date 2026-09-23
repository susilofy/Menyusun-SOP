import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  ClipboardList,
  Layers,
  Scale,
  Archive,
  Settings,
  MessageSquare,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
} from "lucide-react";
import { UserRole, SchoolProfile } from "../types";

export type NavTab =
  | "dashboard"
  | "profil"
  | "daftar-sop"
  | "buat-ai"
  | "analisis-kebutuhan"
  | "revisi"
  | "pemeriksaan"
  | "disahkan"
  | "template"
  | "regulasi"
  | "arsip"
  | "pengaturan";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  role: UserRole;
  onChangeRole: (role: UserRole) => void;
  schoolProfile: SchoolProfile;
  totalSops: number;
  openChat: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  role,
  onChangeRole,
  schoolProfile,
  totalSops,
  openChat,
  isCollapsed: propIsCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const menuItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "profil", label: "Profil Satuan Pendidikan", icon: <Building2 size={18} /> },
    { id: "daftar-sop", label: "Daftar SOP", icon: <FileText size={18} />, badge: totalSops },
    { id: "buat-ai", label: "Asisten AI Menyusun SOP", icon: <Sparkles size={18} />, badge: "AI" },
    { id: "analisis-kebutuhan", label: "Analisis Kebutuhan", icon: <ClipboardList size={18} /> },
    { id: "template", label: "Template SOP", icon: <Layers size={18} /> },
    { id: "regulasi", label: "Regulasi & Dasar Hukum", icon: <Scale size={18} /> },
    { id: "arsip", label: "Arsip & Review", icon: <Archive size={18} /> },
    { id: "pengaturan", label: "Pengaturan", icon: <Settings size={18} /> },
  ];

  return (
    <aside
      id="app-sidebar"
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } bg-slate-900 text-slate-200 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none transition-all duration-300 ease-in-out relative`}
    >
      {/* Brand & School Logo */}
      {!isCollapsed ? (
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-900/30 shrink-0">
              <Shield size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                Buat SOP
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleCollapse}
            title="Tutup Sidebar (Persempit Tampilan)"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 shrink-0"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
      ) : (
        <div className="p-3 border-b border-slate-800 flex flex-col items-center justify-center space-y-2">
          <div
            className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-900/30 cursor-pointer"
            onClick={toggleCollapse}
            title="Buka Sidebar (Buat SOP)"
          >
            <Shield size={22} />
          </div>
          <button
            type="button"
            onClick={toggleCollapse}
            title="Buka Sidebar (Perluas Tampilan)"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      )}

      {/* School Badge / Quick Profile Access */}
      {!isCollapsed ? (
        <div
          onClick={() => onSelectTab("profil")}
          className={`mx-2 mt-2.5 mb-1 p-2.5 rounded-xl border cursor-pointer transition-all ${
            currentTab === "profil"
              ? "bg-indigo-950/60 border-indigo-500/60 ring-1 ring-indigo-500/30"
              : "bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 hover:border-indigo-500/50"
          } group`}
          title="Buka Menu Profil Satuan Pendidikan"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                currentTab === "profil"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white"
              }`}
            >
              <Building2 size={13} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-white">
                {schoolProfile.namaSekolah}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                NPSN: {schoolProfile.npsn || "-"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => onSelectTab("profil")}
          className={`mx-auto mt-2 p-2 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
            currentTab === "profil"
              ? "bg-indigo-600 text-white"
              : "bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-indigo-400"
          }`}
          title={`Profil Satuan Pendidikan: ${schoolProfile.namaSekolah}`}
        >
          <Building2 size={16} />
        </div>
      )}

      {/* Nav List */}
      <nav className={`flex-1 overflow-y-auto py-3 ${isCollapsed ? "px-1.5 space-y-1.5" : "px-2 space-y-1"}`}>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
              } rounded-md text-xs font-medium transition-colors relative ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-2.5 truncate"}`}>
                <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badge === "AI"
                      ? "bg-indigo-900/60 text-indigo-300 border border-indigo-700"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Chat Trigger */}
      <div className={`${isCollapsed ? "p-2" : "p-3"} border-t border-slate-800 bg-slate-950/40`}>
        {!isCollapsed ? (
          <button
            onClick={openChat}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold py-2.5 px-3 rounded-lg shadow-md transition-all active:scale-[0.99]"
          >
            <MessageSquare size={16} />
            <span>Tanyakan AI SOP</span>
          </button>
        ) : (
          <button
            onClick={openChat}
            title="Tanyakan AI SOP (Format Baku Kepmenpan RB)"
            className="w-full h-10 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg shadow-md transition-all active:scale-[0.95]"
          >
            <MessageSquare size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};
