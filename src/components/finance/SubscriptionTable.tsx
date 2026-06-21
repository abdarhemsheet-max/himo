"use client";

import { motion } from "framer-motion";
import { GlassCard, GlassBadge } from "@/components/ui";
import { useFinanceStore } from "@/store/finance.store";
import { useAppStore } from "@/store/app.store";

export default function SubscriptionTable() {
  const { subscriptions, toggleSubscription } = useFinanceStore();
  const showBalance = useAppStore((s) => s.showBalance);

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const formatCountdown = (days: number) => {
    if (days < 0) return "منتهي";
    if (days === 0) return "اليوم";
    if (days === 1) return "بعد غد";
    return `بعد ${days} يوم`;
  };

  return (
    <GlassCard className="p-5" hover={false}>
      <h3 className="text-sm font-medium text-secondary mb-4">الاشتراكات</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px] lg:min-w-0">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="text-start pb-3 font-medium text-secondary">الاسم</th>
              <th className="text-start pb-3 font-medium text-secondary">التكلفة</th>
              <th className="text-start pb-3 font-medium text-secondary">تاريخ التجديد</th>
              <th className="text-start pb-3 font-medium text-secondary">المتبقي</th>
              <th className="text-start pb-3 font-medium text-secondary">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub, i) => {
              const days = getDaysUntil(sub.renewalDate);
              return (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 text-primary">{sub.name}</td>
                  <td className="py-3 text-primary tabular-nums">
                    {showBalance ? `${sub.cost.toLocaleString("ar-SA")} ر.س` : "***"}
                  </td>
                  <td className="py-3 text-secondary">{sub.renewalDate}</td>
                  <td className="py-3">
                    <GlassBadge
                      variant={
                        days < 0
                          ? "danger"
                          : days <= 7
                          ? "warning"
                          : "info"
                      }
                    >
                      {formatCountdown(days)}
                    </GlassBadge>
                  </td>
                  <td className="py-3">
                    <motion.button
                      onClick={() => toggleSubscription(sub.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        sub.active
                          ? "bg-[rgba(16,185,129,0.15)] text-green-accent"
                          : "bg-[rgba(255,255,255,0.05)] text-secondary"
                      }`}
                    >
                      {sub.active ? "نشط" : "متوقف"}
                    </motion.button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
