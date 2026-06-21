export interface Wallet {
  id: string;
  name: string;
  type: "bank" | "cash" | "crypto" | "freelance" | "digital";
  balance: number;
  currency: string;
  icon: string;
}

export interface Income {
  id: string;
  amount: number;
  client: string;
  status: "pending" | "received";
  date: string;
  walletId: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: "software" | "life" | "hardware" | "food" | "transport" | "entertainment" | "other";
  tags: string[];
  description: string;
  date: string;
  walletId: string;
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  renewalDate: string;
  category: string;
  active: boolean;
}

export interface Debt {
  id: string;
  creditor: string;
  amount: number;
  remaining: number;
  dueDate: string;
  type: "loan" | "credit" | "personal" | "other";
}


