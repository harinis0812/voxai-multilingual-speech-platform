import React from "react";
import { motion } from "framer-motion";
import {
  Mic,
  Volume2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Layers,
  Cpu,
  Clock,
  CheckCircle2
} from "lucide-react";

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 max-w-7xl mx-auto"
    >
      {/* HERO SECTION */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass-panel border border-white/[0.08] shadow-2xl"
      >
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Indic Speech Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Give Your Voice a <br className="hidden sm:inline" />
              <span className="gradient-text-accent">New Dimension.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Transform speech into text and text into natural-sounding speech with Gnani AI.
              Engineered specifically for Indian languages, regional accents, and seamless code-switching.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => setActiveTab("stt")}
                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-sm hover:shadow-glow-md transition-all active:scale-[0.98]"
              >
                <Mic className="w-4 h-4" />
                <span>Transcribe Speech (STT)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => setActiveTab("tts")}
                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white font-semibold text-sm border border-white/[0.1] hover:border-violet-500/30 transition-all active:scale-[0.98]"
              >
                <Volume2 className="w-4 h-4 text-violet-400" />
                <span>Synthesize Voice (TTS)</span>
              </button>
            </div>
          </div>

          {/* Interactive Floating Sound Wave Visual */}
          <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-2xl bg-navy-900/60 border border-white/[0.08] backdrop-blur-md w-72">
            <div className="flex items-center space-x-1.5 h-16 mb-4">
              <span className="w-1.5 h-full bg-violet-400 rounded-full wave-bar-1" />
              <span className="w-1.5 h-full bg-violet-500 rounded-full wave-bar-2" />
              <span className="w-1.5 h-full bg-indigo-400 rounded-full wave-bar-3" />
              <span className="w-1.5 h-full bg-indigo-500 rounded-full wave-bar-4" />
              <span className="w-1.5 h-full bg-cyan-400 rounded-full wave-bar-5" />
              <span className="w-1.5 h-full bg-cyan-500 rounded-full wave-bar-6" />
              <span className="w-1.5 h-full bg-violet-400 rounded-full wave-bar-7" />
              <span className="w-1.5 h-full bg-indigo-400 rounded-full wave-bar-8" />
            </div>

            <div className="text-center">
              <div className="text-xs font-semibold text-slate-200">Prisma & Timbre Engine</div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span>{isHealthy ? "Live Connection Active" : "Connecting..."}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FEATURE CARDS (STT & TTS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Speech-to-Text */}
        <motion.div
          variants={item}
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab("stt")}
          className="group cursor-pointer glass-panel rounded-2xl p-7 border border-white/[0.08] hover:border-violet-500/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 pointer-events-none">
            <Mic className="w-32 h-32 text-violet-400" />
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center mb-5 text-violet-300 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300 shadow-glow-sm">
              <Mic className="w-6 h-6" />
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
              <span>Speech-to-Text</span>
              <span>•</span>
              <span>Prisma v3.0</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">
              Multilingual Speech Recognition
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              High-accuracy speech transcription trained on thousands of hours of Indian regional dialects.
              Supports Tamil, English, Hindi, and auto language identification with raw WAV uploads.
            </p>

            <ul className="space-y-2 mb-6 text-xs text-slate-300">
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
                <span>Sub-second inference with exact processing metadata</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-2 text-sm font-semibold text-violet-400 group-hover:text-violet-300">
            <span>Launch Speech-to-Text</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 2: Text-to-Speech */}
        <motion.div
          variants={item}
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab("tts")}
          className="group cursor-pointer glass-panel rounded-2xl p-7 border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 pointer-events-none">
            <Volume2 className="w-32 h-32 text-cyan-400" />
          </div>

          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mb-5 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300 shadow-glow-cyan">
              <Volume2 className="w-6 h-6" />
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <span>Text-to-Speech</span>
              <span>•</span>
              <span>Timbre v3.0</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">
              Neural Voice Synthesis
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              Natural, human-like voice generation delivering high-fidelity audio with rich prosody and emotional cadence.
              Outputs clean 48,000 Hz studio-quality PCM WAV audio.
            </p>

            <ul className="space-y-2 mb-6 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>13 Native Indian voice personas (Lakshmi, Shivani, Avinash, etc.)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>48 kHz 16-bit linear PCM uncompressed studio sound</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant audio playback & one-click WAV download</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center space-x-2 text-sm font-semibold text-cyan-400 group-hover:text-cyan-300">
            <span>Launch Text-to-Speech</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>

      {/* SYSTEM HIGHLIGHTS / STATS STRIP */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="glass-panel rounded-xl p-5 border border-white/[0.06]">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-violet-600/15 text-violet-400">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-400">STT Model</span>
          </div>
          <div className="text-lg font-bold text-white">Prisma v3.0</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Indic Multilingual Acoustic</p>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-white/[0.06]">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-400">TTS Model</span>
          </div>
          <div className="text-lg font-bold text-white">Timbre v3.0</div>
          <p className="text-[11px] text-slate-400 mt-0.5">13 Neural Voice Personas</p>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-white/[0.06]">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-400">Language Reach</span>
          </div>
          <div className="text-lg font-bold text-white">Indic & English</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Tamil, Hindi, Kannada, Telugu</p>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-white/[0.06]">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-400">Backend Core</span>
          </div>
          <div className="text-lg font-bold text-white">FastAPI Async</div>
          <p className="text-[11px] text-slate-400 mt-0.5">In-Memory Audio Processing</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
