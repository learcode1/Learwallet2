import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface DashboardStats {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  activeSubscriptions: number;
  subscriptionsTotal: number;
  pendingTransactions: number;
  pendingTotal: number;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) {
        return {
          balance: 0,
          income: 0,
          expenses: 0,
          savings: 0,
          savingsRate: 0,
          activeSubscriptions: 0,
          subscriptionsTotal: 0,
          pendingTransactions: 0,
          pendingTotal: 0,
        };
      }

      // Get current month transactions
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

      const [transactionsRes, subscriptionsRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount, status, date")
          .eq("user_id", user.id),
        supabase
          .from("subscriptions")
          .select("amount, status")
          .eq("user_id", user.id),
      ]);

      const transactions = transactionsRes.data || [];
      const subscriptions = subscriptionsRes.data || [];

      // Calculate totals for the current month
      const monthTransactions = transactions.filter(
        (t) => t.date >= startOfMonth && t.date <= endOfMonth
      );

      const income = monthTransactions
        .filter((t) => t.amount > 0 && t.status === "pago")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = Math.abs(
        monthTransactions
          .filter((t) => t.amount < 0 && t.status === "pago")
          .reduce((sum, t) => sum + t.amount, 0)
      );

      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;

      // Calculate all-time balance
      const allPaid = transactions.filter((t) => t.status === "pago");
      const balance = allPaid.reduce((sum, t) => sum + t.amount, 0);

      // Active subscriptions
      const activeSubscriptions = subscriptions.filter((s) => s.status === "ativa");
      const subscriptionsTotal = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);

      // Pending transactions
      const pending = transactions.filter((t) => t.status === "pendente");
      const pendingTotal = Math.abs(pending.reduce((sum, t) => sum + t.amount, 0));

      return {
        balance,
        income,
        expenses,
        savings,
        savingsRate,
        activeSubscriptions: activeSubscriptions.length,
        subscriptionsTotal,
        pendingTransactions: pending.length,
        pendingTotal,
      };
    },
    enabled: !!user,
  });
}
