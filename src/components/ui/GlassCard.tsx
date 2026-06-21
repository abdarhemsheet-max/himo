"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "accent" | "blue" | "green" | "warning" | "none";
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = "none",
  onClick,
}: GlassCardProps) {
  const glowStyles = {
    accent: "hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]",
    blue: "hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
    green: "hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
    warning: "hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
    none: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-[rgba(255,255,255,0.05)]
        backdrop-blur-xl backdrop-saturate-150
        border border-[rgba(255,255,255,0.08)]
        rounded-2xl
        shadow-lg shadow-black/10
        ${hover ? "cursor-pointer transition-all duration-300" : ""}
        ${hover ? glowStyles[glow] : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}
