import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const TELEGRAM_API_URL = "https://api.telegram.org/bot";

function getSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function tg(method: string, body: unknown) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  
  const res = await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

/**
 * Cron endpoint: send today's pending reminders to each user's Telegram.
 * Schedule via pg_cron to call this daily.
 */
export const Route = createFileRoute("/api/public/hooks/send-reminders")({
  server: {
    handlers: {
      POST: async () => {
        const supabase = getSupabaseAdmin();
        const today = new Date().toISOString().slice(0, 10);

        const { data: pending } = await supabase
          .from("reminders")
          .select("id,user_id,title,date")
          .eq("enabled", true)
          .eq("sent", false)
          .lte("date", today);

        if (!pending?.length) return Response.json({ ok: true, sent: 0 });

        let sent = 0;
        for (const r of pending) {
          const { data: conn } = await supabase
            .from("telegram_connections")
            .select("chat_id, notify_vencimentos")
            .eq("user_id", r.user_id)
            .maybeSingle();
          if (!conn?.chat_id || !conn.notify_vencimentos) continue;
          const text = `🔔 <b>LearWallet — Lembrete</b>\n\n${r.title}\n📅 ${r.date}`;
          const res = await tg("sendMessage", { chat_id: conn.chat_id, text, parse_mode: "HTML" });
          if (res?.ok) {
            await supabase.from("reminders").update({ sent: true }).eq("id", r.id);
            await supabase.from("notifications").insert({
              user_id: r.user_id, title: "Lembrete enviado", body: r.title, channel: "telegram", status: "sent",
            });
            sent++;
          }
        }
        return Response.json({ ok: true, sent });
      },
    },
  },
});
