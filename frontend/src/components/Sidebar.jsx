import React from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Mic,
  Volume2,
  Activity,
  Info,
  Sparkles,
  Waves,
  X,
  ExternalLink,
  Radio
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  isHealthy,
  mobileOpen,
  setMobileOpen
}) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutGrid,
      badge: null
    },
    {
      id: "stt",
      label: "Speech-to-Text",
      icon: Mic,
      badge: "Prisma v3"
    },
    {
      id: "tts",
      label: "Text-to-Speech",
      icon: Volume2,
      badge: "Timbre v3"
    },
    {
      id: "status",
      label: "API Status",
      icon: Activity,
      badge: null
    },
    {
      id: "about",
      label: "About VoxAI",
      icon: Info,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#080517]/95 backdrop-blur-2xl border-r border-purple-500/20 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-purple-500/15 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 p-[1px] shadow-glow-sm flex items-center justify-center">
              <div className="w-full h-full bg-[#0E0824] rounded-[11px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-purple-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Vox</span>
                <span className="font-extrabold text-xl bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">AI</span>
              </div>
              <p className="text-[10px] font-semibold text-purple-300/80 tracking-wider uppercase">Speech Intelligence</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] lg:hidden transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-purple-300/60 uppercase">
            Platform Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`relative w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-purple-200/70 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-violet-600/20 to-transparent border-l-2 border-purple-400 rounded-xl shadow-glow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="flex items-center space-x-3 z-10">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-500/20 text-purple-300 shadow-glow-sm"
                      : "text-purple-300/60 group-hover:text-purple-200"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`z-10 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isActive
                        ? "bg-purple-500/25 text-purple-200 border border-purple-400/40"
                        : "bg-white/[0.04] text-purple-300/60 border border-white/[0.06]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Backend Connectivity Status Box */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-[#180F33]/80 to-[#100824]/90 border border-purple-500/20 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-purple-600/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-amber-400 animate-pulse shadow-[0_0_8px_#F59E0B]"}`} />
              <span>FastAPI Engine</span>
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isHealthy ? "text-emerald-300 bg-emerald-500/15 border border-emerald-500/30" : "text-amber-300 bg-amber-500/15 border border-amber-500/30"}`}>
              {isHealthy ? "Live" : "Checking"}
            </span>
          </div>

          <p className="text-[11px] text-purple-200/70 leading-relaxed mb-3">
            FastAPI speech service at <code className="text-purple-300 font-mono">127.0.0.1:8000</code>.
          </p>

          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 w-full py-1.5 text-xs font-semibold text-purple-200 hover:text-white bg-purple-600/20 hover:bg-purple-600/30 rounded-xl transition-all border border-purple-500/30"
          >
            <span>Swagger API Docs</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>
      </aside>
    </>
  );
}
