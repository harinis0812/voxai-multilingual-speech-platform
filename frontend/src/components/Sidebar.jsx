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
  ExternalLink
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
      label: "About & Docs",
      icon: Info,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-900/90 backdrop-blur-xl border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-glow-sm flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[11px] flex items-center justify-center">
                <Waves className="w-5 h-5 text-lavender-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-white">Gnani</span>
                <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">Voice Intelligence</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Platform Services
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
                className={`relative w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-violet-600/10 to-transparent border-l-2 border-violet-500 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="flex items-center space-x-3 z-10">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-violet-400" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`z-10 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isActive
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-white/[0.04] text-slate-400 border border-white/[0.06]"
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
        <div className="p-4 m-4 rounded-xl bg-navy-850/80 border border-white/[0.06] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-violet-600/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-amber-400 animate-pulse"}`} />
              <span>Backend Core</span>
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isHealthy ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
              {isHealthy ? "Online" : "Connecting"}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            FastAPI microservice at <code className="text-violet-300">127.0.0.1:8000</code> with Prisma & Timbre models.
          </p>

          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 w-full py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors border border-white/[0.06]"
          >
            <span>Open Swagger UI</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        </div>
      </aside>
    </>
  );
}
