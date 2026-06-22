import { create } from "zustand";
import { Client, Company, Task } from "@/types/workspace";
import { mockClients, mockTasks } from "@/lib/mock/workspace";
import { supabase } from "@/lib/supabase";
import { useFinanceStore } from "./finance.store";
import { useDocumentsStore } from "./documents.store";
import { logger } from "@/lib/logger";

let _nextId = 200;
const uid = () => `w_${++_nextId}_${Date.now()}`;

interface WorkspaceState {
  clients: Client[];
  companies: Company[];
  tasks: Task[];
  selectedClient: Client | null;
  selectedCompany: Company | null;

  fetchCompanies: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  seedIfEmpty: () => Promise<void>;
  selectClient: (client: Client | null) => void;
  selectCompany: (company: Company | null) => void;
  addTask: (clientId: string, title: string, companyId?: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  moveToInProgress: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  generateRecurringTasks: (companyId: string) => Promise<void>;
  addClient: (data: { name: string; company: string; email: string; phone: string }) => Promise<void>;
  archiveClient: (id: string) => Promise<void>;
  restoreClient: (id: string) => Promise<void>;
  addCompany: (data: { name: string; type: Company["type"]; email: string; phone: string }) => Promise<void>;
  addRecurringService: (companyId: string, service: string) => Promise<void>;
  archiveCompany: (id: string) => Promise<void>;
  restoreCompany: (id: string) => Promise<void>;
  completeProject: (clientId: string, projectId: string, walletId?: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  clients: [],
  companies: [],
  tasks: [],
  selectedClient: null,
  selectedCompany: null,

  fetchCompanies: async () => {
    const { data, error } = await supabase.from("companies").select("*");
    if (error) { logger.api.supabase("fetch companies", error); return; }
    if (data) set({ companies: data as unknown as Company[] });
  },

  fetchClients: async () => {
    const { data, error } = await supabase.from("clients").select("*");
    if (error) { logger.api.supabase("fetch clients", error); return; }
    if (data) set({ clients: data as unknown as Client[] });
  },

  fetchTasks: async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) { logger.api.supabase("fetch tasks", error); return; }
    if (data) set({ tasks: data as unknown as Task[] });
  },

  seedIfEmpty: async () => {
    const { data: existingClients } = await supabase.from("clients").select("id").limit(1);
    const { data: existingTasks } = await supabase.from("tasks").select("id").limit(1);
    const needsSeed = (!existingClients || existingClients.length === 0) && (!existingTasks || existingTasks.length === 0);
    if (!needsSeed) return;
    const { data: seededClients } = await supabase.from("clients").insert(
      mockClients.map(({ id: _cl, ...rest }) => rest)
    ).select();
    const { data: seededTasks } = await supabase.from("tasks").insert(
      mockTasks.map(({ id: _ts, ...rest }) => rest)
    ).select();
    if (seededClients) set({ clients: seededClients as unknown as Client[] });
    if (seededTasks) set({ tasks: seededTasks as unknown as Task[] });
  },

  selectClient: (client) => set({ selectedClient: client }),
  selectCompany: (company) => set({ selectedCompany: company }),

  addTask: async (clientId, title, companyId) => {
    const optimistic: Task = {
      id: uid(), title, description: "", status: "pending",
      clientId, companyId, dueDate: "", priority: "medium", billableHours: 0,
    };
    const prev = get().tasks;
    set({ tasks: [...prev, optimistic] });

    const { data, error } = await supabase.from("tasks").insert({
      title, client_id: clientId, company_id: companyId || null,
      description: "", status: "pending", due_date: "", priority: "medium", billable_hours: 0,
    }).select().single();

    if (error) {
      logger.api.supabase("insert task", error, { clientId, title });
      set({ tasks: prev });
      return;
    }
    set({ tasks: get().tasks.map((t) => t.id === optimistic.id ? { ...t, id: data.id } : t) });
  },

  archiveTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    const prev = get().tasks;
    const tasks = prev.map((t) => t.id !== id ? t : { ...t, status: "archived" as const });
    set({ tasks });

