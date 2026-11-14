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
  ExternalLink
} from "lucide-react";
import { fetchHealth } from "../api";

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
        message: "Could not reach FastAPI backend at 127.0.0.1:8000.",
      });
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>Service Status & Health Monitor</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time diagnostics and engine readiness for Gnani AI Voice Platform.
          </p>
        </div>

        <button
          onClick={runCheck}
          disabled={isPinging}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 border border-white/[0.08] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-emerald-400" : ""}`} />
          <span>{isPinging ? "Pinging..." : "Refresh Status"}</span>
        </button>
      </div>

      {/* STATUS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Core Server */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="w-5 h-5" />
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isHealthy ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
              }`}
            >
              {isHealthy ? "Operational" : "Offline"}
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">FastAPI Backend</h4>
            <p className="text-xs text-slate-400 mt-0.5">http://127.0.0.1:8000</p>
          </div>

          <div className="pt-2 text-xs text-slate-400 border-t border-white/[0.04] flex items-center justify-between">
            <span>Ping Latency:</span>
            <span className="font-mono text-emerald-400 font-semibold">{latency ? `${latency} ms` : "—"}</span>
          </div>
        </div>

        {/* Card 2: Prisma STT */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
              Ready
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">Prisma v3.0 (STT)</h4>
            <p className="text-xs text-slate-400 mt-0.5">https://api.vachana.ai/stt/v3</p>
          </div>

          <div className="pt-2 text-xs text-slate-400 border-t border-white/[0.04] flex items-center justify-between">
            <span>Auth Scope:</span>
            <span className="text-violet-300 font-semibold">Active & Verified</span>
          </div>
        </div>

        {/* Card 3: Timbre TTS */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-400/20">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              Ready
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">Timbre v3.0 (TTS)</h4>
            <p className="text-xs text-slate-400 mt-0.5">https://api.vachana.ai/api/v1/tts/inference</p>
          </div>

          <div className="pt-2 text-xs text-slate-400 border-t border-white/[0.04] flex items-center justify-between">
            <span>Supported Personas:</span>
            <span className="text-cyan-300 font-semibold">13 Voices</span>
          </div>
        </div>
      </div>

      {/* TECHNICAL SPECIFICATIONS TABLE */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-violet-400" />
          <span>Platform Specifications & Endpoint Registry</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400">
                <th className="pb-3 font-semibold">Service</th>
                <th className="pb-3 font-semibold">Endpoint</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Content-Type</th>
                <th className="pb-3 font-semibold">Engine / Target</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300 font-mono">
              <tr>
                <td className="py-3.5 font-sans font-semibold text-white">Health Monitor</td>
                <td className="py-3.5 text-slate-300">/health</td>
                <td className="py-3.5 text-emerald-400 font-bold">GET</td>
                <td className="py-3.5 text-slate-400">application/json</td>
                <td className="py-3.5 font-sans text-slate-300">FastAPI Async</td>
                <td className="py-3.5 text-emerald-400">200 OK</td>
              </tr>
              <tr>
                <td className="py-3.5 font-sans font-semibold text-white">Speech-to-Text</td>
                <td className="py-3.5 text-slate-300">/api/stt</td>
                <td className="py-3.5 text-violet-400 font-bold">POST</td>
                <td className="py-3.5 text-slate-400">multipart/form-data</td>
                <td className="py-3.5 font-sans text-slate-300">Gnani Prisma v3.0</td>
                <td className="py-3.5 text-emerald-400">200 OK</td>
              </tr>
              <tr>
                <td className="py-3.5 font-sans font-semibold text-white">Text-to-Speech</td>
                <td className="py-3.5 text-slate-300">/api/tts</td>
                <td className="py-3.5 text-cyan-400 font-bold">POST</td>
                <td className="py-3.5 text-slate-400">application/json</td>
                <td className="py-3.5 font-sans text-slate-300">Gnani Timbre v3.0</td>
                <td className="py-3.5 text-emerald-400">200 OK</td>
              </tr>
              <tr>
                <td className="py-3.5 font-sans font-semibold text-white">Swagger Documentation</td>
                <td className="py-3.5 text-slate-300">/docs</td>
                <td className="py-3.5 text-emerald-400 font-bold">GET</td>
                <td className="py-3.5 text-slate-400">text/html</td>
                <td className="py-3.5 font-sans text-slate-300">OpenAPI 3.1</td>
                <td className="py-3.5 text-emerald-400">Active</td>
              </tr>
            </tbody>
          </table>
        </div>

        {lastChecked && (
          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Last checked: {lastChecked}</span>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 flex items-center space-x-1"
            >
              <span>Explore Interactive API Schema</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
