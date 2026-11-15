import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Waves, Volume2 } from "lucide-react";

/**
 * NeuralVoiceOrb:
 * Crystalline 3D transparent glass audio sphere matching the TTS Visual Reference Image.
 * - Glowing transparent glass orb with specular reflections and inner glass rim.
 * - Dual internal oscillating sine waves:
 *     Curve 1 -> Electric Cyan-Blue (#00D2FF / #38BDF8)
 *     Curve 2 -> Neon Magenta-Pink (#E879F9 / #D946EF)
 * - Orbiting curved glass ribbons with etched spectral panels and cyan borders.
 * - Dynamically reactive to synthesis, playback, and resting states.
 */
export default function NeuralVoiceOrb({
  isPlaying = false,
  isSynthesizing = false,
  voiceName = "Lakshmi",
  gender = "Female",
  size = 280,
  className = ""
}) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const phaseRef = useRef({ wave1: 0, wave2: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    const w = size;
    const h = size;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const radius = w * 0.44;
    const centerX = w / 2;
    const centerY = h / 2;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Clip drawing inside the circular glass sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
      ctx.clip();

      // Deep dark blue inner orb ambient backdrop
      const innerGrad = ctx.createRadialGradient(
        centerX, centerY - radius * 0.2, radius * 0.1,
        centerX, centerY, radius
      );
      innerGrad.addColorStop(0, "rgba(20, 35, 75, 0.45)");
      innerGrad.addColorStop(0.6, "rgba(10, 15, 45, 0.75)");
      innerGrad.addColorStop(1, "rgba(5, 8, 28, 0.92)");
      ctx.fillStyle = innerGrad;
      ctx.fillRect(0, 0, w, h);

      // Speed and Amplitude based on state
      let speedMult = 1;
      let ampMult = 1;

      if (isSynthesizing) {
        speedMult = 2.4;
        ampMult = 1.6;
      } else if (isPlaying) {
        speedMult = 1.8;
        ampMult = 1.35;
      }

      phaseRef.current.wave1 += 0.045 * speedMult;
      phaseRef.current.wave2 += 0.038 * speedMult;

      const p1 = phaseRef.current.wave1;
      const p2 = phaseRef.current.wave2;

      // 1. Draw Wave 2 (Neon Magenta / Pink harmonic curve - behind)
      ctx.beginPath();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "#D946EF";
      ctx.shadowColor = "#E879F9";
      ctx.shadowBlur = 18;

      const startX = centerX - radius;
      const endX = centerX + radius;

      for (let x = startX; x <= endX; x += 2) {
        const norm = (x - startX) / (2 * radius);
        // Envelope so wave anchors at the sphere borders
        const env = Math.sin(norm * Math.PI);
        const y = centerY + Math.sin(norm * 9 + p2) * 26 * env * ampMult
                          + Math.cos(norm * 4 - p2 * 0.8) * 12 * env * ampMult;
        if (x === startX) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 2. Draw Wave 1 (Electric Cyan-Blue prominent curve - front)
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#00D2FF";
      ctx.shadowColor = "#38BDF8";
      ctx.shadowBlur = 22;

      for (let x = startX; x <= endX; x += 2) {
        const norm = (x - startX) / (2 * radius);
        const env = Math.sin(norm * Math.PI);
        const y = centerY + Math.sin(norm * 7 - p1) * 32 * env * ampMult
                          + Math.sin(norm * 14 + p1 * 1.2) * 8 * env * ampMult;
        if (x === startX) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Reset shadow for inner reflections
      ctx.shadowBlur = 0;

      // Inner bottom cyan glow reflection
      const bottomGlow = ctx.createRadialGradient(
        centerX, centerY + radius * 0.65, 0,
        centerX, centerY + radius * 0.65, radius * 0.8
      );
      bottomGlow.addColorStop(0, "rgba(0, 210, 255, 0.35)");
      bottomGlow.addColorStop(0.5, "rgba(168, 85, 247, 0.15)");
      bottomGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, 0, w, h);

      // Top-left specular crescent reflection
      const specGrad = ctx.createRadialGradient(
        centerX - radius * 0.35, centerY - radius * 0.35, 0,
        centerX - radius * 0.35, centerY - radius * 0.35, radius * 0.65
      );
      specGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      specGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.2)");
      specGrad.addColorStop(1, "transparent");
      ctx.fillStyle = specGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isSynthesizing, size]);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: `${size + 40}px`, height: `${size + 40}px` }}
    >
      {/* Ambient background atmosphere glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none filter blur-3xl opacity-60"
        style={{
          background: isSynthesizing
            ? "radial-gradient(circle, rgba(0, 210, 255, 0.45), rgba(217, 70, 239, 0.3) 60%, transparent 80%)"
            : isPlaying
            ? "radial-gradient(circle, rgba(56, 189, 248, 0.4), rgba(168, 85, 247, 0.25) 60%, transparent 80%)"
            : "radial-gradient(circle, rgba(168, 85, 247, 0.3), rgba(56, 189, 248, 0.15) 60%, transparent 80%)"
        }}
      />

      {/* Orbiting Curved Glass Ribbon 1 (Tilted 3D Ring with Cyan Edges) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none"
        style={{
          width: `${size + 36}px`,
          height: `${size * 0.62}px`,
          borderRadius: "50%",
          border: "1.5px solid rgba(56, 189, 248, 0.45)",
          boxShadow: "0 0 20px rgba(56, 189, 248, 0.3), inset 0 0 15px rgba(56, 189, 248, 0.2)",
          transform: "rotateX(68deg) rotateY(-18deg)",
          transformStyle: "preserve-3d"
        }}
      >
        {/* Etched Glass HUD Chips on Orbital Ring */}
        <div className="absolute -top-2.5 left-8 px-2 py-0.5 rounded-md bg-[#0D0726]/90 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]">
          48 kHz
        </div>
        <div className="absolute -bottom-2.5 right-8 px-2 py-0.5 rounded-md bg-[#0D0726]/90 border border-purple-400/40 text-[9px] font-mono text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.5)]">
          PCM WAV
        </div>
      </motion.div>

      {/* Orbiting Curved Glass Ribbon 2 (Counter-Rotating Glass Ribbon) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        className="absolute pointer-events-none"
        style={{
          width: `${size + 20}px`,
          height: `${size * 0.58}px`,
          borderRadius: "50%",
          border: "1px dashed rgba(217, 70, 239, 0.4)",
          transform: "rotateX(74deg) rotateY(24deg)",
          transformStyle: "preserve-3d"
        }}
      />

      {/* 3D Glass Sphere Outer Glow Container */}
      <div
        className="relative rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: isSynthesizing
            ? "0 0 45px rgba(0, 210, 255, 0.5), inset 0 0 25px rgba(255, 255, 255, 0.35)"
            : isPlaying
            ? "0 0 35px rgba(56, 189, 248, 0.45), inset 0 0 20px rgba(255, 255, 255, 0.3)"
            : "0 0 25px rgba(168, 85, 247, 0.35), inset 0 0 15px rgba(255, 255, 255, 0.25)"
        }}
      >
        {/* HTML5 Canvas for Internal Dual Oscillating Sine Waves */}
        <canvas
          ref={canvasRef}
          style={{ width: `${size}px`, height: `${size}px` }}
          className="rounded-full"
        />

        {/* Outer Glass Rim & Specular Ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none border border-cyan-400/40"
          style={{
            boxShadow: "inset 0 1.5px 3px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 210, 255, 0.3)"
          }}
        />
      </div>

      {/* Floating Status Pill Underneath Orb */}
      <div className="absolute -bottom-4 px-3.5 py-1 rounded-full bg-[#0E0824]/90 border border-purple-500/30 backdrop-blur-xl shadow-lg flex items-center space-x-2 text-xs">
        <span className="relative flex h-2 w-2">
          {isSynthesizing ? (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          ) : isPlaying ? (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
          ) : null}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            isSynthesizing ? "bg-cyan-400 shadow-[0_0_8px_#00D2FF]" : isPlaying ? "bg-purple-400" : "bg-emerald-400"
          }`} />
        </span>
        <span className="font-semibold text-white">
          {isSynthesizing ? "Synthesizing Neural Speech..." : isPlaying ? `Streaming ${voiceName}` : `${voiceName} (${gender})`}
        </span>
      </div>
    </div>
  );
}