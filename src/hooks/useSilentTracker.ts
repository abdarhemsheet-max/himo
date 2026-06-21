"use client";

import { useEffect, useRef, useState } from "react";
import { useCoursesStore } from "@/store/courses.store";

export function useSilentTracker(courseId: string) {
  const addTimeSpent = useCoursesStore((s) => s.addTimeSpent);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const handleVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibility);
    intervalRef.current = setInterval(() => {
      if (visibleRef.current) {
        setSessionSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (intervalRef.current) clearInterval(intervalRef.current);
      addTimeSpent(courseId, sessionSeconds);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return sessionSeconds;
}
