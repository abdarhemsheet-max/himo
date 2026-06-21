"use client";

import { motion } from "framer-motion";
import { GlassCard, GlassBadge } from "@/components/ui";
import { useFinanceStore } from "@/store/finance.store";
import { useAppStore } from "@/store/app.store";

const typeColors: Record<string, "info" | "warning" | "success" | "default"> = {
  bank: "info",
  cash: "success",
  crypto: "warning",
  freelance: "default",
  digital: "info",
};

const typeLabels: Record<string, string> = {
  bank: "بنكي",
  cash: "نقدي",
  crypto: "عملات رقمية",
  freelance: "عمل حر",
  digital: "محفظة رقمية",
};

export default function WalletGrid() {
  const { wallets } = useFinanceStore();
  const showBalance = useAppStore((s) => s.showBalance);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {wallets.map((wallet, i) => (
        <motion.div
          key={wallet.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{wallet.icon}</span>
              <GlassBadge variant={typeColors[wallet.type]}>
                {typeLabels[wallet.type]}
              </GlassBadge>
            </div>
            <p className="text-sm text-secondary mb-1">{wallet.name}</p>
            <p className="text-lg font-bold text-primary tabular-nums">
              {showBalance ? wallet.balance.toLocaleString("ar-SA") : "*****"}
            </p>
            <p className="text-xs text-secondary mt-0.5">{wallet.currency}</p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
