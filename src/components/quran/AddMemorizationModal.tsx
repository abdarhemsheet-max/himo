"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Plus } from "lucide-react";
import { GlassButton } from "@/components/ui";
import { QURAN_SURAHS } from "@/lib/quran-surahs";
import { useQuranStore } from "@/store/quran.store";

interface Props {
  open: boolean;
  onClose: () => void;
  prefill?: { surahId?: number; fromAyah?: number; toAyah?: number };
}

export default function AddMemorizationModal({ open, onClose, prefill }: Props) {
  const addMemorization = useQuranStore((s) => s.addMemorization);

  const [surahId, setSurahId] = useState(prefill?.surahId || QURAN_SURAHS[0].id);
  const [fromAyah, setFromAyah] = useState(prefill?.fromAyah ? String(prefill.fromAyah) : "1");
  const [toAyah, setToAyah] = useState(prefill?.toAyah ? String(prefill.toAyah) : "");

  useEffect(() => {
    const id = setTimeout(() => {
      if (prefill?.surahId) setSurahId(prefill.surahId);
      if (prefill?.fromAyah) setFromAyah(String(prefill.fromAyah));
      if (prefill?.toAyah) setToAyah(String(prefill.toAyah));
    }, 0);
    return () => clearTimeout(id);
  }, [prefill?.surahId, prefill?.fromAyah, prefill?.toAyah]);

  useEffect(() => {
    const surah = QURAN_SURAHS.find((s) => s.id === surahId);
    if (surah && !toAyah) {
      const id = setTimeout(() => setToAyah(String(surah.totalAyahs)), 0);
      return () => clearTimeout(id);
    }
  }, [surahId, toAyah]);

  const selected = QURAN_SURAHS.find((s) => s.id === surahId);
  const maxAyah = selected?.totalAyahs ?? 0;

  const handleSave = () => {
    const from = parseInt(fromAyah) || 1;
    const to = parseInt(toAyah) || maxAyah;
    if (from > to || to > maxAyah) return;
    addMemorization({
      surahId,
      fromAyah: from,
      toAyah: to,
      dateMemorized: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="relative w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,20,30,0.85)] backdrop-blur-2xl shadow-2xl shadow-black/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-bold text-[#F1F5F9]">إضافة حفظ جديد</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#94A3B8] hover:text-[#F1F5F9]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5" dir="rtl">
                {/* Surah dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-secondary">السورة</label>
                  <div className="relative">
                    <select
                      value={surahId}
                      onChange={(e) => setSurahId(Number(e.target.value))}
                      dir="rtl"
                      className="w-full px-4 py-2.5 appearance-none bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-xl text-primary outline-none transition-all duration-200 focus:border-accent/50 text-sm"
                    >
                      {QURAN_SURAHS.map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#0B0F19] text-primary">
                          {s.id}. {s.name} ({s.totalAyahs} آية)
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                  </div>
                </div>

                {/* From / To Ayah */}
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-secondary">من آية</label>
                    <input
                      type="number"
                      min={1}
                      max={maxAyah}
                      value={fromAyah}
                      onChange={(e) => setFromAyah(e.target.value)}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-xl text-primary outline-none transition-all duration-200 focus:border-accent/50 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-secondary">إلى آية</label>
                    <input
                      type="number"
                      min={1}
                      max={maxAyah}
                      value={toAyah}
                      onChange={(e) => setToAyah(e.target.value)}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-xl text-primary outline-none transition-all duration-200 focus:border-accent/50 text-sm"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <GlassButton variant="secondary" size="md" onClick={onClose} className="flex-1">
                    إلغاء
                  </GlassButton>
                  <GlassButton variant="primary" size="md" onClick={handleSave} className="flex-1">
                    <Plus size={14} />
                    حفظ
                  </GlassButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
