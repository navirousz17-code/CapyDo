'use client';
// hooks/useFinanceStore.ts

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export type TxType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  type: TxType;
  amount: number;
  category: string;
  note: string | null;
  occurred_at: string; // YYYY-MM-DD
  created_at: string;
}

export const EXPENSE_CATEGORIES = [
  { id: 'food',       label: 'Food',          icon: '🍔', color: '#f97316' },
  { id: 'transport',  label: 'Transport',     icon: '🚗', color: '#3b82f6' },
  { id: 'bills',      label: 'Bills',         icon: '🧾', color: '#ef4444' },
  { id: 'shopping',   label: 'Shopping',      icon: '🛍️', color: '#ec4899' },
  { id: 'entertainment', label: 'Fun',        icon: '🎮', color: '#8b5cf6' },
  { id: 'health',     label: 'Health',        icon: '💊', color: '#10b981' },
  { id: 'education',  label: 'Education',     icon: '📚', color: '#06b6d4' },
  { id: 'other',      label: 'Other',         icon: '📦', color: '#6b7280' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary',   label: 'Salary',   icon: '💼', color: '#22c55e' },
  { id: 'allowance', label: 'Allowance', icon: '💵', color: '#16a34a' },
  { id: 'gift',     label: 'Gift',     icon: '🎁', color: '#a855f7' },
  { id: 'freelance', label: 'Freelance', icon: '💻', color: '#0ea5e9' },
  { id: 'other',    label: 'Other',    icon: '📦', color: '#6b7280' },
];

export function getCategoryMeta(type: TxType, category: string) {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.id === category) ?? list[list.length - 1];
}

interface FinanceStore {
  transactions: Transaction[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  createTransaction: (data: { type: TxType; amount: number; category: string; note?: string; occurred_at?: string }) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<void>;
  getStats: () => {
    balance: number;
    monthIncome: number;
    monthExpense: number;
    todayExpense: number;
    categoryBreakdown: { category: string; amount: number; meta: ReturnType<typeof getCategoryMeta> }[];
    last7Days: { date: string; label: string; income: number; expense: number }[];
  };
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/finance');
      const data = await res.json();
      if (Array.isArray(data)) set({ transactions: data });
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    } finally {
      set({ loading: false });
    }
  },

  createTransaction: async (input) => {
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) return null;
      const tx: Transaction = await res.json();
      set((s) => ({ transactions: [tx, ...s.transactions] }));
      return tx;
    } catch (e) {
      console.error('Failed to create transaction', e);
      return null;
    }
  },

  deleteTransaction: async (id) => {
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
    try {
      await fetch(`/api/finance/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete transaction', e);
    }
  },

  getStats: () => {
    const { transactions } = get();
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7); // YYYY-MM
    const todayStr = now.toISOString().split('T')[0];

    let balance = 0;
    let monthIncome = 0;
    let monthExpense = 0;
    let todayExpense = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach((t) => {
      const signedAmount = t.type === 'income' ? t.amount : -t.amount;
      balance += signedAmount;

      if (t.occurred_at.startsWith(monthStr)) {
        if (t.type === 'income') monthIncome += t.amount;
        else monthExpense += t.amount;
      }

      if (t.occurred_at === todayStr && t.type === 'expense') {
        todayExpense += t.amount;
      }

      if (t.type === 'expense' && t.occurred_at.startsWith(monthStr)) {
        categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount;
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount, meta: getCategoryMeta('expense', category) }))
      .sort((a, b) => b.amount - a.amount);

    // Last 7 days income/expense
    const last7Days: { date: string; label: string; income: number; expense: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayIncome = transactions.filter((t) => t.occurred_at === dateStr && t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const dayExpense = transactions.filter((t) => t.occurred_at === dateStr && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      last7Days.push({ date: dateStr, label, income: dayIncome, expense: dayExpense });
    }

    return { balance, monthIncome, monthExpense, todayExpense, categoryBreakdown, last7Days };
  },
}));