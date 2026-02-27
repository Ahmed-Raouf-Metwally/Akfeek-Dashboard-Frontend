/**
 * Shared constants and helpers for workshop form (Admin + Vendor).
 * Used by WorkshopsPage and VendorWorkshopEditPage to avoid duplication.
 */

export const WORKING_DAYS = [
  { key: 'sunday', labelEn: 'Sunday', labelAr: 'الأحد' },
  { key: 'monday', labelEn: 'Monday', labelAr: 'الإثنين' },
  { key: 'tuesday', labelEn: 'Tuesday', labelAr: 'الثلاثاء' },
  { key: 'wednesday', labelEn: 'Wednesday', labelAr: 'الأربعاء' },
  { key: 'thursday', labelEn: 'Thursday', labelAr: 'الخميس' },
  { key: 'friday', labelEn: 'Friday', labelAr: 'الجمعة' },
  { key: 'saturday', labelEn: 'Saturday', labelAr: 'السبت' },
];

export function defaultWorkingHoursByDay() {
  const entries = WORKING_DAYS.map(({ key }) => {
    const isWeekend = key === 'friday' || key === 'saturday';
    return [key, { closed: isWeekend, open: isWeekend ? '' : '09:00', close: isWeekend ? '' : '18:00' }];
  });
  return Object.fromEntries(entries);
}

/**
 * @param {{ [day: string]: { closed?: boolean, open?: string, close?: string } }} byDay
 * @returns {object|undefined} Payload for API workingHours
 */
export function buildWorkingHoursPayload(byDay) {
  const out = {};
  WORKING_DAYS.forEach(({ key }) => {
    const d = byDay[key];
    if (d?.closed) {
      out[key] = { closed: true };
    } else if (d?.open && d?.close) {
      out[key] = { open: d.open, close: d.close };
    }
  });
  return Object.keys(out).length ? out : undefined;
}
