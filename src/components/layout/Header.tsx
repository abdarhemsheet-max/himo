"use client";

import { motion } from "framer-motion";
import { Search, Eye, EyeOff, Bell, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBalance: boolean;
  onToggleBalance: () => void;
  onToggleMobile?: () => void;
}

export default function Header({
  title,
  subtitle,
  showBalance,
  onToggleBalance,
  onToggleMobile,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 sm:px-6 bg-[rgba(11,15,25,0.6)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-secondary hover:text-primary lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-lg font-bold text-primary">{title}</h1>
          {subtitle && (
            <p className="text-xs text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 start-3 text-secondary/50"
          />
          <input
            type="text"
            placeholder="بحث..."
            className="w-40 md:w-56 ps-9 pe-4 py-2 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-primary placeholder:text-secondary/30 outline-none focus:border-accent/30 transition-colors"
          />
        </div>

        <button
          onClick={onToggleBalance}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-secondary hover:text-primary"
          title={showBalance ? "إخفاء الرصيد" : "إظهار الرصيد"}
        >
          {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button className="p-2 rounded-xl hover:bg-white/5 transition-colors text-secondary hover:text-primary relative">
          <Bell size={18} />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>
      </div>
    </motion.header>
  );
}
