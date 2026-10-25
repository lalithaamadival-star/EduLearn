import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Accessible Toast Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          let borderClass = 'border-slate-800 bg-slate-900/95 text-slate-100 shadow-xl';
          let IconComponent = Info;
          let iconColor = 'text-indigo-400';

          if (t.type === 'success') {
            borderClass = 'border-emerald-500/50 bg-slate-900/95 text-emerald-100 shadow-emerald-950/40 shadow-xl';
            IconComponent = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (t.type === 'error') {
            borderClass = 'border-rose-500/50 bg-slate-900/95 text-rose-100 shadow-rose-950/40 shadow-xl';
            IconComponent = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (t.type === 'warning') {
            borderClass = 'border-amber-500/50 bg-slate-900/95 text-amber-100 shadow-amber-950/40 shadow-xl';
            IconComponent = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md flex items-start gap-3 transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-top-2 ${borderClass}`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs font-medium leading-relaxed">
                {t.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-white transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      success: (msg) => console.log('[Toast Success]:', msg),
      error: (msg) => console.error('[Toast Error]:', msg),
      warning: (msg) => console.warn('[Toast Warning]:', msg),
      info: (msg) => console.log('[Toast Info]:', msg),
      dismiss: () => {},
    };
  }
  return context;
}
