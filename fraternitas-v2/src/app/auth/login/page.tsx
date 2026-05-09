"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validation/schemas";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const verified = searchParams.get("verified"); 
{registered && (
  <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
    ✓ Compte créé ! Connectez-vous maintenant.
  </div>
)}
  
  const errorParam = searchParams.get("error");

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(
    errorParam === "token-expired" ? "Lien expiré. Demandez un nouveau lien." :
    errorParam === "invalid-token" ? "Lien invalide." :
    errorParam === "token-used" ? "Lien déjà utilisé." : ""
  );
  const [attempts, setAttempts] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setError(`Email ou mot de passe incorrect. ${5 - newAttempts} tentative(s) restante(s) avant blocage temporaire.`);
        } else {
          setError("Email ou mot de passe incorrect.");
        }
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md">
      <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] rounded-3xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-normal text-3xl text-[#F7F3EC] mb-2">Bon retour</h1>
          <p className="text-sm text-[rgba(247,243,236,0.45)] font-light">Connectez-vous à votre communauté</p>
        </div>

        {verified && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
            ✓ Email vérifié ! Vous pouvez vous connecter.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl }); }}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm hover:bg-[rgba(255,255,255,0.10)] transition-all mb-5 disabled:opacity-50">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Redirection…" : "Continuer avec Google"}
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.09)]" />
          <span className="text-xs text-[rgba(247,243,236,0.3)]">ou par email</span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.09)]" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(247,243,236,0.5)] block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
              <input {...register("email")} type="email" placeholder="vous@example.com" autoComplete="email"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15 placeholder:text-[rgba(247,243,236,0.25)]" />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(247,243,236,0.5)]">Mot de passe</label>
              <Link href="/auth/forgot-password" className="text-xs text-[#D4AF5A] hover:text-[#F0E3C0] transition-colors">
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
              <input {...register("password")} type={showPwd ? "text" : "password"} placeholder="••••••••" autoComplete="current-password"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15 placeholder:text-[rgba(247,243,236,0.25)]" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)] hover:text-[rgba(247,243,236,0.6)]">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-br from-[#D4AF5A] to-[#B8973A] text-white font-medium text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#B8973A]/30 disabled:opacity-50 disabled:transform-none mt-2">
            {loading ? "Connexion…" : (<>Se connecter <ArrowRight size={16} /></>)}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[rgba(247,243,236,0.4)]">
            Pas encore membre ?{" "}
            <Link href="/auth/register" className="text-[#D4AF5A] hover:text-[#F0E3C0] transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 bg-[rgba(255,255,255,0.04)] rounded-3xl animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}
