"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud, Camera, FileText, X, Check,
} from "lucide-react";
import { GlassModal, GlassButton } from "@/components/ui";
import { useDocumentsStore } from "@/store/documents.store";

const categories = [
  { id: "personal", label: "شخصي" },
  { id: "work", label: "عمل" },
  { id: "finance", label: "مالي" },
  { id: "official", label: "رسمي" },
  { id: "education", label: "تعليمي" },
];

const fileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadDocumentModal({ open, onClose }: Props) {
  const { addDocument } = useDocumentsStore();

  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = useCallback(() => {
    setFile(null);
    setCaptured(null);
    setTitle("");
    setCategory("");
    setDescription("");
    setMode("upload");
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      const id = setTimeout(() => {
        stopStream();
        resetForm();
      }, 0);
      prevOpen.current = open;
      return () => { clearTimeout(id); stopStream(); };
    }
    prevOpen.current = open;
    return () => stopStream();
  }, [open, stopStream, resetForm]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      alert("تعذر الوصول إلى الكاميرا. تأكد من منح الصلاحية.");
    }
  };

  const stopCamera = () => {
    stopStream();
    setCaptured(null);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/png"));
    stopStream();
  };

  const handleRetake = () => {
    setCaptured(null);
    startCamera();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const tags = category ? [category] : [];
    const now = new Date();
    const issueDate = now.toISOString().slice(0, 10);
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const expiryDate = nextYear.toISOString().slice(0, 10);

    addDocument({
      name: title.trim(),
      type: file ? file.name.split(".").pop() || "unknown" : "png",
      tags,
      issueDate,
      expiryDate,
      fileUrl: captured || undefined,
      size: file ? fileSize(file.size) : "0 KB",
      description: description.trim() || undefined,
    });

    onClose();
  };

  const canSubmit = title.trim().length > 0;

  return (
    <GlassModal open={open} onClose={onClose} title="رفع وثيقة جديدة">
      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] w-fit" dir="ltr">
        <button
          onClick={() => setMode("upload")}
          className={`relative px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
            mode === "upload" ? "text-white" : "text-secondary hover:text-primary"
          }`}
        >
          {mode === "upload" && (
            <motion.div
              layoutId="doc-tab"
              className="absolute inset-0 rounded-lg bg-[rgba(249,115,22,0.15)] border border-accent/20"
            />
          )}
          <UploadCloud size={14} className="relative z-10" />
          <span className="relative z-10">رفع ملف</span>
        </button>
        <button
          onClick={() => setMode("camera")}
          className={`relative px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
            mode === "camera" ? "text-white" : "text-secondary hover:text-primary"
          }`}
        >
          {mode === "camera" && (
            <motion.div
              layoutId="doc-tab"
              className="absolute inset-0 rounded-lg bg-[rgba(249,115,22,0.15)] border border-accent/20"
            />
          )}
          <Camera size={14} className="relative z-10" />
          <span className="relative z-10">التقاط صورة</span>
        </button>
      </div>

      {/* Upload Mode */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all ${
            dragOver
              ? "border-accent/50 bg-accent/10 scale-[1.02]"
              : "border-white/20 bg-white/5 hover:bg-white/10"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          {file ? (
            <div className="text-center">
              <FileText size={32} className="text-accent-light mx-auto mb-2" />
              <p className="text-sm font-medium text-primary mb-1">{file.name}</p>
              <p className="text-xs text-secondary">{fileSize(file.size)}</p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="mt-3 text-xs text-secondary hover:text-danger transition-colors"
              >
                إزالة
              </button>
            </div>
          ) : (
            <>
              <UploadCloud size={36} className="text-accent-light mb-3" />
              <p className="text-sm font-medium text-primary mb-1">اسحب الملف إلى هنا أو اضغط للاختيار</p>
              <p className="text-xs text-secondary">PDF, Excel, Images</p>
            </>
          )}
        </div>
      )}

      {/* Camera Mode */}
      {mode === "camera" && (
        <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-black/40">
          {captured ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={captured} alt="captured" className="w-full h-auto max-h-[280px] object-contain" />
              <div className="flex justify-center gap-2 p-3">
                <GlassButton variant="secondary" size="sm" onClick={handleRetake}>
                  <Camera size={14} />
                  إعادة الالتقاط
                </GlassButton>
              </div>
            </div>
          ) : stream ? (
            <div>
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[280px] object-contain" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex justify-center gap-2 p-3">
                <GlassButton variant="primary" size="sm" onClick={captureImage}>
                  <Camera size={14} />
                  التقاط
                </GlassButton>
                <GlassButton variant="secondary" size="sm" onClick={stopCamera}>
                  <X size={14} />
                  إلغاء
                </GlassButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              <Camera size={36} className="text-secondary mb-3" />
              <p className="text-sm text-secondary mb-4">اضغط لفتح الكاميرا</p>
              <GlassButton variant="primary" size="sm" onClick={startCamera}>
                <Camera size={14} />
                فتح الكاميرا
              </GlassButton>
            </div>
          )}
        </div>
      )}

      {/* Metadata Form */}
      <div className="space-y-4 mt-5">
        <div>
          <label className="block text-xs text-secondary mb-1.5">عنوان الملف</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أدخل عنوان المستند..."
            dir="rtl"
            className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-primary placeholder:text-secondary/30 outline-none focus:border-accent/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-secondary mb-1.5">التصنيف</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(category === cat.id ? "" : cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                  category === cat.id
                    ? "bg-accent/20 border-accent/30 text-accent-light"
                    : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-secondary hover:border-white/20 hover:text-primary"
                }`}
              >
                {category === cat.id && <Check size={12} className="inline ml-1" />}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-secondary mb-1.5">تفاصيل بسيطة</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ملاحظة قصيرة (اختياري)..."
            dir="rtl"
            rows={3}
            className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-primary placeholder:text-secondary/30 outline-none focus:border-accent/30 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <GlassButton
          variant="primary"
          size="md"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          <UploadCloud size={16} />
          حفظ الوثيقة
        </GlassButton>
      </div>
    </GlassModal>
  );
}
