"use client";

import { motion } from "framer-motion";
import { X, RotateCcw, Trash2, Archive } from "lucide-react";
import { GlassBadge } from "@/components/ui";
import { useWorkspaceStore } from "@/store/workspace.store";
import type { Task } from "@/types/workspace";

interface Props {
  tasks: Task[];
  onClose: () => void;
}

const priorityLabel: Record<string, string> = {
  critical: "عاجل", high: "مهم", medium: "متوسط", low: "عادي",
};
const priorityVariant: Record<string, "danger" | "warning" | "info" | "default"> = {
  critical: "danger", high: "warning", medium: "info", low: "default",
};

export default function ArchiveModal({ tasks, onClose }: Props) {
  const { restoreTask, deleteTask } = useWorkspaceStore();
  const archived = tasks.filter((t) => t.status === "archived");

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
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,20,30,0.85)] backdrop-blur-2xl shadow-2xl shadow-black/30"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2">
              <Archive size={16} className="text-[#94A3B8]" />
              <h2 className="text-lg font-bold text-[#F1F5F9]">أرشيف المهام</h2>
              <span className="text-xs text-[#94A3B8] font-normal">({archived.length})</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-5">
            {archived.length === 0 ? (
              <p className="text-sm text-[#94A3B8] py-6 text-center">لا توجد مهام مؤرشفة</p>
            ) : (
              <div className="space-y-2">
                {archived.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F1F5F9] truncate opacity-60">{task.title}</p>
                      <p className="text-xs text-[#94A3B8] truncate opacity-50">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {task.dueDate && (
                        <span className="text-[10px] text-[#94A3B8] ml-2">{task.dueDate}</span>
                      )}
                      <GlassBadge variant={priorityVariant[task.priority]}>
                        {priorityLabel[task.priority]}
                      </GlassBadge>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => restoreTask(task.id)}
                        className="p-1.5 rounded-lg text-[#94A3B8]/40 hover:text-accent-light hover:bg-accent/10 transition-all"
                        title="استعادة"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-[#94A3B8]/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="حذف نهائي"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
