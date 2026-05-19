import { formatDateBR } from "@/lib/format";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useTransactions, useCreateTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownRight, ArrowUpRight, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  "alimentacao",
  "delivery",
  "transporte",
  "mercado",
  "lazer",
  "saude",
  "educacao",
  "assinatura",
  "trabalho",
  "outros",
] as const;

type Category = (typeof categories)[number];

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transacoes — LearWallet" }] }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { data: list, isLoading } = useTransactions();
  const createMutation = useCreateTransaction();
  const deleteMutation = useDeleteTransaction();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      (list || []).filter((t) => {
        const matchQ = t.description.toLowerCase().includes(q.toLowerCase());
        const matchC = cat === "todas" || t.category === cat;
        return matchQ && matchC;
      }),
    [list, q, cat]
  );

  const remove = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Transacao removida");
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover");
    }
  };

  const add = async (data: {
    description: string;
    amount: number;
    category: string;
    date: string;
    status: string;
  }) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Transacao adicionada");
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
            Transacoes
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} movimentacoes encontradas
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
              <Plus className="mr-1.5 h-4 w-4" />
              Nova transacao
            </Button>
          </DialogTrigger>
          <NewTransactionDialog onSubmit={add} loading={createMutation.isPending} />
        </Dialog>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por descricao..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-card/60 pl-9"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full bg-card/60 sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-elegant">
        <div className="hidden grid-cols-12 gap-3 border-b border-border/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <div className="col-span-5">Descricao</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-2">Data</div>
          <div className="col-span-2 text-right">Valor</div>
          <div className="col-span-1 text-right">Acao</div>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((t) => {
              const positive = t.amount > 0;
              return (
                <li
                  key={t.id}
                  className="grid grid-cols-12 items-center gap-3 px-5 py-3.5 transition hover:bg-accent/30"
                >
                  <div className="col-span-12 flex items-center gap-3 md:col-span-5">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-xl ${positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                    >
                      {positive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {formatDateBR(t.date)} ·{" "}
                        <span className="capitalize">{t.category}</span>
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:col-span-2 md:block">
                    <Badge variant="outline" className="border-border/60 capitalize">
                      {t.category}
                    </Badge>
                  </div>
                  <div className="hidden text-sm text-muted-foreground md:col-span-2 md:block">
                    {formatDateBR(t.date)}
                  </div>
                  <div className="col-span-9 text-right md:col-span-2">
                    <span
                      className={`text-sm font-semibold ${positive ? "text-success" : "text-foreground"}`}
                    >
                      {positive ? "+" : ""}
                      {formatBRL(t.amount)}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 border-border/60 text-[10px] capitalize md:hidden"
                    >
                      {t.status}
                    </Badge>
                  </div>
                  <div className="col-span-3 flex justify-end md:col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(t.id)}
                      disabled={deleteMutation.isPending}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-5 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma transacao encontrada
                </p>
              </li>
            )}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function NewTransactionDialog({
  onSubmit,
  loading,
}: {
  onSubmit: (t: {
    description: string;
    amount: number;
    category: string;
    date: string;
    status: string;
  }) => void;
  loading?: boolean;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("outros");
  const [type, setType] = useState<"receita" | "despesa">("despesa");

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Nova transacao</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Descricao</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Mercado, salario..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Valor (R$)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Categoria</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger className="capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          className="w-full bg-gradient-primary text-primary-foreground"
          disabled={loading}
          onClick={() => {
            const n = parseFloat(amount);
            if (!description || !n) return toast.error("Preencha os campos");
            onSubmit({
              description,
              amount: type === "despesa" ? -Math.abs(n) : Math.abs(n),
              category,
              date: new Date().toISOString().slice(0, 10),
              status: "pago",
            });
          }}
        >
          {loading ? "Salvando..." : "Salvar transacao"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
