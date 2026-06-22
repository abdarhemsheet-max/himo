import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFinanceStore } from "../finance.store";
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
  },
}));

describe("useFinanceStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFinanceStore.setState({
      wallets: [], incomes: [], expenses: [], subscriptions: [], debts: [],
      totalBalance: 0, totalIncome: 0, totalExpenses: 0, totalDebts: 0,
      pendingProfits: 0, totalSubscriptionsCost: 0, isLoading: false,
    });
  });

  describe("recomputeTotals", () => {
    it("should compute totals from data", () => {
      useFinanceStore.setState({
        wallets: [{ id: "w1", name: "Cash", type: "cash", balance: 5000, currency: "SAR", icon: "wallet" }],
        incomes: [{ id: "i1", amount: 1000, client: "Client A", status: "received", date: "2024-01-01", walletId: "w1" }],
        expenses: [{ id: "e1", amount: 200, category: "software", tags: [], description: "SaaS", date: "2024-01-02", walletId: "w1" }],
        debts: [{ id: "d1", creditor: "Bank", amount: 10000, remaining: 5000, dueDate: "2024-12-31", type: "loan" }],
      });
      useFinanceStore.getState().recomputeTotals();

      const s = useFinanceStore.getState();
      expect(s.totalBalance).toBe(5000);
      expect(s.totalIncome).toBe(1000);
      expect(s.totalExpenses).toBe(200);
      expect(s.totalDebts).toBe(5000);
    });
  });

  describe("addIncome", () => {
    it("should add income and update wallet balance optimistically", async () => {
      useFinanceStore.setState({
        wallets: [{ id: "w1", name: "Cash", type: "cash", balance: 1000, currency: "SAR", icon: "wallet" }],
      });

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() } as any);

      await useFinanceStore.getState().addIncome({
        amount: 500, client: "Freelance", status: "received",
        date: "2024-06-01", walletId: "w1",
      });

      const s = useFinanceStore.getState();
      expect(s.incomes.length).toBe(1);
      expect(s.incomes[0].amount).toBe(500);
      expect(s.wallets[0].balance).toBe(1500);
      expect(s.totalIncome).toBe(500);
    });

    it("should rollback on supabase error", async () => {
      useFinanceStore.setState({
        wallets: [{ id: "w1", name: "Cash", type: "cash", balance: 1000, currency: "SAR", icon: "wallet" }],
      });

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: new Error("Insert failed") }), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() } as any);

      await useFinanceStore.getState().addIncome({
        amount: 500, client: "Freelance", status: "received",
        date: "2024-06-01", walletId: "w1",
      });

      const s = useFinanceStore.getState();
      expect(s.incomes.length).toBe(0);
      expect(s.wallets[0].balance).toBe(1000);
    });
  });

  describe("addExpense", () => {
    it("should deduct from wallet optimistically and rollback on error", async () => {
      useFinanceStore.setState({
        wallets: [{ id: "w1", name: "Cash", type: "cash", balance: 1000, currency: "SAR", icon: "wallet" }],
      });

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: new Error("Insert failed") }), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() } as any);

      await useFinanceStore.getState().addExpense({
        amount: 300, category: "food", tags: [], description: "Groceries",
        date: "2024-06-01", walletId: "w1",
      });

      const s = useFinanceStore.getState();
      expect(s.expenses.length).toBe(0);
      expect(s.wallets[0].balance).toBe(1000);
    });
  });

  describe("deleteExpense", () => {
    it("should restore wallet balance on delete", async () => {
      useFinanceStore.setState({
        wallets: [{ id: "w1", name: "Cash", type: "cash", balance: 700, currency: "SAR", icon: "wallet" }],
        expenses: [{ id: "e1", amount: 300, category: "food", tags: [], description: "Groceries", date: "2024-06-01", walletId: "w1" }],
      });

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ delete: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }), select: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() } as any);

      await useFinanceStore.getState().deleteExpense("e1");

      const s = useFinanceStore.getState();
      expect(s.expenses.length).toBe(0);
      expect(s.wallets[0].balance).toBe(1000);
    });
  });

  describe("toggleSubscription", () => {
    it("should toggle active status and rollback on error", async () => {
      useFinanceStore.setState({
        subscriptions: [{ id: "s1", name: "Netflix", cost: 50, renewalDate: "2024-07-01", category: "entertainment", active: true }],
      });

      const mockFrom = vi.mocked(supabase.from);
      mockFrom.mockReturnValue({ update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: new Error("Update failed") }), select: vi.fn().mockReturnThis(), insert: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), single: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() } as any);

      await useFinanceStore.getState().toggleSubscription("s1");

      const s = useFinanceStore.getState();
      expect(s.subscriptions[0].active).toBe(true); // rolled back
    });
  });
});
