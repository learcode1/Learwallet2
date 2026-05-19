import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send, CheckCircle2, Bell, AlertCircle, FileBarChart, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { sendTelegramTest } from "@/lib/telegram.functions";

export const Route = createFileRoute("/telegram")({
  head: () => ({ meta: [{ title: "Telegram — LearWallet" }] }),
  component: TelegramPage,
});

type Conn = {
  chat_id: string;
  notify_vencimentos: boolean;
  notify_alertas: boolean;
  notify_mensalidades: boolean;
  notify_resumo: boolean;
};

function TelegramPage() {
  const { user } = useAuth();
  const [chatId, setChatId] = useState("");
  const [conn, setConn] = useState<Conn | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastNotif, setLastNotif] = useState<{ title: string; body: string | null; created_at: string } | null>(null);
  const testFn = useServerFn(sendTelegramTest);

  useEffect(() => {
    if (!user) return;
    supabase.from("telegram_connections").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setConn(data as Conn); setChatId(data.chat_id); }
    });
    supabase.from("notifications").select("title,body,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (data) setLastNotif(data as any);
    });
  }, [user]);

  const connect = async () => {
    if (!user) return;
    if (!chatId || !/^-?\d{4,}$/.test(chatId)) return toast.error("Chat ID inválido");
    setSaving(true);
    const payload = {
      user_id: user.id,
      chat_id: chatId,
      notify_vencimentos: conn?.notify_vencimentos ?? true,
      notify_alertas: conn?.notify_alertas ?? true,
      notify_mensalidades: conn?.notify_mensalidades ?? true,
      notify_resumo: conn?.notify_resumo ?? true,
    };
    const { data, error } = await supabase.from("telegram_connections").upsert(payload, { onConflict: "user_id" }).select().single();
    setSaving(false);
    if (error) return toast.error(error.message);
    setConn(data as Conn);
    toast.success("Telegram conectado!");
  };

  const updateNotif = async (key: keyof Conn, value: boolean) => {
    if (!user || !conn) return;
    const next = { ...conn, [key]: value };
    setConn(next);
    await supabase.from("telegram_connections").update({ [key]: value } as never).eq("user_id", user.id);
  };

  const sendTest = async () => {
    try {
      await testFn();
      toast.success("Mensagem de teste enviada");
    } catch (e: any) {
      toast.error(e.message || "Falha ao enviar");
    }
  };

  const connected = !!conn;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Integração Telegram</h1>
        <p className="text-sm text-muted-foreground">Receba alertas financeiros direto no seu Telegram</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-elegant lg:col-span-3">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-chart-2/15 text-chart-2 shadow-glow">
              <Send className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">LearWallet Bot</h2>
                {connected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    <CheckCircle2 className="h-3 w-3" />Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                    <AlertCircle className="h-3 w-3" />Desconectado
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">@learwallet_bot</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
            <p className="font-semibold">Como conectar</p>
            <ol className="ml-4 list-decimal space-y-1.5 text-muted-foreground">
              <li>Abra o Telegram e procure por <span className="font-mono text-foreground">@learwallet_bot</span></li>
              <li>Envie <span className="font-mono text-foreground">/start</span> para obter seu Chat ID</li>
              <li>Cole o ID abaixo e clique em conectar</li>
            </ol>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <Label className="text-xs">Seu Chat ID</Label>
              <Input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="Ex: 7632885070" inputMode="numeric" />
            </div>
            <div className="flex gap-2">
              <Button onClick={connect} disabled={saving} className="flex-1 bg-gradient-primary text-primary-foreground">
                {saving ? "Salvando…" : connected ? "Atualizar conexão" : "Conectar Telegram"}
              </Button>
              {connected && (
                <Button variant="outline" onClick={sendTest}>Enviar teste</Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-elegant">
            <h3 className="mb-3 text-sm font-semibold">Notificações</h3>
            <div className="space-y-3">
              <NotifRow icon={Bell} label="Lembretes de vencimento" value={!!conn?.notify_vencimentos} onChange={(v) => updateNotif("notify_vencimentos", v)} disabled={!connected} />
              <NotifRow icon={AlertCircle} label="Alertas financeiros" value={!!conn?.notify_alertas} onChange={(v) => updateNotif("notify_alertas", v)} disabled={!connected} />
              <NotifRow icon={CreditCard} label="Aviso de mensalidades" value={!!conn?.notify_mensalidades} onChange={(v) => updateNotif("notify_mensalidades", v)} disabled={!connected} />
              <NotifRow icon={FileBarChart} label="Resumo financeiro semanal" value={!!conn?.notify_resumo} onChange={(v) => updateNotif("notify_resumo", v)} disabled={!connected} />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-surface p-5 shadow-elegant">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Última notificação</p>
            {lastNotif ? (
              <>
                <p className="mt-2 text-sm font-medium">{lastNotif.title}</p>
                {lastNotif.body && <p className="mt-0.5 text-xs text-muted-foreground">{lastNotif.body}</p>}
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma notificação enviada ainda.</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function NotifRow({ icon: Icon, label, value, onChange, disabled }: {
  icon: typeof Bell; label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/60 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
