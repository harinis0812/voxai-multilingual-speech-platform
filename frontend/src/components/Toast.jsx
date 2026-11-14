import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
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
    info: <Info className="w-5 h-5 text-violet-400 shrink-0" />
  };

  const borders = {
    success: "border-emerald-500/30 bg-navy-900/95 shadow-[0_4px_25px_-5px_rgba(16,185,129,0.2)]",
    error: "border-rose-500/30 bg-navy-900/95 shadow-[0_4px_25px_-5px_rgba(244,63,94,0.2)]",
    info: "border-violet-500/30 bg-navy-900/95 shadow-[0_4px_25px_-5px_rgba(139,92,246,0.2)]"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border backdrop-blur-xl ${
        borders[toast.type] || borders.info
      }`}
    >
      <div className="mt-0.5">{icons[toast.type] || icons.info}</div>
      <div className="flex-1">
        {toast.title && (
          <h4 className="text-xs font-semibold text-white tracking-wide">{toast.title}</h4>
        )}
        <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
