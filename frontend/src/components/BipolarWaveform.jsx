import React, { useEffect, useRef } from "react";
import { Mic, Waves } from "lucide-react";

/**
 * BipolarWaveform:
 * Futuristic audio waveform console matching the STT Visual Reference.
 * - Central glowing microphone badge in concentric neon rings.
 * - Symmetrical bipolar audio spectrum:
 *     Left Channel  -> Electric Cyan-Blue (#00D2FF / #38BDF8)
 *     Right Channel -> Neon Violet-Magenta (#A855F7 / #D946EF)
 * - Laser baseline horizontal alignment.
 * - Reactive Web Audio API AnalyserNode integration for both audio playback and live mic.
 */
export default function BipolarWaveform({
  audioRef,
  isPlaying = false,
  isRecording = false,
  stream = null,
  height = 100,
  showMicBadge = true,
  statusLabel = null,
  className = ""
}) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamSourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Setup high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const canvasH = height;

    canvas.width = width * dpr;
    canvas.height = canvasH * dpr;
    ctx.scale(dpr, dpr);

    const centerY = canvasH / 2;
    const centerGap = showMicBadge ? 44 : 12; // Gap for the center mic badge
    const barWidth = 3;
    const barGap = 3.5;
    const step = barWidth + barGap;

    // Number of bars per half
    const halfWidth = (width / 2) - centerGap;
    const barsPerSide = Math.max(8, Math.floor(halfWidth / step));

    // Draw idle / resting state
    const drawResting = (phase) => {
      ctx.clearRect(0, 0, width, canvasH);

      // 1. Draw glowing laser baseline
      const laserGrad = ctx.createLinearGradient(0, centerY, width, centerY);
      laserGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
      laserGrad.addColorStop(0.2, "rgba(56, 189, 248, 0.45)");
      laserGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.7)");
      laserGrad.addColorStop(0.8, "rgba(217, 70, 239, 0.45)");
      laserGrad.addColorStop(1, "rgba(217, 70, 239, 0)");

      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // 2. Draw Left Bars (Cyan-Blue)
      for (let i = 0; i < barsPerSide; i++) {
        const x = (width / 2) - centerGap - (i + 1) * step;
        if (x < 4) break;

        // Subtle resting sine ripple
        const normalized = (barsPerSide - i) / barsPerSide;
        const ripple = Math.sin(phase + i * 0.25) * 4;
        const barH = Math.max(3, 4 + normalized * 8 + ripple);

        const cyanGrad = ctx.createLinearGradient(x, centerY - barH / 2, x, centerY + barH / 2);
        cyanGrad.addColorStop(0, "rgba(56, 189, 248, 0.85)");
        cyanGrad.addColorStop(0.5, "rgba(0, 210, 255, 0.5)");
        cyanGrad.addColorStop(1, "rgba(56, 189, 248, 0.85)");

        ctx.fillStyle = cyanGrad;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barH / 2, barWidth, barH, 1.5);
        ctx.fill();
      }

      // 3. Draw Right Bars (Neon Violet-Magenta)
      for (let i = 0; i < barsPerSide; i++) {
        const x = (width / 2) + centerGap + i * step;
        if (x > width - 4) break;

        const normalized = (barsPerSide - i) / barsPerSide;
        const ripple = Math.sin(phase + i * 0.25 + Math.PI / 2) * 4;
        const barH = Math.max(3, 4 + normalized * 8 + ripple);

        const magentaGrad = ctx.createLinearGradient(x, centerY - barH / 2, x, centerY + barH / 2);
        magentaGrad.addColorStop(0, "rgba(217, 70, 239, 0.85)");
        magentaGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.5)");
        magentaGrad.addColorStop(1, "rgba(217, 70, 239, 0.85)");

        ctx.fillStyle = magentaGrad;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barH / 2, barWidth, barH, 1.5);
        ctx.fill();
      }
    };

    if (!isPlaying && !isRecording) {
      // Resting animation
      let p = phaseRef.current;
      const renderIdle = () => {
        p += 0.04;
        phaseRef.current = p;
        drawResting(p);
        animationFrameRef.current = requestAnimationFrame(renderIdle);
      };
      renderIdle();
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }

    // Set up Web Audio API
    let audioCtx = audioContextRef.current;
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
      }
    }

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    let analyser = analyserRef.current;
    if (audioCtx && !analyser) {
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.78;
      analyserRef.current = analyser;
    }

    // Connect audio playback
    if (isPlaying && audioRef?.current && audioCtx && analyser && !sourceRef.current) {
      try {
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        sourceRef.current = source;
      } catch (e) {
        // Source might already be connected
      }
    }

    // Connect mic recording stream
    if (isRecording && stream && audioCtx && analyser && !streamSourceRef.current) {
      try {
        const streamSource = audioCtx.createMediaStreamSource(stream);
        streamSource.connect(analyser);
        streamSourceRef.current = streamSource;
      } catch (e) {
        // Stream connection fallback
      }
    }

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const renderActive = () => {
      ctx.clearRect(0, 0, width, canvasH);

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      // Draw glowing laser baseline
      const laserGrad = ctx.createLinearGradient(0, centerY, width, centerY);
      laserGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
      laserGrad.addColorStop(0.2, "rgba(56, 189, 248, 0.75)");
      laserGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.9)");
      laserGrad.addColorStop(0.8, "rgba(217, 70, 239, 0.75)");
      laserGrad.addColorStop(1, "rgba(217, 70, 239, 0)");

      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Left Channel: Cyan-Blue frequencies
      for (let i = 0; i < barsPerSide; i++) {
        const x = (width / 2) - centerGap - (i + 1) * step;
        if (x < 4) break;

        let val = 0;
        if (dataArray) {
          const binIndex = Math.min(dataArray.length - 1, Math.floor((i / barsPerSide) * dataArray.length * 0.75));
          val = dataArray[binIndex] || 0;
        } else {
          val = (Math.sin(Date.now() * 0.008 + i * 0.3) + 1) * 70;
        }

        const barH = Math.max(4, (val / 255) * (canvasH * 0.85));

        const cyanGrad = ctx.createLinearGradient(x, centerY - barH / 2, x, centerY + barH / 2);
        cyanGrad.addColorStop(0, "#38BDF8");
        cyanGrad.addColorStop(0.5, "#00D2FF");
        cyanGrad.addColorStop(1, "#38BDF8");

        ctx.fillStyle = cyanGrad;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barH / 2, barWidth, barH, 1.5);
        ctx.fill();
      }

      // Right Channel: Neon Violet-Magenta frequencies
      for (let i = 0; i < barsPerSide; i++) {
        const x = (width / 2) + centerGap + i * step;
        if (x > width - 4) break;

        let val = 0;
        if (dataArray) {
          const binIndex = Math.min(dataArray.length - 1, Math.floor((i / barsPerSide) * dataArray.length * 0.75));
          val = dataArray[binIndex] || 0;
        } else {
          val = (Math.cos(Date.now() * 0.008 + i * 0.3) + 1) * 70;
        }

        const barH = Math.max(4, (val / 255) * (canvasH * 0.85));

        const magentaGrad = ctx.createLinearGradient(x, centerY - barH / 2, x, centerY + barH / 2);
        magentaGrad.addColorStop(0, "#D946EF");
        magentaGrad.addColorStop(0.5, "#A855F7");
        magentaGrad.addColorStop(1, "#D946EF");

        ctx.fillStyle = magentaGrad;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barH / 2, barWidth, barH, 1.5);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(renderActive);
    };

    renderActive();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isRecording, stream, height, showMicBadge]);

  return (
    <div className={`relative w-full flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background Cyber Laser Horizon Line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none" />

      {/* HTML5 Canvas Waveform */}
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px`, width: "100%" }}
        className="block"
      />

      {/* Central Illuminated Microphone Badge (Matching STT Reference Image) */}
      {showMicBadge && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          {/* Outer Concentric Cyan/Violet Glow Ring */}
          <div className={`w-14 h-14 rounded-full border border-purple-400/40 flex items-center justify-center transition-all duration-300 ${
            isPlaying || isRecording
              ? "shadow-[0_0_25px_rgba(168,85,247,0.7),0_0_15px_rgba(56,189,248,0.5)] scale-105 border-cyan-400/60"
              : "shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          }`}>
            {/* Inner Dark Badge */}
            <div className="w-10 h-10 rounded-full bg-[#0A051D] border border-cyan-400/50 flex items-center justify-center shadow-inner">
              {isRecording ? (
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
              ) : isPlaying ? (
                <Waves className="w-5 h-5 text-cyan-300 animate-pulse" />
              ) : (
                <Mic className="w-5 h-5 text-purple-200" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Optional Status Label Badge */}
      {statusLabel && (
        <div className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/40 border border-purple-500/20 text-[10px] text-purple-300/80 font-mono">
          {statusLabel}
        </div>
      )}
    </div>
  );
}