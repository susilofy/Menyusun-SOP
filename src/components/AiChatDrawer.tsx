import React, { useState } from "react";
import { X, Send, Sparkles, Bot, User, Loader2, ArrowRight, BookOpen } from "lucide-react";
import { SchoolProfile, SopDocument } from "../types";

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schoolProfile: SchoolProfile;
  sops: SopDocument[];
  onDraftSop: (title: string, category: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  schoolProfile,
  sops,
  onDraftSop,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Selamat datang, Bapak/Ibu Kepala Sekolah di **${schoolProfile.namaSekolah}**.\n\nSaya adalah Asisten AI Khusus Manajemen SOP Satuan Pendidikan SD. Saya siap membantu memeriksa regulasi resmi Kemendikdasmen, menganalisis SOP yang belum dimiliki, mengoreksi alur mutu baku, atau memberikan rekomendasi administrasi sekolah.\n\nAda yang dapat saya bantu diskusikan hari ini?`,
      timestamp: "Baru saja",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "Apa saja SOP yang wajib dimiliki SD kami tahun ini?",
    "Bagaimana dasar hukum terbaru untuk Pengelolaan Dana BOSP SD?",
    "Bagaimana penanganan bullying di SD sesuai Permendikbudristek 46/2023?",
    "Rekomendasikan SOP Sarpras untuk pemeliharaan gedung & TIK",
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          schoolProfile,
          existingSops: sops.map((s) => ({
            nama: s.identitas.namaSop,
            nomor: s.identitas.nomorSop,
            kategori: s.kategori,
            status: s.status,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memperoleh respon dari asisten AI.");
      }

      const data = await res.json();
      const botMsg: Message = {
        role: "assistant",
        content: data.reply || "Maaf, respon tidak dapat diformat.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Terjadi kendala teknis: ${err.message}`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-300 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Konsultan AI SOP Satuan Pendidikan</h3>
            <p className="text-[10px] text-slate-400">Dasar Regulasi Kepmenpan RB & Kemendikdasmen</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400">
              {m.role === "user" ? (
                <>
                  <span>Kepala Sekolah</span>
                  <User size={12} />
                </>
              ) : (
                <>
                  <Bot size={12} className="text-indigo-600" />
                  <span className="font-semibold text-slate-600">Asisten AI SOP</span>
                </>
              )}
              <span>• {m.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-xl max-w-[90%] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-indigo-600 text-white shadow-xs rounded-tr-none"
                  : "bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-none"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 p-3 rounded-lg w-max">
            <Loader2 size={15} className="animate-spin text-indigo-600" />
            <span>AI sedang memeriksa regulasi dan data sekolah...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-1.5 shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          Pertanyaan Cepat Kepala Sekolah:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="text-[11px] text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-md px-2 py-1 text-left transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan regulasi, alur SOP, atau mintalah saran..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors shrink-0 shadow-2xs"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
