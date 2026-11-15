import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Mic,
  Volume2,
  Radio,
  ExternalLink,
  Menu,
  X,
  Sparkles
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, isHealthy }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all">
      {/* Horizontal Floating Glass Pill Navbar (Inspired by VoxAI Glass Reference) */}
      <nav
        aria-label="Main Navigation"
        className="relative flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full bg-[#0E0824]/85 border border-purple-500/25 backdrop-blur-2xl shadow-[0_8px_32px_rgba(5,3,18,0.7),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
      >
        {/* LEFT: BRAND IDENTITY */}
        <div
          onClick={() => handleNavClick("dashboard")}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 p-[1px] shadow-glow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0E0824] rounded-full flex items-center justify-center">
              <Radio className="w-4 h-4 text-purple-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-extrabold text-lg tracking-tight text-white">Vox</span>
              <span className="font-extrabold text-lg bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">AI</span>
            </div>
          </div>
        </div>

        {/* CENTER: DESKTOP HORIZONTAL NAVIGATION LINKS */}
        <div className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-2 group ${
                  isActive
                    ? "text-white font-bold"
                    : "text-purple-200/70 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTopNav"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/35 via-violet-600/25 to-indigo-600/30 rounded-full border border-purple-400/40 shadow-glow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}

                <Icon
                  className={`w-3.5 h-3.5 z-10 transition-colors ${
                    isActive ? "text-purple-300" : "text-purple-300/60 group-hover:text-purple-200"
                  }`}
                />
                <span className="z-10">{item.label}</span>

                {item.badge && (
                  <span
                    className={`z-10 text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? "bg-purple-500/30 text-purple-200 border border-purple-400/30"
                        : "bg-white/[0.04] text-purple-300/50 border border-white/[0.06]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT: UTILITY CONTROLS (HEALTH MONITOR + SWAGGER DOCS + MOBILE TOGGLE) */}
        <div className="flex items-center space-x-2.5">
          {/* Backend Status Pill */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#140D36]/80 border border-purple-500/25 shadow-sm text-xs">
            <span className="relative flex h-2 w-2">
              {isHealthy && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-amber-400 shadow-[0_0_8px_#F59E0B]"}`}></span>
            </span>
            <span className="font-semibold text-purple-200 text-[11px]">
              {isHealthy ? "Core Ready" : "Connecting..."}
            </span>
          </div>

          {/* Swagger API Docs Button */}
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/30 shadow-glow-sm hover:shadow-glow-md transition-all active:scale-95"
          >
            <span>API Docs</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-purple-200 hover:text-white hover:bg-white/[0.08] lg:hidden transition-colors border border-purple-500/20"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* MOBILE COMPACT DROPDOWN MENU (No permanent vertical sidebar!) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden mt-2 p-3 rounded-3xl bg-[#0E0824]/95 border border-purple-500/25 backdrop-blur-2xl shadow-2xl space-y-1.5"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-purple-600/30 text-white border border-purple-400/40 shadow-glow-sm"
                      : "text-purple-200/70 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-purple-300" : "text-purple-400/60"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-200 border border-purple-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Utility Controls */}
            <div className="pt-2 px-2 border-t border-purple-500/15 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className="text-purple-200/70">FastAPI: {isHealthy ? "Online" : "Connecting"}</span>
              </div>

              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-purple-300 hover:text-white flex items-center space-x-1"
              >
                <span>Swagger Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
