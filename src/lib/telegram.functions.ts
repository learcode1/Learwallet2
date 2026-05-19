import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TELEGRAM_API_URL = "https://api.telegram.org/bot";

async function callTelegram(method: string, body: unknown) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not configured");

  const res = await fetch(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(`Telegram ${method} failed [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

const sendSchema = z.object({
  chatId: z.string().min(1).max(64),
  text: z.string().min(1).max(4000),
});

/** Send a message to the authenticated user's connected chat. */
export const sendTelegramMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => sendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // verify the chatId belongs to the user
    const { data: conn } = await supabase
      .from("telegram_connections")
      .select("chat_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!conn || conn.chat_id !== data.chatId) {
      throw new Error("Chat ID não vinculado a esta conta");
    }
    const r = await callTelegram("sendMessage", {
      chat_id: data.chatId,
      text: data.text,
      parse_mode: "HTML",
    });
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Mensagem enviada",
      body: data.text.slice(0, 200),
      channel: "telegram",
      status: "sent",
    });
    return { ok: true, message_id: r?.result?.message_id ?? null };
  });

/** Send a quick test message — only requires being signed in + having a connection. */
export const sendTelegramTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: conn } = await supabase
      .from("telegram_connections")
      .select("chat_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!conn) throw new Error("Telegram não conectado");
    await callTelegram("sendMessage", {
      chat_id: conn.chat_id,
      text: "✅ <b>LearWallet</b> conectado com sucesso!\n\nVocê receberá aqui seus lembretes, alertas e resumos financeiros.",
      parse_mode: "HTML",
    });
    await supabase.from("notifications").insert({
      user_id: userId, title: "Teste de conexão", body: "Mensagem de teste enviada", channel: "telegram", status: "sent",
    });
    return { ok: true };
  });
