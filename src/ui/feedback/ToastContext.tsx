import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastTone = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  message: string;
  tone?: ToastTone;
};

type ToastCtx = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastCtx | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback<ToastCtx["push"]>((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((curr) => [...curr, { id, ...t }]);
    setTimeout(() => remove(id), 3500);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const getIcon = (tone?: ToastTone) => {
    switch (tone) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "info":
      default:
        return <Info size={20} />;
    }
  };

  const getStyles = (tone?: ToastTone) => {
    switch (tone) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800";
      case "error":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case "info":
      default:
        return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[280px] rounded-md border px-4 py-3 text-sm shadow-lg flex items-start gap-3 ${getStyles(
              t.tone
            )}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(t.tone)}</div>
            <div className="flex-1">{t.message}</div>
            <button
              onClick={() => remove(t.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
