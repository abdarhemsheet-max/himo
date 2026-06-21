"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, CheckCircle, Plus, Clock } from "lucide-react";
import { GlassCard, GlassInput, GlassButton } from "@/components/ui";
import { useQuranStore } from "@/store/quran.store";
import { QURAN_SURAHS } from "@/lib/quran-surahs";

const surahNameMap = Object.fromEntries(QURAN_SURAHS.map((s) => [s.id, s.name]));

interface AiPlan {
  reviewPlan: { surahName: string; ayahs: string }[];
  newMemorization: { surahName: string; startAyah: number; endAyah: number }[];
}

export default function SmartQuranAssistant() {
  const { entries, markAsReviewed, addMemorization } = useQuranStore();
  const [userRequest, setUserRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const needsReview = entries.filter((e) => e.status === "needs-review");
  const memorized = entries.filter((e) => e.status === "memorized");
  const lastEntry = memorized.length > 0 ? memorized[memorized.length - 1] : null;

  const currentSurahName = lastEntry ? surahNameMap[lastEntry.surahId] || `سورة ${lastEntry.surahId}` : null;

  const handleGenerate = async () => {
    if (!userRequest.trim()) return;
    setLoading(true);
    setPlan(null);
    setDoneIds(new Set());

    try {
      const res = await fetch("/api/quran-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentProgress: entries.map((e) => ({
            surahName: surahNameMap[e.surahId] || `سورة ${e.surahId}`,
            ayahs: `${e.fromAyah}-${e.toAyah}`,
            lastReviewed: e.lastReviewedDate,
            nextReview: e.nextReviewDate,
          })),
          needsReview: needsReview.map((e) => ({
            surahName: surahNameMap[e.surahId] || `سورة ${e.surahId}`,
            ayahs: `${e.fromAyah}-${e.toAyah}`,
            lastReviewed: e.lastReviewedDate,
            nextReview: e.nextReviewDate,
          })),
          userRequest: userRequest.trim(),
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setPlan(data);
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDone = (surahName: string, ayahs: string) => {
    const entry = needsReview.find(
      (e) =>
        (surahNameMap[e.surahId] || `سورة ${e.surahId}`) === surahName &&
        `${e.fromAyah}-${e.toAyah}` === ayahs
    );
    if (entry) {
      markAsReviewed(entry.id);
      setDoneIds((prev) => new Set(prev).add(entry.id));
    }
  };

  const handleAddNew = (surahName: string, startAyah: number, endAyah: number) => {
    const surah = QURAN_SURAHS.find((s) => s.name === surahName);
    if (!surah) return;
    addMemorization({
      surahId: surah.id,
      fromAyah: startAyah,
      toAyah: endAyah,
      dateMemorized: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <GlassCard className="p-5" hover={false} glow="accent">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-accent-light" />
        <span className="text-sm font-medium text-secondary">الموجه الذكي</span>
      </div>

      {/* Step 1: Greeting */}
      <p className="text-sm text-primary mb-4 leading-relaxed">
        {lastEntry
          ? `لقد توقفت مؤخراً عند سورة ${currentSurahName} آية ${lastEntry.toAyah}.`
          : "لم تبدأ بعد في حفظ القرآن."}
        {" "}كم من الوقت متاح لك اليوم للإنجاز؟
      </p>

      {/* Step 2: User input */}
      <div className="flex gap-2 mb-4">
        <GlassInput
          value={userRequest}
          onChange={setUserRequest}
          placeholder='مثال: "لدي 20 دقيقة" أو "أريد حفظ صفحة جديدة"'
          className="flex-1"
        />
        <GlassButton
          variant="primary"
          size="md"
          onClick={handleGenerate}
          disabled={loading || !userRequest.trim()}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          توليد خطة اليوم
        </GlassButton>
      </div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-4"
          >
            <Loader2 size={20} className="text-accent-light animate-spin" />
            <span className="text-sm text-secondary">يتم إنشاء الخطة الذكية...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: AI Plan */}
      <AnimatePresence>
        {plan && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 pt-2 border-t border-white/10"
          >
            {/* Review Plan */}
            {plan.reviewPlan && plan.reviewPlan.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-secondary flex items-center gap-1.5 mb-2">
                  <Clock size={12} />
                  ورد المراجعة
                </h4>
                <div className="space-y-1.5">
                  {plan.reviewPlan.map((item, i) => {
                    const done = [...doneIds].some(
                      (id) =>
                        needsReview.find(
                          (e) =>
                            e.id === id &&
                            (surahNameMap[e.surahId] || `سورة ${e.surahId}`) === item.surahName &&
                            `${e.fromAyah}-${e.toAyah}` === item.ayahs
                        )
                    );
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
                      >
                        <span className="text-xs text-primary">
                          {item.surahName} ({item.ayahs})
                        </span>
                        <button
                          onClick={() => handleReviewDone(item.surahName, item.ayahs)}
                          disabled={done}
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition-all ${
                            done
                              ? "bg-green-500/20 text-green-accent border border-green-500/20"
                              : "bg-[rgba(255,255,255,0.05)] text-secondary border border-white/10 hover:bg-green-500/15 hover:text-green-accent hover:border-green-500/25"
                          }`}
                        >
                          <CheckCircle size={12} />
                          {done ? "تم" : "تم"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Memorization */}
            {plan.newMemorization && plan.newMemorization.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-secondary flex items-center gap-1.5 mb-2">
                  <Plus size={12} />
                  الحفظ الجديد
                </h4>
                <div className="space-y-1.5">
                  {plan.newMemorization.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
                    >
                      <span className="text-xs text-primary">
                        {item.surahName} ({item.startAyah}-{item.endAyah})
                      </span>
                      <button
                        onClick={() => handleAddNew(item.surahName, item.startAyah, item.endAyah)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-accent/15 border border-accent/25 text-accent-light hover:bg-accent/25 transition-all"
                      >
                        <Plus size={12} />
                        إضافة للحفظ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
