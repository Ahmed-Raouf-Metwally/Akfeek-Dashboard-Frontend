/**
 * العملة المعتمدة في التطبيق: الريال السعودي
 * Currency used across the dashboard: Saudi Riyal
 */
export const CURRENCY_SYMBOL = 'ر.س';
export const CURRENCY_NAME = 'الريال السعودي';
export const CURRENCY_CODE = 'SAR';

/** تنسيق مبلغ مع رمز العملة */
export function formatAmount(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${CURRENCY_SYMBOL}`;
}

/** مبلغ مع رمز العملة للنص القصير (مثلاً في الجداول) */
export function formatAmountShort(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(2)} ${CURRENCY_SYMBOL}`;
}
