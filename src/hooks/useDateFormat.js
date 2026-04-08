import { useTranslation } from 'react-i18next';
import { useDashboardSettingsStore } from '../store/dashboardSettingsStore';
import { formatDate, formatDateTime } from '../utils/dateFormatter';

/**
 * Returns bound `fmt(date)` and `fmtDT(date)` functions that use
 * the current language and dateFormat setting from the store.
 *
 * Usage:
 *   const { fmt, fmtDT } = useDateFormat();
 *   <td>{fmt(row.createdAt)}</td>
 */
export function useDateFormat() {
  const { i18n } = useTranslation();
  const dateFormat = useDashboardSettingsStore((s) => s.dateFormat);
  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-SA';

  const fmt   = (d) => formatDate(d, locale, dateFormat, false);
  const fmtDT = (d) => formatDateTime(d, locale, dateFormat);

  return { fmt, fmtDT, locale, dateFormat };
}
