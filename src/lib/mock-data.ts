export type Category =
  | "alimentação" | "delivery" | "transporte" | "mercado" | "lazer"
  | "saúde" | "educação" | "assinatura" | "trabalho" | "outros";

export type Transaction = {
  id: string;
  description: string;
  amount: number; // negative = expense, positive = income
  category: Category;
  date: string;
  status: "pago" | "pendente" | "agendado";
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  recurrence: "mensal" | "anual" | "semanal";
  category: Category;
  status: "ativa" | "pausada";
  color: string;
  initial: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  emoji: string;
};

export type Reminder = {
  id: string;
  title: string;
  date: string;
  channel: "telegram" | "email";
  enabled: boolean;
};

export const transactions: Transaction[] = [
  { id: "1", description: "Salário Empresa", amount: 8500, category: "trabalho", date: "2026-05-05", status: "pago" },
  { id: "2", description: "Mercado Pão de Açúcar", amount: -432.5, category: "mercado", date: "2026-05-14", status: "pago" },
  { id: "3", description: "iFood — Almoço", amount: -45.9, category: "delivery", date: "2026-05-17", status: "pago" },
  { id: "4", description: "Uber para reunião", amount: -28.3, category: "transporte", date: "2026-05-16", status: "pago" },
  { id: "5", description: "Netflix", amount: -55.9, category: "assinatura", date: "2026-05-12", status: "pago" },
  { id: "6", description: "Spotify Family", amount: -34.9, category: "assinatura", date: "2026-05-10", status: "pago" },
  { id: "7", description: "Farmácia", amount: -89.4, category: "saúde", date: "2026-05-09", status: "pago" },
  { id: "8", description: "Cinema com amigos", amount: -78, category: "lazer", date: "2026-05-11", status: "pago" },
  { id: "9", description: "Curso de inglês", amount: -240, category: "educação", date: "2026-05-08", status: "pago" },
  { id: "10", description: "Freelance Design", amount: 1800, category: "trabalho", date: "2026-05-15", status: "pago" },
  { id: "11", description: "Aluguel", amount: -2200, category: "outros", date: "2026-05-20", status: "pendente" },
  { id: "12", description: "Internet Vivo", amount: -129.9, category: "assinatura", date: "2026-05-22", status: "agendado" },
];

export const subscriptions: Subscription[] = [
  { id: "1", name: "Netflix", amount: 55.9, dueDay: 12, recurrence: "mensal", category: "lazer", status: "ativa", color: "oklch(0.7 0.2 15)", initial: "N" },
  { id: "2", name: "Spotify Family", amount: 34.9, dueDay: 10, recurrence: "mensal", category: "lazer", status: "ativa", color: "oklch(0.78 0.17 155)", initial: "S" },
  { id: "3", name: "Smart Fit", amount: 99.9, dueDay: 5, recurrence: "mensal", category: "saúde", status: "ativa", color: "oklch(0.82 0.16 75)", initial: "G" },
  { id: "4", name: "Internet Vivo Fibra", amount: 129.9, dueDay: 22, recurrence: "mensal", category: "outros", status: "ativa", color: "oklch(0.72 0.16 280)", initial: "V" },
  { id: "5", name: "Celular Claro", amount: 79.9, dueDay: 18, recurrence: "mensal", category: "outros", status: "ativa", color: "oklch(0.7 0.2 25)", initial: "C" },
  { id: "6", name: "Aluguel", amount: 2200, dueDay: 20, recurrence: "mensal", category: "outros", status: "ativa", color: "oklch(0.72 0.16 240)", initial: "A" },
  { id: "7", name: "Notion Plus", amount: 49, dueDay: 3, recurrence: "mensal", category: "trabalho", status: "pausada", color: "oklch(0.85 0.02 250)", initial: "N" },
];

export const goals: Goal[] = [
  { id: "1", name: "Reserva de emergência", target: 30000, current: 18450, deadline: "2026-12-31", emoji: "🛡️" },
  { id: "2", name: "Viagem para Japão", target: 25000, current: 8200, deadline: "2027-03-15", emoji: "🗾" },
  { id: "3", name: "MacBook Pro M5", target: 18000, current: 12300, deadline: "2026-09-01", emoji: "💻" },
  { id: "4", name: "Curso de pós", target: 12000, current: 9800, deadline: "2026-08-01", emoji: "🎓" },
];

export const reminders: Reminder[] = [
  { id: "1", title: "Vencimento do aluguel", date: "2026-05-20", channel: "telegram", enabled: true },
  { id: "2", title: "Pagar fatura do cartão", date: "2026-05-18", channel: "telegram", enabled: true },
  { id: "3", title: "Resumo semanal", date: "2026-05-19", channel: "telegram", enabled: true },
  { id: "4", title: "Revisar metas mensais", date: "2026-05-31", channel: "email", enabled: false },
];

// Charts data
export const monthlySpending = [
  { month: "Dez", gastos: 4200, receitas: 9200 },
  { month: "Jan", gastos: 4800, receitas: 9500 },
  { month: "Fev", gastos: 5100, receitas: 10200 },
  { month: "Mar", gastos: 4600, receitas: 10300 },
  { month: "Abr", gastos: 5300, receitas: 10800 },
  { month: "Mai", gastos: 4350, receitas: 10300 },
];

export const weeklySpending = [
  { day: "Seg", value: 145 },
  { day: "Ter", value: 89 },
  { day: "Qua", value: 232 },
  { day: "Qui", value: 178 },
  { day: "Sex", value: 320 },
  { day: "Sáb", value: 410 },
  { day: "Dom", value: 195 },
];

export const categoryBreakdown = [
  { name: "Mercado", value: 1240, color: "var(--chart-1)" },
  { name: "Delivery", value: 580, color: "var(--chart-2)" },
  { name: "Assinaturas", value: 425, color: "var(--chart-3)" },
  { name: "Transporte", value: 320, color: "var(--chart-4)" },
  { name: "Lazer", value: 480, color: "var(--chart-5)" },
];

export const balanceEvolution = [
  { month: "Dez", saldo: 12400 },
  { month: "Jan", saldo: 13100 },
  { month: "Fev", saldo: 14800 },
  { month: "Mar", saldo: 16200 },
  { month: "Abr", saldo: 17900 },
  { month: "Mai", saldo: 19850 },
];

export const subscriptionsTrend = [
  { month: "Jan", value: 280 },
  { month: "Fev", value: 320 },
  { month: "Mar", value: 355 },
  { month: "Abr", value: 380 },
  { month: "Mai", value: 425 },
];

export const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
