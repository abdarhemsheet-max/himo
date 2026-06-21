import { create } from "zustand";
import { useWorkspaceStore } from "./workspace.store";
import { useDocumentsStore } from "./documents.store";

export type ReportTab = "personal" | "company";

export const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export interface PersonalReportInput {
  achievements: string;
  pendingTasks: string;
  notes: string;
}

export interface CompanyReportInput {
  companyId: string;
  month: string;
}

export type ReportGenerationStatus = "idle" | "loading" | "success" | "error";

interface ReportsState {
  tab: ReportTab;
  personalInput: PersonalReportInput;
  selectedCompanyId: string;
  selectedMonth: string;
  status: ReportGenerationStatus;
  reportMd: string | null;
  error: string | null;

  setTab: (tab: ReportTab) => void;
  setPersonalInput: (input: Partial<PersonalReportInput>) => void;
  setSelectedCompanyId: (id: string) => void;
  setSelectedMonth: (month: string) => void;
  generateReport: () => Promise<void>;
  reset: () => void;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  tab: "personal",
  personalInput: { achievements: "", pendingTasks: "", notes: "" },
  selectedCompanyId: "",
  selectedMonth: String(new Date().getMonth()),
  status: "idle",
  reportMd: null,
  error: null,

  setTab: (tab) => {
    set({ tab, reportMd: null, error: null, status: "idle" });
  },

  setPersonalInput: (input) => {
    set((s) => ({ personalInput: { ...s.personalInput, ...input } }));
  },

  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),

  generateReport: async () => {
    set({ status: "loading", error: null, reportMd: null });

    const state = get();
    const type = state.tab;
    const workspaceState = useWorkspaceStore.getState();
    const company = type === "company"
      ? workspaceState.companies.find((c) => c.id === state.selectedCompanyId)
      : null;

    if (type === "company" && !company) {
      set({ status: "error", error: "يرجى اختيار شركة" });
      return;
    }

    const data = type === "personal"
      ? { ...state.personalInput }
      : {
          companyName: company!.name,
          month: MONTHS[parseInt(state.selectedMonth)],
          achievements: "",
          pendingTasks: company!.recurringServices.join("، "),
          notes: "",
        };

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "فشل في إنشاء التقرير");
      }

      const result = await res.json();

      // Auto-archive to Documents Vault (bypass manual review)
      const now = new Date();
      const nextYear = new Date(now);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      const docName = type === "personal"
        ? `التقرير الأسبوعي - ${now.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}`
        : `تقرير ${data.companyName} - ${data.month}`;

      useDocumentsStore.getState().addDocument({
        name: docName,
        type: "report",
        tags: [type === "personal" ? "تقرير شخصي" : "تقرير شركة", "تقرير"],
        issueDate: now.toISOString().slice(0, 10),
        expiryDate: nextYear.toISOString().slice(0, 10),
        description: `تم إنشاؤه في ${now.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}`,
        fileUrl: "",
        size: `${result.markdown.length} حرف`,
      });

      set({ reportMd: result.markdown, status: "success" });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "خطأ في الاتصال",
      });
    }
  },

  reset: () => {
    set({
      tab: "personal",
      personalInput: { achievements: "", pendingTasks: "", notes: "" },
      selectedCompanyId: "",
      selectedMonth: String(new Date().getMonth()),
      status: "idle",
      reportMd: null,
      error: null,
    });
  },
}));
