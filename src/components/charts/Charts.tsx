import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartData } from "@/hooks/use-chart-data";
import { Skeleton } from "@/components/ui/skeleton";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11 };
const grid = { stroke: "var(--color-border)", strokeDasharray: "3 3" };

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--color-popover-foreground)",
  boxShadow: "0 8px 30px -10px rgba(0,0,0,.5)",
};

export function MonthlyChart() {
  const { data, isLoading } = useChartData();
  const monthlyData = data?.monthlyData || [];

  if (isLoading) return <Skeleton className="h-[260px] w-full rounded-xl" />;
  if (monthlyData.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={monthlyData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gReceitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gGastos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-5)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-5)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...grid} vertical={false} />
        <XAxis dataKey="month" {...axis} tickLine={false} axisLine={false} />
        <YAxis {...axis} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatBRL(v)} />
        <Area type="monotone" dataKey="receitas" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#gReceitas)" />
        <Area type="monotone" dataKey="gastos" stroke="var(--color-chart-5)" strokeWidth={2} fill="url(#gGastos)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function WeeklyChart() {
  const { data, isLoading } = useChartData();
  const weeklyData = data?.weeklyData || [];

  if (isLoading) return <Skeleton className="h-[220px] w-full rounded-xl" />;
  if (weeklyData.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={weeklyData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid {...grid} vertical={false} />
        <XAxis dataKey="day" {...axis} tickLine={false} axisLine={false} />
        <YAxis {...axis} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatBRL(v)} cursor={{ fill: "var(--color-muted)" }} />
        <Bar dataKey="value" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryChart() {
  const { data, isLoading } = useChartData();
  const categoryData = data?.categoryData || [];

  if (isLoading) return <Skeleton className="h-[260px] w-full rounded-xl" />;
  if (categoryData.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          stroke="var(--color-background)"
          strokeWidth={2}
        >
          {categoryData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatBRL(v)} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BalanceChart() {
  const { data, isLoading } = useChartData();
  const balanceData = data?.balanceData || [];

  if (isLoading) return <Skeleton className="h-[260px] w-full rounded-xl" />;
  if (balanceData.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={balanceData} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid {...grid} vertical={false} />
        <XAxis dataKey="month" {...axis} tickLine={false} axisLine={false} />
        <YAxis {...axis} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatBRL(v)} />
        <Line
          type="monotone"
          dataKey="saldo"
          stroke="var(--color-chart-1)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--color-chart-1)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SubscriptionsTrendChart() {
  const { data, isLoading } = useChartData();
  const subscriptionsTrend = data?.subscriptionsTrend || [];

  if (isLoading) return <Skeleton className="h-[180px] w-full rounded-xl" />;
  if (subscriptionsTrend.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={subscriptionsTrend} margin={{ left: -25, right: 0, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gSubs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" {...axis} tickLine={false} axisLine={false} />
        <YAxis hide />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatBRL(v)} />
        <Area type="monotone" dataKey="value" stroke="var(--color-chart-3)" strokeWidth={2} fill="url(#gSubs)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
