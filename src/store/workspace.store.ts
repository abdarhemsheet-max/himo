import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Client, Company, Task } from "@/types/workspace";
import {
  mockClients,
  mockTasks,
} from "@/lib/mock/workspace";
import { supabase } from "@/lib/supabase";
import { useFinanceStore } from "./finance.store";
import { useDocumentsStore } from "./documents.store";

let _nextId = 200;
const uid = () => `w_${++_nextId}_${Date.now()}`;

interface WorkspaceState {
  clients: Client[];
  companies: Company[];
  tasks: Task[];
  selectedClient: Client | null;
  selectedCompany: Company | null;

  loadMockData: () => void;
  fetchCompanies: () => Promise<void>;
  selectClient: (client: Client | null) => void;
  selectCompany: (company: Company | null) => void;
  addTask: (clientId: string, title: string, companyId?: string) => void;
  archiveTask: (id: string) => void;
  moveToInProgress: (id: string) => void;
  restoreTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  generateRecurringTasks: (companyId: string) => void;
  addClient: (data: { name: string; company: string; email: string; phone: string }) => void;
  archiveClient: (id: string) => void;
  restoreClient: (id: string) => void;
  addCompany: (data: { name: string; type: Company["type"]; email: string; phone: string }) => void;
  addRecurringService: (companyId: string, service: string) => void;
  archiveCompany: (id: string) => void;
  restoreCompany: (id: string) => void;
  completeProject: (clientId: string, projectId: string, walletId?: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      clients: [],
      companies: [],
      tasks: [],
      selectedClient: null,
      selectedCompany: null,

      loadMockData: () => {
        const s = get();
        // Only seed clients and tasks – companies come from Supabase
        if (s.clients.length === 0 && s.tasks.length === 0) {
          set({ clients: mockClients, tasks: mockTasks });
        }
      },

      fetchCompanies: async () => {
        const { data, error } = await supabase.from("companies").select("*");
        if (error) {
          console.error("Failed to fetch companies:", error);
          return;
        }
        if (data) {
          set({ companies: data as unknown as Company[] });
        }
      },

  selectClient: (client) => {
    set({ selectedClient: client });
  },

  selectCompany: (company) => {
    set({ selectedCompany: company });
  },

  addTask: (clientId, title, companyId) => {
    const task: Task = {
      id: uid(),
      title,
      description: "",
      status: "pending",
      clientId,
      companyId,
      dueDate: "",
      priority: "medium",
      billableHours: 0,
    };
    set({ tasks: [...get().tasks, task] });
  },

  archiveTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    const tasks = get().tasks.map((t) => {
      if (t.id !== id) return t;
      return { ...t, status: "archived" as const };
    });
    set({ tasks });

    // Auto-create document in Documents Vault (bypass manual review)
    if (task) {
      useDocumentsStore.getState().addDocument({
        name: `مهمة مكتملة: ${task.title}`,
        type: "archive",
        tags: ["أرشيف", "مهمة"],
        issueDate: new Date().toISOString().slice(0, 10),
        expiryDate: "",
        description: task.description || `تمت أرشفة المهمة: ${task.title}`,
        fileUrl: "",
        size: "0 B",
      });
    }
  },

