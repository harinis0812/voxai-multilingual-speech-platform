import React from "react";
import { Menu, Sparkles, Activity, ShieldCheck, ExternalLink } from "lucide-react";

export default function Header({ activeTab, setMobileOpen, isHealthy }) {
  const titles = {
    dashboard: {
      title: "VoxAI Overview",
      subtitle: "Multilingual Speech Recognition & Neural Voice Synthesis"
    },
    stt: {
      title: "Speech-to-Text Studio",
      subtitle: "Powered by Gnani Prisma v3.0 Multilingual Recognition Engine"
    },
    tts: {
      title: "Text-to-Speech Studio",
      subtitle: "Powered by Gnani Timbre v3.0 Neural Voice Synthesis"
    },
    status: {
      title: "API Status & Diagnostics",
      subtitle: "Real-time service health, latency benchmarks, and specifications"
    },
    about: {
      title: "About VoxAI",
      subtitle: "Internship Challenge Architecture & Documentation"
    }
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#050312]/85 backdrop-blur-2xl border-b border-purple-500/15 flex items-center justify-between px-6 lg:px-10">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 -ml-2 rounded-xl text-purple-300 hover:text-white hover:bg-white/[0.06] lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>{current.title}</span>
          </h1>
          <p className="text-xs text-purple-200/70 hidden sm:block mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Real-time status pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#110A29]/90 border border-purple-500/25 shadow-sm">
          <span className="relative flex h-2 w-2">
            {isHealthy && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-amber-400 shadow-[0_0_8px_#F59E0B]"}`}></span>
          </span>
          <span className="text-xs font-semibold text-purple-100">
            {isHealthy ? "Backend Core Online" : "Checking Engine..."}
          </span>
        </div>

        {/* Model tags */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-purple-200/80 bg-white/[0.04] px-3.5 py-1.5 rounded-xl border border-purple-500/20">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold text-purple-100">Prisma</span>
          <span className="text-purple-400/50">•</span>
          <span className="font-semibold text-purple-100">Timbre v3.0</span>
        </div>

        {/* API Docs link */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/30 shadow-glow-sm hover:shadow-glow-md transition-all active:scale-95"
        >
          <span>API Docs</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
        </a>
      </div>
    </header>
  );
}
