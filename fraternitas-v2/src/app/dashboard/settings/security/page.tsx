"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { changePasswordSchema } from "@/lib/validation/schemas";

type ChangeInput = { currentPassword: string; newPassword: string; confirmPassword: string };

export default function SecuritySettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangeInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangeInput) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error); setLoading(false); return; }
    setSuccess(true);
    reset();
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display font-light text-3xl text-[#111009] mb-1">Sécurité</h1>
        <p className="text-sm text-[rgba(17,16,9,0.45)]">Gérez votre mot de passe et la sécurité de votre compte</p>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[rgba(17,16,9,0.06)]">
          <h2 className="text-sm font-semibold text-[rgba(17,16,9,0.5)] uppercase tracking-wider">Changer le mot de passe</h2>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
              <CheckCircle size={16} /> Mot de passe modifié avec succès. Un email de confirmation a été envoyé.
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Mot de passe actuel</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(17,16,9,0.3)]" />
                <input {...register("currentPassword")} type={showCurrent ? "text" : "password"} autoComplete="current-password"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(17,16,9,0.15)] bg-white text-[#111009] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(17,16,9,0.3)]">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(17,16,9,0.3)]" />
                <input {...register("newPassword")} type={showNew ? "text" : "password"} autoComplete="new-password"
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(17,16,9,0.15)] bg-white text-[#111009] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(17,16,9,0.3)]">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(17,16,9,0.3)]" />
                <input {...register("confirmPassword")} type={showConfirm ? "text" : "password"}
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(17,16,9,0.15)] bg-white text-[#111009] text-sm outline-none transition-all focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(17,16,9,0.3)]">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:transform-none">
                {loading ? "Modification…" : "Modifier le mot de passe"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security info */}
      <div className="bg-[#F7F3EC] rounded-2xl border border-[rgba(17,16,9,0.08)] p-6">
        <h3 className="font-semibold text-[#111009] mb-3 text-sm">Conseils de sécurité</h3>
        <ul className="space-y-2 text-sm text-[rgba(17,16,9,0.65)]">
          <li className="flex items-start gap-2"><span className="text-[#B8973A] mt-0.5">✓</span>Utilisez au moins 8 caractères avec majuscules, chiffres et caractères spéciaux</li>
          <li className="flex items-start gap-2"><span className="text-[#B8973A] mt-0.5">✓</span>N'utilisez jamais le même mot de passe sur plusieurs sites</li>
          <li className="flex items-start gap-2"><span className="text-[#B8973A] mt-0.5">✓</span>Un email de confirmation est envoyé à chaque changement de mot de passe</li>
          <li className="flex items-start gap-2"><span className="text-[#B8973A] mt-0.5">✓</span>Toutes vos sessions actives sont invalidées lors d'une réinitialisation</li>
        </ul>
      </div>
    </div>
  );
}
