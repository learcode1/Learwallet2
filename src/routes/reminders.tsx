import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Bell, Mail, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useReminders, useCreateReminder, useUpdateReminder, useDeleteReminder } from "@/hooks/use-reminders";
import { formatDateBR } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/reminders")({
  head: () => ({ meta: [{ title: "Lembretes — LearWallet" }] }),
  component: RemindersPage,
});

function RemindersPage() {
  const { data: list, isLoading } = useReminders();
  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder();
  const deleteMutation = useDeleteReminder();
  
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const reminders = list || [];

  const add = async () => {
    if (!title || !date) return toast.error("Preencha titulo e data");
    try {
      await createMutation.mutateAsync({
        title,
        date,
        channel: "telegram",
        enabled: true,
        sent: false,
      });
      setTitle("");
      setDate("");
      toast.success("Lembrete criado — voce sera notificado no Telegram");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar");
    }
  };

  const toggle = async (id: string, currentEnabled: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, enabled: !currentEnabled });
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Removido");
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover");
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Lembretes automaticos
        </h1>
        <p className="text-sm text-muted-foreground">
          Receba alertas de vencimentos e resumos financeiros
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-elegant lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold">Novo lembrete</h3>
          <div className="space-y-3">
            <Input
              placeholder="Titulo do lembrete"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button
              onClick={add}
              disabled={createMutation.isPending}
              className="w-full bg-gradient-primary text-primary-foreground"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {createMutation.isPending ? "Criando..." : "Criar lembrete"}
            </Button>
          </div>
          <div className="mt-6 rounded-xl border border-border/60 bg-background/40 p-4 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">Dica</p>
            Lembretes sao enviados via Telegram no horario programado. Conecte seu bot
            na aba Telegram.
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 shadow-elegant lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <h3 className="text-sm font-semibold">Seus lembretes</h3>
            <span className="text-xs text-muted-foreground">
              {reminders.filter((r) => r.enabled).length} ativos
            </span>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-xl ${r.channel === "telegram" ? "bg-chart-2/15 text-chart-2" : "bg-accent text-muted-foreground"}`}
                  >
                    {r.channel === "telegram" ? (
                      <Send className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateBR(r.date)} · via {r.channel}
                    </p>
                  </div>
                  <Switch
                    checked={r.enabled}
                    onCheckedChange={() => toggle(r.id, r.enabled)}
                    disabled={updateMutation.isPending}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(r.id)}
                    disabled={deleteMutation.isPending}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
              {reminders.length === 0 && (
                <li className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Nenhum lembrete ainda</p>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
