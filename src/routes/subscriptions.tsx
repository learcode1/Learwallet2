import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useSubscriptions, useCreateSubscription, useUpdateSubscription } from "@/hooks/use-subscriptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CalendarClock, Plus, Repeat } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const DEFAULT_COLORS = [
  "oklch(0.7 0.2 15)",
  "oklch(0.78 0.17 155)",
  "oklch(0.82 0.16 75)",
  "oklch(0.72 0.16 280)",
  "oklch(0.72 0.16 240)",
  "oklch(0.85 0.02 250)",
];

export const Route = createFileRoute("/subscriptions")({
  head: () => ({ meta: [{ title: "Assinaturas — LearWallet" }] }),
  component: SubsPage,
});

function SubsPage() {
  const { data: items, isLoading } = useSubscriptions();
  const updateMutation = useUpdateSubscription();
  const createMutation = useCreateSubscription();
  const [open, setOpen] = useState(false);

  const subscriptions = items || [];
  const total = subscriptions
    .filter((i) => i.status === "ativa")
    .reduce((a, b) => a + b.amount, 0);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        status: currentStatus === "ativa" ? "pausada" : "ativa",
      });
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    }
  };

  const addSubscription = async (data: {
    name: string;
    amount: number;
    due_day: number;
    category: string;
    recurrence: string;
  }) => {
    try {
      const color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
      await createMutation.mutateAsync({
        ...data,
        color,
        status: "ativa",
      });
      toast.success("Assinatura adicionada");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar");
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Assinaturas
          </h1>
          <p className="text-sm text-muted-foreground">
            {subscriptions.filter((i) => i.status === "ativa").length} ativas · Total
            mensal {formatBRL(total)}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
              <Plus className="mr-1.5 h-4 w-4" />
              Nova assinatura
            </Button>
          </DialogTrigger>
          <NewSubscriptionDialog onSubmit={addSubscription} loading={createMutation.isPending} />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Repeat className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Nenhuma assinatura ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((s) => (
            <div
              key={s.id}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-elegant transition hover:-translate-y-0.5 hover:border-primary/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl text-base font-bold text-primary-foreground shadow-glow"
                    style={{ background: s.color || "var(--primary)" }}
                  >
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {s.category}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={s.status === "ativa"}
                  onCheckedChange={() => toggleStatus(s.id, s.status)}
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    {formatBRL(s.amount)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                    <Repeat className="h-3 w-3" />
                    {s.recurrence}
                  </p>
                </div>
                <Badge variant="outline" className="border-border/60 text-xs">
                  <CalendarClock className="mr-1 h-3 w-3" />
                  Dia {s.due_day}
                </Badge>
              </div>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-primary"
                  style={{ width: `${Math.min(100, (s.due_day / 31) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function NewSubscriptionDialog({
  onSubmit,
  loading,
}: {
  onSubmit: (data: {
    name: string;
    amount: number;
    due_day: number;
    category: string;
    recurrence: string;
  }) => void;
  loading?: boolean;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [category, setCategory] = useState("outros");
  const [recurrence, setRecurrence] = useState("mensal");

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Nova assinatura</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Nome</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Netflix, Spotify..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Valor (R$)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div>
            <Label className="text-xs">Dia do vencimento</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              placeholder="1-31"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lazer">Lazer</SelectItem>
                <SelectItem value="trabalho">Trabalho</SelectItem>
                <SelectItem value="saude">Saude</SelectItem>
                <SelectItem value="educacao">Educacao</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Recorrencia</Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          className="w-full bg-gradient-primary text-primary-foreground"
          disabled={loading}
          onClick={() => {
            const n = parseFloat(amount);
            const day = parseInt(dueDay);
            if (!name || !n || !day || day < 1 || day > 31) {
              return toast.error("Preencha todos os campos corretamente");
            }
            onSubmit({
              name,
              amount: n,
              due_day: day,
              category,
              recurrence,
            });
          }}
        >
          {loading ? "Salvando..." : "Salvar assinatura"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
