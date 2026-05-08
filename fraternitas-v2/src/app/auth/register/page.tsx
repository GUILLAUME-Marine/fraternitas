"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validation/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");
  const pwdStrength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 :
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 :
    password.length >= 8 ? 2 : password.length > 0 ? 1 : 0;

  const strengthColors = ["bg-transparent", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const strengthLabels = ["", "Trop faible", "Faible", "Moyen", "Fort"];

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setSuccess(true);
    } catch {
      setError("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center">
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] rounded-3xl p-12">
          <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-400" size={28} />
          </div>
          <h1 className="font-display text-2xl text-[#F7F3EC] mb-3">Vérifiez votre email</h1>
          <p className="text-sm text-[rgba(247,243,236,0.5)] leading-relaxed mb-6">
            Un email de confirmation a été envoyé à votre adresse. Cliquez sur le lien pour activer votre compte.
          </p>
          <p className="text-xs text-[rgba(247,243,236,0.3)]">Pensez à vérifier vos spams.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md">
      <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] rounded-3xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-normal text-3xl text-[#F7F3EC] mb-2">Rejoindre Fraternitas</h1>
          <p className="text-sm text-[rgba(247,243,236,0.45)] font-light">Créez votre compte gratuitement</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(247,243,236,0.5)] block mb-1.5">Prénom</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
              <input {...register("name")} placeholder="Votre prénom"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15 placeholder:text-[rgba(247,243,236,0.25)]" />
            </div>
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(247,243,236,0.5)] block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
              <input {...register("email")} type="email" placeholder="vous@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15 placeholder:text-[rgba(247,243,236,0.25)]" />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(247,243,236,0.5)] block mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
              <input {...register("password")} type={showPwd ? "text" : "password"} placeholder="Min. 8 car., majuscule, chiffre, spécial"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15 placeholder:text-[rgba(247,243,236,0.25)]" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)] hover:text-[rgba(247,243,236,0.6)]">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwdStrength ? strengthColors[pwdStrength] : "bg-[rgba(255,255,255,0.1)]"}`} />
                  ))}
                </div>
                <p className="text-xs text-[rgba(247,243,236,0.35)] mt-1">{strengthLabels[pwdStrength]}</p>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(247,243,236,0.5)] block mb-1.5">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
              <input {...register("confirmPassword")} type={showConfirm ? "text" : "password"} placeholder="Répétez votre mot de passe"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15 placeholder:text-[rgba(247,243,236,0.25)]" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)] hover:text-[rgba(247,243,236,0.6)]">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-br from-[#D4AF5A] to-[#B8973A] text-white font-medium text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#B8973A]/30 disabled:opacity-50 disabled:transform-none mt-2">
            {loading ? "Création..." : (<>Créer mon compte <ArrowRight size={16} /></>)}
          </button>
        </form>

        <p className="text-xs text-[rgba(247,243,236,0.25)] text-center mt-4 leading-relaxed">
          En créant un compte, vous acceptez nos{" "}
          <a href="#" className="text-[#D4AF5A] hover:underline">CGU</a> et notre{" "}
          <a href="#" className="text-[#D4AF5A] hover:underline">Politique de confidentialité</a>.
        </p>

        <div className="mt-6 text-center">
          <p className="text-sm text-[rgba(247,243,236,0.4)]">
            Déjà membre ?{" "}
            <Link href="/auth/login" className="text-[#D4AF5A] hover:text-[#F0E3C0] transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
