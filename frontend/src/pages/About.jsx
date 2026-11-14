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
  CheckCircle2
} from "lucide-react";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2.5">
          <Info className="w-6 h-6 text-violet-400" />
          <span>About the Platform & Architecture</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Gnani AI Voice Intelligence Internship Challenge — Architecture, Models, and Technologies.
        </p>
      </div>

      {/* CORE OVERVIEW */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-600/15 border border-violet-500/30 text-xs font-semibold text-violet-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Engineering Overview</span>
        </div>

        <h3 className="text-xl font-bold text-white">
          Enterprise Multilingual Voice Platform
        </h3>

        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          This system was built to provide an end-to-end speech processing solution that combines
          advanced acoustic recognition for regional Indian languages with natural, studio-quality
          voice synthesis. Designed as an asynchronous microservice with a modern React SPA, it
          bridges Gnani AI's Vachana cloud infrastructure with web and enterprise applications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-navy-950/70 border border-white/[0.06] space-y-2">
            <div className="flex items-center space-x-2 text-violet-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Gnani Prisma v3.0 (STT)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Proprietary Indic speech recognition engine capable of handling code-mixed dialectal
              speech (Tanglish, Hinglish) and telephony noise. Includes 30-second duration bounds
              and automated punctuation restoration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/70 border border-white/[0.06] space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>Gnani Timbre v3.0 (TTS)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Neural multi-speaker text-to-speech synthesizer generating 48 kHz uncompressed linear
              PCM WAV audio across 13 native Indian voice personas with adjustable cadence and prosody.
            </p>
          </div>
        </div>
      </div>

      {/* ARCHITECTURAL HIGHLIGHTS */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-5">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-indigo-400" />
          <span>Key Architectural Decisions</span>
        </h3>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">In-Memory Audio Processing:</strong>
              <p className="text-slate-400 mt-0.5">
                Uploaded files and generated audio streams are processed entirely through memory buffers
                (using Python's <code className="text-violet-300">BytesIO</code> and <code className="text-violet-300">wave</code> module), eliminating temporary disk bottlenecks and concurrent write collisions.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Streaming WAV Normalization:</strong>
              <p className="text-slate-400 mt-0.5">
                Streaming audio chunks returned by live neural engines often set chunk sizes to <code className="text-violet-300">0xFFFFFFFF</code>.
                Our backend normalizes the binary header into strict standard PCM WAV, ensuring immediate playback compatibility in all operating systems and browsers.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Zero API Quota Consumption in Automated Testing:</strong>
              <p className="text-slate-400 mt-0.5">
                The test suite (<code className="text-violet-300">pytest</code>) utilizes mocked HTTP adapters to validate all 35 test cases—including error mappings for 400, 401, 402, 403, 429, and 500—without consuming live API credits or requiring cloud connectivity.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Strict Credential Isolation:</strong>
              <p className="text-slate-400 mt-0.5">
                The Gnani API credentials are read from <code className="text-violet-300">.env</code> on the backend and injected via the <code className="text-violet-300">X-API-Key-ID</code> header. The frontend and public endpoints never see or expose API credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
