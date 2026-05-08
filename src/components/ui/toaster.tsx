"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 shadow-xl border text-sm font-body max-w-sm",
        type === "success" && "bg-[#111009] text-[#F7F3EC] border-[rgba(255,255,255,0.1)]",
        type === "error" && "bg-red-50 text-red-800 border-red-200",
        type === "info" && "bg-white text-[#111009] border-[rgba(17,16,9,0.15)]"
      )}
    >
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto opacity-50 hover:opacity-100 transition-opacity">
        ✕
      </button>
    </div>
  );
}

// Simple toast store
type ToastState = { message: string; type: "success" | "error" | "info"; id: number } | null;
let toastState: ToastState = null;
let listeners: Array<() => void> = [];

export function showToast(message: string, type: "success" | "error" | "info" = "info") {
  toastState = { message, type, id: Date.now() };
  listeners.forEach((l) => l());
}

export function Toaster() {
  const [toast, setToast] = React.useState<ToastState>(null);

  React.useEffect(() => {
    const listener = () => setToast(toastState);
    listeners.push(listener);
    return () => { listeners = listeners.filter((l) => l !== listener); };
  }, []);

  if (!toast) return null;
  return <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />;
}
