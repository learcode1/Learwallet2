import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive" | "neutral";
};

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  primary: "from-primary/20 to-primary/0 text-primary",
  success: "from-success/20 to-success/0 text-success",
  warning: "from-warning/20 to-warning/0 text-warning",
  destructive: "from-destructive/20 to-destructive/0 text-destructive",
  neutral: "from-muted/40 to-muted/0 text-muted-foreground",
};

export function StatCard({ label, value, delta, hint, icon: Icon, tone = "primary" }: Props) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-elegant transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", toneClass[tone])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">{value}</p>
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl bg-background/60 ring-1 ring-border/60", toneClass[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-2 text-xs">
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium",
              positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
