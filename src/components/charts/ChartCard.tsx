import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartCard({
  title, description, action, children, className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-elegant",
      className,
    )}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
