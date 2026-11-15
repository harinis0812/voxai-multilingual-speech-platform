import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Key,
  Clock,
  Layers,
  Cpu,
  ShieldCheck,
  ExternalLink,
  Radio,
  FileAudio
} from "lucide-react";
import { fetchHealth, API_BASE_URL, DOCS_URL } from "../api";

export default function ApiStatus({ isHealthy, setIsHealthy, addToast }) {
  const [healthData, setHealthData] = useState(null);
  const [latency, setLatency] = useState(null);
  const [isPinging, setIsPinging] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const runCheck = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const data = await fetchHealth();
      const elapsed = Math.round(performance.now() - start);
      setHealthData(data);
      setLatency(elapsed);
      setIsHealthy(true);
      setLastChecked(new Date().toLocaleTimeString());
      addToast({
        type: "success",
        title: "API Status Verified",
        message: `FastAPI responded in ${elapsed} ms.`,
      });
    } catch (err) {
      setHealthData(null);
      setIsHealthy(false);
      setLatency(null);
      addToast({
        type: "error",
        title: "Connection Failed",
        message: "Could not reach FastAPI backend service.",
      });
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-2">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>Telemetry & Service Readiness</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <span>Service Status & Health Monitor</span>
          </h2>
          <p className="text-sm text-purple-200/70 mt-1">
            Real-time diagnostics and engine readiness for VoxAI Multilingual Speech Platform.
          </p>
        </div>

        <button
          onClick={runCheck}
          disabled={isPinging}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 text-xs font-bold text-purple-200 hover:text-white border border-purple-500/25 transition-all self-start sm:self-auto shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isPinging ? "animate-spin" : ""}`} />
          <span>{isPinging ? "Pinging..." : "Refresh Status"}</span>
        </button>
      </div>

      {/* STATUS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Core Server */}
        <div className="glass-panel rounded-3xl p-6 border border-purple-500/20 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-glow-sm">
              <Server className="w-5 h-5" />
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isHealthy
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
              }`}
            >
              {isHealthy ? "Operational" : "Offline"}
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">FastAPI Backend Core</h4>
            <p className="text-xs text-purple-300/70 font-mono mt-0.5">{API_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "FastAPI Service")}</p>
          </div>

          <div className="pt-3 text-xs text-purple-300/70 border-t border-purple-500/15 flex items-center justify-between">
            <span>Ping Latency:</span>
            <span className="font-mono text-emerald-400 font-bold">{latency !== null ? `${latency} ms` : "—"}</span>
          </div>
        </div>

        {/* Card 2: Prisma STT */}
        <div className="glass-panel rounded-3xl p-6 border border-purple-500/20 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-glow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-200 border border-purple-400/30">
              Ready
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">Prisma v3.0 (STT)</h4>
            <p className="text-xs text-purple-300/70 font-mono mt-0.5 truncate">https://api.vachana.ai/stt/v3</p>
          </div>

          <div className="pt-3 text-xs text-purple-300/70 border-t border-purple-500/15 flex items-center justify-between">
            <span>Auth Scope:</span>
            <span className="text-purple-200 font-bold">X-API-Key-ID Verified</span>
          </div>
        </div>

        {/* Card 3: Timbre TTS */}
        <div className="glass-panel rounded-3xl p-6 border border-purple-500/20 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-glow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-400/30">
              Ready
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">Timbre v3.0 (TTS)</h4>
            <p className="text-xs text-purple-300/70 font-mono mt-0.5 truncate">https://api.vachana.ai/api/v1/tts/inference</p>
          </div>

          <div className="pt-3 text-xs text-purple-300/70 border-t border-purple-500/15 flex items-center justify-between">
            <span>Voice Personas:</span>
            <span className="text-indigo-200 font-bold">13 Indian Personas</span>
          </div>
        </div>
      </div>

      {/* TECHNICAL SPECIFICATIONS TABLE */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <span>Platform Specifications & Endpoint Registry</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-500/20 text-purple-300/60 uppercase tracking-wider font-bold">
                <th className="pb-3.5">Service</th>
                <th className="pb-3.5">Endpoint</th>
                <th className="pb-3.5">Method</th>
                <th className="pb-3.5">Content-Type</th>
                <th className="pb-3.5">Engine / Model</th>
                <th className="pb-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-purple-100/90 font-mono">
              <tr>
                <td className="py-4 font-sans font-bold text-white">Health Monitor</td>
                <td className="py-4 text-purple-300 font-mono">/health</td>
                <td className="py-4 text-emerald-400 font-bold">GET</td>
                <td className="py-4 text-purple-300/60">application/json</td>
                <td className="py-4 font-sans text-purple-200">FastAPI Async</td>
                <td className="py-4 text-emerald-400 font-bold">200 OK</td>
              </tr>
              <tr>
                <td className="py-4 font-sans font-bold text-white">Speech-to-Text</td>
                <td className="py-4 text-purple-300 font-mono">/api/stt</td>
                <td className="py-4 text-purple-400 font-bold">POST</td>
                <td className="py-4 text-purple-300/60">multipart/form-data</td>
                <td className="py-4 font-sans text-purple-200">Gnani Prisma v3.0</td>
                <td className="py-4 text-emerald-400 font-bold">200 OK</td>
              </tr>
              <tr>
                <td className="py-4 font-sans font-bold text-white">Text-to-Speech</td>
                <td className="py-4 text-purple-300 font-mono">/api/tts</td>
                <td className="py-4 text-indigo-400 font-bold">POST</td>
                <td className="py-4 text-purple-300/60">application/json</td>
                <td className="py-4 font-sans text-purple-200">Gnani Timbre v3.0</td>
                <td className="py-4 text-emerald-400 font-bold">200 OK</td>
              </tr>
              <tr>
                <td className="py-4 font-sans font-bold text-white">Benchmark Samples</td>
                <td className="py-4 text-purple-300 font-mono">/api/samples/{`{name}`}</td>
                <td className="py-4 text-emerald-400 font-bold">GET</td>
                <td className="py-4 text-purple-300/60">audio/wav</td>
                <td className="py-4 font-sans text-purple-200">FastAPI Static Stream</td>
                <td className="py-4 text-emerald-400 font-bold">200 OK</td>
              </tr>
              <tr>
                <td className="py-4 font-sans font-bold text-white">Swagger API Docs</td>
                <td className="py-4 text-purple-300 font-mono">/docs</td>
                <td className="py-4 text-emerald-400 font-bold">GET</td>
                <td className="py-4 text-purple-300/60">text/html</td>
                <td className="py-4 font-sans text-purple-200">OpenAPI 3.1</td>
                <td className="py-4 text-emerald-400 font-bold">Active</td>
              </tr>
            </tbody>
          </table>
        </div>

        {lastChecked && (
          <div className="pt-3 text-[11px] text-purple-300/60 flex items-center justify-between border-t border-purple-500/15">
            <span>Last checked: {lastChecked}</span>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 flex items-center space-x-1.5 font-semibold transition-colors"
            >
              <span>Explore Interactive API Schema</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
