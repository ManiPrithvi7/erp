import dayjs from 'dayjs';
import currency from 'currency.js';

/**
 * Format date using dayjs
 */
export function formatDate(date: string | Date | undefined, format: string = 'YYYY-MM-DD'): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number | undefined,
  currencyCode: string = 'USD',
  options?: { locale?: string }
): string {
  if (amount === undefined || amount === null) return '0.00';
  
  return currency(amount, {
    symbol: '',
    decimal: '.',
    separator: ',',
    precision: 2,
    ...options,
  }).format();
}

/**
 * Format currency with symbol
 */
export function formatCurrencyWithSymbol(
  amount: number | undefined,
  currencyCode: string = 'USD'
): string {
  if (amount === undefined || amount === null) return '$0.00';
  
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${formatCurrency(amount, currencyCode)}`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    CNY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    SEK: 'kr',
    NZD: 'NZ$',
  };
  
  return symbols[currencyCode] || currencyCode;
}

/**
 * Format phone number
 */
export function formatPhone(phone: string | undefined): string {
  if (!phone) return '';
  // Basic phone formatting - can be enhanced
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

