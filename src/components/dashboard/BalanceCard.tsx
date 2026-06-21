"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/ui";
import { useFinanceStore } from "@/store/finance.store";
import { useAppStore } from "@/store/app.store";

export default function BalanceCard() {
  const { totalBalance } = useFinanceStore();
  const showBalance = useAppStore((s) => s.showBalance);
  const toggleBalance = useAppStore((s) => s.toggleBalance);
  const [animatedBalance, setAnimatedBalance] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = totalBalance / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalBalance) {
        setAnimatedBalance(totalBalance);
        clearInterval(timer);
      } else {
        setAnimatedBalance(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [totalBalance]);

  const monthlyIncome = 25400;
  const monthlyExpenses = 10780;

  return (
    <GlassCard className="p-5" glow="accent">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-accent-light" />
          <span className="text-sm font-medium text-secondary">إجمالي الرصيد</span>
        </div>
        <button
          onClick={toggleBalance}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-secondary hover:text-primary"
        >
          {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="mb-4">
        {showBalance ? (
          <motion.span
            key={animatedBalance}
            className="text-3xl font-bold text-primary tabular-nums"
          >
            {Math.round(animatedBalance).toLocaleString("ar-SA")}
          </motion.span>
        ) : (
          <span className="text-3xl font-bold text-primary">*****</span>
        )}
        <span className="text-sm text-secondary me-2">ريال</span>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[rgba(16,185,129,0.15)]">
            <TrendingUp size={14} className="text-green-accent" />
          </div>
          <div>
            <p className="text-xs text-secondary">الدخل</p>
            <p className="text-sm font-semibold text-green-accent">
              {showBalance ? monthlyIncome.toLocaleString("ar-SA") : "***"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[rgba(239,68,68,0.15)]">
            <TrendingDown size={14} className="text-danger" />
          </div>
          <div>
            <p className="text-xs text-secondary">المصروفات</p>
            <p className="text-sm font-semibold text-danger">
              {showBalance ? monthlyExpenses.toLocaleString("ar-SA") : "***"}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