    const { error } = await supabase.from("tasks").update({ status: "archived" }).eq("id", id);
    if (error) {
      logger.api.supabase("archive task", error, { taskId: id });
      set({ tasks: prev });
      return;
    }
    if (task) {
      useDocumentsStore.getState().addDocument({
        name: `مهمة مكتملة: ${task.title}`,
        type: "archive", tags: ["أرشيف", "مهمة"],
        issueDate: new Date().toISOString().slice(0, 10), expiryDate: "",
        description: task.description || `تمت أرشفة المهمة: ${task.title}`,
        fileUrl: "", size: "0 B",
      });
    }
  },

  moveToInProgress: async (id) => {
    const prev = get().tasks;
    set({ tasks: prev.map((t) => t.id !== id ? t : { ...t, status: "in-progress" as const }) });
    const { error } = await supabase.from("tasks").update({ status: "in-progress" }).eq("id", id);
    if (error) { logger.api.supabase("move task", error, { taskId: id }); set({ tasks: prev }); }
  },

  restoreTask: async (id) => {
    const prev = get().tasks;
    set({ tasks: prev.map((t) => t.id !== id ? t : { ...t, status: "pending" as const }) });
    const { error } = await supabase.from("tasks").update({ status: "pending" }).eq("id", id);
    if (error) { logger.api.supabase("restore task", error, { taskId: id }); set({ tasks: prev }); }
  },

  deleteTask: async (id) => {
    const prev = get().tasks;
    set({ tasks: prev.filter((t) => t.id !== id) });
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { logger.api.supabase("delete task", error, { taskId: id }); set({ tasks: prev }); }
  },

  updateTask: async (id, data) => {
    const prev = get().tasks;
    set({ tasks: prev.map((t) => t.id === id ? { ...t, ...data } : t) });
    const dbData: Record<string, unknown> = {};
    if (data.title !== undefined) dbData.title = data.title;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.status !== undefined) dbData.status = data.status;
    if (data.dueDate !== undefined) dbData.due_date = data.dueDate;
    if (data.priority !== undefined) dbData.priority = data.priority;
    if (data.billableHours !== undefined) dbData.billable_hours = data.billableHours;
    if (data.clientId !== undefined) dbData.client_id = data.clientId;
    if (data.companyId !== undefined) dbData.company_id = data.companyId;
    const { error } = await supabase.from("tasks").update(dbData).eq("id", id);
    if (error) { logger.api.supabase("update task", error, { taskId: id }); set({ tasks: prev }); }
  },

  generateRecurringTasks: async (companyId) => {
    const company = get().companies.find((c) => c.id === companyId);
    if (!company) return;
    const existing = get().tasks.filter((t) => t.companyId === companyId && t.status !== "archived");
    const existingTitles = new Set(existing.map((t) => t.title));
    const newTasks: Task[] = company.recurringServices
      .filter((svc) => !existingTitles.has(svc))
      .map((svc) => ({
        id: uid(), title: svc, description: `مهمة شهرية متكررة - ${svc}`,
        status: "pending" as const, clientId: "", companyId,
        dueDate: "", priority: "high" as const, billableHours: 0,
      }));
    if (newTasks.length === 0) return;
    const prev = get().tasks;
    set({ tasks: [...prev, ...newTasks] });

    const { error } = await supabase.from("tasks").insert(
      newTasks.map((t) => ({
        title: t.title, description: t.description, status: t.status,
        company_id: companyId, due_date: "", priority: "high", billable_hours: 0,
      }))
    );
    if (error) { logger.api.supabase("insert recurring tasks", error, { companyId }); set({ tasks: prev }); }
  },

  completeProject: async (clientId, projectId, walletId) => {
    const state = get();
    const client = state.clients.find((c) => c.id === clientId);
    if (!client) return;

    const updatedClients = state.clients.map((c) => {
      if (c.id !== clientId) return c;
      const projects = c.projects.map((p) =>
        p.id === projectId ? { ...p, status: "completed" as const, progress: 100 } : p
      );
      return { ...c, projects };
    });
    set({ clients: updatedClients });

    const updatedClient = updatedClients.find((c) => c.id === clientId);
    if (updatedClient) {
      await supabase.from("clients").update({ projects: JSON.parse(JSON.stringify(updatedClient.projects)) }).eq("id", clientId);
    }

    const relatedTasks = state.tasks.filter((t) => t.clientId === clientId && t.status !== "archived");
    if (relatedTasks.length > 0) {
      set({ tasks: state.tasks.map((t) => t.clientId === clientId && t.status !== "archived" ? { ...t, status: "archived" as const } : t) });
      await supabase.from("tasks").update({ status: "archived" }).eq("client_id", clientId).neq("status", "archived");
    }

    const project = client.projects.find((p) => p.id === projectId);
    const projectRevenue = project ? Math.round(client.totalRevenue / client.projects.length) : 0;
    const financeState = useFinanceStore.getState();
    const targetWalletId = walletId || (financeState.wallets.length > 0 ? financeState.wallets[0].id : "");
    if (targetWalletId && projectRevenue > 0) {
      financeState.addIncome({
        amount: projectRevenue, client: client.name, status: "received",
        date: new Date().toISOString().slice(0, 10), walletId: targetWalletId,
      });
    }
  },

  addClient: async (data) => {
    const optimistic: Client = {
      id: uid(), name: data.name, company: data.company,
      email: data.email, phone: data.phone,
      activeContracts: 0, totalRevenue: 0, projects: [], status: "active",
    };
    const prev = get().clients;
    set({ clients: [...prev, optimistic] });

    const { data: inserted, error } = await supabase.from("clients").insert({
      name: data.name, company: data.company, email: data.email, phone: data.phone,
    }).select().single();

    if (error) { logger.api.supabase("insert client", error, { name: data.name }); set({ clients: prev }); return; }
    set({ clients: get().clients.map((c) => c.id === optimistic.id ? { ...c, id: inserted.id } : c) });
  },

  archiveClient: async (id) => {
    const client = get().clients.find((c) => c.id === id);
    const prev = get().clients;
    set({ clients: prev.map((c) => c.id === id ? { ...c, status: "archived" as const } : c), selectedClient: null });

    const { error } = await supabase.from("clients").update({ status: "archived" }).eq("id", id);
    if (error) { logger.api.supabase("archive client", error, { clientId: id }); set({ clients: prev }); return; }

    if (client) {
      useDocumentsStore.getState().addDocument({
        name: `أرشيف العميل: ${client.name}`, type: "archive", tags: ["أرشيف", "عميل"],
        issueDate: new Date().toISOString().slice(0, 10), expiryDate: "",
        description: `تم أرشفة العميل ${client.name} - ${client.company}`,
        fileUrl: "", size: "0 B",
      });
    }
  },

  restoreClient: async (id) => {
    const prev = get().clients;
    set({ clients: prev.map((c) => c.id === id ? { ...c, status: "active" as const } : c) });
    const { error } = await supabase.from("clients").update({ status: "active" }).eq("id", id);
    if (error) { logger.api.supabase("restore client", error, { clientId: id }); set({ clients: prev }); }
  },

  addCompany: async (data) => {
    const tempId = uid();
    const optimistic: Company = {
      id: tempId, name: data.name, type: data.type, email: data.email, phone: data.phone,
      monthlyValue: 0, recurringServices: [], activeTasksCount: 0, status: "active",
    };
    const prev = get().companies;
    set((s) => ({ companies: [...s.companies, optimistic] }));

    const { data: inserted, error } = await supabase.from("companies").insert({
      name: data.name, type: data.type, email: data.email, phone: data.phone,
    }).select().single();

    if (error) { logger.api.supabase("insert company", error, { name: data.name }); set({ companies: prev }); return; }
    const real = inserted as unknown as Company;
    set((s) => ({ companies: s.companies.map((c) => (c.id === tempId ? real : c)) }));
  },

  addRecurringService: async (companyId, service) => {
    const prev = get().companies;
    set((s) => ({
      companies: s.companies.map((c) =>
        c.id === companyId ? { ...c, recurringServices: [...c.recurringServices, service] } : c
      ),
    }));
    const company = get().companies.find((c) => c.id === companyId);
    if (company) {
      const { error } = await supabase.from("companies").update({
        recurring_services: company.recurringServices,
      }).eq("id", companyId);
      if (error) { logger.api.supabase("add recurring service", error, { companyId }); set({ companies: prev }); }
    }
  },

  archiveCompany: async (id) => {
    const company = get().companies.find((c) => c.id === id);
    const prev = get().companies;
    set({ companies: prev.map((c) => c.id === id ? { ...c, status: "archived" as const } : c), selectedCompany: null });

    const { error } = await supabase.from("companies").update({ status: "archived" }).eq("id", id);
    if (error) { logger.api.supabase("archive company", error, { companyId: id }); set({ companies: prev }); return; }

    if (company) {
      useDocumentsStore.getState().addDocument({
        name: `أرشيف الشركة: ${company.name}`, type: "archive", tags: ["أرشيف", "شركة"],
        issueDate: new Date().toISOString().slice(0, 10), expiryDate: "",
        description: `تم أرشفة الشركة ${company.name} - ${company.type}`,
        fileUrl: "", size: "0 B",
      });
    }
  },

  restoreCompany: async (id) => {
    const prev = get().companies;
    set({ companies: prev.map((c) => c.id === id ? { ...c, status: "active" as const } : c) });
    const { error } = await supabase.from("companies").update({ status: "active" }).eq("id", id);
    if (error) { logger.api.supabase("restore company", error, { companyId: id }); set({ companies: prev }); }
  },
}));
