"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileBarChart, Building2, User, Loader2, ChevronDown,
  Printer, Sparkles,
} from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "@/components/ui";
import AppShell from "@/components/layout/AppShell";
import { useDocumentsStore } from "@/store/documents.store";
import { useWorkspaceStore } from "@/store/workspace.store";

type Tab = "personal" | "company";

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function formatDate(date: Date) {
  return date.toLocaleDateString("ar-SA", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const html = lines
    .map((line) => {
      if (/^#{1,3}\s/.test(line)) {
        const level = line.match(/^#+/)![0].length;
        const text = line.replace(/^#+\s/, "");
        const tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
        const size = level === 1 ? "text-xl font-bold" : level === 2 ? "text-lg font-semibold" : "text-base font-semibold";
        return `<${tag} class="${size} text-primary mt-5 mb-2">${text}</${tag}>`;
      }
      if (/^- /.test(line)) {
        const text = line.replace(/^- /, "");
        return `<li class="text-sm text-secondary me-4 list-disc">${text}</li>`;
      }
      if (/\*\*(.+?)\*\*/.test(line)) {
        return `<p class="text-sm text-secondary leading-relaxed">${line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')}</p>`;
      }
      if (line.trim() === "") return "<br />";
      return `<p class="text-sm text-secondary leading-relaxed">${line}</p>`;
    })
    .join("\n");
  return html;
}

export default function ReportsPage() {
  const { addDocument } = useDocumentsStore();
  const { companies } = useWorkspaceStore();
  const [tab, setTab] = useState<Tab>("personal");

  // Personal state
  const [personalInput, setPersonalInput] = useState({
    achievements: "",
    pendingTasks: "",
    notes: "",
  });

  // Company state
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth())
  );

  // Shared state
  const [loading, setLoading] = useState(false);
  const [reportMd, setReportMd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const activeCompanies = companies.filter((c) => c.status === "active");

  // Reset selectedCompanyId if the chosen company was archived/removed
  if (selectedCompanyId && !activeCompanies.some((c) => c.id === selectedCompanyId)) {
    setSelectedCompanyId("");
  }

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReportMd(null);

    const type = tab;
    const company = tab === "company"
      ? companies.find((c) => c.id === selectedCompanyId)
      : null;

    if (tab === "company" && !company) {
      setError(activeCompanies.length === 0 ? "لا توجد شركات مسجلة. أضف شركة أولاً في مساحة العمل." : "يرجى اختيار شركة");
      setLoading(false);
      return;
    }

    const data = tab === "personal"
      ? { ...personalInput }
      : {
          companyName: company!.name,
          month: MONTHS[parseInt(selectedMonth)],
          achievements: "",
          pendingTasks: company!.recurringServices.join("، "),
          notes: "",
        };

    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY not configured");

      const systemPrompt = `أنت كاتب تقارير احترافي باللغة العربية الفصحى.
مهمتك إنشاء تقارير أسبوعية/شهرية منظمة وجاهزة للطباعة.
استخدم تنسيق Markdown نظيف مع عناوين وفقرات ونقاط.

شكل التقرير الشخصي الأسبوعي:
# التقرير الأسبوعي
**الفترة:** [تاريخ]
**تاريخ الإنشاء:** [تاريخ اليوم]

## ملخص الإنجازات
[فقرة عامة]

## المهام المنجزة
- [مهمة 1]
- [مهمة 2]

## المهام قيد التنفيذ
- [مهمة]

## الملاحظات والتوصيات
[نصائح للأسبوع القادم]

شكل تقرير الشركة الشهري:
# تقرير [اسم الشركة] الشهري
**الشهر:** [الشهر]
**تاريخ الإنشاء:** [تاريخ اليوم]

## ملخص الأداء
[فقرة عامة]

## الإنجازات
- [إنجاز]

## المهام والخدمات
- [خدمة/مهمة]

## التوصيات
[توصيات]

أخرج Markdown فقط بدون أي نص إضافي خارج التنسيق.`;

      const userPrompt = type === "personal"
        ? `بيانات الأسبوع:\n- الإنجازات: ${data.achievements || "لا توجد"}\n- المهام المتبقية: ${data.pendingTasks || "لا توجد"}\n- ملاحظات: ${data.notes || "بدون"}`
        : `بيانات شركة "${data.companyName}":\n- الشهر: ${data.month || "الحالي"}\n- الإنجازات: ${data.achievements || "لا توجد"}\n- المهام: ${data.pendingTasks || "لا توجد"}\n- ملاحظات: ${data.notes || "بدون"}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!groqRes.ok) throw new Error("Groq API error");

      const groqData = await groqRes.json();
      const markdown: string = groqData.choices?.[0]?.message?.content || "";
      if (!markdown) throw new Error("Empty response from Groq");

      // Auto-archive to Documents Vault
      const now = new Date();
      const nextYear = new Date(now);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      const docName = type === "personal"
        ? `التقرير الأسبوعي - ${formatDate(now)}`
        : `تقرير ${data.companyName} - ${data.month}`;

      addDocument({
        name: docName,
        type: "report",
        tags: [type === "personal" ? "تقرير شخصي" : "تقرير شركة", "تقرير"],
        issueDate: now.toISOString().slice(0, 10),
        expiryDate: nextYear.toISOString().slice(0, 10),
        description: `تم إنشاؤه في ${formatDate(now)}`,
        fileUrl: "",
        size: `${markdown.length} حرف`,
      });

      setReportMd(markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "personal", label: "التقرير الشخصي", icon: User },
    { key: "company", label: "تقارير الشركات", icon: Building2 },
  ];

  return (
    <AppShell title="مركز التقارير" subtitle="إنشاء وأرشفة التقارير تلقائياً">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FileBarChart size={22} className="text-accent-light" />
        <span className="text-sm text-secondary">التقارير تُؤرشف فوراً في خزانة الوثائق</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 mb-6 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] w-fit" dir="ltr">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setReportMd(null); setError(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[rgba(249,115,22,0.15)] text-accent-light border border-accent/20 shadow-[0_0_16px_-4px_rgba(249,115,22,0.2)]"
                  : "text-secondary hover:text-primary hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div>
          <GlassCard className="p-5" hover={false}>
            <h2 className="text-base font-semibold text-primary mb-4">
              {tab === "personal" ? "بيانات التقرير الأسبوعي" : "بيانات تقرير الشركة"}
            </h2>

            {tab === "personal" ? (
              <div className="space-y-4" dir="rtl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-secondary">الإنجازات هذا الأسبوع</label>
                  <textarea
                    value={personalInput.achievements}
                    onChange={(e) => setPersonalInput((p) => ({ ...p, achievements: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-primary outline-none focus:border-accent/50 text-sm resize-none transition-all"
                    placeholder="ما الذي أنجزته هذا الأسبوع؟"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-secondary">المهام المتبقية</label>
                  <textarea
                    value={personalInput.pendingTasks}
                    onChange={(e) => setPersonalInput((p) => ({ ...p, pendingTasks: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-primary outline-none focus:border-accent/50 text-sm resize-none transition-all"
                    placeholder="المهام التي لم تكتمل بعد"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-secondary">ملاحظات إضافية</label>
                  <textarea
                    value={personalInput.notes}
                    onChange={(e) => setPersonalInput((p) => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-primary outline-none focus:border-accent/50 text-sm resize-none transition-all"
                    placeholder="أي ملاحظات تود إضافتها"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4" dir="rtl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-secondary">الشركة</label>
                  <div className="relative">
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full px-4 py-2.5 appearance-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-primary outline-none focus:border-accent/50 text-sm transition-all"
                    >
                      {activeCompanies.length === 0 ? (
                        <option key="no-companies" value="" className="bg-[#0B0F19]">لا توجد شركات مسجلة حالياً</option>
                      ) : (
                        <>
                          <option key="placeholder" value="" className="bg-[#0B0F19]">اختر شركة...</option>
                          {activeCompanies.map((c) => (
                            <option key={c.id} value={c.id} className="bg-[#0B0F19]">
                              {c.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-secondary">الشهر</label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-4 py-2.5 appearance-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-primary outline-none focus:border-accent/50 text-sm transition-all"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={i} value={i} className="bg-[#0B0F19]">{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <GlassButton
                variant="primary"
                size="md"
                onClick={generateReport}
                disabled={loading || (tab === "company" && !selectedCompanyId)}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري إنشاء التقرير...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    إنشاء التقرير
                  </>
                )}
              </GlassButton>
            </div>

            {error && (
              <p className="text-xs text-red-400 mt-3 text-center">{error}</p>
            )}
          </GlassCard>
        </div>

        {/* Report Preview */}
        <div>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full min-h-[300px]"
              >
                <div className="text-center">
                  <Loader2 size={32} className="animate-spin text-accent-light mx-auto mb-3" />
                  <p className="text-sm text-secondary">يجري توليد التقرير...</p>
                </div>
              </motion.div>
            ) : reportMd ? (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-6" hover={false}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-primary">معاينة التقرير</h2>
                    <button
                      onClick={handlePrint}
                      className="print:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.1)] transition-all text-sm"
                    >
                      <Printer size={15} />
                      تصدير PDF
                    </button>
                  </div>
                  <div
                    ref={previewRef}
                    dir="rtl"
                    className="prose prose-sm max-w-none report-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(reportMd) }}
                  />
                  <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] print:hidden">
                    <GlassBadge variant="success">تم أرشفة التقرير في خزانة الوثائق</GlassBadge>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full min-h-[300px]"
              >
                <div className="text-center">
                  <FileBarChart size={40} className="text-secondary/30 mx-auto mb-3" />
                  <p className="text-sm text-secondary">سيظهر التقرير هنا بعد إنشائه</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
            background: white !important;
          }
          .report-content,
          .report-content * {
            visibility: visible !important;
            background: white !important;
            color: #1e293b !important;
          }
          .report-content {
            position: absolute !important;
            top: 20px !important;
            right: 20px !important;
            left: 20px !important;
            width: auto !important;
          }
          .report-content h1 { font-size: 22px !important; color: #0f172a !important; border-bottom: 2px solid #e2e8f0 !important; padding-bottom: 8px !important; }
          .report-content h2 { font-size: 18px !important; color: #1e293b !important; }
          .report-content h3 { font-size: 15px !important; color: #334155 !important; }
          .report-content p, .report-content li { font-size: 13px !important; color: #475569 !important; line-height: 1.7 !important; }
          .report-content strong { color: #0f172a !important; }
          .report-content li { margin-bottom: 4px !important; }
          .report-content br { display: none !important; }
          @page { margin: 20mm; }
        }
      `}</style>
    </AppShell>
  );
}
