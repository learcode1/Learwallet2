import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface MonthlyData {
  month: string;
  gastos: number;
  receitas: number;
}

export interface WeeklyData {
  day: string;
  value: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface BalanceData {
  month: string;
  saldo: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  "alimentacao": "var(--chart-1)",
  "delivery": "var(--chart-2)",
  "transporte": "var(--chart-3)",
  "mercado": "var(--chart-4)",
  "lazer": "var(--chart-5)",
  "saude": "var(--chart-1)",
  "educacao": "var(--chart-2)",
  "assinatura": "var(--chart-3)",
  "trabalho": "var(--chart-4)",
  "outros": "var(--chart-5)",
};

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function useChartData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chart-data", user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          monthlyData: [] as MonthlyData[],
          weeklyData: [] as WeeklyData[],
          categoryData: [] as CategoryData[],
          balanceData: [] as BalanceData[],
          subscriptionsTrend: [] as { month: string; value: number }[],
        };
      }

      // Get last 6 months of transactions
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const startDate = sixMonthsAgo.toISOString().slice(0, 10);

      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount, category, date, status")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .eq("status", "pago");

      const txs = transactions || [];

      // Monthly data (last 6 months)
      const monthlyData: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = date.toISOString().slice(0, 7);
        const monthTxs = txs.filter((t) => t.date.startsWith(monthStart));
        
        const receitas = monthTxs.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const gastos = Math.abs(monthTxs.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        
        monthlyData.push({
          month: MONTH_NAMES[date.getMonth()],
          gastos,
          receitas,
        });
      }

      // Weekly data (last 7 days)
      const weeklyData: WeeklyData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10);
        const dayTxs = txs.filter((t) => t.date === dateStr && t.amount < 0);
        const value = Math.abs(dayTxs.reduce((sum, t) => sum + t.amount, 0));
        
        weeklyData.push({
          day: DAY_NAMES[date.getDay()],
          value,
        });
      }

      // Category breakdown (current month)
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 7);
      const currentMonthTxs = txs.filter((t) => t.date.startsWith(currentMonthStart) && t.amount < 0);
      
      const categoryMap = new Map<string, number>();
      currentMonthTxs.forEach((t) => {
        const cat = t.category || "outros";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
      });

      const categoryData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: CATEGORY_COLORS[name] || "var(--chart-5)",
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Balance evolution
      let runningBalance = 0;
      const balanceData: BalanceData[] = monthlyData.map((m) => {
        runningBalance += m.receitas - m.gastos;
        return { month: m.month, saldo: runningBalance };
      });

      // Subscriptions trend (mock for now as subscriptions don't have history)
      const subscriptionsTrend = monthlyData.map((m, i) => ({
        month: m.month,
        value: 280 + i * 30, // Placeholder - would need subscription history table
      }));

      return {
        monthlyData,
        weeklyData,
        categoryData,
        balanceData,
        subscriptionsTrend,
      };
    },
    enabled: !!user,
  });
}
