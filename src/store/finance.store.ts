import { create } from "zustand";
import { Wallet, Income, Expense, Subscription, Debt } from "@/types/finance";
import { mockWallets, mockIncomes, mockExpenses, mockSubscriptions, mockDebts } from "@/lib/mock/finance";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

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

  fetchAll: () => Promise<void>;
  seedIfEmpty: () => Promise<void>;
  toggleSubscription: (id: string) => Promise<void>;
  recomputeTotals: () => void;

  addWallet: (data: Omit<Wallet, "id">) => Promise<void>;
  updateWallet: (id: string, data: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;

  addIncome: (data: Omit<Income, "id">) => Promise<void>;
  updateIncome: (id: string, data: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  addExpense: (data: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addSubscription: (data: Omit<Subscription, "id">) => Promise<void>;
  updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;

  addDebt: (data: Omit<Debt, "id">) => Promise<void>;
  updateDebt: (id: string, data: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  wallets: [], incomes: [], expenses: [], subscriptions: [], debts: [],
  totalBalance: 0, totalIncome: 0, totalExpenses: 0, totalDebts: 0,
  pendingProfits: 0, totalSubscriptionsCost: 0, isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    const [walletsRes, incomesRes, expensesRes, subscriptionsRes, debtsRes] = await Promise.all([
      supabase.from("wallets").select("*"),
      supabase.from("incomes").select("*"),
      supabase.from("expenses").select("*"),
      supabase.from("subscriptions").select("*"),
      supabase.from("debts").select("*"),
    ]);
    if (walletsRes.data) set({ wallets: walletsRes.data as unknown as Wallet[] });
    if (incomesRes.data) set({ incomes: incomesRes.data as unknown as Income[] });
    if (expensesRes.data) set({ expenses: expensesRes.data as unknown as Expense[] });
    if (subscriptionsRes.data) set({ subscriptions: subscriptionsRes.data as unknown as Subscription[] });
    if (debtsRes.data) set({ debts: debtsRes.data as unknown as Debt[] });
    get().recomputeTotals();
    set({ isLoading: false });
  },

  seedIfEmpty: async () => {
    const { data: existing } = await supabase.from("wallets").select("id").limit(1);
    if (existing && existing.length > 0) return;
    await supabase.from("wallets").insert(mockWallets.map(({ id: _w, ...r }) => r));
    await supabase.from("incomes").insert(mockIncomes.map(({ id: _i, ...r }) => ({ ...r, wallet_id: r.walletId })));
    await supabase.from("expenses").insert(mockExpenses.map(({ id: _e, ...r }) => ({ ...r, wallet_id: r.walletId })));
    await supabase.from("subscriptions").insert(mockSubscriptions.map(({ id: _s, ...r }) => r));
    await supabase.from("debts").insert(mockDebts.map(({ id: _d, ...r }) => r));
    await get().fetchAll();
  },

  recomputeTotals: () => {
    const s = get();
    set({
      totalBalance: s.wallets.reduce((sum, w) => sum + w.balance, 0),
      totalIncome: s.incomes.filter((i) => i.status === "received").reduce((sum, i) => sum + i.amount, 0),
      totalExpenses: s.expenses.reduce((sum, e) => sum + e.amount, 0),
      totalDebts: s.debts.reduce((sum, d) => sum + d.remaining, 0),
      pendingProfits: s.incomes.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.amount, 0),
      totalSubscriptionsCost: s.subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.cost, 0),
    });
  },

  toggleSubscription: async (id) => {
    const prev = get().subscriptions;
    set((s) => ({ subscriptions: s.subscriptions.map((sub) => sub.id === id ? { ...sub, active: !sub.active } : sub) }));
    get().recomputeTotals();
    const sub = get().subscriptions.find((s) => s.id === id);
    if (sub) {
      const { error } = await supabase.from("subscriptions").update({ active: sub.active }).eq("id", id);
      if (error) { logger.api.supabase("toggle subscription", error, { subId: id }); set({ subscriptions: prev }); get().recomputeTotals(); }
    }
  },

  addWallet: async (data) => {
    const optimistic: Wallet = { id: uid(), ...data };
    const prev = get().wallets;
    set((s) => ({ wallets: [...s.wallets, optimistic] }));
    get().recomputeTotals();
    const { data: inserted, error } = await supabase.from("wallets").insert(data).select().single();
    if (error) { logger.api.supabase("insert wallet", error, { name: data.name }); set({ wallets: prev }); get().recomputeTotals(); return; }
    set((s) => ({ wallets: s.wallets.map((w) => w.id === optimistic.id ? { ...w, id: inserted.id } : w) }));
  },

  updateWallet: async (id, data) => {
    const prev = get().wallets;
    set((s) => ({ wallets: s.wallets.map((w) => (w.id === id ? { ...w, ...data } : w)) }));
    get().recomputeTotals();
    const { error } = await supabase.from("wallets").update(data).eq("id", id);
    if (error) { logger.api.supabase("update wallet", error, { walletId: id }); set({ wallets: prev }); get().recomputeTotals(); }
  },

  deleteWallet: async (id) => {
    const prev = get().wallets;
    set((s) => ({ wallets: s.wallets.filter((w) => w.id !== id) }));
    get().recomputeTotals();
    const { error } = await supabase.from("wallets").delete().eq("id", id);
    if (error) { logger.api.supabase("delete wallet", error, { walletId: id }); set({ wallets: prev }); get().recomputeTotals(); }
  },

  addIncome: async (data) => {
    const income: Income = { id: uid(), ...data };
    const prevIncomes = get().incomes;
    const prevWallets = get().wallets;
    set((s) => ({
      incomes: [...s.incomes, income],
      wallets: income.status === "received"
        ? s.wallets.map((w) => w.id === income.walletId ? { ...w, balance: w.balance + income.amount } : w)
        : s.wallets,
    }));
    get().recomputeTotals();
    const { error } = await supabase.from("incomes").insert({
      amount: data.amount, client: data.client, status: data.status,
      date: data.date, wallet_id: data.walletId,
    });
    if (error) { logger.api.supabase("insert income", error, { client: data.client, amount: data.amount }); set({ incomes: prevIncomes, wallets: prevWallets }); get().recomputeTotals(); }
  },

  updateIncome: async (id, data) => {
    const prev = get().incomes.find((i) => i.id === id);
    if (!prev) return;
    const prevWallets = get().wallets;
    const newStatus = data.status ?? prev.status;
    const newAmount = data.amount ?? prev.amount;
    const newWalletId = data.walletId ?? prev.walletId;
    set((s) => ({ incomes: s.incomes.map((i) => (i.id === id ? { ...i, ...data } : i)) }));
    const reversePrev = prev.status === "received" ? { walletId: prev.walletId, amount: -prev.amount } : null;
    const applyNew = newStatus === "received" ? { walletId: newWalletId, amount: newAmount } : null;
    set((s) => {
      let w = s.wallets;
      if (reversePrev) w = w.map((wal) => wal.id === reversePrev.walletId ? { ...wal, balance: wal.balance + reversePrev.amount } : wal);
      if (applyNew) w = w.map((wal) => wal.id === applyNew.walletId ? { ...wal, balance: wal.balance + applyNew.amount } : wal);
      return { wallets: w };
    });
    get().recomputeTotals();
    const dbData: Record<string, unknown> = {};
    if (data.amount !== undefined) dbData.amount = data.amount;
    if (data.client !== undefined) dbData.client = data.client;
    if (data.status !== undefined) dbData.status = data.status;
    if (data.date !== undefined) dbData.date = data.date;
    if (data.walletId !== undefined) dbData.wallet_id = data.walletId;
    const { error } = await supabase.from("incomes").update(dbData).eq("id", id);
    if (error) { logger.api.supabase("update income", error, { incomeId: id }); set({ incomes: get().incomes.map((i) => i.id === id ? prev : i), wallets: prevWallets }); get().recomputeTotals(); }
  },

  deleteIncome: async (id) => {
    const target = get().incomes.find((i) => i.id === id);
    if (!target) return;
    const prevIncomes = get().incomes;
    const prevWallets = get().wallets;
    set((s) => ({
      incomes: s.incomes.filter((i) => i.id !== id),
      wallets: target.status === "received" ? s.wallets.map((w) => w.id === target.walletId ? { ...w, balance: w.balance - target.amount } : w) : s.wallets,
    }));
    get().recomputeTotals();
    const { error } = await supabase.from("incomes").delete().eq("id", id);
    if (error) { logger.api.supabase("delete income", error, { incomeId: id }); set({ incomes: prevIncomes, wallets: prevWallets }); get().recomputeTotals(); }
  },

  addExpense: async (data) => {
    const expense: Expense = { id: uid(), ...data };
    const prevExpenses = get().expenses;
    const prevWallets = get().wallets;
    set((s) => ({
      expenses: [...s.expenses, expense],
      wallets: s.wallets.map((w) => w.id === expense.walletId ? { ...w, balance: w.balance - expense.amount } : w),
    }));
    get().recomputeTotals();
    const { error } = await supabase.from("expenses").insert({
      amount: data.amount, category: data.category, tags: data.tags,
      description: data.description, date: data.date, wallet_id: data.walletId,
    });
    if (error) { logger.api.supabase("insert expense", error, { description: data.description, amount: data.amount }); set({ expenses: prevExpenses, wallets: prevWallets }); get().recomputeTotals(); }
  },

  updateExpense: async (id, data) => {
    const prev = get().expenses.find((e) => e.id === id);
    const prevWallets = get().wallets;
    set((s) => ({ expenses: s.expenses.map((e) => e.id === id ? { ...e, ...data } : e) }));
    if (prev) {
      const newAmount = data.amount ?? prev.amount;
      const delta = prev.amount - newAmount;
      const walletId = data.walletId ?? prev.walletId;
      set((s) => ({ wallets: s.wallets.map((w) => w.id === walletId ? { ...w, balance: w.balance + delta } : w) }));
    }
    get().recomputeTotals();
    const dbData: Record<string, unknown> = {};
    if (data.amount !== undefined) dbData.amount = data.amount;
    if (data.category !== undefined) dbData.category = data.category;
    if (data.tags !== undefined) dbData.tags = data.tags;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.date !== undefined) dbData.date = data.date;
    if (data.walletId !== undefined) dbData.wallet_id = data.walletId;
    const { error } = await supabase.from("expenses").update(dbData).eq("id", id);
    if (error) { logger.api.supabase("update expense", error, { expenseId: id }); set({ expenses: get().expenses.map((e) => e.id === id ? prev! : e), wallets: prevWallets }); get().recomputeTotals(); }
  },

  deleteExpense: async (id) => {
    const target = get().expenses.find((e) => e.id === id);
    if (!target) return;
    const prevExpenses = get().expenses;
    const prevWallets = get().wallets;
    set((s) => ({
      expenses: s.expenses.filter((e) => e.id !== id),
      wallets: s.wallets.map((w) => w.id === target.walletId ? { ...w, balance: w.balance + target.amount } : w),
    }));
    get().recomputeTotals();
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) { logger.api.supabase("delete expense", error, { expenseId: id }); set({ expenses: prevExpenses, wallets: prevWallets }); get().recomputeTotals(); }
  },

  addSubscription: async (data) => {
    const sub: Subscription = { id: uid(), ...data };
    const prev = get().subscriptions;
    set((s) => ({ subscriptions: [...s.subscriptions, sub] }));
    get().recomputeTotals();
    const { error } = await supabase.from("subscriptions").insert(data);
    if (error) { logger.api.supabase("insert subscription", error, { name: data.name }); set({ subscriptions: prev }); get().recomputeTotals(); }
  },

  updateSubscription: async (id, data) => {
    const prev = get().subscriptions;
    set((s) => ({ subscriptions: s.subscriptions.map((sub) => sub.id === id ? { ...sub, ...data } : sub) }));
    get().recomputeTotals();
    const { error } = await supabase.from("subscriptions").update(data).eq("id", id);
    if (error) { logger.api.supabase("update subscription", error, { subId: id }); set({ subscriptions: prev }); get().recomputeTotals(); }
  },

  deleteSubscription: async (id) => {
    const prev = get().subscriptions;
    set((s) => ({ subscriptions: s.subscriptions.filter((sub) => sub.id !== id) }));
    get().recomputeTotals();
    const { error } = await supabase.from("subscriptions").delete().eq("id", id);
    if (error) { logger.api.supabase("delete subscription", error, { subId: id }); set({ subscriptions: prev }); get().recomputeTotals(); }
  },

  addDebt: async (data) => {
    const debt: Debt = { id: uid(), ...data };
    const prev = get().debts;
    set((s) => ({ debts: [...s.debts, debt] }));
    get().recomputeTotals();
    const { error } = await supabase.from("debts").insert(data);
    if (error) { logger.api.supabase("insert debt", error, { creditor: data.creditor }); set({ debts: prev }); get().recomputeTotals(); }
  },

  updateDebt: async (id, data) => {
    const prev = get().debts;
    set((s) => ({ debts: s.debts.map((d) => d.id === id ? { ...d, ...data } : d) }));
    get().recomputeTotals();
    const { error } = await supabase.from("debts").update(data).eq("id", id);
    if (error) { logger.api.supabase("update debt", error, { debtId: id }); set({ debts: prev }); get().recomputeTotals(); }
  },

  deleteDebt: async (id) => {
    const prev = get().debts;
    set((s) => ({ debts: s.debts.filter((d) => d.id !== id) }));
    get().recomputeTotals();
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) { logger.api.supabase("delete debt", error, { debtId: id }); set({ debts: prev }); get().recomputeTotals(); }
  },
}));
