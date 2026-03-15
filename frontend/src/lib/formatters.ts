export function formatCurrency(value: string | number, currency = 'COP', locale = 'es-CO') {
  const amount = typeof value === 'number' ? value : Number(value);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number.isNaN(amount) ? 0 : amount);
}

export function formatPercent(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatShortDate(dateValue: string, locale = 'es-CO') {
  const date = new Date(dateValue);

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function normalizeNumber(value: string | number) {
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
}
