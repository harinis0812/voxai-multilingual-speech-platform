import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import SpeechToText from "./pages/SpeechToText";
import TextToSpeech from "./pages/TextToSpeech";
import ApiStatus from "./pages/ApiStatus";
import About from "./pages/About";
import { fetchHealth } from "./api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isHealthy, setIsHealthy] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast management helper
  const addToast = (toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Health monitor check on initial load & periodic ping
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await fetchHealth();
        setIsHealthy(true);
      } catch (err) {
        setIsHealthy(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen bg-[#050312] text-[#F1ECFF] flex flex-col relative overflow-x-hidden">
      {/* Background Ambient Violet & Indigo Glow Blobs (Inspired by VoxAI Glass Reference) */}
      <div className="fixed top-10 -left-20 w-[450px] h-[450px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-48 -right-20 w-[420px] h-[420px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/3 w-[550px] h-[350px] bg-fuchsia-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="bottom-horizon-glow" />

      {/* Main Top Navigation (Full Width, Sticky, No Permanent Sidebar) */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isHealthy={isHealthy}
        />

        {/* Full-width Responsive Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {activeTab === "dashboard" && (
                <Dashboard setActiveTab={setActiveTab} isHealthy={isHealthy} />
              )}
              {activeTab === "stt" && (
                <SpeechToText addToast={addToast} />
              )}
              {activeTab === "tts" && (
                <TextToSpeech addToast={addToast} />
              )}
              {activeTab === "status" && (
                <ApiStatus
                  isHealthy={isHealthy}
                  setIsHealthy={setIsHealthy}
                  addToast={addToast}
                />
              )}
              {activeTab === "about" && (
                <About />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
