export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD' },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || '$';
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const curr = CURRENCIES.find(c => c.code === currency);
  if (!curr) return `$${amount.toFixed(2)}`;

  // BDT custom formatting
  if (currency === 'BDT') {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  try {
    return new Intl.NumberFormat(curr.locale, {
      style: 'currency',
      currency: curr.code,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${curr.symbol}${amount.toFixed(2)}`;
  }
}

export function formatCompact(amount: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount, currency);
}
