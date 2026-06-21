"use client";

import { motion } from "framer-motion";
import { CheckSquare, Flame, Sun, Moon } from "lucide-react";
import { GlassCard } from "@/components/ui";
import { mockHabits } from "@/lib/mock/habits";

export default function HabitsChecklist() {
  const today = "2026-06-19";
  const morningHabits = mockHabits.filter((h) => h.type === "morning");
  const eveningHabits = mockHabits.filter((h) => h.type === "evening");

  const maxStreak = Math.max(...mockHabits.map((h) => h.streak));

  return (
    <GlassCard className="p-5" glow="green">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-green-accent" />
          <span className="text-sm font-medium text-secondary">عادات اليوم</span>
        </div>
        <div className="flex items-center gap-1.5 text-warning">
          <Flame size={16} />
          <span className="text-sm font-bold">{maxStreak} يوم</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sun size={14} className="text-warning" />
            <span className="text-xs font-medium text-secondary">صباحية</span>
          </div>
          <div className="space-y-1.5">
            {morningHabits.map((habit, i) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[rgba(255,255,255,0.03)]"
              >
                <div
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${
                    habit.completedDates.includes(today)
                      ? "bg-green-accent border-green-accent"
                      : "border-white/20"
                  }`}
                >
                  {habit.completedDates.includes(today) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-primary flex-1">{habit.name}</span>
                <span className="text-xs text-secondary">{habit.streak} يوم</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Moon size={14} className="text-blue-accent" />
            <span className="text-xs font-medium text-secondary">مسائية</span>
          </div>
          <div className="space-y-1.5">
            {eveningHabits.map((habit, i) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[rgba(255,255,255,0.03)]"
              >
                <div
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${
                    habit.completedDates.includes(today)
                      ? "bg-green-accent border-green-accent"
                      : "border-white/20"
                  }`}
                >
                  {habit.completedDates.includes(today) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-primary flex-1">{habit.name}</span>
                <span className="text-xs text-secondary">{habit.streak} يوم</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
