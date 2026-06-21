"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Users, Building2, Archive, Plus } from "lucide-react";
import { GlassCard, GlassButton } from "@/components/ui";
import AppShell from "@/components/layout/AppShell";
import ClientDetailsView from "@/components/workspace/ClientDetailsView";
import CompanyDetailsModal from "@/components/workspace/CompanyDetailsModal";
import TaskBoard from "@/components/workspace/TaskBoard";
import EntitiesArchiveModal from "@/components/workspace/EntitiesArchiveModal";
import AddClientModal from "@/components/workspace/AddClientModal";
import AddCompanyModal from "@/components/workspace/AddCompanyModal";
import { useWorkspaceStore } from "@/store/workspace.store";

const tabs = [
  { id: "clients" as const, label: "العملاء", icon: Users },
  { id: "companies" as const, label: "الشركات", icon: Building2 },
  { id: "kanban" as const, label: "لوحة المهام", icon: Briefcase },
];

export default function WorkspacePage() {
  const [selectedTab, setSelectedTab] = useState<"clients" | "companies" | "kanban">("clients");
  const [showArchive, setShowArchive] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const { clients, companies, tasks, selectedClient, selectedCompany, selectClient, selectCompany } = useWorkspaceStore();

  const activeClients = clients.filter((c) => c.status !== "archived");
  const activeCompanies = companies.filter((c) => c.status !== "archived");

  const activeCount = (id: string) => {
    if (id === "clients") return activeClients.length;
    if (id === "companies") return activeCompanies.length;
    return 0;
  };

  return (
    <AppShell title="مساحة العمل" subtitle="إدارة العملاء والشركات والمهام">
      <div className="flex gap-1 p-1 mb-6 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = activeCount(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`relative px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-2 transition-colors ${
                selectedTab === tab.id
                  ? "text-white"
                  : "text-secondary hover:text-primary hover:bg-white/5"
              }`}
            >
              {selectedTab === tab.id && (
                <motion.div
                  layoutId="workspace-tab"
                  className="absolute inset-0 rounded-xl bg-[rgba(249,115,22,0.15)] border border-accent/20"
                />
              )}
              <Icon size={16} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
              {count > 0 && (
                <span className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.08)] text-secondary">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedTab === "clients" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-secondary">{activeClients.length} عميل نشط</span>
            <GlassButton variant="primary" size="md" onClick={() => setClientModalOpen(true)}>
              <Plus size={16} />
              إضافة عميل
            </GlassButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {activeClients.map((client, i) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ delay: i * 0.02, duration: 0.25 }}
              >
                <button
                  onClick={() => selectClient(client)}
                  className="w-full text-right"
                >
                  <GlassCard className="p-4 cursor-pointer transition-all hover:scale-[1.02] hover:border-accent/30" glow="blue">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/30 to-blue-accent/30 flex items-center justify-center text-sm font-bold text-primary">
                        {client.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{client.name}</p>
                        <p className="text-xs text-secondary truncate">{client.company}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-secondary">
                      <p>{client.email}</p>
                      <p>{client.phone}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                      <span className="text-xs text-secondary">
                        العقود: <span className="text-primary font-medium">{client.activeContracts}</span>
                      </span>
                      <span className="text-xs text-secondary">
                        الإيرادات: <span className="text-green-accent font-medium">{client.totalRevenue.toLocaleString("ar-SA")} ر.س</span>
                      </span>
                    </div>
                  </GlassCard>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        </motion.div>
      )}

      {selectedTab === "companies" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-secondary">{activeCompanies.length} شركة نشطة</span>
            <GlassButton variant="primary" size="md" onClick={() => setCompanyModalOpen(true)}>
              <Plus size={16} />
              إضافة شركة
            </GlassButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {activeCompanies.map((company, i) => {
              const coTasks = tasks.filter((t) => t.companyId === company.id);
              const doneCount = coTasks.filter((t) => t.status === "archived").length;
              const progress = coTasks.length > 0 ? Math.round((doneCount / coTasks.length) * 100) : 0;

              return (
                <motion.div
                  key={company.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ delay: i * 0.02, duration: 0.25 }}
                >
                  <button
                    onClick={() => selectCompany(company)}
                    className="w-full text-right"
                  >
                    <GlassCard className="p-4 cursor-pointer transition-all hover:scale-[1.02] hover:border-green-accent/30" glow="blue">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-accent/30 to-blue-accent/30 flex items-center justify-center text-sm font-bold text-primary">
                          {company.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{company.name}</p>
                          <p className="text-xs text-secondary truncate">{company.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-secondary">القيمة الشهرية</span>
                        <span className="text-sm font-bold text-green-accent [text-shadow:0_0_20px_rgba(16,185,129,0.4)]">
                          {company.monthlyValue.toLocaleString("ar-SA")} ر.س
                        </span>
                      </div>
                      <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-secondary">إنجاز مهام الشهر</span>
                          <span className="text-xs text-secondary">{doneCount}/{coTasks.length}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-accent to-accent-light transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </GlassCard>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        </motion.div>
      )}

      {selectedTab === "kanban" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TaskBoard />
        </motion.div>
      )}

      {/* Tiny archive button */}
      {(selectedTab === "clients" || selectedTab === "companies") && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowArchive(true)}
            className="text-xs text-[#94A3B8]/50 hover:text-[#94A3B8] transition-all border border-white/5 bg-white/[0.02] px-3 py-1 rounded-full flex items-center gap-1.5"
          >
            <Archive size={12} />
            أرشيف العملاء والشركات
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedClient && (
          <ClientDetailsView
            key="client-details"
            client={selectedClient}
            tasks={tasks}
            onClose={() => selectClient(null)}
          />
        )}
        {selectedCompany && (
          <CompanyDetailsModal
            key="company-details"
            company={selectedCompany}
            tasks={tasks}
            onClose={() => selectCompany(null)}
          />
        )}
        {showArchive && (
          <EntitiesArchiveModal key="archive" onClose={() => setShowArchive(false)} />
        )}
      </AnimatePresence>

      <AddClientModal open={clientModalOpen} onClose={() => setClientModalOpen(false)} />
      <AddCompanyModal open={companyModalOpen} onClose={() => setCompanyModalOpen(false)} />
    </AppShell>
  );
}
