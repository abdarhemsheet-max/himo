"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Briefcase, Wallet, BookOpen, GraduationCap,
  CheckSquare, FileBarChart, Search,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

const allCommands = (router: ReturnType<typeof useRouter>): Command[] => [
  { id: "dashboard", label: "لوحة القيادة", description: "الصفحة الرئيسية", icon: <LayoutDashboard size={16} />, action: () => router.push("/") },
  { id: "workspace", label: "مساحة العمل", description: "العملاء والشركات والمهام", icon: <Briefcase size={16} />, action: () => router.push("/workspace") },
  { id: "finance", label: "المالية", description: "المحافظ والدخل والمصروفات", icon: <Wallet size={16} />, action: () => router.push("/finance") },
  { id: "quran", label: "القرآن", description: "الحفظ والمراجعة", icon: <BookOpen size={16} />, action: () => router.push("/quran") },
  { id: "courses", label: "التعلم", description: "الدورات والدروس", icon: <GraduationCap size={16} />, action: () => router.push("/courses") },
  { id: "habits", label: "العادات", description: "العادات اليومية والمهام", icon: <CheckSquare size={16} />, action: () => router.push("/habits") },
  { id: "reports", label: "التقارير", description: "إنشاء تقارير أسبوعية وشهرية", icon: <FileBarChart size={16} />, action: () => router.push("/reports") },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = allCommands(router);
  const filtered = query
    ? commands.filter((c) => c.label.includes(query) || c.description.includes(query))
    : commands;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((p) => !p);
      }
      if (e.key === "Escape" && open) close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const execute = (cmd: Command) => {
    cmd.action();
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      execute(filtered[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
          onClick={close}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg mx-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0F1420]/95 backdrop-blur-2xl shadow-2xl shadow-black/40"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <Search size={16} className="text-secondary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="ابحث عن صفحة..."
                className="flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-secondary/50"
                dir="rtl"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-secondary/60 bg-white/5 rounded border border-white/5">
                ESC
              </kbd>
            </div>

            <div className="max-h-72 overflow-y-auto py-2" dir="rtl">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-sm text-secondary/60 text-center">لا توجد نتائج</p>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={() => execute(cmd)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-right transition-all ${
                      i === selectedIndex
                        ? "bg-accent/10 text-accent-light border-r-2 border-accent"
                        : "text-secondary hover:text-primary hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="shrink-0 opacity-60">{cmd.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{cmd.label}</p>
                      <p className="text-[11px] text-secondary/60">{cmd.description}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
