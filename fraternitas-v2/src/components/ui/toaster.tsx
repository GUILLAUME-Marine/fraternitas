"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType }

let listeners: Array<(toast: Toast) => void> = [];

export function showToast(message: string, type: ToastType = "info") {
  const toast = { id: Date.now(), message, type };
  listeners.forEach((l) => l(toast));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 4000);
    };
    listeners.push(listener);
    return () => { listeners = listeners.filter((l) => l !== listener); };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id}
          className={cn(
            "flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border text-sm max-w-sm animate-in slide-in-from-right-4",
            toast.type === "success" && "bg-[#111009] text-[#F7F3EC] border-[rgba(255,255,255,0.1)]",
            toast.type === "error" && "bg-red-50 text-red-800 border-red-200",
            toast.type === "info" && "bg-white text-[#111009] border-[rgba(17,16,9,0.12)] shadow-lg"
          )}>
          {toast.type === "success" && <CheckCircle size={16} className="text-[#D4AF5A] flex-shrink-0" />}
          {toast.type === "error" && <XCircle size={16} className="text-red-500 flex-shrink-0" />}
          {toast.type === "info" && <Info size={16} className="text-[#B8973A] flex-shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
