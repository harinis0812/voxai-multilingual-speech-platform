import React from "react";
import { motion } from "framer-motion";
import { Mic, Waves, Sparkles, Check, AlertCircle } from "lucide-react";

/**
 * Reusable AI Orb component representing VoxAI's neural speech intelligence.
 * Supports states: 'idle' | 'listening' | 'processing' | 'completed' | 'error'
 */
export default function AiOrb({
  state = "idle",
  size = "md",
  className = "",
  onClick,
  label
}) {
  const sizeMap = {
    sm: "w-32 h-32",
    md: "w-52 h-52 sm:w-64 sm:h-64",
    lg: "w-64 h-64 sm:w-80 sm:h-80",
  };

  const centerSizeMap = {
    sm: "w-12 h-12",
    md: "w-16 h-16 sm:w-20 sm:h-20",
    lg: "w-20 h-20 sm:w-24 sm:h-24",
  };

  const iconSizeMap = {
    sm: "w-5 h-5",
    md: "w-7 h-7 sm:w-8 sm:h-8",
    lg: "w-9 h-9 sm:w-10 sm:h-10",
  };

  // State-specific visual styling
  const stateConfig = {
    idle: {
      coreBg: "from-violet-600 via-purple-700 to-indigo-900",
      glowColor: "rgba(168, 85, 247, 0.45)",
      borderColor: "border-purple-400/40",
      icon: Sparkles,
      iconColor: "text-purple-200",
      statusText: "Ready for Speech Input",
      pulseSpeed: 4,
    },
    listening: {
      coreBg: "from-fuchsia-500 via-violet-600 to-cyan-500",
      glowColor: "rgba(232, 121, 249, 0.65)",
      borderColor: "border-fuchsia-300/60",
      icon: Mic,
      iconColor: "text-white animate-pulse",
      statusText: "Listening to Audio Stream...",
      pulseSpeed: 1.8,
    },
    processing: {
      coreBg: "from-purple-600 via-indigo-600 to-cyan-400",
      glowColor: "rgba(56, 189, 248, 0.55)",
      borderColor: "border-cyan-400/60",
      icon: Waves,
      iconColor: "text-cyan-200 animate-spin",
      statusText: "Prisma v3.0 Processing...",
      pulseSpeed: 1.2,
    },
    completed: {
      coreBg: "from-emerald-500 via-teal-600 to-purple-800",
      glowColor: "rgba(16, 185, 129, 0.55)",
      borderColor: "border-emerald-400/60",
      icon: Check,
      iconColor: "text-emerald-100",
      statusText: "Transcription Complete",
      pulseSpeed: 3,
    },
    error: {
      coreBg: "from-rose-600 via-pink-700 to-purple-950",
      glowColor: "rgba(244, 63, 94, 0.55)",
      borderColor: "border-rose-400/60",
      icon: AlertCircle,
      iconColor: "text-rose-100",
      statusText: "Processing Error",
      pulseSpeed: 2,
    },
  };

  const current = stateConfig[state] || stateConfig.idle;
  const IconComponent = current.icon;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer Glow Halo */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none filter blur-2xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: current.pulseSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ background: current.glowColor }}
      />

      {/* Rotating Dot Constellation Ring (inspired by VoxAI design) */}
      <div
        className={`relative ${sizeMap[size] || sizeMap.md} flex items-center justify-center cursor-pointer`}
        onClick={onClick}
      >
        {/* Outer dotted orbital ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-purple-500/20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #E9D5FF 1.5px, transparent 2px)",
            backgroundSize: "14px 14px",
            maskImage: "radial-gradient(circle, transparent 40%, black 50%, black 72%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 40%, black 50%, black 72%, transparent 78%)",
          }}
        />

        {/* Inner reverse dotted orbital ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute inset-6 rounded-full border border-cyan-400/15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #C084FC 1.8px, transparent 2.4px)",
            backgroundSize: "18px 18px",
            maskImage: "radial-gradient(circle, transparent 32%, black 42%, black 68%, transparent 74%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 32%, black 42%, black 68%, transparent 74%)",
          }}
        />

        {/* Breathing Inner Sphere */}
        <motion.div
          className={`absolute rounded-full bg-gradient-to-tr ${current.coreBg} shadow-orb border ${current.borderColor} flex items-center justify-center`}
          animate={{
            scale: state === "listening" || state === "processing" ? [0.96, 1.05, 0.96] : [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: current.pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: "60%",
            height: "60%",
          }}
        >
          {/* Subtle interior highlight */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

          {/* Center Micro Badge */}
          <div
            className={`${centerSizeMap[size] || centerSizeMap.md} rounded-full bg-[#0E0720]/80 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg`}
          >
            <IconComponent className={`${iconSizeMap[size] || iconSizeMap.md} ${current.iconColor}`} />
          </div>
        </motion.div>
      </div>

      {/* Optional Orb Sub-label */}
      {(label || current.statusText) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-medium text-purple-200">
            {label || current.statusText}
          </span>
        </motion.div>
      )}
    </div>
  );
}
