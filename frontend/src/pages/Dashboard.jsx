import React from "react";
import { motion } from "framer-motion";
import {
  Mic,
  Volume2,
  Sparkles,
  ArrowRight,
  Globe2,
  CheckCircle2,
  Activity
} from "lucide-react";
import AiOrb from "../components/AiOrb";

export default function Dashboard({ setActiveTab, isHealthy }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const targetLanguages = [
    {
      code: "en-IN",
      name: "English",
      native: "English",
      desc: "Indian accent, code-mixed & standard speech",
      stt: "Prisma v3.0",
      tts: "Shivani / Avinash"
    },
    {
      code: "hi-IN",
      name: "Hindi",
      native: "हिंदी",
      desc: "Devanagari script, dialectal nuances & colloquial phrasing",
      stt: "Prisma v3.0",
      tts: "Avinash / Shubham"
    },
    {
      code: "ta-IN",
      name: "Tamil",
      native: "தமிழ்",
      desc: "Tamil script, regional articulation & colloquial cadence",
      stt: "Prisma v3.0",
      tts: "Lakshmi / Tarika"
    },
    {
      code: "ml-IN",
      name: "Malayalam",
      native: "മലയാളം",
      desc: "Malayalam script, natural phrasing & 10 verified personas",
      stt: "Prisma v3.0",
      tts: "Lakshmi / Kalpana"
    }
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 max-w-7xl mx-auto pb-12"
    >
      {/* 1. HERO SECTION WITH AI ORB */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass-panel border border-purple-500/25 shadow-2xl"
      >
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-xs font-semibold text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Next-Gen Indic Speech Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Give Your Voice a <br className="hidden sm:inline" />
              <span className="gradient-text-accent">New Dimension.</span>
            </h1>

            <p className="text-base sm:text-lg text-purple-100/80 leading-relaxed font-normal max-w-xl">
              VoxAI transforms regional Indian speech into precise text and generates natural, studio-quality neural voices. Powered by Gnani AI's Prisma v3.0 and Timbre v3.0 models.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => setActiveTab("stt")}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-sm hover:shadow-glow-md transition-all active:scale-[0.98] border border-purple-400/40"
              >
                <Mic className="w-4 h-4" />
                <span>Start Speech-to-Text</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => setActiveTab("tts")}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] text-purple-100 hover:text-white font-bold text-sm border border-purple-500/25 hover:border-purple-400/50 transition-all active:scale-[0.98] shadow-sm"
              >
                <Volume2 className="w-4 h-4 text-purple-300" />
                <span>Synthesize Speech</span>
              </button>

              <button
                onClick={() => setActiveTab("status")}
                className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 hover:text-white font-semibold text-xs border border-purple-500/20 transition-all active:scale-[0.98]"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Check API Status</span>
              </button>
            </div>
          </div>

          {/* Reusable Animated AI Orb Visual */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-[#0B0620]/80 border border-purple-500/20 backdrop-blur-xl shrink-0 shadow-xl">
            <AiOrb
              state={isHealthy ? "idle" : "processing"}
              size="lg"
              label={isHealthy ? "Neural Engine Ready" : "Connecting Backend Core..."}
            />
            <div className="mt-4 text-center">
              <span className="text-xs font-semibold text-purple-200">Prisma & Timbre Engine</span>
              <div className="text-[11px] text-purple-300/70 mt-1 flex items-center justify-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-amber-400 animate-pulse"}`} />
                <span>{isHealthy ? "FastAPI Microservice Connected" : "Connecting to Backend Service..."}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. SUPPORTED LANGUAGES SHOWCASE */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2.5">
              <Globe2 className="w-5 h-5 text-purple-400" />
              <span>Native Indic Language Support</span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/70 mt-0.5">
              Optimized for regional vocabulary, phonetics, code-switching, and authentic writing scripts.
            </p>
          </div>

          <div className="text-xs font-semibold text-purple-300 bg-purple-950/50 px-3.5 py-1.5 rounded-full border border-purple-500/25 self-start sm:self-auto">
            <span>English • हिन्दी • தமிழ் • മലയാളം</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {targetLanguages.map((lang) => (
            <div
              key={lang.code}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-purple-500/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-white font-sans tracking-wide">
                    {lang.native}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-300 border border-purple-500/30">
                    {lang.code}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-purple-100">{lang.name}</h3>
                <p className="text-xs text-purple-200/70 mt-1 leading-relaxed">
                  {lang.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between text-[11px]">
                <span className="text-purple-300/60">STT: {lang.stt}</span>
                <span className="text-purple-300 font-semibold">{lang.tts}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3. CORE APPLICATION FUNCTIONALITY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Speech-to-Text */}
        <motion.div
          variants={item}
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab("stt")}
          className="group cursor-pointer glass-panel rounded-3xl p-7 border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-lg"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 pointer-events-none">
            <Mic className="w-32 h-32 text-purple-400" />
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mb-5 text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-glow-sm">
              <Mic className="w-6 h-6" />
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
              <span>Speech-to-Text</span>
              <span>•</span>
              <span>Prisma v3.0</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
              Multilingual Speech Recognition
            </h3>

            <p className="text-sm text-purple-100/80 leading-relaxed mb-6 font-normal">
              High-accuracy speech transcription trained on thousands of hours of Indian regional dialects.
              Supports Tamil, Hindi, Malayalam, English, and auto-language identification with raw WAV uploads.
            </p>

            <ul className="space-y-2 mb-6 text-xs text-purple-200/80">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Optimized for Indian code-mixed speech (Tanglish / Hinglish)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Built-in 30-second audio duration validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Audio upload, benchmark pills & live microphone recording</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-2 text-sm font-bold text-purple-400 group-hover:text-purple-300">
            <span>Launch Speech-to-Text Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 2: Text-to-Speech */}
        <motion.div
          variants={item}
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab("tts")}
          className="group cursor-pointer glass-panel rounded-3xl p-7 border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-lg"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 pointer-events-none">
            <Volume2 className="w-32 h-32 text-indigo-400" />
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-5 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-glow-sm">
              <Volume2 className="w-6 h-6" />
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <span>Text-to-Speech</span>
              <span>•</span>
              <span>Timbre v3.0</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
              Neural Voice Synthesis
            </h3>

            <p className="text-sm text-purple-100/80 leading-relaxed mb-6 font-normal">
              Natural, human-like voice generation delivering high-fidelity audio with rich prosody and emotional cadence.
              Outputs clean 48,000 Hz studio-quality linear PCM WAV audio.
            </p>

            <ul className="space-y-2 mb-6 text-xs text-purple-200/80">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>13 Voice Personas (Lakshmi, Avinash, Shivani, Kalpana, Prakash, etc.)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Automatic Unicode script detection & manual override</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>48 kHz 16-bit linear PCM uncompressed studio sound with speed controls</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-2 text-sm font-bold text-indigo-400 group-hover:text-indigo-300">
            <span>Launch Text-to-Speech Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
