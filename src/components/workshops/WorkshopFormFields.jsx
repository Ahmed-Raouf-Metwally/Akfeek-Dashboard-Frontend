import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Input';
import { WORKING_DAYS, defaultWorkingHoursByDay } from '../../utils/workshopFormShared';

/**
 * Shared workshop form fields (Admin + Vendor).
 * Includes: name, nameAr, city, cityAr, address, addressAr, phone, email, locationUrl,
 * services, description, descriptionAr, working hours.
 * Optional: isActive, isVerified (admin only when showAdminFields=true).
 */
export default function WorkshopFormFields({
  form,
  setForm,
  requireLocationUrl = false,
  showAdminFields = false,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <>
      <Input
        label={t('workshops.name')}
        name="name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        placeholder="e.g. Al-Salam Auto Center"
        required
      />
      <Input
        label={t('common.nameAr')}
        name="nameAr"
        value={form.nameAr}
        onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
        placeholder="مركز السلام للسيارات"
      />
      <Input
        label={t('workshops.city')}
        name="city"
        value={form.city}
        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
        placeholder="Riyadh"
        required
      />
      <Input
        label={t('workshops.cityAr', 'City (Arabic)')}
        name="cityAr"
        value={form.cityAr}
        onChange={(e) => setForm((f) => ({ ...f, cityAr: e.target.value }))}
        placeholder="الرياض"
      />
      <Input
        label={t('workshops.address')}
        name="address"
        value={form.address}
        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        placeholder="King Fahd Road"
        required
      />
      <Input
        label={t('workshops.addressAr', 'Address (Arabic)')}
        name="addressAr"
        value={form.addressAr}
        onChange={(e) => setForm((f) => ({ ...f, addressAr: e.target.value }))}
        placeholder="طريق الملك فهد"
      />
      <Input
        label={t('workshops.phone')}
        name="phone"
        type="tel"
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        placeholder="+966112345000"
        required
      />
      <Input
        label={t('workshops.email')}
        name="email"
        type="email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        placeholder="info@workshop.sa"
      />
      <Input
        label={t('workshops.locationUrl')}
        name="locationUrl"
        value={form.locationUrl}
        onChange={(e) => setForm((f) => ({ ...f, locationUrl: e.target.value }))}
        placeholder={t('workshops.locationUrlPlaceholder', 'Paste Google Maps share link (required for new workshop)')}
        required={requireLocationUrl}
      />
      <Input
        label={t('workshops.services')}
        name="services"
        value={form.services}
        onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))}
        placeholder='["Engine Repair", "Oil Change"]'
        required
        className="sm:col-span-2"
      />
      <Input
        label={t('common.description')}
        name="description"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Brief description"
        className="sm:col-span-2"
      />
      <Input
        label={t('common.descriptionAr', 'Description (Arabic)')}
        name="descriptionAr"
        value={form.descriptionAr}
        onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))}
        placeholder="وصف مختصر"
        className="sm:col-span-2"
      />

      {/* Working Hours */}
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {t('workshops.workingHours', 'ساعات العمل')}
        </label>
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
          {WORKING_DAYS.map(({ key, labelEn, labelAr }) => {
            const label = isRTL ? labelAr : labelEn;
            const day = (form.workingHoursByDay || defaultWorkingHoursByDay())[key] || { closed: false, open: '09:00', close: '18:00' };
            return (
              <div key={key} className="flex flex-wrap items-center gap-3 rounded-md bg-white px-3 py-2 shadow-sm">
                <span className="w-24 text-sm font-medium text-slate-700">{label}</span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!day.closed}
                    onChange={() => {
                      setForm((f) => {
                        const byDay = { ...(f.workingHoursByDay || defaultWorkingHoursByDay()) };
                        byDay[key] = { closed: !day.closed, open: day.open || '09:00', close: day.close || '18:00' };
                        return { ...f, workingHoursByDay: byDay };
                      });
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-600">{t('workshops.closed', 'مغلق')}</span>
                </label>
                {!day.closed && (
                  <>
                    <input
                      type="time"
                      value={day.open || ''}
                      onChange={(e) => {
                        setForm((f) => {
                          const byDay = { ...(f.workingHoursByDay || defaultWorkingHoursByDay()) };
                          byDay[key] = { ...byDay[key], open: e.target.value, close: byDay[key].close || '18:00' };
                          return { ...f, workingHoursByDay: byDay };
                        });
                      }}
                      className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <span className="text-slate-400">–</span>
                    <input
                      type="time"
                      value={day.close || ''}
                      onChange={(e) => {
                        setForm((f) => {
                          const byDay = { ...(f.workingHoursByDay || defaultWorkingHoursByDay()) };
                          byDay[key] = { ...byDay[key], close: e.target.value };
                          return { ...f, workingHoursByDay: byDay };
                        });
                      }}
                      className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showAdminFields && (
        <>
          <label className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">{t('common.active')}</span>
          </label>
          <label className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
            <input
              type="checkbox"
              checked={!!form.isVerified}
              onChange={(e) => setForm((f) => ({ ...f, isVerified: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">{t('workshops.verified')}</span>
          </label>
        </>
      )}
    </>
  );
}
