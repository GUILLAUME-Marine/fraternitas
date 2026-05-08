"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
}

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 48, text: "text-2xl" },
};

export function Logo({
  variant = "dark",
  size = "md",
  className,
  iconOnly = false,
}: LogoProps) {
  const s = sizes[size];
  const gold = "#B8973A";
  const goldLight = "#D4AF5A";
  const textColor = variant === "dark" ? "text-ink" : "text-cream-DEFAULT";

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Modern Catholic Logo Mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer circle — unity of the community */}
        <circle cx="24" cy="24" r="22.5" stroke={gold} strokeWidth="1.2" />

        {/* Inner subtle circle */}
        <circle cx="24" cy="24" r="15" stroke={goldLight} strokeWidth="0.6" strokeDasharray="2 3" />

        {/* Cross — simplified, elegant, centered */}
        {/* Vertical bar */}
        <rect x="22.8" y="8" width="2.4" height="32" rx="1.2" fill={gold} />
        {/* Horizontal bar — slightly above center for classical proportions */}
        <rect x="10" y="19.8" width="28" height="2.4" rx="1.2" fill={gold} />

        {/* Four corner dots — symbolizing the four cardinal directions / community points */}
        <circle cx="24" cy="8.5" r="1.2" fill={goldLight} />
        <circle cx="24" cy="39.5" r="1.2" fill={goldLight} />
        <circle cx="8.5" cy="24" r="1.2" fill={goldLight} />
        <circle cx="39.5" cy="24" r="1.2" fill={goldLight} />

        {/* Center circle — the heart */}
        <circle cx="24" cy="24" r="3.5" fill="none" stroke={gold} strokeWidth="1.4" />
        <circle cx="24" cy="24" r="1.5" fill={gold} />
      </svg>

      {!iconOnly && (
        <span
          className={cn(
            "font-display font-normal tracking-[0.05em]",
            s.text,
            variant === "dark" ? "text-[#111009]" : "text-[#F7F3EC]"
          )}
        >
          Fraternitas
        </span>
      )}
    </div>
  );
}
