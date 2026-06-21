"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, CheckCircle, Circle, Play, ExternalLink,
  BookOpen, GraduationCap, Globe, Clock,
} from "lucide-react";
import { GlassButton } from "@/components/ui";
import { useCoursesStore } from "@/store/courses.store";
import { useSilentTracker } from "@/hooks/useSilentTracker";
import type { Course } from "@/types/courses";

const platformMeta: Record<string, { icon: typeof Play; color: string }> = {
  YouTube: { icon: Play, color: "#FF0000" },
  Udemy: { icon: BookOpen, color: "#A435F0" },
  Coursera: { icon: GraduationCap, color: "#0056D2" },
};
const defaultMeta = { icon: Globe, color: "#F97316" };

interface Props {
  course: Course;
  onClose: () => void;
}

export default function CourseDetailsModal({ course, onClose }: Props) {
  const { toggleLesson } = useCoursesStore();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const progress =
    course.totalLessons > 0
      ? Math.round((course.completedLessons / course.totalLessons) * 100)
      : 0;

  const sessionSeconds = useSilentTracker(course.id);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const displayedTime = formatTime(course.totalTimeSpent + sessionSeconds);

  const meta = platformMeta[course.platform] || defaultMeta;
  const Icon = meta.icon;
  const nextLesson = course.lessons.find((l) => !l.isCompleted);
  const currentIdx = course.lessons.findIndex((l) => !l.isCompleted);

  return (
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
        className="relative w-full max-w-xl max-h-[90vh] rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,20,30,0.85)] backdrop-blur-2xl shadow-2xl shadow-black/30 flex flex-col overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />

        {/* Header */}
        <div className="relative z-10 shrink-0">
          {course.coverImage && (
            <div
              className="relative h-28 bg-cover bg-center"
              style={{ backgroundImage: `url(${course.coverImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[rgba(15,20,30,1)]" />
            </div>
          )}

          <div className="px-6 pt-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="p-2 rounded-xl shrink-0"
                  style={{ backgroundColor: `${meta.color}22` }}
                >
                  <Icon size={18} style={{ color: meta.color }} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#F1F5F9] truncate">
                    {course.name}
                  </h2>
                  <p className="text-xs text-secondary">{course.platform}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#94A3B8] hover:text-[#F1F5F9]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-l from-accent to-accent-light"
                />
              </div>
              <span className="text-xs text-secondary tabular-nums shrink-0">
                {course.completedLessons}/{course.totalLessons}
              </span>
            </div>

            {/* Auto-tracking indicator */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-secondary/60" />
                <span className="text-xs text-secondary/60 tabular-nums" dir="ltr">
                  {displayedTime}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-[10px] text-white/40">
                  يتم احتساب وقت التعلم تلقائياً
                </span>
              </div>
            </div>

            {nextLesson && (
              <div className="mt-3 flex justify-center">
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(nextLesson.url, "_blank")}
                >
                  <ExternalLink size={14} />
                  متابعة الدرس الحالي
                </GlassButton>
              </div>
            )}
          </div>
        </div>

        {/* Timeline scrollable body */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5">
          <div className="relative" dir="rtl">
            {/* Vertical connecting line */}
            <div className="absolute right-[11px] top-1 bottom-1 w-0.5 bg-[rgba(255,255,255,0.06)]" />

            <div className="space-y-0">
              {course.lessons.map((lesson, idx) => {
                const isCompleted = lesson.isCompleted;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={lesson.id}
                    className="relative flex items-stretch gap-3 group cursor-pointer"
                    onClick={() => toggleLesson(course.id, lesson.id)}
                  >
                    {/* Timeline node */}
                    <div className="relative z-10 flex flex-col items-center shrink-0 pt-1">
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-accent drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                        >
                          <CheckCircle size={22} />
                        </motion.div>
                      ) : isCurrent ? (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="text-accent-light drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]"
                        >
                          <Circle size={22} fill="rgba(249,115,22,0.3)" />
                        </motion.div>
                      ) : (
                        <Circle size={22} className="text-[rgba(255,255,255,0.15)]" />
                      )}

                      {/* Connector line (except last) */}
                      {idx < course.lessons.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 min-h-[24px] mt-1 ${
                            isCompleted
                              ? "bg-green-accent/30"
                              : "bg-[rgba(255,255,255,0.06)]"
                          }`}
                        />
                      )}
                    </div>

                    {/* Lesson content card */}
                    <div
                      className={`flex-1 mb-2 p-3 rounded-xl border transition-all duration-200
                        ${
                          isCompleted
                            ? "bg-[rgba(16,185,129,0.06)] border-green-accent/15"
                            : isCurrent
                            ? "bg-[rgba(249,115,22,0.08)] border-accent/25"
                            : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.05)]"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm transition-all ${
                              isCompleted
                                ? "text-green-accent line-through decoration-green-accent/40"
                                : isCurrent
                                ? "text-[#F1F5F9] font-medium"
                                : "text-[rgba(255,255,255,0.35)]"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>

                        {/* Actions: play / open */}
                        {isCurrent && lesson.url && (
                          <a
                            href={lesson.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-accent/20 border border-accent/30 hover:bg-accent/30 text-accent-light transition-colors shrink-0"
                          >
                            <Play size={14} />
                          </a>
                        )}

                        {/* Hover toggle indicator */}
                        {!isCompleted && !isCurrent && (
                          <span className="opacity-0 group-hover:opacity-100 text-secondary/40 transition-opacity">
                            <CheckCircle size={14} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
