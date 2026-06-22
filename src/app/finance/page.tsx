"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  HandCoins,
  Clock,
  RefreshCw,
  Plus,
  Loader2,
  ChevronDown,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import WalletGrid from "@/components/finance/WalletGrid";
import IncomeList from "@/components/finance/IncomeList";
import ExpenseList from "@/components/finance/ExpenseList";
import SubscriptionTable from "@/components/finance/SubscriptionTable";
import dynamic from "next/dynamic";

const AnalyticsChart = dynamic(() => import("@/components/finance/AnalyticsChart"), {
  ssr: false,
  loading: () => <div className="h-80 rounded-2xl bg-white/5 animate-pulse" />,
});
import GlassModal from "@/components/ui/GlassModal";
import GlassInput from "@/components/ui/GlassInput";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { useFinanceStore } from "@/store/finance.store";
import { useAppStore } from "@/store/app.store";
import type { Wallet, Expense } from "@/types/finance";

const trends = {
  income: { value: 12.5, label: "عن الشهر الماضي", positive: true },
  expenses: { value: 3.2, label: "عن الشهر الماضي", positive: false },
  debts: { value: 8.1, label: "عن الشهر الماضي", positive: true },
  pending: { value: 5.7, label: "عن الشهر الماضي", positive: true },
  subs: { value: 0, label: "شهرياً", positive: true },
};

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  gradient: string;
  trendValue: number;
  trendLabel: string;
  trendPositive: boolean;
  delay: number;
}

function MetricCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  gradient,
  trendValue,
  trendLabel,
  trendPositive,
  delay,
}: MetricCardProps) {
  const showBalance = useAppStore((s) => s.showBalance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden group"
    >
      <div
        className={`
          relative p-5 rounded-2xl h-full
          bg-[rgba(255,255,255,0.05)]
          backdrop-blur-xl backdrop-saturate-150
          border border-[rgba(255,255,255,0.08)]
          shadow-lg shadow-black/10
          transition-all duration-300
        `}
      >
        <div
          className="absolute -top-12 -end-12 w-24 h-24 rounded-full opacity-[0.08] group-hover:opacity-[0.18] transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle, ${gradient}, transparent 70%)`,
            filter: "blur(24px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-2xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium tracking-wide text-[#94A3B8]">
              {label}
            </span>
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: iconBg }}
            >
              <span style={{ color: iconColor }}>{icon}</span>
            </div>
          </div>

          <div className="mb-3">
            {showBalance ? (
              <span className="text-2xl font-bold text-[#F1F5F9] tabular-nums tracking-tight">
                {value.toLocaleString("ar-SA")}
              </span>
            ) : (
              <span className="text-2xl font-bold text-[#F1F5F9]">*****</span>
            )}
            <span className="text-xs text-[#94A3B8] me-1.5">ر.س</span>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <span
              className={`text-xs font-medium tabular-nums ${
                trendPositive ? "text-[#10B981]" : "text-[#EF4444]"
              }`}
            >
              {trendPositive ? "+" : "-"}
              {trendValue}%
            </span>
            <span className="text-[10px] text-[#94A3B8]">{trendLabel}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const tabs = [
  { id: "wallets", label: "المحافظ" },
  { id: "income", label: "الدخل" },
  { id: "expenses", label: "المصروفات" },
  { id: "subscriptions", label: "الاشتراكات" },
  { id: "analytics", label: "التحليلات" },
];

const tabContent: Record<string, React.ComponentType> = {
  wallets: WalletGrid,
  income: IncomeList,
  expenses: ExpenseList,
  subscriptions: SubscriptionTable,
  analytics: AnalyticsChart,
};

const addButtonLabels: Record<string, string> = {
  wallets: "إضافة محفظة",
  income: "إضافة دخل",
  expenses: "إضافة مصروف",
  subscriptions: "إضافة اشتراك",
};

