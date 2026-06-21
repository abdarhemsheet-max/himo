"use client";

import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { usePomodoro } from "@/hooks/usePomodoro";

const SIZE = 180;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export default function ZenPomodoroTimer() {
  const { mode, display, progress, isRunning, toggleTimer, resetTimer } = usePomodoro();

  const isFocus = mode === "focus";
  const accentColor = isFocus ? "rgba(96, 165, 250, 0.8)" : "rgba(74, 222, 128, 0.8)";
  const trackColor = "rgba(255,255,255,0.06)";
  const glowColor = isFocus ? "rgba(96, 165, 250, 0.15)" : "rgba(74, 222, 128, 0.15)";

  const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative flex flex-col items-center p-6 rounded-2xl transition-all duration-500 ${
        isRunning
          ? "shadow-[0_0_30px_var(--glow-color)]"
          : ""
      }`}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        "--glow-color": glowColor,
      } as React.CSSProperties}
    >
      {/* SVG Ring */}
      <svg width={SIZE} height={SIZE} className="mb-3">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={trackColor}
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={accentColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            filter: `drop-shadow(0 0 6px ${accentColor})`,
          }}
        />
      </svg>

      {/* Display */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-mono font-bold text-primary tracking-wider mb-4"
        style={{ direction: "ltr" }}
      >
        {display}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTimer}
          className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.1)] transition-all"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.1)] transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Mode label */}
      <motion.span
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-secondary mt-3"
      >
        {isFocus ? "تركيز" : "استراحة"}
      </motion.span>
    </motion.div>
  );
}
