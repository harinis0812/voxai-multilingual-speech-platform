import React from "react";
import {
  Radio,
  ExternalLink,
  Activity,
  Info,
  Mic,
  Volume2,
  LayoutGrid,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { DOCS_URL } from "../api";

export default function Footer({ setActiveTab, isHealthy }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-purple-500/20 bg-[#0A051D]/90 backdrop-blur-2xl relative z-10 transition-colors">
      {/* Specular Edge Highlight */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-10">
          {/* Column 1: Brand & Identity */}
          <div className="md:col-span-1 space-y-4">
            <div
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center space-x-2.5 cursor-pointer select-none group inline-flex"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 p-[1px] shadow-glow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0E0824] rounded-full flex items-center justify-center">
                  <Radio className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-base tracking-tight text-white">Vox</span>
                <span className="font-extrabold text-base bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">AI</span>
              </div>
            </div>

            <p className="text-xs text-purple-200/70 leading-relaxed font-normal">
              Next-generation multilingual speech intelligence platform powered by Gnani AI's Prisma v3.0 and Timbre v3.0 neural speech engines.
            </p>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/25 text-[11px] text-purple-300">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Indic Speech Platform</span>
            </div>
          </div>

          {/* Column 2: Studio Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 flex items-center space-x-1.5">
              <span>Studio Apps</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-purple-200/75">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white flex items-center space-x-2 transition-colors group"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-purple-400/70 group-hover:text-purple-300" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("stt");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white flex items-center space-x-2 transition-colors group"
                >
                  <Mic className="w-3.5 h-3.5 text-purple-400/70 group-hover:text-purple-300" />
                  <span>Speech-to-Text Studio</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("tts");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white flex items-center space-x-2 transition-colors group"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-400/70 group-hover:text-purple-300" />
                  <span>Text-to-Speech Studio</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Resources (About VoxAI & API Status accessible here!) */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Platform & System
            </h4>
            <ul className="space-y-2.5 text-xs text-purple-200/75">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("status");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white flex items-center space-x-2 transition-colors group"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400/80 group-hover:text-emerald-300" />
                  <span>API Status & Diagnostics</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("about");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white flex items-center space-x-2 transition-colors group"
                >
                  <Info className="w-3.5 h-3.5 text-purple-400/70 group-hover:text-purple-300" />
                  <span>About VoxAI</span>
                </button>
              </li>
              <li>
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center space-x-2 transition-colors group"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400/70 group-hover:text-purple-300" />
                  <span>Interactive Swagger API Docs</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Engine Specifications */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              AI Speech Stack
            </h4>
            <div className="space-y-2 text-xs text-purple-200/70">
              <div className="flex items-center justify-between py-1 border-b border-purple-500/10">
                <span>ASR Model</span>
                <span className="font-semibold text-purple-300">Prisma v3.0</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-purple-500/10">
                <span>TTS Model</span>
                <span className="font-semibold text-purple-300">Timbre v3.0</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-purple-500/10">
                <span>Audio Standard</span>
                <span className="font-semibold text-purple-300">48 kHz Linear PCM</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Languages</span>
                <span className="font-semibold text-purple-300">en, hi, ta, ml</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & System Architecture */}
        <div className="pt-6 border-t border-purple-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-300/60">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>© {currentYear} VoxAI – Multilingual Speech Intelligence Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-purple-900/30 border border-purple-500/20 text-purple-300">
              FastAPI + React 18 + Tailwind
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}