  moveToInProgress: (id) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== id) return t;
      return { ...t, status: "in-progress" as const };
    });
    set({ tasks });
  },

  restoreTask: (id) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== id) return t;
      return { ...t, status: "pending" as const };
    });
    set({ tasks });
  },

  deleteTask: (id) => {
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },

  updateTask: (id, data) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...data } : t
    );
    set({ tasks });
  },

  generateRecurringTasks: (companyId) => {
    const company = get().companies.find((c) => c.id === companyId);
    if (!company) return;

    const existing = get().tasks.filter(
      (t) => t.companyId === companyId && t.status !== "archived"
    );
    const existingTitles = new Set(existing.map((t) => t.title));

    const newTasks: Task[] = company.recurringServices
      .filter((svc) => !existingTitles.has(svc))
      .map((svc) => ({
        id: uid(),
        title: svc,
        description: `مهمة شهرية متكررة - ${svc}`,
        status: "pending" as const,
        clientId: "",
        companyId,
        dueDate: "",
        priority: "high" as const,
        billableHours: 0,
      }));

    if (newTasks.length > 0) {
      set({ tasks: [...get().tasks, ...newTasks] });
    }
  },

  completeProject: (clientId, projectId, walletId) => {
    const state = get();
    const client = state.clients.find((c) => c.id === clientId);
    if (!client) return;

    // Mark the project as completed
    const updatedClients = state.clients.map((c) => {
      if (c.id !== clientId) return c;
      const projects = c.projects.map((p) =>
        p.id === projectId ? { ...p, status: "completed" as const, progress: 100 } : p
      );
      return { ...c, projects };
    });
    set({ clients: updatedClients });

    // Auto-archive related tasks
    const relatedTasks = state.tasks.filter(
      (t) => t.clientId === clientId && t.status !== "archived"
    );
    if (relatedTasks.length > 0) {
      set({
        tasks: state.tasks.map((t) =>
          t.clientId === clientId && t.status !== "archived"
            ? { ...t, status: "archived" as const }
            : t
        ),
      });
    }

    // Auto-create income in finance store (Workspace → Finance integration)
    const project = client.projects.find((p) => p.id === projectId);
    const projectRevenue = project ? Math.round(client.totalRevenue / client.projects.length) : 0;
    const financeState = useFinanceStore.getState();
    const targetWalletId = walletId || (financeState.wallets.length > 0 ? financeState.wallets[0].id : "");
    if (targetWalletId && projectRevenue > 0) {
      financeState.addIncome({
        amount: projectRevenue,
        client: client.name,
        status: "received",
        date: new Date().toISOString().slice(0, 10),
        walletId: targetWalletId,
      });
    }
  },

  addClient: (data) => {
    const client: Client = {
      id: uid(),
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      activeContracts: 0,
      totalRevenue: 0,
      projects: [],
      status: "active",
    };
    set({ clients: [...get().clients, client] });
  },

  archiveClient: (id) => {
    const client = get().clients.find((c) => c.id === id);
    const clients = get().clients.map((c) =>
      c.id === id ? { ...c, status: "archived" as const } : c
    );
    set({ clients, selectedClient: null });

    // Auto-create document in Documents Vault (bypass manual review)
    if (client) {
      useDocumentsStore.getState().addDocument({
        name: `أرشيف العميل: ${client.name}`,
        type: "archive",
        tags: ["أرشيف", "عميل"],
        issueDate: new Date().toISOString().slice(0, 10),
        expiryDate: "",
        description: `تم أرشفة العميل ${client.name} - ${client.company}`,
        fileUrl: "",
        size: "0 B",
      });
    }
  },

  restoreClient: (id) => {
    const clients = get().clients.map((c) =>
      c.id === id ? { ...c, status: "active" as const } : c
    );
    set({ clients });
  },

  addCompany: async (data) => {
    const tempId = uid();
    const optimistic: Company = {
      id: tempId,
      name: data.name,
      type: data.type,
      email: data.email,
      phone: data.phone,
      monthlyValue: 0,
      recurringServices: [],
      activeTasksCount: 0,
      status: "active",
    };
    set((s) => ({ companies: [...s.companies, optimistic] }));

    const { data: inserted, error } = await supabase
      .from("companies")
      .insert({
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert company:", error);
      set((s) => ({ companies: s.companies.filter((c) => c.id !== tempId) }));
      return;
    }

    // Swap temp ID for real DB record
    const real = inserted as unknown as Company;
    set((s) => ({
      companies: s.companies.map((c) => (c.id === tempId ? real : c)),
    }));
  },

  addRecurringService: (companyId, service) => {
    set((s) => ({
      companies: s.companies.map((c) =>
        c.id === companyId
          ? { ...c, recurringServices: [...c.recurringServices, service] }
          : c
      ),
    }));
  },

  archiveCompany: (id) => {
    const company = get().companies.find((c) => c.id === id);
    const companies = get().companies.map((c) =>
      c.id === id ? { ...c, status: "archived" as const } : c
    );
    set({ companies, selectedCompany: null });

    // Auto-create document in Documents Vault (bypass manual review)
    if (company) {
      useDocumentsStore.getState().addDocument({
        name: `أرشيف الشركة: ${company.name}`,
        type: "archive",
        tags: ["أرشيف", "شركة"],
        issueDate: new Date().toISOString().slice(0, 10),
        expiryDate: "",
        description: `تم أرشفة الشركة ${company.name} - ${company.type}`,
        fileUrl: "",
        size: "0 B",
      });
    }
  },

  restoreCompany: (id) => {
    const companies = get().companies.map((c) =>
      c.id === id ? { ...c, status: "active" as const } : c
    );
    set({ companies });
  },
}),
{
  name: "himo-workspace",
  partialize: (state) => ({
    selectedClient: state.selectedClient,
    selectedCompany: state.selectedCompany,
  }),
  onRehydrateStorage() {
    return (state) => {
      if (!state) return;
      state.loadMockData();
      state.fetchCompanies();
    };
  },
},
));
