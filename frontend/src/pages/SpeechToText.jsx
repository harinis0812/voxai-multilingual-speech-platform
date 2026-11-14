import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Mic,
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
  RefreshCw
} from "lucide-react";
import { transcribeAudio } from "../api";

export default function SpeechToText({ addToast }) {
  const [file, setFile] = useState(null);
  const [fileDuration, setFileDuration] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState("ta-IN");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Audio preview player state
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const supportedLanguages = [
    { code: "indic-auto", label: "Auto-Detect Language (indic-auto - Recommended)" },
    { code: "ta-IN", label: "Tamil (தமிழ்)" },
    { code: "hi-IN", label: "Hindi (हिन्दी)" },
    { code: "en-IN", label: "Indian English" },
    { code: "kn-IN", label: "Kannada (ಕನ್ನಡ)" },
    { code: "te-IN", label: "Telugu (తెలుగు)" },
    { code: "mr-IN", label: "Marathi (मराठी)" },
  ];

  // Handle selected file and read duration via HTML5 Audio
  const processSelectedFile = (selectedFile) => {
    if (!selectedFile) return;

    setError(null);
    setResult(null);

    // Revoke previous audio preview URL if existing
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setFile(selectedFile);

    // Create object URL for audio preview & duration inspection
    const objectUrl = URL.createObjectURL(selectedFile);
    setAudioUrl(objectUrl);

    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && isFinite(tempAudio.duration)) {
        setFileDuration(tempAudio.duration);
        if (tempAudio.duration > 30.0) {
          setError(
            `Audio duration is ${tempAudio.duration.toFixed(1)}s. Gnani AI short-clip REST API enforces a maximum of 30 seconds.`
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
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select or drop an audio file first.");
      return;
    }

    if (fileDuration && fileDuration > 30.0) {
      setError(
        `Audio duration (${fileDuration.toFixed(1)}s) exceeds the maximum limit of 30 seconds.`
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
        message: "Audio successfully transcribed using Prisma v3.0.",
      });
    } catch (err) {
      const msg = err.message || "Failed to transcribe audio.";
      setError(msg);
      addToast({
        type: "error",
        title: "STT Failed",
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
      title: "Copied",
      message: "Transcript copied to clipboard.",
    });
  };

  const downloadTranscript = () => {
    if (!result?.transcript) return;
    const blob = new Blob([result.transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: "info",
      title: "Downloaded",
      message: "Transcript saved as text file.",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Mic className="w-6 h-6 text-violet-400" />
            <span>Speech-to-Text Studio</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Transcribe Indian speech and multilingual recordings using Gnani Prisma v3.0.
          </p>
        </div>

        {/* Model Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-violet-600/15 border border-violet-500/30 text-xs font-semibold text-violet-300 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Model: prisma-v3.0</span>
        </div>
      </div>

      {/* MAIN CARD: UPLOAD & CONFIGURATION */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        {/* DRAG & DROP ZONE */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? "border-violet-500 bg-violet-600/10 scale-[1.01]"
              : file
              ? "border-emerald-500/40 bg-emerald-500/[0.03]"
              : "border-white/[0.12] hover:border-violet-500/40 hover:bg-white/[0.02]"
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
              <div className="w-14 h-14 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-300 shadow-glow-sm">
                <Upload className="w-6 h-6 animate-bounce" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Drag and drop your audio recording here, or{" "}
                  <span className="text-violet-400 underline underline-offset-2">browse files</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports WAV, MP3, OGG, M4A • Maximum duration: 30 seconds
                </p>
              </div>

              {/* Sample indicator */}
              <div className="inline-flex items-center space-x-2 text-[11px] text-slate-400 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
                <span>Tip: You can use the project's</span>
                <code className="text-violet-300 font-mono">recording.wav</code>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{file.type || "audio/wav"}</span>
                    {fileDuration !== null && (
                      <>
                        <span>•</span>
                        <span
                          className={`font-semibold ${
                            fileDuration > 30 ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {fileDuration.toFixed(2)}s {fileDuration > 30 ? "(Over 30s limit!)" : "(Valid)"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons on file card */}
              <div className="flex items-center space-x-2 shrink-0">
                {audioUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay();
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white transition-colors"
                    title={isPlaying ? "Pause" : "Play preview"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-violet-400" /> : <Play className="w-4 h-4 text-violet-400" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Audio Player for Preview */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* CONTROLS ROW: LANGUAGE SELECTION & TRANSCRIBE BUTTON */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-navy-900 text-white">
                  {lang.label} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={handleSubmit}
              disabled={!file || isProcessing || (fileDuration && fileDuration > 30.0)}
              className={`w-full flex items-center justify-center space-x-2.5 py-2.5 px-6 rounded-xl font-semibold text-sm transition-all shadow-glow-sm ${
                !file || isProcessing || (fileDuration && fileDuration > 30.0)
                  ? "bg-white/[0.06] text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white active:scale-[0.99]"
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
                  <span>Transcribe Audio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-3 leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-rose-200">Error: </span>
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
            className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/[0.06] gap-3">
              <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Transcription Result</span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-violet-400" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={downloadTranscript}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            {/* Transcript text box */}
            <div className="p-5 rounded-xl bg-navy-950/70 border border-white/[0.06]">
              <p className="text-base sm:text-lg text-slate-100 font-normal leading-relaxed whitespace-pre-wrap select-text">
                {result.transcript || <span className="text-slate-500 italic">No speech detected in audio clip.</span>}
              </p>
            </div>

            {/* Language mismatch notice if acoustic detector differs from user selection */}
            {result.detected_language_code && result.detected_language_code !== (result.requested_language_code || language) && (
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-semibold">Acoustic Language Mismatch: </span>
                  Audio was acoustically classified as <strong>{result.detected_language_code}</strong> (requested: <strong>{result.requested_language_code || language}</strong>). Prisma v3.0 transcribed according to the actual spoken speech.
                </div>
              </div>
            )}

            {/* Metadata strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-slate-500 block text-[11px]">Detected Language</span>
                <span className="font-semibold text-violet-300 font-mono mt-0.5 block">
                  {result.detected_language_code || language}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-slate-500 block text-[11px]">Model</span>
                <span className="font-semibold text-slate-200 font-mono mt-0.5 block">
                  {result.model || "prisma-v3.0"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-slate-500 block text-[11px]">Processing Time</span>
                <span className="font-semibold text-emerald-400 font-mono mt-0.5 block">
                  {result.processing_time !== null && result.processing_time !== undefined
                    ? `${Number(result.processing_time).toFixed(2)}s`
                    : "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-slate-500 block text-[11px]">End-to-End Latency</span>
                <span className="font-semibold text-cyan-400 font-mono mt-0.5 block">
                  {result.end_to_end_latency !== null && result.end_to_end_latency !== undefined
                    ? `${Number(result.end_to_end_latency).toFixed(2)}s`
                    : "N/A"}
                </span>
              </div>
            </div>

            {result.request_id && (
              <div className="text-[11px] text-slate-500 font-mono text-right truncate">
                Request ID: {result.request_id}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
