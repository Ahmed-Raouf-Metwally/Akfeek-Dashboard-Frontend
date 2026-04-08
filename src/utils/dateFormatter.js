/**
 * Central date formatting utility.
 * All pages should use `useDateFormat()` hook or `formatDate()` directly.
 */

/** Map settings store values to Intl dateStyle */
const DATE_STYLE_MAP = {
  short:  'short',   // 1/27/25
  medium: 'medium',  // Jan 27, 2025
  long:   'long',    // January 27, 2025
};

/**
 * Format a date value to a localised string.
 * @param {Date|string|number} d - Date to format
 * @param {string} [locale='en'] - BCP-47 locale tag (e.g. 'ar', 'en')
 * @param {'short'|'medium'|'long'} [dateFormat='medium'] - Format from settings store
 * @param {boolean} [includeTime=false] - Also show time
 * @returns {string}
 */
export function formatDate(d, locale = 'en', dateFormat = 'medium', includeTime = false) {
  if (!d) return '—';
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) return '—';

  const dateStyle = DATE_STYLE_MAP[dateFormat] ?? 'medium';

  if (includeTime) {
    return x.toLocaleString(locale, { dateStyle, timeStyle: 'short' });
  }
  return x.toLocaleDateString(locale, { dateStyle });
}

/**
 * Format a datetime (date + time) value.
 */
export function formatDateTime(d, locale = 'en', dateFormat = 'medium') {
  return formatDate(d, locale, dateFormat, true);
}
