"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, Download, Printer, FileText, ImageIcon,
  CalendarDays, Tag, AlignLeft, HardDrive, FileType,
} from "lucide-react";
import { GlassBadge } from "@/components/ui";
import type { Document } from "@/types/documents";

const tagLabels: Record<string, string> = {
  official: "رسمي",
  work: "عمل",
  personal: "شخصي",
  finance: "مالي",
  education: "تعليمي",
};

const tagColors: Record<string, "info" | "warning" | "success" | "danger" | "default"> = {
  official: "danger",
  work: "info",
  personal: "warning",
  finance: "success",
  education: "default",
};

interface Props {
  document: Document;
  onClose: () => void;
}

export default function DocumentViewerModal({ document: doc, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(doc.type);
  const isPdf = doc.type === "pdf";
  const previewContent = doc.fileUrl;

  const handleDownload = () => {
    if (previewContent) {
      const a = document.createElement("a");
      a.href = previewContent;
      a.download = `${doc.name}.${doc.type}`;
      a.click();
    }
  };

  const handlePrint = () => {
    if (previewContent) {
      const w = window.open("", "_blank");
      if (!w) return;
      w.document.write(
        isImage
          ? `<img src="${previewContent}" style="max-width:100%" />`
          : `<iframe src="${previewContent}" style="width:100%;height:100vh;border:none"></iframe>`
      );
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 500);
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
        className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,20,30,0.85)] backdrop-blur-2xl shadow-2xl shadow-black/30 flex flex-col"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[rgba(59,130,246,0.15)]">
              <FileText size={18} className="text-blue-accent" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#F1F5F9] truncate">{doc.name}</h2>
              <p className="text-xs text-secondary">{doc.size} — {doc.type.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-accent/20 border border-accent/30 hover:bg-accent/30 text-accent-light transition-all"
              title="تنزيل الوثيقة"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-[rgba(255,255,255,0.05)] border border-white/10 hover:bg-[rgba(255,255,255,0.1)] text-secondary hover:text-primary transition-all"
              title="طباعة"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Preview (left side) */}
            <div className="flex-1 min-h-[300px] lg:min-h-0 lg:w-3/5 bg-[#0B0F19]/50 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center">
              {previewContent ? (
                isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewContent}
                    alt={doc.name}
                    loading="lazy"
                    className="w-full h-full object-contain max-h-[65vh]"
                  />
                ) : isPdf ? (
                  <iframe
                    src={previewContent}
                    className="w-full h-[65vh]"
                    title={doc.name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-secondary">
                    <FileType size={48} className="mb-3 text-accent-light" />
                    <p className="text-sm font-medium mb-1">معاينة غير متاحة</p>
                    <p className="text-xs">هذا النوع من الملفات لا يدعم المعاينة المباشرة</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-secondary">
                  <ImageIcon size={48} className="mb-3" />
                  <p className="text-sm font-medium mb-1">لا توجد معاينة</p>
                  <p className="text-xs">لم يتم رفع ملف لهذه الوثيقة</p>
                </div>
              )}
            </div>

            {/* Metadata (right side, RTL) */}
            <div dir="rtl" className="lg:w-2/5 space-y-5">
              {/* Title */}
              <div>
                <label className="flex items-center gap-1.5 text-xs text-secondary mb-2">
                  <FileText size={13} className="text-accent-light" />
                  عنوان الوثيقة
                </label>
                <p className="text-sm font-medium text-[#F1F5F9]">{doc.name}</p>
              </div>

              {/* Category Badges */}
              <div>
                <label className="flex items-center gap-1.5 text-xs text-secondary mb-2">
                  <Tag size={13} className="text-accent-light" />
                  التصنيف
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.length > 0 ? (
                    doc.tags.map((tag) => (
                      <GlassBadge key={tag} variant={tagColors[tag] || "default"}>
                        {tagLabels[tag] || tag}
                      </GlassBadge>
                    ))
                  ) : (
                    <span className="text-xs text-secondary">—</span>
                  )}
                </div>
              </div>

              {/* Description */}
              {doc.description && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-secondary mb-2">
                    <AlignLeft size={13} className="text-accent-light" />
                    تفاصيل بسيطة
                  </label>
                  <p className="text-sm text-[#94A3B8] leading-relaxed bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2.5">
                    {doc.description}
                  </p>
                </div>
              )}

              {/* Upload Date & Size row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2.5">
                  <label className="flex items-center gap-1.5 text-xs text-secondary mb-1">
                    <CalendarDays size={12} className="text-accent-light" />
                    تاريخ الإضافة
                  </label>
                  <p className="text-sm font-medium text-[#F1F5F9]">{doc.issueDate}</p>
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2.5">
                  <label className="flex items-center gap-1.5 text-xs text-secondary mb-1">
                    <HardDrive size={12} className="text-accent-light" />
                    الحجم
                  </label>
                  <p className="text-sm font-medium text-[#F1F5F9]">{doc.size}</p>
                </div>
              </div>

              {/* Expiry */}
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-3 py-2.5">
                <label className="flex items-center gap-1.5 text-xs text-secondary mb-1">
                  <CalendarDays size={12} className="text-warning" />
                  تاريخ انتهاء الصلاحية
                </label>
                <p className="text-sm font-medium text-[#F1F5F9]">{doc.expiryDate}</p>
              </div>

              {/* Download & Print buttons (mobile fallback) */}
              <div className="flex gap-2 lg:hidden pt-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-accent/20 border border-accent/30 hover:bg-accent/30 text-accent-light transition-all"
                >
                  <Download size={16} />
                  تنزيل الوثيقة
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-[rgba(255,255,255,0.05)] border border-white/10 hover:bg-[rgba(255,255,255,0.1)] text-primary transition-all"
                >
                  <Printer size={16} />
                  طباعة
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
