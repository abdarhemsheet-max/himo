"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookMarked, AlertTriangle, Plus, CheckCircle, Trash2,
  Sparkles, Moon, X, Flame,
} from "lucide-react";
import { GlassCard, GlassBadge, CircularProgress, GlassButton } from "@/components/ui";
import AppShell from "@/components/layout/AppShell";
import AddMemorizationModal from "@/components/quran/AddMemorizationModal";
import DailyQuranPlan from "@/components/quran/DailyQuranPlan";
import SmartQuranAssistant from "@/components/quran/SmartQuranAssistant";
import VisualQuranGrid from "@/components/quran/VisualQuranGrid";
import QuranActivityHeatmap from "@/components/quran/QuranActivityHeatmap";
import QuranPredictorCard from "@/components/quran/QuranPredictorCard";
import ZenPomodoroTimer from "@/components/quran/ZenPomodoroTimer";
import { useQuranStore } from "@/store/quran.store";
import { QURAN_SURAHS } from "@/lib/quran-surahs";

const surahNameMap = Object.fromEntries(
  QURAN_SURAHS.map((s) => [s.id, s.name])
);

function daysUntil(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "اليوم";
  if (diff === 1) return "غداً";
  return `بعد ${diff} أيام`;
}

export default function QuranPage() {
  const {
    entries,
    evaluateReviews,
    markAsReviewed,
    deleteMemorization,
    getComputed,
  } = useQuranStore();
  const [addOpen, setAddOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    evaluateReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { totalAyahs, memorizedAyahs, needsReviewCount, currentStreak } = getComputed();
  const globalProgress = (memorizedAyahs / totalAyahs) * 100;

  const needsReview = entries.filter((e) => e.status === "needs-review");
  const memorized = entries.filter((e) => e.status === "memorized");
  const recentMemorized = memorized.slice(0, 4);

  const normalContent = (
    <>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Streak */}
          {currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)]"
            >
              <Flame
                size={18}
                className="text-[#F97316] animate-pulse drop-shadow-[0_0_12px_rgba(249,115,22,0.7)]"
              />
              <span className="text-sm font-bold text-[#F97316]">{currentStreak}</span>
              <span className="text-xs text-[#F97316]/70">يوم</span>
            </motion.div>
          )}
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent-light" />
            <span className="text-sm text-secondary hidden sm:inline">خطة الحفظ اليومية</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZenMode(true)}
            className="p-2 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-secondary hover:text-accent-light hover:border-[rgba(56,189,248,0.3)] transition-all"
            title="وضع الخلوة"
          >
            <Moon size={16} />
          </button>
          <GlassButton variant="primary" size="md" onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            إضافة حفظ جديد
          </GlassButton>
        </div>
      </div>

      {/* Daily AI Plan */}
      <div className="mb-6">
        <DailyQuranPlan />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Progress */}
        <GlassCard className="p-6 flex flex-col items-center justify-center" hover={false} glow="accent">
          <CircularProgress
            value={globalProgress}
            size={140}
            strokeWidth={8}
            color="#F97316"
            label="من القرآن"
            sublabel={`${memorizedAyahs.toLocaleString("ar-SA")} / ${totalAyahs.toLocaleString("ar-SA")} آية`}
          />
        </GlassCard>

        {/* Needs Review */}
        <GlassCard className="p-5" hover={false} glow="warning">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-warning" />
            <span className="text-sm font-medium text-secondary">
              يحتاج مراجعة
              {needsReviewCount > 0 && (
                <span className="me-1.5 text-xs text-warning">({needsReviewCount})</span>
              )}
            </span>
          </div>
          <div className="space-y-2" dir="rtl">
            {needsReview.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-green-accent font-medium mb-1">🎉 ممتاز! لقد أتممت جميع مراجعاتك المجدولة لهذا اليوم.</p>
                <p className="text-xs text-secondary">حافظ على هذا المستوى الرائع ✨</p>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {needsReview.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] group"
                >
                  <div>
                    <span className="text-sm text-primary font-medium">
                      {surahNameMap[entry.surahId] || `سورة ${entry.surahId}`}
                    </span>
                    <span className="text-xs text-secondary me-2">
                      {entry.fromAyah}-{entry.toAyah}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => markAsReviewed(entry.id, "hard")}
                      className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:border-red-500/40 hover:shadow-[0_0_12px_-2px_rgba(239,68,68,0.4)] transition-all"
                    >
                      صعب
                    </button>
                    <button
                      onClick={() => markAsReviewed(entry.id, "good")}
                      className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/25 hover:border-yellow-500/40 hover:shadow-[0_0_12px_-2px_rgba(234,179,8,0.4)] transition-all"
                    >
                      جيد
                    </button>
                    <button
                      onClick={() => markAsReviewed(entry.id, "easy")}
                      className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-green-500/10 border border-green-500/20 text-green-accent hover:bg-green-500/25 hover:border-green-500/40 hover:shadow-[0_0_12px_-2px_rgba(16,185,129,0.4)] transition-all"
                    >
                      سهل
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Recent Memorized */}
        <GlassCard className="p-5" hover={false} glow="green">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-green-accent" />
            <span className="text-sm font-medium text-secondary">آخر المحفوظات</span>
          </div>
          <div className="space-y-2" dir="rtl">
            {recentMemorized.length === 0 && (
              <p className="text-xs text-secondary text-center py-6">لم يتم حفظ أي شيء بعد</p>
            )}
            {recentMemorized.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)]"
              >
                <span className="text-sm text-primary font-medium">
                  {surahNameMap[entry.surahId] || `سورة ${entry.surahId}`}
                </span>
                <span className="text-xs text-secondary">{entry.fromAyah}-{entry.toAyah}</span>
              </div>
            ))}
            {memorized.length > 4 && (
              <p className="text-xs text-secondary text-center pt-2">
                +{memorized.length - 4} entries أخرى
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Predictor Card */}
      <div className="mb-6">
        <QuranPredictorCard />
      </div>

      {/* AI Assistant */}
      <div className="mb-6">
        <SmartQuranAssistant />
      </div>

      {/* Visual Grid + Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <VisualQuranGrid />
        <QuranActivityHeatmap days={90} />
      </div>

      {/* History Table */}
      <GlassCard className="p-5" hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <BookMarked size={18} className="text-accent-light" />
          <span className="text-sm font-medium text-secondary">سجل الحفظ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px] lg:min-w-0">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-start pb-3 font-medium text-secondary">السورة</th>
                <th className="text-start pb-3 font-medium text-secondary">الآيات</th>
                <th className="text-start pb-3 font-medium text-secondary">تاريخ الحفظ</th>
                <th className="text-start pb-3 font-medium text-secondary">آخر مراجعة</th>
                <th className="text-start pb-3 font-medium text-secondary">المراجعة القادمة</th>
                <th className="text-start pb-3 font-medium text-secondary">الحالة</th>
                <th className="text-start pb-3 font-medium text-secondary"></th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-secondary">
                    لا توجد entries بعد
                  </td>
                </tr>
              )}
              <AnimatePresence mode="popLayout">
                {entries.map((entry) => (
                  <motion.tr
                    key={entry.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-[rgba(255,255,255,0.03)] last:border-0"
                  >
                    <td className="py-3 text-primary font-medium">
                      {surahNameMap[entry.surahId] || `سورة ${entry.surahId}`}
                    </td>
                    <td className="py-3 text-secondary">
                      {entry.fromAyah}-{entry.toAyah}
                    </td>
                    <td className="py-3 text-secondary">{entry.dateMemorized}</td>
                    <td className="py-3 text-secondary">{entry.lastReviewedDate}</td>
                    <td className="py-3">
                      <GlassBadge variant={entry.status === "needs-review" ? "danger" : "info"}>
                        {daysUntil(entry.nextReviewDate)}
                      </GlassBadge>
                    </td>
                    <td className="py-3">
                      <GlassBadge variant={entry.status === "needs-review" ? "warning" : "success"}>
                        {entry.status === "needs-review" ? "يحتاج مراجعة" : "مُراجَع"}
                      </GlassBadge>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => deleteMemorization(entry.id)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)] transition-all"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );

  return (
    <>
      {/* Normal Mode */}
      <AnimatePresence mode="wait">
        {!zenMode && (
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AppShell title="القرآن الكريم" subtitle="تتبع الحفظ والمراجعة">
              {normalContent}
            </AppShell>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zen Mode Overlay */}
      <AnimatePresence>
        {zenMode && (
          <motion.div
            key="zen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center"
            style={{
              background: "rgba(5, 8, 16, 0.97)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Top label */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="absolute top-8 flex items-center gap-2"
            >
              <Moon size={18} className="text-accent-light" />
              <span className="text-sm font-medium text-secondary">وضع الخلوة</span>
            </motion.div>

            {/* Focused Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl px-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <Flame
                  size={36}
                  className="mx-auto text-[#F97316] animate-pulse drop-shadow-[0_0_20px_rgba(249,115,22,0.8)] mb-1"
                />
                {currentStreak > 0 && (
                  <p className="text-sm text-[#F97316] font-semibold">
                    {currentStreak} يوم متتالٍ 🔥
                  </p>
                )}
              </div>

              {/* Pomodoro Timer */}
              <div className="flex justify-center mb-8">
                <ZenPomodoroTimer />
              </div>

              {needsReview.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-green-accent font-medium mb-2">
                    🎉 اكتملت جميع المراجعات
                  </p>
                  <p className="text-sm text-secondary">أنت في حالة ذهنية ممتازة. خذ استراحة.</p>
                </div>
              ) : (
                <div className="space-y-4" dir="rtl">
                  <h2 className="text-lg font-bold text-primary text-center">المراجعة</h2>
                  {needsReview.map((entry) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.25 }}
                      className="p-5 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-semibold text-primary">
                          {surahNameMap[entry.surahId] || `سورة ${entry.surahId}`}
                        </span>
                        <span className="text-sm text-secondary">
                          {entry.fromAyah}-{entry.toAyah}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => markAsReviewed(entry.id, "hard")}
                          className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:border-red-500/40 transition-all"
                        >
                          صعب
                        </button>
                        <button
                          onClick={() => markAsReviewed(entry.id, "good")}
                          className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/25 hover:border-yellow-500/40 transition-all"
                        >
                          جيد
                        </button>
                        <button
                          onClick={() => markAsReviewed(entry.id, "easy")}
                          className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-green-500/10 border border-green-500/20 text-green-accent hover:bg-green-500/25 hover:border-green-500/40 transition-all"
                        >
                          سهل
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Exit button */}
            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              onClick={() => setZenMode(false)}
              className="absolute bottom-10 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.1)] transition-all backdrop-blur-xl"
            >
              <X size={16} />
              <span className="text-sm font-medium">الخروج من وضع الخلوة</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AddMemorizationModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
