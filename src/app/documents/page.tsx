"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Plus } from "lucide-react";
import { GlassCard, GlassBadge, GlassButton } from "@/components/ui";
import AppShell from "@/components/layout/AppShell";
import UploadDocumentModal from "@/components/documents/UploadDocumentModal";
import DocumentViewerModal from "@/components/documents/DocumentViewerModal";
import { useDocumentsStore } from "@/store/documents.store";
import type { Document } from "@/types/documents";

const tagLabels: Record<string, string> = {
  official: "رسمي",
  work: "عمل",
  personal: "شخصي",
  finance: "مالي",
  education: "تعليمي",
};

export default function DocumentsPage() {
  const { documents } = useDocumentsStore();
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const filtered = documents.filter(
    (doc) =>
      doc.name.includes(search) ||
      doc.tags.some((t) => t.includes(search))
  );

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return { label: "منتهي", variant: "danger" as const };
    if (diff <= 30) return { label: `باق ${diff} يوم`, variant: "warning" as const };
    return { label: `باق ${diff} يوم`, variant: "success" as const };
  };

  return (
    <AppShell title="خزانة الوثائق" subtitle="إدارة وتنظيم مستنداتك">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 end-3 text-secondary/50"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الوثائق..."
            className="w-full ps-10 pe-10 py-2.5 text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-primary placeholder:text-secondary/30 outline-none focus:border-accent/30 transition-colors"
          />
        </div>
        <GlassButton variant="primary" size="md" onClick={() => setUploadOpen(true)}>
          <Plus size={16} />
          إضافة وثيقة
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc, i) => {
          const status = getExpiryStatus(doc.expiryDate);
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setSelectedDoc(doc)}
                className="w-full text-right"
              >
                <GlassCard className="p-4 cursor-pointer transition-all hover:scale-[1.02] hover:border-accent/30" glow="blue">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-[rgba(59,130,246,0.15)]">
                      <FileText size={18} className="text-blue-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-secondary">{doc.size}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] text-secondary"
                      >
                        #{tagLabels[tag] || tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <span className="text-xs text-secondary">
                      {doc.issueDate}
                    </span>
                    <GlassBadge variant={status.variant}>
                      {status.label}
                    </GlassBadge>
                  </div>
                </GlassCard>
              </button>
            </motion.div>
          );
        })}
      </div>

      <UploadDocumentModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      <AnimatePresence>
        {selectedDoc && (
          <DocumentViewerModal
            document={selectedDoc}
            onClose={() => setSelectedDoc(null)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
