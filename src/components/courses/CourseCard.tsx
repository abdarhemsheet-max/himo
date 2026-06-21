"use client";

import { motion } from "framer-motion";
import { Play, ExternalLink, BookOpen, GraduationCap, Globe } from "lucide-react";
import CircularProgress from "@/components/ui/CircularProgress";
import type { Course } from "@/types/courses";

const platformMeta: Record<string, { label: string; icon: typeof Play; color: string }> = {
  YouTube: { label: "يوتيوب", icon: Play, color: "#FF0000" },
  Udemy: { label: "Udemy", icon: BookOpen, color: "#A435F0" },
  Coursera: { label: "Coursera", icon: GraduationCap, color: "#0056D2" },
};
const defaultMeta = { label: "دورة", icon: Globe, color: "#F97316" };

interface Props {
  course: Course;
  index: number;
  onClick: () => void;
}

export default function CourseCard({ course, index, onClick }: Props) {
  const progress = course.totalLessons > 0
    ? Math.round((course.completedLessons / course.totalLessons) * 100)
    : 0;
  const meta = platformMeta[course.platform] || defaultMeta;
  const Icon = meta.icon;
  const nextLesson = course.lessons.find((l) => !l.isCompleted);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <button
        onClick={onClick}
        className="w-full text-right group"
      >
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:border-white/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

          {course.coverImage && (
            <div className="relative h-28 bg-cover bg-center" style={{ backgroundImage: `url(${course.coverImage})` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[rgba(15,20,30,1)]" />
            </div>
          )}

          <div className="relative z-10 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div
                className="relative"
                style={{ width: 64, height: 64 }}
              >
                <CircularProgress
                  value={progress}
                  size={64}
                  strokeWidth={5}
                  color={meta.color}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-white"
                    style={{ backgroundColor: `${meta.color}22`, borderColor: `${meta.color}44` }}
                  >
                    <Icon size={10} />
                    {meta.label}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-primary truncate">{course.name}</h3>
                <p className="text-xs text-secondary mt-0.5">
                  {course.completedLessons}/{course.totalLessons} دروس
                </p>
              </div>
            </div>

            <div className="mb-3">
              <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-l from-accent to-accent-light"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary">{progress}% مكتمل</span>
              {nextLesson && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(nextLesson.url, "_blank");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[rgba(249,115,22,0.2)] border border-accent/30 hover:bg-[rgba(249,115,22,0.3)] text-white backdrop-blur-md transition-colors cursor-pointer"
                >
                  <ExternalLink size={12} />
                  متابعة الدرس الحالي
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}
