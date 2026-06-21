"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Clock, Plus, Play, CheckCircle, Trash2,
  Building2, CircleDollarSign, Sparkles, Hash, Archive,
} from "lucide-react";
import { GlassBadge, GlassButton } from "@/components/ui";
import { useWorkspaceStore } from "@/store/workspace.store";
import type { Company, Task } from "@/types/workspace";

interface Props {
  company: Company;
  tasks: Task[];
  onClose: () => void;
}

export default function CompanyDetailsModal({ company, tasks, onClose }: Props) {
  const { addTask, moveToInProgress, archiveTask, deleteTask, generateRecurringTasks, addRecurringService, archiveCompany } = useWorkspaceStore();
  const companyTasks = tasks.filter((t) => t.companyId === company.id && t.status !== "archived");
  const doneCount = companyTasks.filter((t) => t.status === "in-progress").length;
  const progress = companyTasks.length > 0 ? Math.round((doneCount / companyTasks.length) * 100) : 0;

  const [showInput, setShowInput] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState("");
  const serviceInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    addTask("", title, company.id);
    setNewTitle("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setShowInput(false);
      setNewTitle("");
    }
  };

  const handleGenerate = () => {
    generateRecurringTasks(company.id);
  };

  const handleAddService = () => {
    const svc = newService.trim();
    if (!svc) return;
    addRecurringService(company.id, svc);
    setNewService("");
    setIsAddingService(false);
  };

  const handleServiceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddService();
    if (e.key === "Escape") {
      setIsAddingService(false);
      setNewService("");
    }
  };

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
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,20,30,0.85)] backdrop-blur-2xl shadow-2xl shadow-black/30"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-accent/30 to-blue-accent/30 flex items-center justify-center text-lg font-bold text-primary">
                {company.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#F1F5F9]">{company.name}</h2>
                  <GlassBadge variant="success">عقد نشط</GlassBadge>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                  <Building2 size={12} />
                  <span>{company.type}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { archiveCompany(company.id); onClose(); }}
                className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#94A3B8]/50 hover:text-warning"
                title="نقل إلى الأرشيف"
              >
                <Archive size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#94A3B8] hover:text-[#F1F5F9]"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Monthly Value & Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.03)] rounded-xl px-3 py-2.5">
                <CircleDollarSign size={14} className="text-green-accent" />
                <span className="text-xs text-[#94A3B8]">قيمة العقد الشهري:</span>
                <span className="text-sm font-bold text-green-accent [text-shadow:0_0_20px_rgba(16,185,129,0.4)]">
                  {company.monthlyValue.toLocaleString("ar-SA")} ر.س
                </span>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-xl px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#94A3B8]">إنجاز مهام الشهر الحالي</span>
                  <span className="text-xs text-[#94A3B8]">{doneCount}/{companyTasks.length}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-accent to-accent-light transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recurring Services */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Hash size={14} className="text-accent-light" />
                  الخدمات الثابتة
                </h3>
                <GlassButton variant="secondary" size="sm" onClick={handleGenerate}>
                  <Sparkles size={14} />
                  توليد المهام
                </GlassButton>
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {company.recurringServices.map((svc, i) => (
                    <motion.span
                      key={`${svc}-${i}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[rgba(249,115,22,0.1)] border border-accent/20 text-accent-light"
                    >
                      {svc}
                    </motion.span>
                  ))}
                </AnimatePresence>

                {!isAddingService ? (
                  <motion.button
                    key="add-svc-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => {
                      setIsAddingService(true);
                      setTimeout(() => serviceInputRef.current?.focus(), 50);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium border border-dashed border-white/10 text-secondary hover:text-accent-light hover:border-accent/30 hover:bg-[rgba(249,115,22,0.08)] transition-all flex items-center gap-1"
                  >
                    <Plus size={12} />
                    إضافة
                  </motion.button>
                ) : (
                  <motion.div
                    key="add-svc-input"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                  >
                    <input
                      ref={serviceInputRef}
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyDown={handleServiceKeyDown}
                      onBlur={() => {
                        if (!newService.trim()) {
                          setIsAddingService(false);
                          setNewService("");
                        }
                      }}
                      placeholder="اسم الخدمة..."
                      dir="rtl"
                      className="px-3 py-1.5 rounded-xl text-xs bg-[rgba(255,255,255,0.05)] border border-white/10 text-primary placeholder:text-secondary/50 outline-none transition-all focus:border-accent/50 w-[160px]"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* This Month's Tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Clock size={14} className="text-accent-light" />
                  مهام الشهر
                  <span className="text-xs text-[#94A3B8] font-normal">({companyTasks.length})</span>
                </h3>
                {!showInput && (
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowInput(true);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                  >
                    <Plus size={14} />
                    إضافة
                  </GlassButton>
                )}
              </div>

              {showInput && (
                <div className="flex items-center gap-2 mb-3">
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
              )}

              {companyTasks.length === 0 && !showInput ? (
                <p className="text-sm text-[#94A3B8] py-6 text-center">لا توجد مهام للشركة هذا الشهر</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {companyTasks.map((task: Task) => {
                    const isPending = task.status === "pending";
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
                      >
                        <button
                          onClick={() => isPending ? moveToInProgress(task.id) : archiveTask(task.id)}
                          className="shrink-0 transition-colors hover:scale-110"
                          title={isPending ? "بدء التنفيذ" : "أرشفة"}
                        >
                          {isPending ? (
                            <Play size={18} className="text-[#94A3B8] hover:text-warning" />
                          ) : (
                            <CheckCircle size={18} className="text-green-accent" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#F1F5F9] truncate">
                            {task.title}
                          </p>
                          {task.description && task.description !== `مهمة شهرية متكررة - ${task.title}` && (
                            <p className="text-xs text-[#94A3B8] truncate">{task.description}</p>
                          )}
                        </div>

                        {task.dueDate && (
                          <span className="text-[10px] text-[#94A3B8] shrink-0">{task.dueDate}</span>
                        )}

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="shrink-0 p-1 rounded-lg text-[#94A3B8]/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
