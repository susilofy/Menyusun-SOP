import React, { useState, useEffect } from "react";
import { Sidebar, NavTab } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { SopListView } from "./components/SopListView";
import { SopEditorView } from "./components/SopEditorView";
import { SopPrintPreview } from "./components/SopPrintPreview";
import { SchoolProfileModal } from "./components/SchoolProfileModal";
import { SchoolProfileView } from "./components/SchoolProfileView";
import { AiWizardView } from "./components/AiWizardView";
import { AiNeedsAnalysisView } from "./components/AiNeedsAnalysisView";
import { ChecklistInspectionView } from "./components/ChecklistInspectionView";
import { ApprovalSection } from "./components/ApprovalSection";
import { FormGeneratorModal } from "./components/FormGeneratorModal";
import { ChecklistGeneratorModal } from "./components/ChecklistGeneratorModal";
import { AiChatDrawer } from "./components/AiChatDrawer";
import { RegulationsView } from "./components/RegulationsView";
import { TemplatesView } from "./components/TemplatesView";
import { ArchiveAndReviewView } from "./components/ArchiveAndReviewView";
import { SettingsView } from "./components/SettingsView";
import { SopDocument, SchoolProfile, UserRole } from "./types";
import { DEFAULT_SCHOOL_PROFILE, SAMPLE_SOPS } from "./data/initialData";
import { Star, CheckCircle2, X } from "lucide-react";

const STORAGE_KEY_PROFILE = "SOP_SMART_SCHOOL_PROFILE_V1";
const STORAGE_KEY_SOPS = "SOP_SMART_SCHOOL_SOPS_V1";
const STORAGE_KEY_ROLE = "SOP_SMART_SCHOOL_ROLE_V1";
const STORAGE_KEY_CUSTOM_DEFAULT_PROFILE = "SOP_SMART_SCHOOL_CUSTOM_DEFAULT_PROFILE_V1";
const STORAGE_KEY_CUSTOM_DEFAULT_SOPS = "SOP_SMART_SCHOOL_CUSTOM_DEFAULT_SOPS_V1";
const STORAGE_KEY_CUSTOM_DEFAULT_META = "SOP_SMART_SCHOOL_CUSTOM_DEFAULT_META_V1";

