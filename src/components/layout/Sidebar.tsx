import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ArrowLeftRight, Repeat, Bell, Target,
  Send, Settings, Wallet, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { to: "/subscriptions", label: "Assinaturas", icon: Repeat },
  { to: "/goals", label: "Metas", icon: Target },
  { to: "/reminders", label: "Lembretes", icon: Bell },
  { to: "/telegram", label: "Telegram", icon: Send },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
          <Wallet className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">LearWallet</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Premium Finance</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {nav.map((item) => {
          const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4 transition-colors", active && "text-primary")} />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-gradient-surface p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-sidebar-foreground">Plano Pro</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Desbloqueie relatórios avançados e alertas ilimitados no Telegram.
        </p>
        <button className="mt-3 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
          Fazer upgrade
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-3">
        <div className="h-8 w-8 rounded-full bg-gradient-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-sidebar-foreground">Lear Souza</p>
          <p className="truncate text-[11px] text-muted-foreground">lear@learwallet.app</p>
        </div>
        <Settings className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" />
      </div>
    </aside>
  );
}
