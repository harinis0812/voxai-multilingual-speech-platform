import React from "react";
import { Menu, Sparkles, Activity, ShieldCheck, ExternalLink } from "lucide-react";

export default function Header({ activeTab, setMobileOpen, isHealthy }) {
  const titles = {
    dashboard: {
      title: "Overview",
      subtitle: "Unified Speech-to-Text & Text-to-Speech Platform"
    },
    stt: {
      title: "Speech-to-Text",
      subtitle: "Powered by Gnani Prisma v3.0 Multilingual Recognition Engine"
    },
    tts: {
      title: "Text-to-Speech",
      subtitle: "Powered by Gnani Timbre v3.0 Neural Voice Synthesis"
    },
    status: {
      title: "API Status & Diagnostics",
      subtitle: "Real-time service health, latency benchmarks, and specifications"
    },
    about: {
      title: "About Gnani Voice AI",
      subtitle: "Internship Challenge Architecture & Documentation"
    }
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 h-20 bg-navy-950/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 lg:px-10">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>{current.title}</span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Real-time status pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-850 border border-white/[0.08]">
          <span className="relative flex h-2 w-2">
            {isHealthy && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy ? "bg-emerald-400" : "bg-amber-400"}`}></span>
          </span>
          <span className="text-xs font-medium text-slate-300">
            {isHealthy ? "Backend Core Online (Ready)" : "Checking Engine..."}
          </span>
        </div>

        {/* Model tags */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.06]">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-semibold text-slate-300">Prisma</span>
          <span className="text-slate-500">|</span>
          <span className="font-semibold text-slate-300">Timbre v3.0</span>
        </div>

        {/* API Docs link */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-300 bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 transition-colors"
        >
          <span>API Docs</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </a>
      </div>
    </header>
  );
}