export default function App() {
  // 1. School Profile State with LocalStorage & Custom Default persistence
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.namaSekolah && parsed.namaSekolah !== "SD Negeri 4 Pendem" && parsed.namaSekolah !== "SD Negeri 3 Yehembang Kauh") {
          if (parsed.alamat === "Jalan Krakatau" || parsed.alamat === "Jalan Krakatau, Loloan Timur, Kecamatan Jembrana") {
            parsed.alamat = "Jalan Krakatau, Loloan Timur, Kec Jembrana";
          }
          if (parsed.kabupatenKota === "Kabupaten Jembrana") {
            parsed.kabupatenKota = "Kab. Jembrana";
          }
          if (parsed.namaKepalaSekolah === "Susilo Fitri Yatmoko, M.Pd") {
            parsed.namaKepalaSekolah = "Susilo Fitri Yatmoko, M.Pd.";
          }
          return parsed;
        }
      }
      const savedDef = localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_PROFILE);
      if (savedDef) {
        const parsedDef = JSON.parse(savedDef);
        if (parsedDef && parsedDef.namaSekolah && parsedDef.namaSekolah !== "SD Negeri 4 Pendem" && parsedDef.namaSekolah !== "SD Negeri 3 Yehembang Kauh") {
          if (parsedDef.alamat === "Jalan Krakatau" || parsedDef.alamat === "Jalan Krakatau, Loloan Timur, Kecamatan Jembrana") {
            parsedDef.alamat = "Jalan Krakatau, Loloan Timur, Kec Jembrana";
          }
          if (parsedDef.kabupatenKota === "Kabupaten Jembrana") {
            parsedDef.kabupatenKota = "Kab. Jembrana";
          }
          if (parsedDef.namaKepalaSekolah === "Susilo Fitri Yatmoko, M.Pd") {
            parsedDef.namaKepalaSekolah = "Susilo Fitri Yatmoko, M.Pd.";
          }
          return parsedDef;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SCHOOL_PROFILE;
  });

  // 2. SOP Documents State with LocalStorage persistence
  const [sops, setSops] = useState<SopDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((s: SopDocument) => {
            if (s.identitas?.namaKepalaSekolah === "Susilo Fitri Yatmoko, M.Pd") {
              return {
                ...s,
                identitas: { ...s.identitas, namaKepalaSekolah: "Susilo Fitri Yatmoko, M.Pd." },
                penanggungJawab: s.penanggungJawab === "Susilo Fitri Yatmoko, M.Pd" ? "Susilo Fitri Yatmoko, M.Pd." : s.penanggungJawab,
              };
            }
            return s;
          });
        }
      }
      const savedDef = localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_SOPS);
      if (savedDef) {
        const parsedDef = JSON.parse(savedDef);
        if (Array.isArray(parsedDef)) {
          return parsedDef.map((s: SopDocument) => {
            if (s.identitas?.namaKepalaSekolah === "Susilo Fitri Yatmoko, M.Pd") {
              return {
                ...s,
                identitas: { ...s.identitas, namaKepalaSekolah: "Susilo Fitri Yatmoko, M.Pd." },
                penanggungJawab: s.penanggungJawab === "Susilo Fitri Yatmoko, M.Pd" ? "Susilo Fitri Yatmoko, M.Pd." : s.penanggungJawab,
              };
            }
            return s;
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_SOPS;
  });

  // 3. User Role State (Kepala Sekolah, Editor, Viewer)
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      if (saved) return saved as UserRole;
    } catch (e) {
      console.error(e);
    }
    return "KEPALA_SEKOLAH";
  });

  // Custom Default Metadata State
  const [customDefaultMeta, setCustomDefaultMeta] = useState<{
    savedAt?: string;
    totalSops?: number;
    namaSekolah?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_META);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Floating Toast Notification
  const [systemToast, setSystemToast] = useState<{
    type: "success" | "info";
    title: string;
    message: string;
  } | null>(null);

  // Sync state to LocalStorage and ensure current input is permanently the system default
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(schoolProfile));
      localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_PROFILE, JSON.stringify(schoolProfile));
    } catch (e) {
      console.error(e);
    }
  }, [schoolProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOPS, JSON.stringify(sops));
      localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_SOPS, JSON.stringify(sops));
      const meta = {
        savedAt: new Date().toISOString(),
        totalSops: sops.length,
        namaSekolah: schoolProfile.namaSekolah,
      };
      localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_META, JSON.stringify(meta));
      setCustomDefaultMeta(meta);
    } catch (e) {
      console.error(e);
    }
  }, [sops, schoolProfile.namaSekolah]);

  // Continuously persist current inputted data to server as permanent default data
  useEffect(() => {
    if (schoolProfile && schoolProfile.namaSekolah) {
      const timer = setTimeout(() => {
        fetch("/api/default-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolProfile,
            sops,
          }),
        }).catch((err) => console.warn("Auto-persist default data error", err));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [schoolProfile, sops]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch (e) {
      console.error(e);
    }
  }, [role]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [sopListFilter, setSopListFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Currently focused SOP for Editor, Preview, Checklist, Approval, Form, or Checklist Generation
  const [activeSop, setActiveSop] = useState<SopDocument | null>(null);
  const [viewMode, setViewMode] = useState<"standard" | "editor" | "preview" | "checklist-audit">("standard");

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [aiWizardPreload, setAiWizardPreload] = useState<{ title: string; category: string } | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isFormGenOpen, setIsFormGenOpen] = useState(false);
  const [isChecklistGenOpen, setIsChecklistGenOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // SOP CRUD Handlers
  const handleSaveSop = (updatedSop: SopDocument) => {
    setSops((prev) => {
      const idx = prev.findIndex((s) => s.id === updatedSop.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedSop;
        return copy;
      }
      return [updatedSop, ...prev];
    });
    setActiveSop(updatedSop);
  };

  const handleDeleteSop = (sopId: string) => {
    setSops((prev) => prev.filter((s) => s.id !== sopId));
    if (activeSop?.id === sopId) {
      setActiveSop(null);
      setViewMode("standard");
    }
  };

  const handleSopGeneratedByAi = (newSop: SopDocument) => {
    handleSaveSop(newSop);
    setActiveSop(newSop);
    setViewMode("editor");
  };

  const handleUseTemplate = (templateSop: SopDocument) => {
    handleSaveSop(templateSop);
    setActiveSop(templateSop);
    setViewMode("editor");
  };

  const handleDraftWithAiFromNeeds = (sopTitle: string, category: string) => {
    setAiWizardPreload({ title: sopTitle, category });
    setCurrentTab("buat-ai");
    setViewMode("standard");
  };

  // Quick navigation helpers
  const handleOpenEditor = (sop: SopDocument) => {
    setActiveSop(sop);
    setViewMode("editor");
  };

  const handleOpenPreview = (sop: SopDocument) => {
    setActiveSop(sop);
    setViewMode("preview");
  };

  const handleOpenChecklistAudit = (sop: SopDocument) => {
    setActiveSop(sop);
    setViewMode("checklist-audit");
  };

  const handleRestoreData = (newSops: SopDocument[], newProfile?: SchoolProfile) => {
    setSops(newSops);
    if (newProfile) setSchoolProfile(newProfile);
    setActiveSop(null);
    setViewMode("standard");
  };

  // 4. Save current active data as the SYSTEM DEFAULT
  const handleSaveCurrentAsDefault = async (customProfile?: SchoolProfile, customSops?: SopDocument[]) => {
    const profileToSave = customProfile || schoolProfile;
    const sopsToSave = customSops || sops;
    const meta = {
      savedAt: new Date().toISOString(),
      totalSops: sopsToSave.length,
      namaSekolah: profileToSave.namaSekolah,
    };

    // Save to LocalStorage custom default
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_PROFILE, JSON.stringify(profileToSave));
      localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_SOPS, JSON.stringify(sopsToSave));
      localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_META, JSON.stringify(meta));
      setCustomDefaultMeta(meta);
    } catch (e) {
      console.error("Local default save error", e);
    }

    // Persist to server /api/default-data
    try {
      await fetch("/api/default-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolProfile: profileToSave,
          sops: sopsToSave,
        }),
      });
    } catch (err) {
      console.warn("Server default save error", err);
    }

    setSystemToast({
      type: "success",
      title: "Data Default Berhasil Ditetapkan!",
      message: `${profileToSave.namaSekolah} (${sopsToSave.length} SOP) resmi dijadikan acuan default sistem.`,
    });
    setTimeout(() => setSystemToast(null), 5000);
  };

  // 5. Restore back to the Saved Custom Default
  const handleRestoreCustomDefault = () => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_PROFILE);
      const savedSops = localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_SOPS);
      if (savedProfile && savedSops) {
        const p = JSON.parse(savedProfile) as SchoolProfile;
        const s = JSON.parse(savedSops) as SopDocument[];
        setSchoolProfile(p);
        setSops(s);
        setActiveSop(null);
        setViewMode("standard");
        setSystemToast({
          type: "info",
          title: "Data Default Dimuat!",
          message: `Berhasil memuat acuan data default ${p.namaSekolah} (${s.length} SOP).`,
        });
        setTimeout(() => setSystemToast(null), 4000);
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setSchoolProfile(DEFAULT_SCHOOL_PROFILE);
    setSops(SAMPLE_SOPS);
  };

  // 6. Handle Clear All SOPs ("KOSONGKAN DAFTAR SOP YANG SUDAH DIBUAT")
  const handleClearAllSops = async () => {
    setSops([]);
    setActiveSop(null);
    setViewMode("standard");
    localStorage.setItem("SOP_USER_CLEARED_V2", "true");
    localStorage.setItem(STORAGE_KEY_SOPS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_SOPS, JSON.stringify([]));

    try {
      await fetch("/api/default-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolProfile,
          sops: [],
        }),
      });
      const meta = {
        savedAt: new Date().toISOString(),
        totalSops: 0,
        namaSekolah: schoolProfile.namaSekolah,
      };
      localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_META, JSON.stringify(meta));
      setCustomDefaultMeta(meta);
    } catch (err) {
      console.warn("Error syncing empty sops to server", err);
    }

    setSystemToast({
      type: "info",
      title: "Daftar SOP Dikosongkan!",
      message: "Seluruh daftar SOP yang sudah dibuat berhasil dikosongkan.",
    });
    setTimeout(() => setSystemToast(null), 4000);
  };

  // 7. Handle School Profile Save
  const handleSaveSchoolProfile = (updated: SchoolProfile, setAsDefaultFlag?: boolean) => {
    setSchoolProfile(updated);
    if (setAsDefaultFlag) {
      handleSaveCurrentAsDefault(updated, sops);
    }
    setSystemToast({
      type: "success",
      title: "Profil Satuan Pendidikan Diperbarui",
      message: `Profil ${updated.namaSekolah} berhasil disimpan dan disinkronkan ke seluruh dokumen SOP.`,
    });
    setTimeout(() => setSystemToast(null), 4000);
  };

  // 7. On app load: ensure server default data is synced or initialize current state as default
  useEffect(() => {
    fetch("/api/default-data")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data && res.data.schoolProfile) {
          const { schoolProfile: srvProfile, sops: srvSops, savedAt } = res.data;
          const meta = {
            savedAt: savedAt || new Date().toISOString(),
            totalSops: srvSops?.length || 0,
            namaSekolah: srvProfile?.namaSekolah || "",
          };
          localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_PROFILE, JSON.stringify(srvProfile));
          localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_SOPS, JSON.stringify(srvSops || []));
          localStorage.setItem(STORAGE_KEY_CUSTOM_DEFAULT_META, JSON.stringify(meta));
          setCustomDefaultMeta(meta);

          // Synchronize profile if currently on old placeholder or missing logos
          setSchoolProfile((prev) => {
            if (!prev || !prev.namaSekolah || prev.namaSekolah === "SD Negeri 4 Pendem" || prev.namaSekolah === "SD Negeri 3 Yehembang Kauh") {
              return srvProfile;
            }
            if (srvProfile) {
              return {
                ...prev,
                ...srvProfile,
                logoSekolahUrl: prev.logoSekolahUrl || srvProfile.logoSekolahUrl,
                logoPemdaUrl: prev.logoPemdaUrl || srvProfile.logoPemdaUrl,
                formatNomorSop: srvProfile.formatNomorSop || prev.formatNomorSop,
              };
            }
            return prev;
          });

          // If current sops is empty, populate with default sops
          setSops((prev) => {
            if (!prev || prev.length === 0) {
              return srvSops || [];
            }
            return prev;
          });
        } else {
          // If server file not created yet, automatically establish current data as default
          handleSaveCurrentAsDefault(schoolProfile, sops);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch server default data", err);
        if (!localStorage.getItem(STORAGE_KEY_CUSTOM_DEFAULT_META)) {
          handleSaveCurrentAsDefault(schoolProfile, sops);
        }
      });
  }, []);

  const totalNeedsReview = sops.filter((s) => s.status === "PERLU_DITINJAU" || s.status === "REVISI").length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* 1. Left Sidebar Navigation (hidden when printing) */}
      <div className="no-print h-full">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === "daftar-sop") {
              setSopListFilter("ALL");
            }
            setCurrentTab(tab);
            setViewMode("standard");
          }}
          role={role}
          onChangeRole={setRole}
          schoolProfile={schoolProfile}
          totalSops={sops.length}
          openChat={() => setIsChatOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <div className="no-print">
          <Header
            schoolProfile={schoolProfile}
            role={role}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenCreateWizard={() => {
              setCurrentTab("buat-ai");
              setViewMode("standard");
            }}
            onOpenNeedsAnalysis={() => {
              setCurrentTab("analisis-kebutuhan");
              setViewMode("standard");
            }}
            totalNeedsReview={totalNeedsReview}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
            onSaveCurrentAsDefault={() => handleSaveCurrentAsDefault()}
            hasCustomDefault={!!customDefaultMeta}
            onOpenProfile={() => {
              setCurrentTab("profil");
              setViewMode("standard");
            }}
          />
        </div>

        {/* View Router */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Specific Active Mode Views (Editor / Print Preview / Checklist Audit) */}
          {viewMode === "preview" && activeSop ? (
            <SopPrintPreview
              sop={activeSop}
              schoolProfile={schoolProfile}
              onBack={() => setViewMode("standard")}
              onEdit={() => setViewMode("editor")}
              onGenerateForm={() => setIsFormGenOpen(true)}
              onGenerateChecklist={() => setIsChecklistGenOpen(true)}
            />
          ) : viewMode === "editor" && activeSop ? (
            <SopEditorView
              sop={activeSop}
              schoolProfile={schoolProfile}
              role={role}
              onSave={handleSaveSop}
              onDeleteSop={handleDeleteSop}
              onBack={() => setViewMode("standard")}
              onPreview={(sop) => {
                setActiveSop(sop);
                setViewMode("preview");
              }}
              onOpenChecklist={(sop) => {
                setActiveSop(sop);
                setViewMode("checklist-audit");
              }}
              onOpenApproval={(sop) => {
                setActiveSop(sop);
                setIsApprovalModalOpen(true);
              }}
            />
          ) : viewMode === "checklist-audit" && activeSop ? (
            <ChecklistInspectionView
              sop={activeSop}
              schoolProfile={schoolProfile}
              onBack={() => setViewMode("standard")}
              onFixWithAi={() => {
                setViewMode("editor");
              }}
              onOpenPreview={() => setViewMode("preview")}
            />
          ) : (
            /* Standard NavTab Views */
            <>
              {currentTab === "dashboard" && (
                <DashboardView
                  sops={sops}
                  schoolProfile={schoolProfile}
                  onOpenCreateWizard={() => {
                    setCurrentTab("buat-ai");
                    setViewMode("standard");
                  }}
                  onOpenNeedsAnalysis={() => setCurrentTab("analisis-kebutuhan")}
                  onSelectSop={handleOpenPreview}
                  onPreviewSop={handleOpenPreview}
                  onEditSop={handleOpenEditor}
                  onGoToTab={(tab) => setCurrentTab(tab)}
                  onOpenProfile={() => {
                    setCurrentTab("profil");
                    setViewMode("standard");
                  }}
                />
              )}

              {currentTab === "profil" && (
                <SchoolProfileView
                  profile={schoolProfile}
                  onSave={handleSaveSchoolProfile}
                  onGoToTab={(tab) => setCurrentTab(tab)}
                />
              )}

              {currentTab === "daftar-sop" && (
                <SopListView
                  sops={sops}
                  schoolProfile={schoolProfile}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onPreviewSop={handleOpenPreview}
                  onEditSop={handleOpenEditor}
                  onDeleteSop={handleDeleteSop}
                  onOpenCreateWizard={() => {
                    setCurrentTab("buat-ai");
                    setViewMode("standard");
                  }}
                  onOpenChecklist={handleOpenChecklistAudit}
                  onClearAllSops={handleClearAllSops}
                  onOpenNeedsAnalysis={() => setCurrentTab("analisis-kebutuhan")}
                />
              )}

              {currentTab === "buat-ai" && (
                <AiWizardView
                  schoolProfile={schoolProfile}
                  initialTitle={aiWizardPreload?.title || ""}
                  initialCategory={aiWizardPreload?.category || "ALL"}
                  onSopGenerated={(newSop) => {
                    handleSaveSop(newSop);
                    setActiveSop(newSop);
                    setViewMode("editor");
                    setAiWizardPreload(null);
                  }}
                  onCancel={() => {
                    setCurrentTab("dashboard");
                    setViewMode("standard");
                    setAiWizardPreload(null);
                  }}
                />
              )}

              {currentTab === "analisis-kebutuhan" && (
                <AiNeedsAnalysisView
                  schoolProfile={schoolProfile}
                  onDraftWithAi={handleDraftWithAiFromNeeds}
                />
              )}

              {currentTab === "revisi" && (
                <SopListView
                  sops={sops.filter((s) => s.status === "DRAFT" || s.status === "REVIEW" || s.status === "REVISI")}
                  schoolProfile={schoolProfile}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onPreviewSop={handleOpenPreview}
                  onEditSop={handleOpenEditor}
                  onDeleteSop={handleDeleteSop}
                  onOpenCreateWizard={() => {
                    setCurrentTab("buat-ai");
                    setViewMode("standard");
                  }}
                  onOpenChecklist={handleOpenChecklistAudit}
                />
              )}

              {currentTab === "pemeriksaan" && (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                    <h2 className="text-base font-bold text-slate-900">
                      Pemeriksaan Kelayakan 19 Indikator Administratif SOP
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pilih dokumen di bawah untuk menguji kelayakan administratif sebelum disahkan oleh Kepala Sekolah.
                    </p>
                  </div>
                  <SopListView
                    sops={sops}
                    schoolProfile={schoolProfile}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onPreviewSop={handleOpenChecklistAudit}
                    onEditSop={handleOpenEditor}
                    onDeleteSop={handleDeleteSop}
                    onOpenCreateWizard={() => {
                      setCurrentTab("buat-ai");
                      setViewMode("standard");
                    }}
                    onOpenChecklist={handleOpenChecklistAudit}
                  />
                </div>
              )}

              {currentTab === "disahkan" && (
                <SopListView
                  sops={sops.filter((s) => s.status === "DISAHKAN" || s.status === "AKTIF")}
                  schoolProfile={schoolProfile}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onPreviewSop={handleOpenPreview}
                  onEditSop={handleOpenEditor}
                  onDeleteSop={handleDeleteSop}
                  onOpenCreateWizard={() => {
                    setCurrentTab("buat-ai");
                    setViewMode("standard");
                  }}
                  onOpenChecklist={handleOpenChecklistAudit}
                />
              )}

              {currentTab === "template" && (
                <TemplatesView
                  schoolProfile={schoolProfile}
                  onUseTemplate={handleUseTemplate}
                />
              )}

              {currentTab === "regulasi" && <RegulationsView />}

              {currentTab === "arsip" && (
                <ArchiveAndReviewView
                  sops={sops}
                  schoolProfile={schoolProfile}
                  onPreviewSop={handleOpenPreview}
                  onEditSop={handleOpenEditor}
                />
              )}

              {currentTab === "pengaturan" && (
                <SettingsView
                  sops={sops}
                  schoolProfile={schoolProfile}
                  onRestoreData={handleRestoreData}
                  onOpenProfile={() => {
                    setCurrentTab("profil");
                    setViewMode("standard");
                  }}
                  onSaveCurrentAsDefault={() => handleSaveCurrentAsDefault()}
                  onRestoreCustomDefault={handleRestoreCustomDefault}
                  onClearAllSops={handleClearAllSops}
                  hasCustomDefault={!!customDefaultMeta}
                  customDefaultMetadata={customDefaultMeta}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. Global Modals & Drawers */}
      {/* Profil Sekolah Modal */}
      <SchoolProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={schoolProfile}
        onSave={handleSaveSchoolProfile}
      />

      {/* Approval & Signature Modal */}
      {activeSop && (
        <ApprovalSection
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          sop={activeSop}
          schoolProfile={schoolProfile}
          onApprove={handleSaveSop}
        />
      )}

      {/* Form Generator Modal */}
      {activeSop && (
        <FormGeneratorModal
          isOpen={isFormGenOpen}
          onClose={() => setIsFormGenOpen(false)}
          sop={activeSop}
          schoolProfile={schoolProfile}
        />
      )}

      {/* Checklist Generator Modal */}
      {activeSop && (
        <ChecklistGeneratorModal
          isOpen={isChecklistGenOpen}
          onClose={() => setIsChecklistGenOpen(false)}
          sop={activeSop}
          schoolProfile={schoolProfile}
        />
      )}

      {/* AI Chat Drawer */}
      <AiChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        schoolProfile={schoolProfile}
        sops={sops}
        onDraftSop={(title, cat) => {
          setIsChatOpen(false);
          setAiWizardPreload({ title, category: cat || "ALL" });
          setCurrentTab("buat-ai");
          setViewMode("standard");
        }}
      />

      {/* Floating System Toast */}
      {systemToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 flex items-start space-x-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
            <CheckCircle2 size={18} />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-slate-100">{systemToast.title}</h4>
            <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">{systemToast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setSystemToast(null)}
            className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