const categoryOptions: Record<string, string[]> = {
  wallets: ["بنكي", "نقدي", "عملات رقمية", "محفظة رقمية", "عمل حر"],
  income: ["الراتب", "عمل حر", "استثمارات", "هدية", "أخرى"],
  expenses: ["طعام", "مواصلات", "ترفيه", "صحة", "فواتير", "أخرى"],
  subscriptions: ["شهري", "سنوي", "أسبوعي", "تجربة مجانية"],
};

const walletTypeMap: Record<string, Wallet["type"]> = {
  "بنكي": "bank",
  "نقدي": "cash",
  "عملات رقمية": "crypto",
  "محفظة رقمية": "digital",
  "عمل حر": "freelance",
};

const fieldLabels: Record<string, { title: string; amount: string }> = {
  wallets: { title: "اسم المحفظة", amount: "الرصيد" },
  income: { title: "اسم العميل", amount: "المبلغ" },
  expenses: { title: "الوصف", amount: "المبلغ" },
  subscriptions: { title: "اسم الاشتراك", amount: "التكلفة" },
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("wallets");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formWalletId, setFormWalletId] = useState("");
  const wallets = useFinanceStore((s) => s.wallets);
  const {
    addWallet,
    addIncome,
    addExpense,
    addSubscription,
    totalIncome,
    totalExpenses,
    totalDebts,
    pendingProfits,
    totalSubscriptionsCost,
    isLoading,
  } = useFinanceStore();

  const ActiveComponent = tabContent[activeTab];
  const addLabel = addButtonLabels[activeTab] || "";
  const showAddButton = activeTab !== "analytics";
  const fields = fieldLabels[activeTab] || { title: "العنوان", amount: "المبلغ" };

  const handleOpenModal = () => {
    setFormTitle("");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormCategory("");
    setFormWalletId(wallets.length > 0 ? wallets[0].id : "");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));

    const amount = parseFloat(formAmount) || 0;

    switch (activeTab) {
      case "wallets":
        addWallet({
          name: formTitle,
          type: walletTypeMap[formCategory] || "bank",
          balance: amount,
          currency: "ر.س",
          icon: "🏦",
        });
        break;
      case "income":
        addIncome({
          client: formTitle,
          amount,
          status: "pending",
          date: formDate,
          walletId: formWalletId,
        });
        break;
      case "expenses":
        addExpense({
          description: formTitle,
          amount,
          category: (formCategory as Expense["category"]) || "other",
          tags: [],
          date: formDate,
          walletId: formWalletId,
        });
        break;
      case "subscriptions":
        addSubscription({
          name: formTitle,
          cost: amount,
          renewalDate: formDate,
          category: formCategory || "عام",
          active: true,
        });
        break;
    }

    setSubmitting(false);
    setModalOpen(false);
  };

  const categories = categoryOptions[activeTab] || [];
  const showCategory = activeTab !== "income";

  const cards: MetricCardProps[] = [
    {
      label: "المدخول",
      value: totalIncome,
      icon: <TrendingUp size={18} />,
      iconBg: "rgba(16,185,129,0.15)",
      iconColor: "#10B981",
      gradient: "#10B981",
      trendValue: trends.income.value,
      trendLabel: trends.income.label,
      trendPositive: trends.income.positive,
      delay: 0,
    },
    {
      label: "المصروفات",
      value: totalExpenses,
      icon: <TrendingDown size={18} />,
      iconBg: "rgba(239,68,68,0.15)",
      iconColor: "#EF4444",
      gradient: "#EF4444",
      trendValue: trends.expenses.value,
      trendLabel: trends.expenses.label,
      trendPositive: trends.expenses.positive,
      delay: 0.1,
    },
    {
      label: "الديون",
      value: totalDebts,
      icon: <HandCoins size={18} />,
      iconBg: "rgba(245,158,11,0.15)",
      iconColor: "#F59E0B",
      gradient: "#F59E0B",
      trendValue: trends.debts.value,
      trendLabel: trends.debts.label,
      trendPositive: trends.debts.positive,
      delay: 0.2,
    },
    {
      label: "الأرباح المعلقة",
      value: pendingProfits,
      icon: <Clock size={18} />,
      iconBg: "rgba(249,115,22,0.15)",
      iconColor: "#FB923C",
      gradient: "#FB923C",
      trendValue: trends.pending.value,
      trendLabel: trends.pending.label,
      trendPositive: trends.pending.positive,
      delay: 0.3,
    },
    {
      label: "الاشتراكات",
      value: totalSubscriptionsCost,
      icon: <RefreshCw size={18} />,
      iconBg: "rgba(59,130,246,0.15)",
      iconColor: "#3B82F6",
      gradient: "#3B82F6",
      trendValue: trends.subs.value,
      trendLabel: trends.subs.label,
      trendPositive: trends.subs.positive,
      delay: 0.4,
    },
  ];

  return (
    <AppShell title="المركز المالي" subtitle="إدارة أموالك واشتراكاتك">
      {/* ── 5 Summary Cards ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : cards.map((card) => <MetricCard key={card.label} {...card} />)}
      </div>

      {/* ── Tabs + Add Button ──────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-1 p-1 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-secondary hover:text-primary hover:bg-white/5"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="finance-tab"
                    className="absolute inset-0 rounded-xl bg-[rgba(249,115,22,0.15)] border border-accent/20"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {showAddButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={activeTab}
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-[rgba(249,115,22,0.2)] border border-accent/30 text-white hover:bg-[rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.3)] transition-all duration-200 shrink-0"
          >
            <Plus size={16} />
            {addLabel}
          </motion.button>
        )}
      </div>

      {/* ── Tab Content ─────────────────────── */}
      {isLoading
        ? <TableSkeleton rows={4} />
        : ActiveComponent && <ActiveComponent />}

      {/* ── Add Modal ────────────────────────── */}
      <GlassModal open={modalOpen} onClose={() => { if (!submitting) setModalOpen(false); }} title={addLabel}>
        <div className="flex flex-col gap-4">
          <GlassInput
            label={fields.title}
            value={formTitle}
            onChange={setFormTitle}
            placeholder={`أدخل ${fields.title}`}
          />

          <div className="flex gap-3">
            <GlassInput
              label={fields.amount}
              value={formAmount}
              onChange={setFormAmount}
              placeholder="٠"
              type="number"
              dir="ltr"
              className="flex-1"
            />
            <GlassInput
              label="التاريخ"
              value={formDate}
              onChange={setFormDate}
              type="date"
              dir="ltr"
              className="flex-1"
            />
          </div>

          {showCategory && categories.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-secondary">التصنيف</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormCategory(cat === formCategory ? "" : cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                      formCategory === cat
                        ? "bg-[rgba(249,115,22,0.2)] border-accent/40 text-white"
                        : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallet selection for income / expense */}
          {(activeTab === "income" || activeTab === "expenses") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-secondary">
                {activeTab === "income" ? "إيداع في (مكان الحفظ)" : "الدفع من (مكان الحفظ)"}
              </label>
              <div className="relative">
                <select
                  value={formWalletId}
                  onChange={(e) => setFormWalletId(e.target.value)}
                  dir="rtl"
                  className="w-full px-4 py-2.5 appearance-none bg-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-xl text-primary outline-none transition-all duration-200 focus:border-accent/50 focus:shadow-[0_0_20px_-5px_rgba(249,115,22,0.2)] text-sm"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} className="bg-[#0B0F19] text-primary">
                      {w.icon} {w.name} — {w.balance.toLocaleString("ar-SA")} {w.currency}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
                />
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-l from-[#F97316] to-[#EA580C] text-white text-sm font-bold shadow-lg shadow-[rgba(249,115,22,0.25)] hover:shadow-[rgba(249,115,22,0.4)] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "جاري الحفظ..." : "حفظ"}
          </motion.button>
        </div>
      </GlassModal>
    </AppShell>
  );
}
