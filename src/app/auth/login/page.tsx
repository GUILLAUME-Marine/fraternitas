"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showToast } from "@/components/ui/toaster";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("email", { message: "Email ou mot de passe incorrect" });
        setError("password", { message: " " });
        showToast("Email ou mot de passe incorrect", "error");
        return;
      }

      showToast("Bienvenue ! ✦", "success");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      showToast("Une erreur réseau est survenue", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] rounded-3xl p-8 md:p-10 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="font-display font-normal text-3xl text-[#F7F3EC] mb-2">
            Bon retour
          </h1>
          <p className="text-sm text-[rgba(247,243,236,0.45)] font-body font-light">
            Connectez-vous à votre communauté
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm font-body hover:bg-[rgba(255,255,255,0.10)] transition-all mb-6 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Redirection…" : "Continuer avec Google"}
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.09)]" />
          <span className="text-xs text-[rgba(247,243,236,0.3)] font-body">ou par email</span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.09)]" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[rgba(247,243,236,0.5)]">Email</Label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="vous@example.com"
                autoComplete="email"
                className="w-full h-11 pl-10 pr-4 rounded-xl border bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm font-body placeholder:text-[rgba(247,243,236,0.25)] outline-none transition-all border-[rgba(255,255,255,0.12)] focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15"
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 font-body">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[rgba(247,243,236,0.5)]">Mot de passe</Label>
              <Link href="/auth/forgot-password" className="text-xs text-[#D4AF5A] hover:text-[#F0E3C0] transition-colors font-body">
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)]" />
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-10 rounded-xl border bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm font-body placeholder:text-[rgba(247,243,236,0.25)] outline-none transition-all border-[rgba(255,255,255,0.12)] focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(247,243,236,0.3)] hover:text-[rgba(247,243,236,0.6)]">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && errors.password.message !== " " && (
              <p className="text-xs text-red-400 font-body">{errors.password.message}</p>
            )}
          </div>

          <Button variant="gold" size="lg" className="w-full mt-2" loading={loading} type="submit">
            Se connecter <ArrowRight size={16} />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[rgba(247,243,236,0.4)] font-body">
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
