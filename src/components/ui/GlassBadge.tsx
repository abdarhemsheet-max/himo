"use client";

import { type ReactNode } from "react";

interface GlassBadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  className?: string;
}

const variants = {
  success: "bg-[rgba(16,185,129,0.15)] text-green-accent border-green-accent/20",
  warning:
    "bg-[rgba(245,158,11,0.15)] text-warning border-warning/20",
  danger: "bg-[rgba(239,68,68,0.15)] text-danger border-danger/20",
  info: "bg-[rgba(59,130,246,0.15)] text-blue-accent border-blue-accent/20",
  default:
    "bg-[rgba(255,255,255,0.05)] text-secondary border-white/10",
};

export default function GlassBadge({
  children,
  variant = "default",
  className = "",
}: GlassBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-medium
        rounded-full
        backdrop-blur-sm
        border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
