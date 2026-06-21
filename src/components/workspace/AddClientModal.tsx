"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import { GlassInput, GlassButton } from "@/components/ui";
import { useWorkspaceStore } from "@/store/workspace.store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddClientModal({ open, onClose }: Props) {
  const addClient = useWorkspaceStore((s) => s.addClient);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    addClient({ name: name.trim(), company: company.trim(), email: email.trim(), phone: phone.trim() });
    setName(""); setCompany(""); setEmail(""); setPhone("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,20,30,0.85)] backdrop-blur-2xl shadow-2xl shadow-black/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-bold text-[#F1F5F9]">إضافة عميل جديد</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#94A3B8] hover:text-[#F1F5F9]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4" dir="rtl">
                <GlassInput label="الاسم" value={name} onChange={setName} placeholder="أدخل اسم العميل" />
                <GlassInput label="المتاجر الإلكترونية / الوصف" value={company} onChange={setCompany} placeholder="اسم الشركة أو وصف النشاط" />
                <GlassInput label="البريد الإلكتروني" value={email} onChange={setEmail} placeholder="example@domain.com" dir="ltr" />
                <GlassInput label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="+966 5X XXX XXXX" dir="ltr" />

                <GlassButton variant="primary" size="lg" onClick={handleSave} disabled={!name.trim()} className="w-full mt-6">
                  <UserPlus size={16} />
                  حفظ
                </GlassButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
