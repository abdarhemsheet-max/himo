import { create } from "zustand";
import {
  Wallet,
  Income,
  Expense,
  Subscription,
  Debt,
} from "@/types/finance";
import {
  mockWallets,
  mockIncomes,
  mockExpenses,
  mockSubscriptions,
  mockDebts,
} from "@/lib/mock/finance";

// ── Helpers ──────────────────────────────────────
let _nextId = 100;
const uid = () => `himo_${++_nextId}_${Date.now()}`;

interface FinanceState {
  wallets: Wallet[];
  incomes: Income[];
  expenses: Expense[];
  subscriptions: Subscription[];
  debts: Debt[];
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalDebts: number;
  pendingProfits: number;
  totalSubscriptionsCost: number;
  isLoading: boolean;

  loadMockData: () => void;
  toggleSubscription: (id: string) => void;
  recomputeTotals: () => void;

  // Wallets
  addWallet: (data: Omit<Wallet, "id">) => void;
  updateWallet: (id: string, data: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;

  // Incomes
  addIncome: (data: Omit<Income, "id">) => void;
  updateIncome: (id: string, data: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  // Expenses
  addExpense: (data: Omit<Expense, "id">) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Subscriptions
  addSubscription: (data: Omit<Subscription, "id">) => void;
  updateSubscription: (id: string, data: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  // Debts
  addDebt: (data: Omit<Debt, "id">) => void;
  updateDebt: (id: string, data: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  wallets: [],
  incomes: [],
  expenses: [],
  subscriptions: [],
  debts: [],
  totalBalance: 0,
  totalIncome: 0,
  totalExpenses: 0,
  totalDebts: 0,
  pendingProfits: 0,
  totalSubscriptionsCost: 0,
  isLoading: false,

  loadMockData: async () => {
    set({ isLoading: true });
    // Simulate network latency — remove when connected to Supabase
    await new Promise((r) => setTimeout(r, 400));

    const totalBalance = mockWallets.reduce((sum, w) => sum + w.balance, 0);
    const totalIncome = mockIncomes
      .filter((i) => i.status === "received")
      .reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDebts = mockDebts.reduce((sum, d) => sum + d.remaining, 0);
    const pendingProfits = mockIncomes
      .filter((i) => i.status === "pending")
      .reduce((sum, i) => sum + i.amount, 0);
    const totalSubscriptionsCost = mockSubscriptions
      .filter((s) => s.active)
      .reduce((sum, s) => sum + s.cost, 0);

    set({
      wallets: mockWallets,
      incomes: mockIncomes,
      expenses: mockExpenses,
      subscriptions: mockSubscriptions,
      debts: mockDebts,
      totalBalance,
      totalIncome,
      totalExpenses,
      totalDebts,
      pendingProfits,
      totalSubscriptionsCost,
      isLoading: false,
    });
  },

  recomputeTotals: () => {
    const s = get();
    const totalBalance = s.wallets.reduce((sum, w) => sum + w.balance, 0);
    const totalIncome = s.incomes
      .filter((i) => i.status === "received")
      .reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = s.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDebts = s.debts.reduce((sum, d) => sum + d.remaining, 0);
    const pendingProfits = s.incomes
      .filter((i) => i.status === "pending")
      .reduce((sum, i) => sum + i.amount, 0);
    const totalSubscriptionsCost = s.subscriptions
      .filter((s) => s.active)
      .reduce((sum, s) => sum + s.cost, 0);
    set({
      totalBalance,
      totalIncome,
      totalExpenses,
      totalDebts,
      pendingProfits,
      totalSubscriptionsCost,
    });
  },

  toggleSubscription: (id: string) => {
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, active: !sub.active } : sub
      ),
    }));
    get().recomputeTotals();
  },

  // ── Wallets ──────────────────────────────────
  addWallet: (data) => {
    // TODO: replace with supabase.from('wallets').insert(data).select().single()
    // const { data: row, error } = await ...
    const wallet: Wallet = { id: uid(), ...data };
    set((s) => ({ wallets: [...s.wallets, wallet] }));
    get().recomputeTotals();
  },
  updateWallet: (id, data) => {
    set((s) => ({
      wallets: s.wallets.map((w) => (w.id === id ? { ...w, ...data } : w)),
    }));
    get().recomputeTotals();
  },
  deleteWallet: (id) => {
    set((s) => ({ wallets: s.wallets.filter((w) => w.id !== id) }));
    get().recomputeTotals();
  },

  // ── Incomes ──────────────────────────────────
  addIncome: (data) => {
    const income: Income = { id: uid(), ...data };
    set((s) => ({
      incomes: [...s.incomes, income],
      // Only affect wallet balance if income is received (pending ≠ money in hand)
      wallets: income.status === "received"
        ? s.wallets.map((w) =>
            w.id === income.walletId ? { ...w, balance: w.balance + income.amount } : w
          )
        : s.wallets,
    }));
    get().recomputeTotals();
  },
  updateIncome: (id, data) => {
    const prev = get().incomes.find((i) => i.id === id);
    if (!prev) return;
    const newStatus = data.status ?? prev.status;
    const newAmount = data.amount ?? prev.amount;
    const newWalletId = data.walletId ?? prev.walletId;

    set((s) => ({
      incomes: s.incomes.map((i) => (i.id === id ? { ...i, ...data } : i)),
    }));

    // Reverse previous wallet effect if it was received
    const reversePrev = prev.status === "received"
      ? { walletId: prev.walletId, amount: -prev.amount }
      : null;
    // Apply new wallet effect if now received
    const applyNew = newStatus === "received"
      ? { walletId: newWalletId, amount: newAmount }
      : null;

    set((s) => {
      let w = s.wallets;
      if (reversePrev) {
        w = w.map((wal) =>
          wal.id === reversePrev.walletId ? { ...wal, balance: wal.balance + reversePrev.amount } : wal
        );
      }
      if (applyNew) {
        w = w.map((wal) =>
          wal.id === applyNew.walletId ? { ...wal, balance: wal.balance + applyNew.amount } : wal
        );
      }
      return { wallets: w };
    });
    get().recomputeTotals();
  },
  deleteIncome: (id) => {
    const target = get().incomes.find((i) => i.id === id);
    if (!target) return;
    set((s) => ({
      incomes: s.incomes.filter((i) => i.id !== id),
      // Only reverse wallet balance if the income was actually received
      wallets: target.status === "received"
        ? s.wallets.map((w) =>
            w.id === target.walletId ? { ...w, balance: w.balance - target.amount } : w
          )
        : s.wallets,
    }));
    get().recomputeTotals();
  },

  // ── Expenses ─────────────────────────────────
  addExpense: (data) => {
    const expense: Expense = { id: uid(), ...data };
    set((s) => ({
      expenses: [...s.expenses, expense],
      wallets: s.wallets.map((w) =>
        w.id === expense.walletId ? { ...w, balance: w.balance - expense.amount } : w
      ),
    }));
    get().recomputeTotals();
  },
  updateExpense: (id, data) => {
    const prev = get().expenses.find((e) => e.id === id);
    set((s) => ({
      expenses: s.expenses.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    }));
    if (prev) {
      const newAmount = data.amount ?? prev.amount;
      const delta = prev.amount - newAmount;
      const walletId = data.walletId ?? prev.walletId;
      set((s) => ({
        wallets: s.wallets.map((w) =>
          w.id === walletId ? { ...w, balance: w.balance + delta } : w
        ),
      }));
    }
    get().recomputeTotals();
  },
  deleteExpense: (id) => {
    const target = get().expenses.find((e) => e.id === id);
    set((s) => ({
      expenses: s.expenses.filter((e) => e.id !== id),
      wallets: s.wallets.map((w) =>
        w.id === target?.walletId ? { ...w, balance: w.balance + (target?.amount ?? 0) } : w
      ),
    }));
    get().recomputeTotals();
  },

  // ── Subscriptions ────────────────────────────
  addSubscription: (data) => {
    const sub: Subscription = { id: uid(), ...data };
    set((s) => ({ subscriptions: [...s.subscriptions, sub] }));
    get().recomputeTotals();
  },
  updateSubscription: (id, data) => {
    set((s) => ({
      subscriptions: s.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...data } : sub
      ),
    }));
    get().recomputeTotals();
  },
  deleteSubscription: (id) => {
    set((s) => ({
      subscriptions: s.subscriptions.filter((sub) => sub.id !== id),
    }));
    get().recomputeTotals();
  },

  // ── Debts ────────────────────────────────────
  addDebt: (data) => {
    const debt: Debt = { id: uid(), ...data };
    set((s) => ({ debts: [...s.debts, debt] }));
    get().recomputeTotals();
  },
  updateDebt: (id, data) => {
    set((s) => ({
      debts: s.debts.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }));
    get().recomputeTotals();
  },
  deleteDebt: (id) => {
    set((s) => ({ debts: s.debts.filter((d) => d.id !== id) }));
    get().recomputeTotals();
  },
}));
