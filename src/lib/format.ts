export const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

// SSR-safe date format dd/MM/yyyy using UTC parts to avoid hydration drift
export function formatDateBR(input: string | Date): string {
  const d = typeof input === "string"
    ? (input.length === 10 ? new Date(input + "T00:00:00Z") : new Date(input))
    : input;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
