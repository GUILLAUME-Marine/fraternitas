"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    // Simulate API call (implement real email sending with Resend/Nodemailer)
    await new Promise((r) => setTimeout(r, 1500));
    setSentEmail(data.email);
    setSent(true);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] rounded-3xl p-8 md:p-10 backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F0E3C0] to-[rgba(184,151,58,0.3)] flex items-center justify-center mx-auto mb-5">
                  <Mail size={24} className="text-[#D4AF5A]" />
                </div>
                <h1 className="font-display font-normal text-3xl text-[#F7F3EC] mb-2">
                  Mot de passe oublié
                </h1>
                <p className="text-sm text-[rgba(247,243,236,0.45)] font-body font-light leading-relaxed">
                  Entrez votre email et nous vous enverrons un lien de réinitialisation.
                </p>
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
                      className="w-full h-11 pl-10 pr-4 rounded-xl border bg-[rgba(255,255,255,0.05)] text-[#F7F3EC] text-sm font-body placeholder:text-[rgba(247,243,236,0.25)] outline-none transition-all border-[rgba(255,255,255,0.12)] focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/15"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 font-body">{errors.email.message}</p>}
                </div>

                <Button variant="gold" size="lg" className="w-full" loading={loading} type="submit">
                  Envoyer le lien
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF5A]/20 to-[#B8973A]/20 border border-[#B8973A]/30 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={28} className="text-[#D4AF5A]" />
              </motion.div>
              <h2 className="font-display text-2xl text-[#F7F3EC] mb-3">Email envoyé !</h2>
              <p className="text-sm text-[rgba(247,243,236,0.5)] font-body font-light leading-relaxed mb-2">
                Un lien de réinitialisation a été envoyé à
              </p>
              <p className="text-sm font-semibold text-[#D4AF5A] font-body mb-8">
                {sentEmail}
              </p>
              <p className="text-xs text-[rgba(247,243,236,0.3)] font-body">
                Vérifiez aussi vos spams. Le lien expire dans 1 heure.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)] text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-[rgba(247,243,236,0.4)] hover:text-[rgba(247,243,236,0.7)] transition-colors font-body"
          >
            <ArrowLeft size={14} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
