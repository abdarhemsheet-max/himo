"use client";

import { motion } from "framer-motion";
import { GlassCard, GlassBadge } from "@/components/ui";
import { useFinanceStore } from "@/store/finance.store";
import { useAppStore } from "@/store/app.store";

export default function IncomeList() {
  const { incomes, wallets } = useFinanceStore();
  const showBalance = useAppStore((s) => s.showBalance);
  const walletMap = Object.fromEntries(wallets.map((w) => [w.id, w]));

  return (
    <GlassCard className="p-5" hover={false}>
      <h3 className="text-sm font-medium text-secondary mb-4">الدخل</h3>
      <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px] lg:min-w-0">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-start pb-3 font-medium text-secondary">العميل</th>
                <th className="text-start pb-3 font-medium text-secondary">المبلغ</th>
                <th className="text-start pb-3 font-medium text-secondary">المحفظة</th>
                <th className="text-start pb-3 font-medium text-secondary">الحالة</th>
                <th className="text-start pb-3 font-medium text-secondary">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((income, i) => {
                const w = walletMap[income.walletId];
                return (
                  <motion.tr
                    key={income.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                  <td className="py-3 text-primary">{income.client}</td>
                  <td className="py-3 text-primary tabular-nums font-medium">
                    {showBalance ? income.amount.toLocaleString("ar-SA") : "***"}
                  </td>
                  <td className="py-3 text-secondary text-xs">
                    {w ? `${w.icon} ${w.name}` : "—"}
                  </td>
                  <td className="py-3">
                    <GlassBadge variant={income.status === "received" ? "success" : "warning"}>
                      {income.status === "received" ? "مستلم" : "معلق"}
                    </GlassBadge>
                  </td>
                  <td className="py-3 text-secondary">{income.date}</td>
                </motion.tr>
              );
            })}
            </tbody>
          </table>
      </div>
    </GlassCard>
  );
}
