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
  RotateCcw,
  SlidersHorizontal,
  FileAudio
} from "lucide-react";
import { synthesizeSpeech } from "../api";
import AudioWaveform from "../components/AudioWaveform";

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

  // Official Timbre v3.0 supported voices with persona details and verified language compatibility
  const supportedVoices = [
    { name: "Avinash", gender: "Male", desc: "Confident & Deep (Hindi / English / Indic)", langs: ["hi-IN", "en-IN", "ta-IN", "ml-IN"] },
    { name: "Lakshmi", gender: "Female", desc: "Expressive & Warm (Tamil / Malayalam / Indic)", langs: ["ta-IN", "ml-IN", "hi-IN", "en-IN"] },
    { name: "Shivani", gender: "Female", desc: "Professional & Melodic (English / Hindi / Indic)", langs: ["en-IN", "hi-IN", "ta-IN"] },
    { name: "Shubham", gender: "Male", desc: "Energetic & Modern (Hindi / Indic)", langs: ["hi-IN", "en-IN", "ta-IN"] },
    { name: "Kalpana", gender: "Female", desc: "Clear & Articulate (Indic / Malayalam / English)", langs: ["ml-IN", "ta-IN", "hi-IN", "en-IN"] },
    { name: "Prakash", gender: "Male", desc: "Authoritative & Formal (Indic / Tamil / Malayalam)", langs: ["ml-IN", "ta-IN", "hi-IN", "en-IN"] },
    { name: "Devansh", gender: "Male", desc: "Conversational & Natural (Hindi / Malayalam / Indic)", langs: ["ml-IN", "hi-IN", "ta-IN", "en-IN"] },
    { name: "Yashraj", gender: "Male", desc: "Dynamic & Resonant (English / Malayalam / Indic)", langs: ["ml-IN", "en-IN", "hi-IN", "ta-IN"] },
    { name: "Chetana", gender: "Female", desc: "Friendly & Enthusiastic (English / Malayalam / Indic)", langs: ["ml-IN", "en-IN", "hi-IN", "ta-IN"] },
    { name: "Vasudha", gender: "Female", desc: "Gentle & Calm (Malayalam / Indic)", langs: ["ml-IN", "hi-IN", "ta-IN", "en-IN"] },
    { name: "Harshad", gender: "Male", desc: "Corporate & Crisp (Indic)", langs: ["hi-IN", "en-IN", "ta-IN"] },
    { name: "Riyaa", gender: "Female", desc: "Youthful & Bright (Malayalam / Indic)", langs: ["ml-IN", "hi-IN", "ta-IN", "en-IN"] },
    { name: "Tarika", gender: "Female", desc: "Smooth & Engaging (Tamil / Malayalam / Indic)", langs: ["ml-IN", "ta-IN", "hi-IN", "en-IN"] },
  ];

  const supportedLanguages = [
    { code: "hi-IN", label: "Hindi (हिन्दी)" },
    { code: "ml-IN", label: "Malayalam (മലയാളം)" },
    { code: "ta-IN", label: "Tamil (தமிழ்)" },
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
      label: "Malayalam Sample",
      lang: "ml-IN",
      voice: "Lakshmi",
      text: "നമസ്കാരം, സുഖമാണോ?",
    },
    {
      label: "Indian English",
      lang: "en-IN",
      voice: "Shivani",
      text: "Hello, welcome to VoxAI voice platform.",
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
      if (code >= 0x0D00 && code <= 0x0D7F) return "ml-IN";
      if (code >= 0x0B80 && code <= 0x0BFF) return "ta-IN";
      if (code >= 0x0C00 && code <= 0x0C7F) return "te-IN";
      if (code >= 0x0C80 && code <= 0x0CFF) return "kn-IN";
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
      if (autoLang === "hi-IN" && (voice === "Lakshmi" || voice === "Prakash")) {
        setVoice("Avinash");
      } else if (autoLang === "en-IN" && voice === "Lakshmi") {
        setVoice("Shivani");
      } else if (autoLang === "ta-IN" && (voice === "Avinash" || voice === "Shivani")) {
        setVoice("Lakshmi");
      } else if (autoLang === "ml-IN" && (voice === "Shivani" || voice === "Shubham" || voice === "Harshad")) {
        setVoice("Lakshmi");
      }
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    // If switching to Malayalam and current voice is not in verified list, switch to Lakshmi
    if (newLang === "ml-IN" && (voice === "Shivani" || voice === "Shubham" || voice === "Harshad")) {
      setVoice("Lakshmi");
    }
  };

  // Filter verified voices for Malayalam specifically
  const visibleVoices = language === "ml-IN"
    ? supportedVoices.filter((v) => v.langs.includes("ml-IN"))
    : supportedVoices;

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
    a.download = `voxai_speech_${voice.toLowerCase()}_${Date.now()}.wav`;
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
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-2">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Neural Speech Synthesis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <span>Text-to-Speech Studio</span>
          </h2>
          <p className="text-sm text-purple-200/70 mt-1 max-w-2xl">
            Convert text into expressive, natural voice audio using Gnani Timbre v3.0 neural voice synthesis.
          </p>
        </div>

        {/* Model Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#140C2E] border border-purple-500/30 text-xs font-semibold text-purple-200 shrink-0 shadow-glow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Model: timbre-v3.0</span>
        </div>
      </div>

      {/* MAIN EDITOR & SYNTHESIS PANEL */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl space-y-6">
        {/* Sample text quick pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-purple-300/70 font-semibold shrink-0">Preset Samples:</span>
          {sampleTexts.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setText(sample.text);
                setLanguage(sample.lang);
                setVoice(sample.voice);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 hover:text-white border border-purple-500/25 shrink-0 transition-all font-medium active:scale-95 shadow-sm"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* TEXT INPUT AREA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-purple-200 uppercase tracking-wider">Input Script</label>
            <span
              className={`font-mono text-xs ${
                text.length > 4500 ? "text-amber-400" : "text-purple-300/60"
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
            className="w-full p-4 rounded-2xl glass-input text-base text-[#F1ECFF] placeholder:text-purple-300/40 resize-y leading-relaxed border border-purple-500/25 focus:border-purple-400"
          />
        </div>

        {/* CONTROLS GRID: VOICE, LANGUAGE, SPEED */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
          {/* Voice Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200 flex items-center justify-between uppercase tracking-wider">
              <span>Voice Persona</span>
              <span className="text-[11px] text-purple-400 font-semibold lowercase">
                {language === "ml-IN" ? "10 verified voices" : "13 Indian voices"}
              </span>
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              disabled={isSynthesizing}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer border border-purple-500/25 focus:border-purple-400"
            >
              {visibleVoices.map((v) => (
                <option key={v.name} value={v.name} className="bg-[#0B0720] text-purple-100">
                  {v.name} ({v.gender}) — {v.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-200 uppercase tracking-wider">Target Language</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isSynthesizing}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm cursor-pointer border border-purple-500/25 focus:border-purple-400"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#0B0720] text-purple-100">
                  {l.label} ({l.code})
                </option>
              ))}
            </select>
          </div>

          {/* Speed Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-purple-200 uppercase tracking-wider">Synthesis Speed</label>
              <span className="text-purple-300 font-mono font-bold">{speed.toFixed(2)}x</span>
            </div>
            <div className="flex items-center space-x-3 pt-3">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                disabled={isSynthesizing}
                className="w-full accent-purple-400 cursor-pointer h-2 bg-purple-950/60 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* GENERATE SPEECH BUTTON */}
        <div className="pt-2">
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || isSynthesizing}
            className={`w-full flex items-center justify-center space-x-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all shadow-glow-sm ${
              !text.trim() || isSynthesizing
                ? "bg-white/[0.05] text-purple-300/40 border border-white/[0.06] cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 shadow-glow-md hover:shadow-glow-lg active:scale-[0.99]"
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
                <span>Generate Speech with Timbre</span>
              </>
            )}
          </button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3 leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-rose-200">Error: </span>
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
            className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-purple-500/15 gap-3">
              <div className="flex items-center space-x-2.5 text-base font-bold text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Synthesized Speech Output</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 border border-purple-500/25 text-purple-200 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-purple-300" />
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
            <div className="p-6 rounded-2xl bg-[#080418]/90 border border-purple-500/20 space-y-5">
              {/* Audio Activity Waveform */}
              <div className="p-2 rounded-xl bg-[#0B0620]/80 border border-purple-500/15">
                <AudioWaveform
                  audioRef={audioRef}
                  isPlaying={isPlaying}
                  height={56}
                />
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.05"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-purple-400 cursor-pointer h-2 bg-purple-950/60 rounded-lg"
                />

                <div className="flex items-center justify-between text-xs font-mono text-purple-300/70 px-0.5">
                  <span>{formatSeconds(currentTime)}</span>
                  <span>{formatSeconds(duration)}</span>
                </div>
              </div>

              {/* Player Controls Strip */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-purple-200/70">
                  <span className="px-3 py-1 rounded-lg bg-purple-950/50 border border-purple-500/20 font-medium">
                    Voice: <strong className="text-white">{voice}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-purple-950/50 border border-purple-500/20 font-medium">
                    Sample Rate: <strong className="text-white">48,000 Hz</strong>
                  </span>
                  {audioSize && (
                    <span className="px-3 py-1 rounded-lg bg-purple-950/50 border border-purple-500/20 font-medium">
                      Size: <strong className="text-white">{(audioSize / 1024).toFixed(1)} KB</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        setCurrentTime(0);
                      }
                    }}
                    className="p-2.5 rounded-xl text-purple-300 hover:text-white hover:bg-white/[0.06] transition-colors border border-purple-500/20"
                    title="Restart playback"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-glow-sm hover:shadow-glow-md active:scale-95 transition-all border border-purple-400/40"
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
