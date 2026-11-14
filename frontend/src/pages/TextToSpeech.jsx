import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Play,
  Pause,
  Download,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FastForward,
  RotateCcw,
  Sliders,
  SlidersHorizontal,
  VolumeX,
  Volume1
} from "lucide-react";
import { synthesizeSpeech } from "../api";

export default function TextToSpeech({ addToast }) {
  const [text, setText] = useState(
    "வணக்கம்! ஞானி ஏஐயின் டிம்பர் குரல் உரை-ஒலி மாற்ற சோதனை வெற்றிகரமாக இயங்குகிறது."
  );
  const [voice, setVoice] = useState("Lakshmi");
  const [language, setLanguage] = useState("ta-IN");
  const [speed, setSpeed] = useState(1.0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState(null);

  // Audio player state
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioSize, setAudioSize] = useState(null);
  const audioRef = useRef(null);

  // Official Timbre v3.0 supported voices with persona details
  const supportedVoices = [
    { name: "Avinash", gender: "Male", desc: "Confident & Deep (Hindi / English / Indic)" },
    { name: "Lakshmi", gender: "Female", desc: "Expressive & Warm (Tamil / Indic)" },
    { name: "Shivani", gender: "Female", desc: "Professional & Melodic (English / Hindi / Indic)" },
    { name: "Shubham", gender: "Male", desc: "Energetic & Modern (Hindi / Indic)" },
    { name: "Kalpana", gender: "Female", desc: "Clear & Articulate (Indic / English)" },
    { name: "Prakash", gender: "Male", desc: "Authoritative & Formal (Indic / Tamil)" },
    { name: "Devansh", gender: "Male", desc: "Conversational & Natural (Hindi / Indic)" },
    { name: "Yashraj", gender: "Male", desc: "Dynamic & Resonant (English / Hindi / Indic)" },
    { name: "Chetana", gender: "Female", desc: "Friendly & Enthusiastic (English / Indic)" },
    { name: "Vasudha", gender: "Female", desc: "Gentle & Calm (Indic)" },
    { name: "Harshad", gender: "Male", desc: "Corporate & Crisp (Indic)" },
    { name: "Riyaa", gender: "Female", desc: "Youthful & Bright (Indic)" },
    { name: "Tarika", gender: "Female", desc: "Smooth & Engaging (Tamil / Indic)" },
  ];

  const supportedLanguages = [
    { code: "ta-IN", label: "Tamil (தமிழ்)" },
    { code: "hi-IN", label: "Hindi (हिन्दी)" },
    { code: "en-IN", label: "Indian English" },
    { code: "kn-IN", label: "Kannada (ಕನ್ನಡ)" },
    { code: "te-IN", label: "Telugu (తెలుగు)" },
    { code: "mr-IN", label: "Marathi (मराठी)" },
  ];

  const sampleTexts = [
    {
      label: "Hindi Sample",
      lang: "hi-IN",
      voice: "Avinash",
      text: "नमस्ते, आप कैसे हैं?",
    },
    {
      label: "Indian English",
      lang: "en-IN",
      voice: "Shivani",
      text: "Hello, welcome to Gnani AI.",
    },
    {
      label: "Tamil Greeting",
      lang: "ta-IN",
      voice: "Lakshmi",
      text: "வணக்கம், நலமாக இருக்கிறீர்களா?",
    },
  ];

  // Script auto-detector
  const detectScriptLanguage = (input) => {
    if (!input) return null;
    for (let ch of input) {
      const code = ch.charCodeAt(0);
      if (code >= 0x0900 && code <= 0x097F) return "hi-IN";
      if (code >= 0x0B80 && code <= 0x0BFF) return "ta-IN";
      if (code >= 0x0C00 && code <= 0x0C7F) return "te-IN";
      if (code >= 0x0C80 && code <= 0x0CFF) return "kn-IN";
      if (code >= 0x0D00 && code <= 0x0D7F) return "ml-IN";
      if (code >= 0x0980 && code <= 0x09FF) return "bn-IN";
      if (code >= 0x0A80 && code <= 0x0AFF) return "gu-IN";
    }
    const latinChars = (input.match(/[a-zA-Z]/g) || []).length;
    if (latinChars >= 5) return "en-IN";
    return null;
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    const autoLang = detectScriptLanguage(val);
    if (autoLang && autoLang !== language) {
      setLanguage(autoLang);
      if (autoLang === "hi-IN" && voice === "Lakshmi") {
        setVoice("Avinash");
      } else if (autoLang === "en-IN" && voice === "Lakshmi") {
        setVoice("Shivani");
      } else if (autoLang === "ta-IN" && (voice === "Avinash" || voice === "Shivani")) {
        setVoice("Lakshmi");
      }
    }
  };

  // Cleanup object URL when component unmounts or audio changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter text to synthesize.");
      return;
    }

    setIsSynthesizing(true);
    setError(null);
    setIsPlaying(false);

    try {
      const blob = await synthesizeSpeech(text.trim(), voice, language, speed);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      const newUrl = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(newUrl);
      setAudioSize(blob.size);
      setCurrentTime(0);

      addToast({
        type: "success",
        title: "Speech Synthesized",
        message: `Generated with voice '${voice}' (${(blob.size / 1024).toFixed(1)} KB).`,
      });
    } catch (err) {
      const msg = err.message || "Failed to synthesize speech.";
      setError(msg);
      addToast({
        type: "error",
        title: "TTS Failed",
        message: msg,
      });
    } finally {
      setIsSynthesizing(false);
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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleDownload = () => {
    if (!audioBlob) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `gnani_speech_${voice.toLowerCase()}_${Date.now()}.wav`;
    a.click();
    addToast({
      type: "info",
      title: "Audio Downloaded",
      message: "Saved 48 kHz studio WAV file to your device.",
    });
  };

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Volume2 className="w-6 h-6 text-cyan-400" />
            <span>Text-to-Speech Studio</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Convert text into expressive, natural voice audio using Gnani Timbre v3.0.
          </p>
        </div>

        {/* Model Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-xs font-semibold text-cyan-300 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Model: timbre-v3.0</span>
        </div>
      </div>

      {/* MAIN EDITOR & SYNTHESIS PANEL */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        {/* Sample text quick pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Preset Samples:</span>
          {sampleTexts.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setText(sample.text);
                setLanguage(sample.lang);
                setVoice(sample.voice);
              }}
              className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] shrink-0 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* TEXT INPUT AREA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300">Input Script</label>
            <span
              className={`font-mono ${
                text.length > 4500 ? "text-amber-400" : "text-slate-400"
              }`}
            >
              {text.length} / 5,000 characters
            </span>
          </div>

          <textarea
            value={text}
            onChange={handleTextChange}
            maxLength={5000}
            rows={5}
            disabled={isSynthesizing}
            placeholder="Type or paste the text you want Gnani AI to synthesize..."
            className="w-full p-4 rounded-xl glass-input text-base text-slate-100 placeholder:text-slate-500 resize-y leading-relaxed"
          />
        </div>

        {/* CONTROLS GRID: VOICE, LANGUAGE, SPEED */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
          {/* Voice Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Voice Persona</span>
              <span className="text-[11px] text-cyan-400 font-normal">13 Indian Voices</span>
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              disabled={isSynthesizing}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
            >
              {supportedVoices.map((v) => (
                <option key={v.name} value={v.name} className="bg-navy-900 text-white">
                  {v.name} ({v.gender}) — {v.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isSynthesizing}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code} className="bg-navy-900 text-white">
                  {l.label} ({l.code})
                </option>
              ))}
            </select>
          </div>

          {/* Speed Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">Synthesis Speed (Timbre Engine)</label>
              <span className="text-cyan-400 font-mono font-semibold">{speed.toFixed(2)}x</span>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                disabled={isSynthesizing}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* GENERATE SPEECH BUTTON */}
        <div className="pt-2">
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || isSynthesizing}
            className={`w-full flex items-center justify-center space-x-2.5 py-3 px-6 rounded-xl font-semibold text-sm transition-all shadow-glow-cyan ${
              !text.trim() || isSynthesizing
                ? "bg-white/[0.06] text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white active:scale-[0.99]"
            }`}
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Voice with Timbre v3.0...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Generate Speech</span>
              </>
            )}
          </button>
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

      {/* SYNTHESIZED AUDIO PLAYER CARD */}
      <AnimatePresence>
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/[0.06] gap-3">
              <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Synthesized Speech Output</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold border border-cyan-400/30 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download WAV (48 kHz)</span>
                </button>
              </div>
            </div>

            {/* Hidden HTML5 Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />

            {/* CUSTOM PLAYER INTERFACE */}
            <div className="p-6 rounded-2xl bg-navy-950/80 border border-white/[0.06] space-y-5">
              {/* Waveform Visualization Bars */}
              <div className="flex items-center justify-center space-x-1 h-12 px-4">
                {[...Array(32)].map((_, i) => {
                  const barHeights = [20, 35, 60, 80, 45, 90, 70, 30, 85, 100, 60, 40, 75, 95, 55, 30, 65, 85, 45, 95, 75, 40, 60, 90, 50, 30, 80, 70, 45, 90, 60, 30];
                  const height = barHeights[i % barHeights.length];
                  return (
                    <motion.span
                      key={i}
                      animate={isPlaying ? { scaleY: [0.3, 1, 0.4] } : { scaleY: 0.3 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8 + (i % 5) * 0.15,
                        ease: "easeInOut",
                        delay: (i % 8) * 0.08,
                      }}
                      style={{ height: `${height}%` }}
                      className={`w-1 rounded-full transition-colors ${
                        (currentTime / (duration || 1)) * 32 > i
                          ? "bg-gradient-to-t from-cyan-400 to-violet-400 shadow-[0_0_8px_#38BDF8]"
                          : "bg-white/[0.12]"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.05"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/[0.1] rounded-lg"
                />

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-0.5">
                  <span>{formatSeconds(currentTime)}</span>
                  <span>{formatSeconds(duration)}</span>
                </div>
              </div>

              {/* Player Controls Strip */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] font-medium text-slate-300">
                    Voice: <strong className="text-white">{voice}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] font-medium text-slate-300">
                    Sample Rate: <strong className="text-white">48,000 Hz</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        setCurrentTime(0);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    title="Restart"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white flex items-center justify-center shadow-glow-cyan active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
