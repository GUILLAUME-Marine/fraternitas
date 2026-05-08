"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation/schemas";


function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) { setError("Token manquant."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, token }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/auth/login"), 3000);
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={28} className="text-green-400" />
        </div>
        <h2 className="font-display text-2xl text-[#F7F3EC] mb-3">Mot de passe modifié !</h2>
        <p className="text-sm text-[rgba(247,243,236,0.5)]">Redirection vers la connexion…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-[#F7F3EC] mb-2">Nouveau mot de passe</h1>
        <p className="text-sm text-[rgba(247,243,236,0.45)] font-light">Choisissez un mot de passe fort</p>
      </div>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(247,243,236,0.5)] block mb-1.5">Nouveau mot de passe</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
            <input {...register("password")} type={showPwd ? "text" : "password"}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(247,243,236,0.5)] block mb-1.5">Confirmer</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
            <input {...register("confirmPassword")} type={showConfirm ? "text" : "password"}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]">
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#D4AF5A] to-[#B8973A] text-white font-medium text-sm disabled:opacity-50 hover:-translate-y-0.5 transition-all">
          {loading ? "Modification…" : "Modifier le mot de passe"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md">
      <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] rounded-3xl p-8 md:p-10">
        <Suspense fallback={<div className="h-60 animate-pulse" />}>
          <ResetForm />
        </Suspense>
        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)] text-center">
          <Link href="/auth/login" className="text-sm text-[rgba(247,243,236,0.4)] hover:text-[rgba(247,243,236,0.7)] transition-colors">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
