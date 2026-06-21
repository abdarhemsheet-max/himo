"use client";

import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { GlassCard, GlassBadge } from "@/components/ui";
import { mockTasks } from "@/lib/mock/workspace";

const priorityColors = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "default",
} as const;

export default function TodayTasks() {
  const today = "2026-06-19";
  const urgentTasks = mockTasks
    .filter((t) => t.dueDate <= today && t.status !== "archived")
    .slice(0, 4);

  return (
    <GlassCard className="p-5" glow="blue">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-warning" />
          <span className="text-sm font-medium text-secondary">مهام اليوم العاجلة</span>
        </div>
        <span className="text-xs text-secondary">{urgentTasks.length} مهام</span>
      </div>

      {urgentTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-secondary">
          <CheckCircle2 size={32} className="mb-2 text-green-accent" />
          <p className="text-sm">لا توجد مهام عاجلة اليوم</p>
        </div>
      ) : (
        <div className="space-y-2">
          {urgentTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {task.title}
                </p>
                <p className="text-xs text-secondary truncate mt-0.5">
                  {task.description}
                </p>
              </div>
              <GlassBadge variant={priorityColors[task.priority]}>
                {task.priority === "critical"
                  ? "عاجل"
                  : task.priority === "high"
                  ? "مهم"
                  : task.priority === "medium"
                  ? "متوسط"
                  : "عادي"}
              </GlassBadge>
              <div className="flex items-center gap-1 text-xs text-secondary shrink-0">
                <Clock size={12} />
                <span>{task.dueDate}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
