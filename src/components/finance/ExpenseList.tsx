"use client";

import { motion } from "framer-motion";
import { GlassCard, GlassBadge } from "@/components/ui";
import { useFinanceStore } from "@/store/finance.store";
import { useAppStore } from "@/store/app.store";

const categoryLabels: Record<string, string> = {
  software: "برمجيات",
  life: "حياة",
  hardware: "أجهزة",
  food: "طعام",
  transport: "مواصلات",
  entertainment: "ترفيه",
  other: "أخرى",
};

const categoryColors: Record<string, "info" | "warning" | "default" | "danger" | "success"> = {
  software: "info",
  life: "default",
  hardware: "warning",
  food: "success",
  transport: "danger",
  entertainment: "info",
  other: "default",
};

export default function ExpenseList() {
  const { expenses, wallets } = useFinanceStore();
  const showBalance = useAppStore((s) => s.showBalance);
  const walletMap = Object.fromEntries(wallets.map((w) => [w.id, w]));

  return (
    <GlassCard className="p-5" hover={false}>
      <h3 className="text-sm font-medium text-secondary mb-4">المصروفات</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[650px] lg:min-w-0">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="text-start pb-3 font-medium text-secondary">الوصف</th>
              <th className="text-start pb-3 font-medium text-secondary">التصنيف</th>
              <th className="text-start pb-3 font-medium text-secondary">المحفظة</th>
              <th className="text-start pb-3 font-medium text-secondary">الوسوم</th>
              <th className="text-start pb-3 font-medium text-secondary">المبلغ</th>
              <th className="text-start pb-3 font-medium text-secondary">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, i) => {
              const w = walletMap[expense.walletId];
              return (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                <td className="py-3 text-primary">{expense.description}</td>
                <td className="py-3">
                  <GlassBadge variant={categoryColors[expense.category]}>
                    {categoryLabels[expense.category]}
                  </GlassBadge>
                </td>
                <td className="py-3 text-secondary text-xs">
                  {w ? `${w.icon} ${w.name}` : "—"}
                </td>
                <td className="py-3">
                  <div className="flex gap-1">
                    {expense.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] text-secondary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 text-danger tabular-nums font-medium">
                  -{showBalance ? expense.amount.toLocaleString("ar-SA") : "***"}
                </td>
                <td className="py-3 text-secondary">{expense.date}</td>
              </motion.tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
