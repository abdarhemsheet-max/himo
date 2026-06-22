import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWorkspaceStore } from "../workspace.store";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
  },
}));

vi.mock("../documents.store", () => ({
  useDocumentsStore: {
    getState: vi.fn(() => ({
      addDocument: vi.fn(),
    })),
  },
}));

vi.mock("../finance.store", () => ({
  useFinanceStore: {
    getState: vi.fn(() => ({
      wallets: [],
      addIncome: vi.fn(),
    })),
  },
}));

describe("useWorkspaceStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceStore.setState({
      clients: [],
      companies: [],
      tasks: [],
      selectedClient: null,
      selectedCompany: null,
    });
  });

  describe("addTask", () => {
    it("should add task optimistically and rollback on error", async () => {
      const mockFrom = vi.mocked(supabase.from);
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: new Error("DB error") });
      mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, eq: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), neq: vi.fn().mockReturnThis(), single: mockSingle } as any);
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const addTask = useWorkspaceStore.getState().addTask;
      await addTask("client-1", "Test Task");

      const state = useWorkspaceStore.getState();
      expect(state.tasks.length).toBe(0); // rolled back
    });

    it("should add task optimistically and update id on success", async () => {
      const mockFrom = vi.mocked(supabase.from);
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: "new-uuid" }, error: null });
      mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect, eq: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), neq: vi.fn().mockReturnThis(), single: mockSingle } as any);
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      await useWorkspaceStore.getState().addTask("client-1", "New Task");

      const state = useWorkspaceStore.getState();
      expect(state.tasks.length).toBe(1);
      expect(state.tasks[0].title).toBe("New Task");
      expect(state.tasks[0].id).toBe("new-uuid");
    });
  });

  describe("archiveTask", () => {
    it("should archive and create document", async () => {
      useWorkspaceStore.setState({
        tasks: [{ id: "t1", title: "Done Task", description: "", status: "pending", clientId: "c1", dueDate: "", priority: "medium", billableHours: 0 }],
      });

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }), select: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), neq: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis() } as any);

      await useWorkspaceStore.getState().archiveTask("t1");

      const state = useWorkspaceStore.getState();
      const archived = state.tasks.find((t) => t.id === "t1");
      expect(archived?.status).toBe("archived");
    });

    it("should rollback archive on supabase error", async () => {
      useWorkspaceStore.setState({
        tasks: [{ id: "t1", title: "Fail Task", description: "", status: "in-progress", clientId: "c1", dueDate: "", priority: "medium", billableHours: 0 }],
      });

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: new Error("DB down") }), select: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), neq: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis() } as any);

      await useWorkspaceStore.getState().archiveTask("t1");

      const state = useWorkspaceStore.getState();
      expect(state.tasks[0].status).toBe("in-progress"); // rolled back
    });
  });

  describe("deleteTask", () => {
    it("should delete optimistically and rollback on error", async () => {
      useWorkspaceStore.setState({
        tasks: [{ id: "t1", title: "Delete Me", description: "", status: "pending", clientId: "c1", dueDate: "", priority: "low", billableHours: 0 }],
      });

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ delete: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: new Error("DB down") }), select: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), neq: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis() } as any);

      await useWorkspaceStore.getState().deleteTask("t1");

      const state = useWorkspaceStore.getState();
      expect(state.tasks.length).toBe(1); // rolled back
    });
  });

  describe("addClient", () => {
    it("should add client and replace temp id with real id", async () => {
      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ insert: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { id: "real-uuid" }, error: null }), update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), neq: vi.fn().mockReturnThis() } as any);

      await useWorkspaceStore.getState().addClient({ name: "Test", company: "Acme", email: "test@a.com", phone: "123" });

      const state = useWorkspaceStore.getState();
      expect(state.clients.length).toBe(1);
      expect(state.clients[0].id).toBe("real-uuid");
      expect(state.clients[0].name).toBe("Test");
    });
  });

  describe("updateTask", () => {
    it("should update optimistically and rollback on error", async () => {
      useWorkspaceStore.setState({
        tasks: [{ id: "t1", title: "Original", description: "", status: "pending", clientId: "c1", dueDate: "", priority: "medium", billableHours: 0 }],
      });

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: new Error("DB down") }), select: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), neq: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis() } as any);

      await useWorkspaceStore.getState().updateTask("t1", { priority: "critical" });

      const state = useWorkspaceStore.getState();
      expect(state.tasks[0].priority).toBe("medium"); // rolled back
    });
  });
});
