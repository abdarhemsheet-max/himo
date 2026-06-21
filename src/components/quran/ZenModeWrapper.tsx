"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, X } from "lucide-react";

interface Props {
  active: boolean;
  onExit: () => void;
  children: ReactNode;
}

export default function ZenModeWrapper({ active, onExit, children }: Props) {
  return (
    <>
      {/* Normal mode */}
      <AnimatePresence mode="wait">
        {!active && <motion.div key="normal">{children}</motion.div>}
      </AnimatePresence>

      {/* Zen mode overlay */}
      <AnimatePresence>
        {active && (
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

            {/* Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl px-6 max-h-[80vh] overflow-y-auto"
            >
              {children}
            </motion.div>

            {/* Exit button */}
            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              onClick={onExit}
              className="absolute bottom-10 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.1)] transition-all backdrop-blur-xl"
            >
              <X size={16} />
              <span className="text-sm font-medium">الخروج من وضع الخلوة</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
