"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Play, CheckCircle, Trash2, Archive,
} from "lucide-react";
import { GlassCard, GlassBadge } from "@/components/ui";
import { useWorkspaceStore } from "@/store/workspace.store";
import ArchiveModal from "@/components/workspace/ArchiveModal";

const columns = [
  { id: "pending" as const, label: "المهام المعلقة", color: "bg-[rgba(59,130,246,0.15)] text-blue-accent border-blue-accent/20" },
  { id: "in-progress" as const, label: "قيد التنفيذ", color: "bg-[rgba(245,158,11,0.15)] text-warning border-warning/20" },
];

const priorityLabel: Record<string, string> = {
  critical: "عاجل", high: "مهم", medium: "متوسط", low: "عادي",
};
const priorityVariant: Record<string, "danger" | "warning" | "info" | "default"> = {
  critical: "danger", high: "warning", medium: "info", low: "default",
};

export default function TaskBoard() {
  const { tasks, addTask, moveToInProgress, archiveTask, deleteTask } = useWorkspaceStore();
  const [showInput, setShowInput] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showArchive, setShowArchive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTasks = tasks.filter((t) => t.status !== "archived");

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    addTask("", title);
    setNewTitle("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") { setShowInput(false); setNewTitle(""); }
  };

  return (
    <div>
      {/* Header with global add */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8]">
            إجمالي المهام النشطة: {activeTasks.length}
          </span>
        </div>
        {!showInput && (
          <button
            onClick={() => { setShowInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="relative px-3 py-1.5 text-sm font-medium rounded-xl flex items-center gap-2 transition-colors text-secondary hover:text-primary hover:bg-white/5"
          >
            <Plus size={16} />
            إضافة مهمة جديدة
          </button>
        )}
      </div>

      {/* Inline add input */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
              <input
                ref={inputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب اسم المهمة واضغط Enter..."
                dir="rtl"
                className="flex-1 px-4 py-2 bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-xl text-primary placeholder:text-secondary/50 outline-none transition-all duration-200 focus:border-accent/50 focus:shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)] text-sm"
              />
              <button
                onClick={handleAdd}
                className="p-2 rounded-xl bg-accent/20 border border-accent/30 hover:bg-accent/30 text-accent-light transition-colors"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => { setShowInput(false); setNewTitle(""); }}
                className="p-2 rounded-xl bg-[rgba(255,255,255,0.05)] border border-white/10 hover:bg-[rgba(255,255,255,0.1)] text-secondary transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {columns.map((column) => {
          const colTasks = activeTasks.filter((t) => t.status === column.id);
          return (
            <div key={column.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${column.color}`}>
                  {column.label}
                </span>
                <span className="text-xs text-[#94A3B8]">{colTasks.length}</span>
              </div>
              {colTasks.length === 0 ? (
                <p className="text-xs text-[#94A3B8]/40 text-center py-8">
                  {column.id === "pending" ? "لا توجد مهام معلقة" : "لا توجد مهام قيد التنفيذ"}
                </p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {colTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: column.id === "pending" ? 50 : -50 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <GlassCard className="p-3 group" hover={false}>
                          <div className="flex items-start gap-2">
                            {column.id === "pending" ? (
                              <button
                                onClick={() => moveToInProgress(task.id)}
                                className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all text-[#94A3B8] hover:text-warning hover:scale-110"
                                title="نقل للتنفيذ"
                              >
                                <Play size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => archiveTask(task.id)}
                                className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all text-[#94A3B8] hover:text-green-accent hover:scale-110"
                                title="أرشفة"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-primary mb-1">{task.title}</p>
                              <p className="text-xs text-secondary mb-2">{task.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-secondary">{task.dueDate}</span>
                                <GlassBadge variant={priorityVariant[task.priority]}>
                                  {priorityLabel[task.priority]}
                                </GlassBadge>
                              </div>
                            </div>

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8]/40 hover:text-red-400"
                              title="حذف"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tiny archive button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => setShowArchive(true)}
          className="text-xs text-[#94A3B8]/50 hover:text-[#94A3B8] transition-all border border-white/5 bg-white/[0.02] px-3 py-1 rounded-full flex items-center gap-1.5"
        >
          <Archive size={12} />
          أرشيف المهام
        </button>
      </div>

      <AnimatePresence>
        {showArchive && (
          <ArchiveModal tasks={tasks} onClose={() => setShowArchive(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
