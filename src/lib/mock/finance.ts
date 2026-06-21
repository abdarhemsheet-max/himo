import { Wallet, Income, Expense, Subscription, Debt } from "@/types/finance";

export const mockWallets: Wallet[] = [
  { id: "w1", name: "البنك الأهلي", type: "bank", balance: 24500, currency: "SAR", icon: "🏦" },
  { id: "w2", name: "محفظة نقدية", type: "cash", balance: 3200, currency: "SAR", icon: "💵" },
  { id: "w3", name: "كريبتو", type: "crypto", balance: 8500, currency: "USDT", icon: "₿" },
  { id: "w4", name: "بايونير", type: "digital", balance: 12800, currency: "USD", icon: "💳" },
  { id: "w5", name: "دوّار", type: "freelance", balance: 5400, currency: "SAR", icon: "🔄" },
];

export const mockIncomes: Income[] = [
  { id: "i1", amount: 5000, client: "شركة تقنية", status: "received", date: "2026-06-15", walletId: "w1" },
  { id: "i2", amount: 3200, client: "منصة تعليمية", status: "received", date: "2026-06-12", walletId: "w4" },
  { id: "i3", amount: 2800, client: "متجر إلكتروني", status: "pending", date: "2026-06-20", walletId: "w4" },
  { id: "i4", amount: 4500, client: "تطبيق جوال", status: "received", date: "2026-06-08", walletId: "w1" },
  { id: "i5", amount: 1500, client: "استشارة تقنية", status: "pending", date: "2026-06-22", walletId: "w4" },
  { id: "i6", amount: 6000, client: "شركة برمجيات", status: "received", date: "2026-06-01", walletId: "w1" },
  { id: "i7", amount: 2200, client: "تصميم واجهات", status: "received", date: "2026-05-28", walletId: "w4" },
  { id: "i8", amount: 3800, client: "تطوير ويب", status: "pending", date: "2026-06-25", walletId: "w1" },
  { id: "i9", amount: 4100, client: "نظام إدارة", status: "received", date: "2026-05-20", walletId: "w1" },
  { id: "i10", amount: 1800, client: "تطبيق سطح مكتب", status: "pending", date: "2026-06-28", walletId: "w4" },
];

export const mockExpenses: Expense[] = [
  { id: "e1", amount: 89, category: "software", tags: ["ai"], description: "اشتراك ChatGPT Plus", date: "2026-06-10", walletId: "w1" },
  { id: "e2", amount: 450, category: "life", tags: ["purchase"], description: "بقالة أسبوعية", date: "2026-06-09", walletId: "w2" },
  { id: "e3", amount: 1200, category: "hardware", tags: ["work"], description: "شاشة جديدة", date: "2026-06-05", walletId: "w1" },
  { id: "e4", amount: 199, category: "software", tags: ["cloud"], description: "اشتراك iCloud", date: "2026-06-01", walletId: "w1" },
  { id: "e5", amount: 75, category: "food", tags: ["dine-out"], description: "عشاء عمل", date: "2026-06-08", walletId: "w2" },
  { id: "e6", amount: 300, category: "transport", tags: ["fuel"], description: "تعبئة بنزين", date: "2026-06-07", walletId: "w2" },
  { id: "e7", amount: 59, category: "software", tags: ["subscription"], description: "اشتراك Netflix", date: "2026-06-11", walletId: "w1" },
  { id: "e8", amount: 250, category: "entertainment", tags: ["leisure"], description: "تذاكر سينما", date: "2026-06-06", walletId: "w2" },
  { id: "e9", amount: 99, category: "software", tags: ["dev"], description: "اشتراك GitHub Copilot", date: "2026-06-02", walletId: "w1" },
  { id: "e10", amount: 180, category: "life", tags: ["health"], description: "اشتراك نادي رياضي", date: "2026-06-01", walletId: "w1" },
  { id: "e11", amount: 39, category: "software", tags: ["storage"], description: "Dropbox Plus", date: "2026-06-03", walletId: "w1" },
  { id: "e12", amount: 600, category: "life", tags: ["rent"], description: "الإيجار الشهري", date: "2026-06-01", walletId: "w1" },
  { id: "e13", amount: 150, category: "entertainment", tags: ["game"], description: "لعبة جديدة", date: "2026-06-04", walletId: "w2" },
  { id: "e14", amount: 45, category: "food", tags: ["dine-out"], description: "غداء", date: "2026-06-12", walletId: "w2" },
  { id: "e15", amount: 200, category: "life", tags: ["bills"], description: "فاتورة كهرباء", date: "2026-06-05", walletId: "w1" },
];

export const mockDebts: Debt[] = [
  { id: "dbt1", creditor: "بنك الراجحي", amount: 50000, remaining: 32000, dueDate: "2028-03-15", type: "loan" },
  { id: "dbt2", creditor: "بطاقة ائتمان سامبا", amount: 15000, remaining: 8200, dueDate: "2026-07-20", type: "credit" },
  { id: "dbt3", creditor: "قرض شخصي - أحمد", amount: 10000, remaining: 4000, dueDate: "2026-09-01", type: "personal" },
  { id: "dbt4", creditor: "تمويل سيارة", amount: 45000, remaining: 28500, dueDate: "2028-11-10", type: "loan" },
];

export const mockSubscriptions: Subscription[] = [
  { id: "s1", name: "ChatGPT Plus", cost: 89, renewalDate: "2026-07-10", category: "ai", active: true },
  { id: "s2", name: "GitHub Copilot", cost: 99, renewalDate: "2026-07-02", category: "dev", active: true },
  { id: "s3", name: "iCloud 2TB", cost: 199, renewalDate: "2026-07-01", category: "cloud", active: true },
  { id: "s4", name: "Netflix Premium", cost: 59, renewalDate: "2026-07-11", category: "entertainment", active: true },
  { id: "s5", name: "Dropbox Plus", cost: 39, renewalDate: "2026-06-03", category: "storage", active: false },
];
