import React from "react";
import { motion } from "framer-motion";
import {
  Info,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Code2,
  Terminal,
  FileText,
  ExternalLink,
  CheckCircle2,
  Radio
} from "lucide-react";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-2">
          <Radio className="w-3.5 h-3.5 text-purple-400" />
          <span>Architecture & System Design</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <span>About VoxAI Platform Architecture</span>
        </h2>
        <p className="text-sm text-purple-200/70 mt-1">
          Engineering overview, neural model specifications, and architectural decisions.
        </p>
      </div>

      {/* CORE OVERVIEW */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-xs font-bold text-purple-200">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>System Engineering Overview</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white">
          Intelligent Multilingual Voice Intelligence Platform
        </h3>

        <p className="text-sm text-purple-100/80 leading-relaxed font-normal">
          VoxAI is an end-to-end speech processing platform combining advanced acoustic recognition for regional Indian languages with natural, studio-quality neural voice synthesis. Built as an asynchronous FastAPI microservice paired with a modern React single-page application, it interfaces with Gnani AI's Vachana cloud infrastructure for high-throughput speech workflows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-5 rounded-2xl bg-[#0B0620]/80 border border-purple-500/20 space-y-2.5 shadow-md">
            <div className="flex items-center space-x-2.5 text-purple-300 font-bold text-sm">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>Gnani Prisma v3.0 (STT)</span>
            </div>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Proprietary Indic acoustic speech recognition engine capable of handling code-mixed dialectal speech (Tanglish, Hinglish) and telephony noise. Enforces strict 30.0-second clip duration limits and provides automatic language identification via <code className="text-purple-300 font-mono">indic-auto</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B0620]/80 border border-purple-500/20 space-y-2.5 shadow-md">
            <div className="flex items-center space-x-2.5 text-indigo-300 font-bold text-sm">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Gnani Timbre v3.0 (TTS)</span>
            </div>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Neural multi-speaker text-to-speech synthesizer generating 48 kHz uncompressed linear PCM WAV audio across 13 native Indian voice personas with adjustable speed multiplier (0.5x to 2.0x) and automatic Unicode script detection.
            </p>
          </div>
        </div>
      </div>

      {/* ARCHITECTURAL DECISIONS */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2.5">
          <Code2 className="w-5 h-5 text-purple-400" />
          <span>Core Engineering Highlights</span>
        </h3>

        <div className="space-y-4 text-xs text-purple-200/80">
          <div className="p-4 rounded-2xl bg-[#0B0620]/70 border border-purple-500/15 flex items-start space-x-3.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">In-Memory Audio Streaming:</strong>
              <p className="text-purple-200/70 mt-1 leading-relaxed">
                Uploaded files and generated audio streams are processed entirely through memory buffers (using Python's <code className="text-purple-300 font-mono">io.BytesIO</code> and standard <code className="text-purple-300 font-mono">wave</code> module), eliminating temporary disk I/O bottlenecks and file collision risks in concurrent environments.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0620]/70 border border-purple-500/15 flex items-start space-x-3.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">Streaming WAV Header Repair:</strong>
              <p className="text-purple-200/70 mt-1 leading-relaxed">
                Streaming audio chunks emitted by neural engines transmit chunk lengths as <code className="text-purple-300 font-mono">0xFFFFFFFF</code>. Our backend inspects and patches the RIFF and data headers to exact byte lengths before streaming to the client, guaranteeing immediate playback and waveform decoding across all browsers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0620]/70 border border-purple-500/15 flex items-start space-x-3.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">Full Automated Test Suite with Mocked Adapters:</strong>
              <p className="text-purple-200/70 mt-1 leading-relaxed">
                The comprehensive 38-test suite validates root routing, health monitoring, STT/TTS workflows, input validation, and external error mappings (400, 401, 402, 403, 429, 500) using FastAPI's <code className="text-purple-300 font-mono">TestClient</code> and mocked adapters with zero live API quota consumption.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0620]/70 border border-purple-500/15 flex items-start space-x-3.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">Strict Credential Isolation:</strong>
              <p className="text-purple-200/70 mt-1 leading-relaxed">
                The Gnani API credentials reside securely in server-side <code className="text-purple-300 font-mono">.env</code> configurations and are injected into outgoing requests via the <code className="text-purple-300 font-mono">X-API-Key-ID</code> header. The frontend and browser runtime never handle, expose, or leak API keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
