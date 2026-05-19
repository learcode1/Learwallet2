import { formatDateBR } from "@/lib/format";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useGoals, useCreateGoal, useUpdateGoal } from "@/hooks/use-goals";
import { Plus, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "Metas — LearWallet" }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const [open, setOpen] = useState(false);

  const items = goals || [];

  const addGoal = async (data: {
    name: string;
    target: number;
    current: number;
    deadline: string;
    emoji: string;
  }) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Meta criada");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar");
    }
  };

  const addProgress = async (id: string, currentAmount: number) => {
    const input = prompt("Valor a adicionar (R$):");
    if (!input) return;
    const value = parseFloat(input.replace(",", "."));
    if (isNaN(value) || value <= 0) {
      toast.error("Valor invalido");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id,
        current: currentAmount + value,
      });
      toast.success("Progresso atualizado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Metas financeiras
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus objetivos de economia
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
              <Plus className="mr-1.5 h-4 w-4" />
              Nova meta
            </Button>
          </DialogTrigger>
          <NewGoalDialog onSubmit={addGoal} loading={createMutation.isPending} />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Target className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Nenhuma meta ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((g) => {
            const pct = Math.min(100, (g.current / g.target) * 100);
            const remaining = g.target - g.current;
            const months = Math.max(
              1,
              Math.ceil(
                (new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
              )
            );
            const perMonth = remaining / months;
            return (
              <div
                key={g.id}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-elegant"
              >
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/60 text-2xl">
                      {g.emoji || "🎯"}
                    </div>
                    <div>
                      <p className="text-base font-semibold">{g.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Prazo: {formatDateBR(g.deadline)}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-end justify-between text-sm">
                    <span className="text-2xl font-semibold tracking-tight">
                      {formatBRL(g.current)}
                    </span>
                    <span className="text-muted-foreground">de {formatBRL(g.target)}</span>
                  </div>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Target className="h-3 w-3" />
                      Faltam
                    </p>
                    <p className="mt-1 text-sm font-semibold">{formatBRL(remaining)}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      Por mes
                    </p>
                    <p className="mt-1 text-sm font-semibold">{formatBRL(perMonth)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-full"
                    onClick={() => addProgress(g.id, g.current)}
                    disabled={updateMutation.isPending}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Aportar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function NewGoalDialog({
  onSubmit,
  loading,
}: {
  onSubmit: (data: {
    name: string;
    target: number;
    current: number;
    deadline: string;
    emoji: string;
  }) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [emoji, setEmoji] = useState("🎯");

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Nova meta</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-3">
          <div>
            <Label className="text-xs">Icone</Label>
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="text-center text-lg"
              maxLength={2}
            />
          </div>
          <div className="col-span-4">
            <Label className="text-xs">Nome da meta</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Viagem, Reserva..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Valor alvo (R$)</Label>
            <Input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div>
            <Label className="text-xs">Valor atual (R$)</Label>
            <Input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Data limite</Label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button
          className="w-full bg-gradient-primary text-primary-foreground"
          disabled={loading}
          onClick={() => {
            const t = parseFloat(target);
            const c = parseFloat(current) || 0;
            if (!name || !t || !deadline) {
              return toast.error("Preencha todos os campos");
            }
            onSubmit({
              name,
              target: t,
              current: c,
              deadline,
              emoji: emoji || "🎯",
            });
          }}
        >
          {loading ? "Salvando..." : "Criar meta"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
