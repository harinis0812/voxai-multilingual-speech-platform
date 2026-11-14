import React, { useEffect, useRef } from "react";

/**
 * AudioWaveform Component:
 * Reflects actual audio playback activity or live recording using Web Audio API and HTML5 Canvas.
 * Renders a clean resting baseline when idle, avoiding permanent fake loops.
 */
export default function AudioWaveform({
  audioRef,
  isPlaying = false,
  isRecording = false,
  stream = null,
  height = 56,
  barColor = "#C084FC",
  activeBarColor = "#A855F7",
  className = ""
}) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamSourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize or connect Web Audio API
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Number of bars to draw
    const barCount = 48;
    const barWidth = 3;
    const barGap = 3;

    // Draw idle / resting baseline
    const drawResting = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const totalWidth = barCount * (barWidth + barGap);
      const startX = (canvas.width - totalWidth) / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + barGap);
        // Subtle resting sine-envelope height
        const envelope = Math.sin((i / barCount) * Math.PI);
        const barH = Math.max(3, envelope * 10);
        ctx.fillStyle = "rgba(168, 85, 247, 0.25)";
        ctx.beginPath();
        ctx.roundRect(x, centerY - barH / 2, barWidth, barH, 2);
        ctx.fill();
      }
    };

    if (!isPlaying && !isRecording) {
      drawResting();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Set up AudioContext if playing or recording
    let audioCtx = audioContextRef.current;
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
      }
    }

    if (!audioCtx) {
      drawResting();
      return;
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    let analyser = analyserRef.current;
    if (!analyser) {
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
    }

    // Connect audio playback element
    if (isPlaying && audioRef?.current && !sourceRef.current) {
      try {
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        sourceRef.current = source;
      } catch (e) {
        // Source might already be connected in some browsers
      }
    }

    // Connect recording microphone stream
    if (isRecording && stream && !streamSourceRef.current) {
      try {
        const streamSource = audioCtx.createMediaStreamSource(stream);
        streamSource.connect(analyser);
        streamSourceRef.current = streamSource;
      } catch (e) {
        console.warn("Failed to connect microphone stream to analyser:", e);
      }
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const totalWidth = barCount * (barWidth + barGap);
      const startX = (canvas.width - totalWidth) / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + barGap);
        const dataIdx = Math.floor((i / barCount) * dataArray.length);
        const val = dataArray[dataIdx] || 0;
        const normalized = val / 255;
        const envelope = Math.sin((i / barCount) * Math.PI);
        const maxH = canvas.height * 0.9;
        const barH = Math.max(4, normalized * maxH * (0.4 + 0.6 * envelope));

        // Create glowing vertical gradient
        const grad = ctx.createLinearGradient(0, centerY - barH / 2, 0, centerY + barH / 2);
        grad.addColorStop(0, "#C084FC");
        grad.addColorStop(0.5, "#A855F7");
        grad.addColorStop(1, "#6366F1");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barH / 2, barWidth, barH, 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isRecording, stream, audioRef]);

  // Clean up stream source when recording stops
  useEffect(() => {
    if (!isRecording && streamSourceRef.current) {
      try {
        streamSourceRef.current.disconnect();
      } catch (e) {}
      streamSourceRef.current = null;
    }
  }, [isRecording]);

  return (
    <div className={`relative flex items-center justify-center w-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={340}
        height={height}
        className="max-w-full"
      />
    </div>
  );
}
