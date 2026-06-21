"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

const variants = {
  primary:
    "bg-[rgba(249,115,22,0.2)] border-accent/30 hover:bg-[rgba(249,115,22,0.3)] text-white",
  secondary:
    "bg-[rgba(255,255,255,0.05)] border-white/10 hover:bg-[rgba(255,255,255,0.1)] text-primary",
  danger:
    "bg-[rgba(239,68,68,0.2)] border-danger/30 hover:bg-[rgba(239,68,68,0.3)] text-danger",
  ghost:
    "bg-transparent border-transparent hover:bg-white/5 text-secondary",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function GlassButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-medium
        backdrop-blur-md
        border
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
