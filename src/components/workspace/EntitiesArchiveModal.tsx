"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Users, Building2, Archive } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace.store";

export default function EntitiesArchiveModal({ onClose }: { onClose: () => void }) {
  const { clients, companies, restoreClient, restoreCompany } = useWorkspaceStore();
  const [tab, setTab] = useState<"clients" | "companies">("clients");

  const archivedClients = clients.filter((c) => c.status === "archived");
  const archivedCompanies = companies.filter((c) => c.status === "archived");

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
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2">
              <Archive size={16} className="text-[#94A3B8]" />
              <h2 className="text-lg font-bold text-[#F1F5F9]">أرشيف العملاء والشركات</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-4 pb-2">
            <button
              onClick={() => setTab("clients")}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                tab === "clients" ? "text-white" : "text-secondary hover:text-primary"
              }`}
            >
              {tab === "clients" && (
                <motion.div
                  layoutId="archive-entity-tab"
                  className="absolute inset-0 rounded-lg bg-[rgba(249,115,22,0.15)] border border-accent/20"
                />
              )}
              <Users size={13} className="relative z-10" />
              <span className="relative z-10">العملاء</span>
              <span className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.08)] text-secondary">
                {archivedClients.length}
              </span>
            </button>
            <button
              onClick={() => setTab("companies")}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                tab === "companies" ? "text-white" : "text-secondary hover:text-primary"
              }`}
            >
              {tab === "companies" && (
                <motion.div
                  layoutId="archive-entity-tab"
                  className="absolute inset-0 rounded-lg bg-[rgba(249,115,22,0.15)] border border-accent/20"
                />
              )}
              <Building2 size={13} className="relative z-10" />
              <span className="relative z-10">الشركات</span>
              <span className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.08)] text-secondary">
                {archivedCompanies.length}
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <AnimatePresence mode="wait">
              {tab === "clients" ? (
                <motion.div
                  key="clients"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {archivedClients.length === 0 ? (
                    <p className="text-sm text-[#94A3B8] py-6 text-center">لا يوجد عملاء في الأرشيف</p>
                  ) : (
                    <div className="space-y-2">
                      {archivedClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/30 to-blue-accent/30 flex items-center justify-center text-xs font-bold text-primary">
                            {client.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#F1F5F9] truncate">{client.name}</p>
                            <p className="text-xs text-[#94A3B8] truncate">{client.company}</p>
                          </div>
                          <button
                            onClick={() => restoreClient(client.id)}
                            className="p-1.5 rounded-lg text-[#94A3B8]/40 hover:text-accent-light hover:bg-accent/10 transition-all"
                            title="استعادة"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="companies"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {archivedCompanies.length === 0 ? (
                    <p className="text-sm text-[#94A3B8] py-6 text-center">لا توجد شركات في الأرشيف</p>
                  ) : (
                    <div className="space-y-2">
                      {archivedCompanies.map((company) => (
                        <div
                          key={company.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-accent/30 to-blue-accent/30 flex items-center justify-center text-xs font-bold text-primary">
                            {company.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#F1F5F9] truncate">{company.name}</p>
                            <p className="text-xs text-[#94A3B8] truncate">{company.type}</p>
                          </div>
                          <button
                            onClick={() => restoreCompany(company.id)}
                            className="p-1.5 rounded-lg text-[#94A3B8]/40 hover:text-accent-light hover:bg-accent/10 transition-all"
                            title="استعادة"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
