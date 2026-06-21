"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Loader2, ExternalLink, CheckCircle, ListChecks } from "lucide-react";
import { GlassInput, GlassButton, GlassBadge } from "@/components/ui";
import { simulateCourseExtraction } from "@/lib/mock/extract-course";
import { useCoursesStore } from "@/store/courses.store";
import type { Course } from "@/types/courses";

type Step = "input" | "loading" | "preview";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddCourseModal({ open, onClose }: Props) {
  const addCourse = useCoursesStore((s) => s.addCourse);
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [extracted, setExtracted] = useState<Omit<Course, "id"> | null>(null);

  const handleExtract = async () => {
    if (!url.trim()) return;
    setStep("loading");
    try {
      const result = await simulateCourseExtraction(url.trim());
      setExtracted(result);
      setStep("preview");
    } catch {
      setStep("input");
    }
  };

  const handleSave = () => {
    if (!extracted) return;
    addCourse(extracted);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setStep("input");
    setUrl("");
    setExtracted(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,20,30,0.85)] backdrop-blur-2xl shadow-2xl shadow-black/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-bold text-[#F1F5F9]">
                  {step === "preview" ? "معاينة الدورة" : "إضافة دورة جديدة"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#94A3B8] hover:text-[#F1F5F9]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5" dir="rtl">
                <AnimatePresence mode="wait">
                  {/* Step 1: URL Input */}
                  {step === "input" && (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-5"
                    >
                      <GlassInput
                        label="رابط الدورة أو قائمة التشغيل"
                        value={url}
                        onChange={setUrl}
                        placeholder="https://youtube.com/playlist?list=..."
                        dir="ltr"
                      />
                      <GlassButton
                        variant="primary"
                        size="lg"
                        onClick={handleExtract}
                        disabled={!url.trim()}
                        className="w-full"
                      >
                        <Wand2 size={16} />
                        استخراج البيانات
                      </GlassButton>
                    </motion.div>
                  )}

                  {/* Step 2: Loading */}
                  {step === "loading" && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="flex flex-col items-center gap-4 py-12"
                    >
                      <Loader2 size={36} className="text-accent-light animate-spin" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-primary">
                          جاري تحليل الروابط واستخراج الدروس...
                        </p>
                        <p className="text-xs text-secondary mt-1">
                          قد يستغرق ذلك بضع ثوانٍ
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Preview */}
                  {step === "preview" && extracted && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-5"
                    >
                      {/* Cover + Title */}
                      {extracted.coverImage && (
                        <div
                          className="relative h-28 rounded-xl bg-cover bg-center overflow-hidden"
                          style={{ backgroundImage: `url(${extracted.coverImage})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[rgba(15,20,30,0.9)]" />
                          <div className="absolute bottom-3 right-3 left-3">
                            <GlassBadge variant="info">
                              <CheckCircle size={10} />
                              {extracted.totalLessons} دروس
                            </GlassBadge>
                          </div>
                        </div>
                      )}
                      <h3 className="text-base font-bold text-primary">{extracted.name}</h3>

                      {/* Lessons list */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 text-xs text-secondary">
                          <ListChecks size={14} />
                          الدروس المستخرجة
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pl-1">
                          {extracted.lessons.map((lesson, i) => (
                            <motion.div
                              key={lesson.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
                            >
                              <span className="w-5 h-5 rounded-full bg-accent/15 text-accent-light text-[10px] font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-xs text-primary truncate">
                                {lesson.title}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-1">
                        <GlassButton
                          variant="secondary"
                          size="md"
                          onClick={handleReset}
                          className="flex-1"
                        >
                          إلغاء
                        </GlassButton>
                        <GlassButton
                          variant="primary"
                          size="md"
                          onClick={handleSave}
                          className="flex-1"
                        >
                          <ExternalLink size={14} />
                          حفظ وبدء التعلم
                        </GlassButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
