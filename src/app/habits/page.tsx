"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle, Flame, Sun, Moon,
  Plus, Trash2, CalendarDays, Coffee,
} from "lucide-react";
import { GlassCard, GlassButton, CircularProgress } from "@/components/ui";
import AppShell from "@/components/layout/AppShell";
import { useHabitsStore } from "@/store/habits.store";

const WEEKDAYS = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

function toMidnightCountdown() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function getWeekDates(today: string) {
  const now = new Date(today);
  const dayOfWeek = now.getDay();
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - ((dayOfWeek + 1) % 7) - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function HabitsPage() {
  const {
    habits, todos, today,
    addHabit, toggleHabit, deleteHabit,
    addTodo, toggleTodo, deleteTodo,
  } = useHabitsStore();

  const [todoInput, setTodoInput] = useState("");
  const [habitInput, setHabitInput] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitType, setHabitType] = useState<"morning" | "evening" | "anytime">("morning");
  const [countdown, setCountdown] = useState(toMidnightCountdown());
  const inputRef = useRef<HTMLInputElement>(null);
  const habitInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => setCountdown(toMidnightCountdown()), 60000);
    return () => clearInterval(t);
  }, []);

  const activeHabits = habits.filter((h) => h.active);
  const completedToday = activeHabits.filter((h) => h.completedDates.includes(today)).length;
  const totalHabits = activeHabits.length;
  const progressPct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const todayTodos = todos.filter((t) => t.date === today);
  const doneTodos = todayTodos.filter((t) => t.completed).length;

  const handleAddTodo = () => {
    const text = todoInput.trim();
    if (!text) return;
    addTodo(text);
    setTodoInput("");
    inputRef.current?.focus();
  };

  const handleAddHabit = () => {
    const name = habitName.trim();
    if (!name) return;
    addHabit(name, habitType);
    setHabitName("");
    setHabitInput(false);
  };

  const weekDates = getWeekDates(today);
  const weekData = weekDates.map((date) => {
    const done = activeHabits.filter((h) => h.completedDates.includes(date)).length;
    return { date, done, total: totalHabits };
  });

  return (
    <AppShell title="العادات والروتين اليومي" subtitle="تتبع عاداتك اليومية وقائمة مهامك">
      {/* Daily Progress */}
      <div className="mb-6">
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <CircularProgress value={progressPct} size={88} strokeWidth={6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F1F5F9] mb-1">
                {totalHabits > 0
                  ? `أنجزت ${completedToday} من ${totalHabits} عادات اليوم`
                  : "لم تضف أي عادة بعد"}
              </p>
              <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-l from-accent to-accent-light"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center">
                <p className="text-xs text-secondary">المهام</p>
                <p className="text-sm font-bold text-[#F1F5F9]">{doneTodos}/{todayTodos.length}</p>
              </div>
              <div className="w-px h-8 bg-[rgba(255,255,255,0.08)]" />
              <div className="text-center">
                <p className="text-xs text-secondary">العادات</p>
                <p className="text-sm font-bold text-[#F1F5F9]">{completedToday}/{totalHabits}</p>
              </div>
              <div className="w-px h-8 bg-[rgba(255,255,255,0.08)]" />
              <div className="text-center">
                <p className="text-xs text-secondary">التسلسل</p>
                <p className="text-sm font-bold text-warning">
                  {Math.max(...activeHabits.map((h) => h.streak), 0)}
                  <Flame size={12} className="inline ms-0.5 text-warning" />
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Tasks */}
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-accent-light" />
            <span className="text-sm font-medium text-secondary">قائمة المهام اليومية</span>
            <div className="me-auto" />
            <div className="flex items-center gap-1.5 text-[10px] text-secondary/60 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-2 py-1 rounded-lg">
              <Clock size={10} />
              <span>تصفر بعد {countdown}</span>
            </div>
          </div>

          {/* Inline add */}
          <div className="flex items-center gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddTodo(); if (e.key === "Escape") setTodoInput(""); }}
              placeholder="أضف مهمة جديدة..."
              dir="rtl"
              className="flex-1 px-4 py-2 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-primary placeholder:text-secondary/30 outline-none focus:border-accent/30 transition-colors"
            />
            <button
              onClick={handleAddTodo}
              className="p-2 rounded-xl bg-accent/20 border border-accent/30 hover:bg-accent/30 text-accent-light transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Todo list */}
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {todayTodos.length === 0 ? (
                <p className="text-xs text-secondary/40 text-center py-6">لا توجد مهام اليوم</p>
              ) : (
                todayTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: 50 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        todo.completed
                          ? "bg-green-accent border-green-accent"
                          : "border-white/20"
                      }`}
                    >
                      {todo.completed && (
                        <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </motion.div>
                    <span
                      className={`text-sm flex-1 transition-all ${
                        todo.completed ? "text-secondary line-through opacity-50" : "text-primary"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[#94A3B8]/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Habits */}
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} className="text-warning" />
            <span className="text-sm font-medium text-secondary">العادات</span>
            <div className="me-auto" />
            {!habitInput && (
              <GlassButton variant="secondary" size="sm" onClick={() => { setHabitInput(true); setTimeout(() => habitInputRef.current?.focus(), 50); }}>
                <Plus size={14} />
                إضافة عادة
              </GlassButton>
            )}
          </div>

          {/* Inline add habit */}
          <AnimatePresence>
            {habitInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] space-y-2">
                  <input
                    ref={habitInputRef}
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddHabit(); if (e.key === "Escape") { setHabitInput(false); setHabitName(""); } }}
                    placeholder="اسم العادة..."
                    dir="rtl"
                    className="w-full px-4 py-2 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-primary placeholder:text-secondary/30 outline-none focus:border-accent/30 transition-colors"
                  />
                  <div className="flex gap-2">
                    {(["morning", "evening", "anytime"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setHabitType(t)}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          habitType === t
                            ? "bg-accent/20 border-accent/30 text-accent-light"
                            : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-secondary hover:border-white/20"
                        }`}
                      >
                        {t === "morning" ? "صباحية" : t === "evening" ? "مسائية" : "أي وقت"}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <GlassButton variant="secondary" size="sm" onClick={handleAddHabit} className="flex-1">
                      <Plus size={14} />
                      إضافة
                    </GlassButton>
                    <button
                      onClick={() => { setHabitInput(false); setHabitName(""); }}
                      className="px-3 py-1.5 text-xs rounded-xl bg-[rgba(255,255,255,0.05)] border border-white/10 hover:bg-[rgba(255,255,255,0.1)] text-secondary transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Habit groups */}
          {([["morning", "صباحية", Sun, "text-warning"], ["evening", "مسائية", Moon, "text-blue-accent"], ["anytime", "أي وقت", Coffee, "text-green-accent"]] as const).map(([type, label, Icon, iconColor]) => {
            const group = activeHabits.filter((h) => h.type === type);
            if (group.length === 0) return null;
            return (
              <div key={type} className="mb-3 last:mb-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={14} className={iconColor} />
                  <span className="text-xs font-medium text-secondary">{label}</span>
                </div>
                <div className="space-y-1.5">
                  <AnimatePresence mode="popLayout">
                    {group.map((habit) => {
                      const done = habit.completedDates.includes(today);
                      return (
                        <motion.div
                          key={habit.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, x: 50 }}
                          transition={{ duration: 0.2 }}
                          className="group flex items-center gap-2 p-2 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
                          onClick={() => toggleHabit(habit.id)}
                        >
                          <motion.div
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.15 }}
                            className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                              done
                                ? "bg-green-accent border-green-accent shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                : "border-white/20"
                            }`}
                          >
                            {done && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                                width="10" height="10" viewBox="0 0 10 10" fill="none"
                              >
                                <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </motion.svg>
                            )}
                          </motion.div>
                          <span className="text-xs text-primary flex-1 truncate">
                            {habit.name}
                          </span>
                          <motion.span
                            key={`${habit.id}-${habit.streak}`}
                            initial={done ? { scale: 1.3 } : false}
                            animate={{ scale: 1 }}
                            className="text-xs text-secondary flex items-center gap-0.5 shrink-0"
                          >
                            {habit.streak}
                            <Flame size={11} className="text-warning" />
                          </motion.span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#94A3B8]/30 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}

          {activeHabits.length === 0 && (
            <p className="text-xs text-secondary/40 text-center py-6">لم تضف أي عادة بعد</p>
          )}

          {/* Weekly Chart */}
          <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={14} className="text-accent-light" />
              <span className="text-xs font-medium text-secondary">مخطط الإنجاز الأسبوعي</span>
            </div>
            <div className="flex gap-1.5 items-end" style={{ height: 80 }}>
              {weekData.map((day, i) => {
                const ratio = day.total > 0 ? day.done / day.total : 0;
                const heightPx = Math.max(ratio * 80, 4);
                const fullDay = ratio >= 1 && day.total > 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: heightPx }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                      className={`w-full rounded-lg transition-all ${
                        fullDay
                          ? "bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                          : ratio > 0
                            ? "bg-gradient-to-t from-accent/50 to-accent/30"
                            : "bg-[rgba(255,255,255,0.05)]"
                      }`}
                      title={`${day.done}/${day.total}`}
                    />
                    <span className="text-[10px] text-secondary">{WEEKDAYS[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
