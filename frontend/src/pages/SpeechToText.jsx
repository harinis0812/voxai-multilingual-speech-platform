import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Mic,
  MicOff,
  FileAudio,
  Play,
  Pause,
  Copy,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Radio,
  Volume2
} from "lucide-react";
import { transcribeAudio } from "../api";
import BipolarWaveform from "../components/BipolarWaveform";

export default function SpeechToText({ addToast }) {
  const [file, setFile] = useState(null);
  const [fileDuration, setFileDuration] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState("indic-auto");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Audio preview player state
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Microphone recording state
  const [activeInputTab, setActiveInputTab] = useState("upload"); // "upload" | "record"
  const [recordingState, setRecordingState] = useState("idle"); // "idle" | "requesting" | "recording" | "stopped"
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const supportedLanguages = [
    { code: "indic-auto", label: "Auto-Detect Language", native: "indic-auto (Recommended)" },
    { code: "hi-IN", label: "Hindi", native: "हिन्दी" },
    { code: "ml-IN", label: "Malayalam", native: "മലയാളം" },
    { code: "ta-IN", label: "Tamil", native: "தமிழ்" },
    { code: "en-IN", label: "Indian English", native: "English" },
    { code: "kn-IN", label: "Kannada", native: "ಕನ್ನಡ" },
    { code: "te-IN", label: "Telugu", native: "తెలుగు" },
    { code: "mr-IN", label: "Marathi", native: "मराठी" },
  ];

  // Clean up recording stream & audio URLs on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Handle selected file and read duration via HTML5 Audio
  const processSelectedFile = (selectedFile) => {
    if (!selectedFile) return;

    setError(null);
    setResult(null);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setAudioUrl(objectUrl);

    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && isFinite(tempAudio.duration)) {
        setFileDuration(tempAudio.duration);
        if (tempAudio.duration > 30.0) {
          setError(
            `Audio duration is ${tempAudio.duration.toFixed(1)}s. Gnani AI short-clip REST API enforces a maximum limit of 30.0 seconds.`
          );
        }
      } else {
        setFileDuration(null);
      }
    };
    tempAudio.onerror = () => {
      setFileDuration(null);
    };
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleClear = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setFile(null);
    setAudioUrl(null);
    setFileDuration(null);
    setResult(null);
    setError(null);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (recordingState === "recording") {
      stopRecording();
    }
    setRecordingState("idle");
    setRecordingSeconds(0);
  };

  // Start microphone recording using standard browser MediaStream & MediaRecorder
  const startRecording = async () => {
    setError(null);
    setRecordingState("requesting");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;

      // Select mime type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/ogg";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const recordedFile = new File([audioBlob], `mic_recording_${Date.now()}.webm`, {
          type: mimeType,
        });
        processSelectedFile(recordedFile);
        setRecordingState("stopped");
        if (recordingStreamRef.current) {
          recordingStreamRef.current.getTracks().forEach((t) => t.stop());
          recordingStreamRef.current = null;
        }
      };

      mediaRecorder.start(250);
      setRecordingState("recording");
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

      addToast({
        type: "info",
        title: "Microphone Active",
        message: "Recording started. Speak into your microphone (max 30s).",
      });
    } catch (err) {
      setRecordingState("idle");
      setError(
        "Microphone access denied or not available. Please allow microphone permissions in your browser."
      );
      addToast({
        type: "error",
        title: "Microphone Error",
        message: "Could not access microphone.",
      });
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload an audio file or record speech first.");
      return;
    }

    if (fileDuration && fileDuration > 30.0) {
      setError(
        `Audio duration (${fileDuration.toFixed(1)}s) exceeds the maximum limit of 30.0 seconds.`
      );
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const data = await transcribeAudio(file, language);
      setResult(data);
      addToast({
        type: "success",
        title: "Transcription Complete",
        message: "Audio successfully transcribed via Prisma v3.0.",
      });
    } catch (err) {
      const msg = err.message || "Failed to transcribe audio.";
      setError(msg);
      addToast({
        type: "error",
        title: "Transcription Failed",
        message: msg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.transcript) return;
    navigator.clipboard.writeText(result.transcript);
    addToast({
      type: "info",
      title: "Copied to Clipboard",
      message: "Transcript text copied.",
    });
  };

  const downloadTranscript = () => {
    if (!result?.transcript) return;
    const blob = new Blob([result.transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voxai_transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: "info",
      title: "Downloaded",
      message: "Transcript saved as .txt file.",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-2">
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Neural Speech Recognition</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <span>Speech-to-Text Studio</span>
          </h2>
          <p className="text-sm text-purple-200/70 mt-1 max-w-2xl">
            Transcribe Indian speech, multilingual dialogues, and mixed dialects with acoustic precision using Gnani Prisma v3.0.
          </p>
        </div>

        {/* Model Specs Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#140C2E] border border-purple-500/30 text-xs font-semibold text-purple-200 shrink-0 shadow-glow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Model: prisma-v3.0</span>
        </div>
      </div>

      {/* MAIN WORKSPACE CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl space-y-6">
        {/* INPUT MODE SWITCHER TABS */}
        <div className="flex items-center space-x-3 border-b border-purple-500/15 pb-4">
          <button
            type="button"
            onClick={() => setActiveInputTab("upload")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeInputTab === "upload"
                ? "bg-purple-600/30 text-white border border-purple-400/40 shadow-glow-sm"
                : "text-purple-300/70 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Upload Audio File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputTab("record")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeInputTab === "record"
                ? "bg-purple-600/30 text-white border border-purple-400/40 shadow-glow-sm"
                : "text-purple-300/70 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Mic className="w-4 h-4 text-purple-400" />
            <span>Record with Microphone</span>
          </button>
        </div>

        {/* TAB 1: FILE UPLOAD ZONE */}
        {activeInputTab === "upload" && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? "border-purple-400 bg-purple-600/15 scale-[1.01] shadow-glow-sm"
                : file
                ? "border-emerald-500/40 bg-[#0E0824]/90"
                : "border-purple-500/25 bg-[#0A061C]/60 hover:border-purple-400/50 hover:bg-purple-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.wav,.mp3,.ogg,.m4a"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <div className="flex flex-col items-center justify-center space-y-3.5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 via-violet-600/20 to-indigo-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-glow-sm">
                  <Upload className="w-7 h-7 text-purple-300 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    Drag and drop your audio clip here, or{" "}
                    <span className="text-purple-400 underline underline-offset-4 font-bold">browse your computer</span>
                  </p>
                  <p className="text-xs text-purple-200/60">
                    Supports WAV, MP3, OGG, M4A • Maximum duration: 30.0 seconds
                  </p>
                </div>

                <div className="inline-flex items-center space-x-2 text-[11px] text-purple-300/80 bg-purple-950/40 px-3.5 py-1 rounded-full border border-purple-500/20">
                  <span>Tested with</span>
                  <code className="text-purple-300 font-mono font-bold">recording.wav</code>
                  <span>& native regional samples</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-glow-sm">
                    <FileAudio className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-purple-200/70">
                      <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{file.type || "audio/wav"}</span>
                      {fileDuration !== null && (
                        <>
                          <span>•</span>
                          <span
                            className={`font-semibold ${
                              fileDuration > 30.0 ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {fileDuration.toFixed(2)}s {fileDuration > 30.0 ? "(Over 30s limit!)" : "(Valid)"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Action Controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  {audioUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlay();
                      }}
                      className="p-3 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 hover:text-white transition-all border border-purple-500/30 shadow-glow-sm"
                      title={isPlaying ? "Pause audio" : "Play preview"}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 text-purple-300" /> : <Play className="w-4 h-4 text-purple-300 ml-0.5" />}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 transition-colors border border-rose-500/20"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE MICROPHONE RECORDING */}
        {activeInputTab === "record" && (
          <div className="p-8 sm:p-10 rounded-2xl bg-[#0A061C]/80 border border-purple-500/20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              {recordingState === "recording" && (
                <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
              )}
              <button
                type="button"
                onClick={recordingState === "recording" ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-glow-md active:scale-95 ${
                  recordingState === "recording"
                    ? "bg-rose-600 text-white border-2 border-rose-400"
                    : "bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-2 border-purple-400/50"
                }`}
              >
                {recordingState === "recording" ? (
                  <MicOff className="w-8 h-8 animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                {recordingState === "idle" && "Click to Start Recording"}
                {recordingState === "requesting" && "Requesting Microphone Access..."}
                {recordingState === "recording" && "Recording in Progress..."}
                {recordingState === "stopped" && "Recording Stopped & Audio Attached"}
              </h4>
              <p className="text-xs text-purple-200/70">
                {recordingState === "recording"
                  ? `Recording time: ${recordingSeconds}s / 30s`
                  : "Maximum clip length is 30.0 seconds."}
              </p>
            </div>

            {/* Live recording timer progress */}
            {recordingState === "recording" && (
              <div className="w-full max-w-md space-y-3">
                <div className="w-full bg-purple-950/60 rounded-full h-2 overflow-hidden border border-purple-500/30">
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${(recordingSeconds / 30) * 100}%` }}
                  />
                </div>

                {/* Live Mic Bipolar Waveform */}
                <div className="p-3 rounded-2xl bg-[#070314]/90 border border-purple-500/25">
                  <BipolarWaveform
                    isRecording={true}
                    stream={recordingStreamRef.current}
                    height={80}
                    showMicBadge={true}
                    statusLabel="Live Mic Analyser"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* CYBERNETIC AUDIO CONSOLE & BIPOLAR WAVEFORM (Matching STT Reference Image) */}
        {audioUrl && (
          <div className="p-5 sm:p-6 rounded-3xl bg-[#080418]/95 border border-purple-500/25 space-y-4 shadow-2xl relative overflow-hidden">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between text-xs text-purple-200/80 px-1 border-b border-purple-500/15 pb-3">
              <span className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? "bg-cyan-400 opacity-75" : "bg-purple-400 opacity-40"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? "bg-cyan-400 shadow-[0_0_8px_#00D2FF]" : "bg-purple-400"}`}></span>
                </span>
                <span className="font-semibold text-white">Prisma Cybernetic Audio Console</span>
                <span className="text-purple-400/60 font-mono text-[11px] hidden sm:inline">• 48 kHz Linear PCM</span>
              </span>
              <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-500/25">
                {isPlaying ? "Playback Active" : "Acoustic Baseline Ready"}
              </span>
            </div>

            {/* Central Bipolar Waveform Display */}
            <div className="py-2">
              <BipolarWaveform
                audioRef={audioRef}
                isPlaying={isPlaying}
                height={100}
                showMicBadge={true}
                statusLabel="Bipolar ASR Spectrum"
              />
            </div>

            {/* Bottom Telemetry HUD Module Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0E0826]/90 border border-purple-500/20 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-cyan-300/80">Container</span>
                <span className="text-white font-mono font-semibold mt-0.5">WAV Audio</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0E0826]/90 border border-purple-500/20 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-cyan-300/80">Sample Rate</span>
                <span className="text-white font-mono font-semibold mt-0.5">48,000 Hz</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0E0826]/90 border border-purple-500/20 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-purple-300/80">Channel</span>
                <span className="text-white font-mono font-semibold mt-0.5">Mono (1.0)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0E0826]/90 border border-purple-500/20 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-purple-300/80">Duration</span>
                <span className={`font-mono font-semibold mt-0.5 ${fileDuration && fileDuration > 30.0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {fileDuration ? `${fileDuration.toFixed(2)}s / 30s` : "Calculating..."}
                </span>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}

        {/* CONTROLS: LANGUAGE SELECTION & TRANSCRIBE BUTTON */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-1 space-y-1.5">
            <label className="text-xs font-bold text-purple-200 uppercase tracking-wider">
              Speech Recognition Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer border border-purple-500/25 focus:border-purple-400"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#0B0720] text-purple-100">
                  {lang.label} ({lang.native})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={handleSubmit}
              disabled={!file || isProcessing || (fileDuration && fileDuration > 30.0)}
              className={`w-full flex items-center justify-center space-x-2.5 py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-glow-sm ${
                !file || isProcessing || (fileDuration && fileDuration > 30.0)
                  ? "bg-white/[0.05] text-purple-300/40 border border-white/[0.06] cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 shadow-glow-md hover:shadow-glow-lg active:scale-[0.99]"
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Transcribing with Prisma v3.0...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Transcribe Audio with Prisma</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ERROR DISPLAY BANNER */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3 leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-rose-200">Validation / Service Notice: </span>
              {error}
            </div>
          </motion.div>
        )}
      </div>

      {/* TRANSCRIPTION RESULT CARD */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-purple-500/15 gap-3">
              <div className="flex items-center space-x-2.5 text-base font-bold text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Prisma v3.0 Transcription</span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 border border-purple-500/25 text-xs font-semibold text-purple-200 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span>Copy Text</span>
                </button>

                <button
                  onClick={downloadTranscript}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 border border-purple-500/25 text-xs font-semibold text-purple-200 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            {/* Transcript Text Container */}
            <div className="p-6 rounded-2xl bg-[#080418]/90 border border-purple-500/20 shadow-inner">
              <p className="text-lg sm:text-xl text-[#F1ECFF] font-normal leading-relaxed whitespace-pre-wrap select-text font-sans">
                {result.transcript || <span className="text-purple-300/40 italic">No audible speech detected in clip.</span>}
              </p>
            </div>

            {/* 1. Successful Auto-Detection Banner */}
            {result.detected_language_code && (result.requested_language_code === "indic-auto" || language === "indic-auto") && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <span className="font-bold text-emerald-100">Auto-Detection Successful: </span>
                  Prisma v3.0 automatically identified the spoken language as <strong className="text-white font-mono">{result.detected_language_code}</strong>.
                </div>
              </div>
            )}

            {/* 2. Acoustic Language Mismatch Warning */}
            {result.detected_language_code &&
              (result.requested_language_code || language) !== "indic-auto" &&
              result.detected_language_code !== (result.requested_language_code || language) && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold text-amber-100">Acoustic Language Mismatch: </span>
                  Audio was acoustically classified as <strong className="text-white font-mono">{result.detected_language_code}</strong> (requested: <strong className="text-white font-mono">{result.requested_language_code || language}</strong>). Prisma v3.0 transcribed according to the actual spoken speech.
                </div>
              </div>
            )}

            {/* METADATA STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0D0722] border border-purple-500/20">
                <span className="text-purple-300/60 block text-[11px] font-semibold">Requested Language</span>
                <span className="font-bold text-purple-100 font-mono mt-1 block truncate">
                  {result.requested_language_code || language}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0722] border border-purple-500/20">
                <span className="text-purple-300/60 block text-[11px] font-semibold">Detected Language</span>
                <span className="font-bold text-purple-300 font-mono mt-1 block truncate">
                  {result.detected_language_code || language}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0722] border border-purple-500/20">
                <span className="text-purple-300/60 block text-[11px] font-semibold">Model</span>
                <span className="font-bold text-purple-100 font-mono mt-1 block truncate">
                  {result.model || "prisma-v3.0"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0722] border border-purple-500/20">
                <span className="text-purple-300/60 block text-[11px] font-semibold">Processing Time</span>
                <span className="font-bold text-emerald-400 font-mono mt-1 block">
                  {result.processing_time !== null && result.processing_time !== undefined
                    ? `${Number(result.processing_time).toFixed(2)}s`
                    : "N/A"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0722] border border-purple-500/20">
                <span className="text-purple-300/60 block text-[11px] font-semibold">End-to-End Latency</span>
                <span className="font-bold text-cyan-400 font-mono mt-1 block">
                  {result.end_to_end_latency !== null && result.end_to_end_latency !== undefined
                    ? `${Number(result.end_to_end_latency).toFixed(2)}s`
                    : "N/A"}
                </span>
              </div>
            </div>

            {result.request_id && (
              <div className="text-[11px] text-purple-300/50 font-mono text-right truncate">
                Request ID: {result.request_id}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
