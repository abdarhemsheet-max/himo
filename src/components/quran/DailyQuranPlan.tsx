"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle, BookOpen, PartyPopper } from "lucide-react";
import { GlassCard, GlassButton } from "@/components/ui";
import AddMemorizationModal from "@/components/quran/AddMemorizationModal";
import { useQuranStore } from "@/store/quran.store";
import { QURAN_SURAHS } from "@/lib/quran-surahs";

const surahNameMap = Object.fromEntries(QURAN_SURAHS.map((s) => [s.id, s.name]));

interface PlanData {
  greeting: string;
  reviewTarget: string;
  newTarget?: { surahId: number; surahName: string; fromAyah: number; toAyah: number };
  congratulatory?: boolean;
}

function ShimmerLoader() {
  return (
    <GlassCard className="p-6" hover={false}>
      <div className="space-y-4" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] animate-pulse" />
          <div className="h-5 w-48 rounded bg-[rgba(255,255,255,0.06)] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] space-y-3">
            <div className="h-4 w-24 rounded bg-[rgba(255,255,255,0.06)] animate-pulse" />
            <div className="h-8 w-full rounded bg-[rgba(255,255,255,0.06)] animate-pulse" />
          </div>
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] space-y-3">
            <div className="h-4 w-24 rounded bg-[rgba(255,255,255,0.06)] animate-pulse" />
            <div className="h-8 w-full rounded bg-[rgba(255,255,255,0.06)] animate-pulse" />
          </div>
        </div>
        <div className="text-center animate-pulse">
          <span className="text-sm text-secondary">جاري تحليل مسار حفظك وبناء خطة اليوم...</span>
        </div>
      </div>
    </GlassCard>
  );
}

export default function DailyQuranPlan() {
  const { entries, markAsReviewed } = useQuranStore();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchPlan = useCallback(async () => {
    if (entries.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const memorizedAyahs = entries
        .filter((e) => e.status === "memorized")
        .slice(-3)
        .map((e) => ({
          surahName: surahNameMap[e.surahId] || `سورة ${e.surahId}`,
          fromAyah: e.fromAyah,
          toAyah: e.toAyah,
          dateMemorized: e.dateMemorized,
          status: e.status,
        }));

      const dueForReview = entries
        .filter((e) => e.status === "needs-review")
        .map((e) => ({
          surahName: surahNameMap[e.surahId] || `سورة ${e.surahId}`,
          fromAyah: e.fromAyah,
          toAyah: e.toAyah,
          dateMemorized: e.dateMemorized,
          status: e.status,
        }));

      const res = await fetch("/api/quran-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorizedAyahs, dueForReview }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch plan");
      }

      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }, [entries]);

  useEffect(() => {
    if (entries.length === 0) return;
    const id = setTimeout(() => fetchPlan(), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  const handleCompleteReview = () => {
    entries
      .filter((e) => e.status === "needs-review")
      .forEach((e) => markAsReviewed(e.id, "good"));
    setPlan((prev) => prev ? { ...prev, congratulatory: true, reviewTarget: "لا توجد مراجعة اليوم ✓" } : prev);
  };

  const hasReviewItems = entries.filter((e) => e.status === "needs-review").length > 0;

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <ShimmerLoader key="shimmer" />}

        {!loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-5 text-center" hover={false} glow="warning">
              <p className="text-sm text-secondary">{error}</p>
              <GlassButton variant="primary" size="sm" onClick={fetchPlan} className="mt-3">
                إعادة المحاولة
              </GlassButton>
            </GlassCard>
          </motion.div>
        )}

        {!loading && !error && plan && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <GlassCard className="p-6" hover={false} glow={plan.congratulatory ? "green" : "accent"}>
              {/* Greeting */}
              <div className="flex items-start gap-3 mb-6" dir="rtl">
                <div className="p-2.5 rounded-xl bg-[rgba(217,70,239,0.12)] shadow-[0_0_16px_-3px_rgba(217,70,239,0.3)]">
                  <Sparkles size={20} className="text-[#D946EF]" />
                </div>
                <div>
                  <p className="text-base font-semibold text-primary leading-relaxed">
                    {plan.greeting}
                  </p>
                  {plan.congratulatory && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-green-accent">
                      <PartyPopper size={16} />
                      <span className="text-sm font-medium">أحسنت! أنت متميز في مراجعتك اليومية ✨</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                {/* Review Card */}
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-300 hover:border-[rgba(251,191,36,0.2)]">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-warning" />
                    <span className="text-xs font-semibold text-warning tracking-wide uppercase">المراجعة الذكية</span>
                  </div>
                  <p className="text-sm text-primary leading-relaxed mb-4">
                    {plan.reviewTarget}
                  </p>
                  {!plan.congratulatory && hasReviewItems && (
                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={handleCompleteReview}
                      className="w-full"
                    >
                      <CheckCircle size={14} />
                      إتمام المراجعة
                    </GlassButton>
                  )}
                  {plan.congratulatory && (
                    <div className="flex items-center gap-1.5 text-xs text-green-accent">
                      <CheckCircle size={14} />
                      <span>تمت المراجعة لهذا اليوم</span>
                    </div>
                  )}
                </div>

                {/* New Memorization Card */}
                <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-300 hover:border-[rgba(56,189,248,0.2)]">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={16} className="text-accent-light" />
                    <span className="text-xs font-semibold text-accent-light tracking-wide uppercase">الحفظ الجديد</span>
                  </div>
                  {plan.newTarget ? (
                    <>
                      <p className="text-sm text-primary leading-relaxed mb-4">
                        {plan.newTarget.surahName} ({plan.newTarget.fromAyah}-{plan.newTarget.toAyah})
                      </p>
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => setAddOpen(true)}
                        className="w-full"
                      >
                        <BookOpen size={14} />
                        بدء الحفظ
                      </GlassButton>
                    </>
                  ) : (
                    <p className="text-sm text-primary leading-relaxed mb-4">
                      {plan.reviewTarget}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {plan?.newTarget && (
        <AddMemorizationModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          prefill={{
            surahId: plan.newTarget.surahId,
            fromAyah: plan.newTarget.fromAyah,
            toAyah: plan.newTarget.toAyah,
          }}
        />
      )}
    </>
  );
}
