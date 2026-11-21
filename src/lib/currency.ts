export const CURRENCY =
  (import.meta.env.VITE_CURRENCY as string | undefined) || "PHP";

export const CURRENCY_LOCALE = "en-PH";

interface CurrencyOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatCurrency(value: number, options: CurrencyOptions = {}) {
  const currency = options.currency || CURRENCY;
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(Number.isFinite(value) ? value : 0);
}
