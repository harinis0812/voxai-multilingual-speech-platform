import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2.5 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-purple-400 shrink-0" />
  };

  const borders = {
    success: "border-emerald-500/40 bg-[#0E0824]/95 shadow-[0_8px_30px_rgba(16,185,129,0.25)]",
    error: "border-rose-500/40 bg-[#0E0824]/95 shadow-[0_8px_30px_rgba(244,63,94,0.25)]",
    info: "border-purple-500/40 bg-[#0E0824]/95 shadow-[0_8px_30px_rgba(168,85,247,0.25)]"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl border backdrop-blur-2xl ${
        borders[toast.type] || borders.info
      }`}
    >
      <div className="mt-0.5">{icons[toast.type] || icons.info}</div>
      <div className="flex-1">
        {toast.title && (
          <h4 className="text-xs font-bold text-white tracking-wide">{toast.title}</h4>
        )}
        <p className="text-xs text-purple-100/80 leading-relaxed mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-white/[0.08] transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
