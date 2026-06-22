"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { GlassButton } from "@/components/ui";
import AppShell from "@/components/layout/AppShell";
import CourseCard from "@/components/courses/CourseCard";
import CourseDetailsModal from "@/components/courses/CourseDetailsModal";
import AddCourseModal from "@/components/courses/AddCourseModal";
import { useCoursesStore } from "@/store/courses.store";
import type { Course } from "@/types/courses";

export default function CoursesPage() {
  const { courses, selectedCourse, selectCourse } =
    useCoursesStore();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const handleCardClick = (course: Course) => {
    selectCourse(course);
    setDetailsOpen(true);
  };

  return (
    <AppShell title="التعلم المستمر" subtitle="تتبع مسيرتك التعليمية">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-secondary">{courses.length} دورات</span>
        <GlassButton variant="primary" size="md" onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          إضافة دورة
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course, i) => (
          <CourseCard
            key={course.id}
            course={course}
            index={i}
            onClick={() => handleCardClick(course)}
          />
        ))}
      </div>

      <AnimatePresence>
        {detailsOpen && selectedCourse && (
          <CourseDetailsModal
            course={selectedCourse}
            onClose={() => {
              setDetailsOpen(false);
              selectCourse(null);
            }}
          />
        )}
        <AddCourseModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
        />
      </AnimatePresence>
    </AppShell>
  );
}
