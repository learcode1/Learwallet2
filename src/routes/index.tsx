import { formatDateBR } from "@/lib/format";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/cards/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  MonthlyChart,
  WeeklyChart,
  CategoryChart,
  BalanceChart,
  SubscriptionsTrendChart,
} from "@/components/charts/Charts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Repeat,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useTransactions } from "@/hooks/use-transactions";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearWallet — Dashboard financeira premium" },
      {
        name: "description",
        content:
          "Controle financeiro premium com lembretes Telegram, metas e graficos.",
      },
    ],
  }),
  component: Dashboard,
});

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n
  );

function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions();

  const recent = transactions?.slice(0, 6) || [];
  const upcoming =
    subscriptions?.filter((s) => s.status === "ativa").slice(0, 4) || [];

  const firstName = user?.user_metadata?.display_name?.split(" ")[0] || user?.email?.split("@")[0] || "Usuario";
  const currentMonth = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Bom dia, {firstName}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Sua visao financeira
        </h1>
        <p className="text-sm text-muted-foreground">
          {currentMonth} — atualizado agora
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statsLoading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="Saldo atual"
              value={formatBRL(stats?.balance || 0)}
              hint="total acumulado"
              icon={Wallet}
              tone="primary"
            />
            <StatCard
              label="Receitas"
              value={formatBRL(stats?.income || 0)}
              hint="este mes"
              icon={TrendingUp}
              tone="success"
            />
            <StatCard
              label="Despesas"
              value={formatBRL(stats?.expenses || 0)}
              hint="este mes"
              icon={TrendingDown}
              tone="destructive"
            />
            <StatCard
              label="Economia"
              value={formatBRL(stats?.savings || 0)}
              hint={`taxa: ${(stats?.savingsRate || 0).toFixed(0)}%`}
              icon={PiggyBank}
              tone="success"
            />
            <StatCard
              label="Assinaturas"
              value={`${stats?.activeSubscriptions || 0} ativas`}
              hint={formatBRL(stats?.subscriptionsTotal || 0)}
              icon={Repeat}
              tone="primary"
            />
            <StatCard
              label="Pendentes"
              value={`${stats?.pendingTransactions || 0} contas`}
              hint={formatBRL(stats?.pendingTotal || 0)}
              icon={AlertCircle}
              tone="warning"
            />
          </>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Receitas vs Gastos"
          description="Ultimos 6 meses"
          className="lg:col-span-2"
        >
          <MonthlyChart />
        </ChartCard>
        <ChartCard title="Gastos por categoria" description="Mes atual">
          <CategoryChart />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Evolucao do saldo"
          description="Patrimonio liquido"
          className="lg:col-span-2"
        >
          <BalanceChart />
        </ChartCard>
        <ChartCard title="Esta semana" description="Gastos diarios">
          <WeeklyChart />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/80 shadow-elegant lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold">Transacoes recentes</h3>
              <p className="text-xs text-muted-foreground">
                Ultimas movimentacoes
              </p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-medium text-primary hover:opacity-80"
            >
              Ver todas
            </Link>
          </div>
          {txLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
              <Wallet className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhuma transacao ainda
              </p>
              <Link
                to="/transactions"
                className="text-xs font-medium text-primary hover:underline"
              >
                Adicionar transacao
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {recent.map((t) => {
                const positive = t.amount > 0;
                return (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-accent/30"
                  >
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-xl ${positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                    >
                      {positive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {t.description}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {t.category} · {formatDateBR(t.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${positive ? "text-success" : "text-foreground"}`}
                      >
                        {positive ? "+" : ""}
                        {formatBRL(t.amount)}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-0.5 border-border/60 text-[10px] capitalize"
                      >
                        {t.status}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <ChartCard title="Assinaturas — tendencia" description="Total mensal">
            <SubscriptionsTrendChart />
          </ChartCard>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-elegant">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Proximos vencimentos</h3>
              <Link to="/subscriptions" className="text-xs font-medium text-primary">
                Ver todas
              </Link>
            </div>
            {subsLoading ? (
              <div className="space-y-2.5">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Repeat className="h-6 w-6 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">
                  Nenhuma assinatura ativa
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {upcoming.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <div
                      className="grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold text-primary-foreground"
                      style={{ background: s.color || "var(--primary)" }}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence dia {s.due_day}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatBRL(s.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
