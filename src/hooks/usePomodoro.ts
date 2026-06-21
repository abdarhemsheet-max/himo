"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuranStore } from "@/store/quran.store";

type PomodoroMode = "focus" | "break";

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

export function usePomodoro(initialMinutes = FOCUS_MINUTES) {
  const logFocusSession = useQuranStore((s) => s.logFocusSession);

  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const switchMode = useCallback((nextMode: PomodoroMode) => {
    setMode(nextMode);
    setTimeLeft(nextMode === "focus" ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (modeRef.current === "focus") {
            logFocusSession(FOCUS_MINUTES);
          }
          switchMode(modeRef.current === "focus" ? "break" : "focus");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer, logFocusSession, switchMode]);

  const toggleTimer = useCallback(() => {
    setIsRunning((p) => !p);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setMode("focus");
    setTimeLeft(FOCUS_MINUTES * 60);
  }, [clearTimer]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = mode === "focus"
    ? 1 - timeLeft / (FOCUS_MINUTES * 60)
    : 1 - timeLeft / (BREAK_MINUTES * 60);

  return {
    mode,
    display,
    progress,
    isRunning,
    toggleTimer,
    resetTimer,
  };
}
