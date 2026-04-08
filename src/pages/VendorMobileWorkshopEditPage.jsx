import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Save, Truck, Upload, ImagePlus, MapPin, Banknote,
  Settings2, PlusCircle, Wrench, X, Check, Pencil, Trash2, Car
} from 'lucide-react';
import mobileWorkshopService from '../services/mobileWorkshopService';
import mobileWorkshopTypeService from '../services/mobileWorkshopTypeService';
import { Card } from '../components/ui/Card';
import { UPLOADS_BASE_URL } from '../config/env';

const EMPTY = {
  name: '', nameAr: '', plateNumber: '', vehicleModel: '', year: '',
  description: '', city: '', latitude: '', longitude: '', serviceRadius: '',
  basePrice: '', pricePerKm: '', hourlyRate: '', minPrice: '', currency: 'SAR',
  isAvailable: true, workshopTypeId: '',
};

function mwImageSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (UPLOADS_BASE_URL || '').toString().replace(/\/$/, '');
  return base ? `${base}${url}` : url;
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  'block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm ' +
  'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white';

// --- Inline Service Item Component ---
function ServiceItem({ svc, workshopId, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(!svc.id);
  const [form, setForm] = useState({
    name: svc.name || '',
    nameAr: svc.nameAr || '',
    price: svc.price ?? '',
    isActive: svc.isActive ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, price: parseFloat(form.price) };
      return svc.id
        ? mobileWorkshopService.updateService(workshopId, svc.id, payload)
        : mobileWorkshopService.addService(workshopId, payload);
    },
    onSuccess: (saved) => {
      setEditing(false);
      onSaved(saved);
    },
    onError: (err) => toast.error(err?.message || 'خطأ في الحفظ'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => mobileWorkshopService.deleteService(workshopId, svc.id),
    onSuccess: () => onDeleted(svc.id),
    onError: (err) => toast.error(err?.message || 'فشل الحذف'),
  });

  if (!editing) return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
      <div>
        <div className="flex items-center gap-2">
           <span className="font-semibold text-slate-800">{form.nameAr || form.name}</span>
           {!form.isActive && <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">موقوفة</span>}
        </div>
        <p className="text-sm font-bold text-indigo-600">{form.price} SAR</p>
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={() => setEditing(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil className="size-4" /></button>
        <button type="button" onClick={() => window.confirm('حذف الخدمة؟') && deleteMutation.mutate()} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/20 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="اسم الخدمة (عربي)" className={inputCls} />
        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Service Name (EN)" className={inputCls} />
        <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="السعر" className={inputCls} />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="size-4 rounded border-slate-300 text-indigo-600" />
          <span className="text-sm text-slate-600">نشطة</span>
        </label>
      </div>
      <div className="flex justify-end gap-2 text-xs">
        {svc.id && <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg">إلغاء</button>}
        <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50">حفظ المنتج</button>
      </div>
    </div>
  );
}

export default function VendorMobileWorkshopEditPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const fileRef  = useRef(null);
  const [form, setForm] = useState(EMPTY);

  const { data: workshop, isLoading } = useQuery({
    queryKey: ['mobile-workshop', 'me'],
    queryFn:  () => mobileWorkshopService.getMyWorkshop(),
    retry:    (_, err) => err?.response?.status !== 404 && err?.response?.status !== 403,
  });

  const { data: workshopTypes = [] } = useQuery({
    queryKey: ['mobile-workshop-types'],
    queryFn:  () => mobileWorkshopTypeService.getAll(),
  });

  const isEdit = Boolean(workshop);

  useEffect(() => {
    if (workshop) {
      setForm({
        name:            workshop.name            || '',
        nameAr:          workshop.nameAr          || '',
        plateNumber:     workshop.plateNumber     || '',
        vehicleModel:    workshop.vehicleModel    || '',
        year:            workshop.year            ?? '',
        description:     workshop.description     || '',
        city:            workshop.city            || '',
        latitude:        workshop.latitude        ?? '',
        longitude:       workshop.longitude       ?? '',
        serviceRadius:   workshop.serviceRadius   ?? '',
        basePrice:       workshop.basePrice       ?? '',
        pricePerKm:      workshop.pricePerKm      ?? '',
        hourlyRate:      workshop.hourlyRate      ?? '',
        minPrice:        workshop.minPrice        ?? '',
        currency:        workshop.currency        || 'SAR',
        isAvailable:     workshop.isAvailable     ?? true,
        workshopTypeId:  workshop.workshopTypeId  || '',
      });
    }
  }, [workshop]);

  const imgMutation = useMutation({
    mutationFn: (file) => mobileWorkshopService.uploadMyWorkshopImage(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop', 'me'] });
      toast.success('تم رفع الصورة');
    },
    onError: (err) => toast.error(err?.message || 'فشل رفع الصورة'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? mobileWorkshopService.updateMyWorkshop(data) : mobileWorkshopService.createMyWorkshop(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-workshop', 'me'] });
      toast.success(isEdit ? 'تم التحديث' : 'تم الإضافة بنجاح');
      navigate('/vendor/mobile-workshop');
    },
    onError: (err) => toast.error(err?.response?.data?.error || err?.message || 'خطأ'),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...form,
      year:          form.year          ? parseInt(form.year)          : null,
      latitude:      form.latitude      ? parseFloat(form.latitude)    : null,
      longitude:     form.longitude     ? parseFloat(form.longitude)   : null,
      serviceRadius: form.serviceRadius ? parseFloat(form.serviceRadius) : null,
      basePrice:     form.basePrice     ? parseFloat(form.basePrice)   : null,
      pricePerKm:    form.pricePerKm    ? parseFloat(form.pricePerKm)  : null,
      hourlyRate:    form.hourlyRate    ? parseFloat(form.hourlyRate)  : null,
      minPrice:      form.minPrice      ? parseFloat(form.minPrice)    : null,
    });
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-slate-400">جاري التحميل...</div>;

  const imageUrl = workshop?.imageUrl ? mwImageSrc(workshop.imageUrl) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/vendor/mobile-workshop" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">
            {isEdit ? 'إدارة الورشة المتنقلة' : 'إضافة ورشة جديدة'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">قم بتعبئة بيانات ورشتك لاستقبال الطلبات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form id="workshopForm" onSubmit={handleSubmit} className="space-y-6">
            {/* الاساسيات */}
            <Card className="p-6 space-y-5">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                <Settings2 className="size-5 text-indigo-600" /> البيانات الأساسية
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                 <Field label="نوع الورشة">
                   <select name="workshopTypeId" value={form.workshopTypeId} onChange={handleChange} required className={inputCls}>
                     <option value="">-- اختر النوع --</option>
                     {workshopTypes.map(t => <option key={t.id} value={t.id}>{t.nameAr || t.name}</option>)}
                   </select>
                 </Field>
                 <Field label="الاسم (عربي) *">
                   <input name="nameAr" value={form.nameAr} onChange={handleChange} required dir="rtl" className={inputCls} />
                 </Field>
                 <Field label="الاسم (EN)">
                   <input name="name" value={form.name} onChange={handleChange} className={inputCls} />
                 </Field>
                 <Field label="رقم اللوحة">
                   <input name="plateNumber" value={form.plateNumber} onChange={handleChange} className={inputCls} />
                 </Field>
              </div>
              <Field label="وصف الورشة">
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputCls} />
              </Field>
            </Card>

            {/* الموقع */}
            <Card className="p-6 space-y-5">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                <MapPin className="size-5 text-indigo-600" /> الموقع والتغطية
              </h3>
              <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50 rounded-xl px-4 py-3">
                <p className="text-xs text-indigo-700 font-medium">تحديد الموقع بدقة يزيد من فرص ظهورك للعملاء</p>
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) return toast.error('المتصفح لا يدعم تحديد الموقع');
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setForm(p => ({ ...p, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                        toast.success('تم جلب الموقع');
                      },
                      (err) => toast.error('فشل الجلب: ' + err.message),
                      { enableHighAccuracy: true }
                    );
                  }}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  جلب موقعي الحالي
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="المدينة">
                  <input name="city" value={form.city} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="نطاق التغطية (كم)" hint="المسافة التي يمكنك الوصول إليها">
                  <input name="serviceRadius" type="number" value={form.serviceRadius} onChange={handleChange} className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-2 sm:col-span-1">
                   <Field label="Latitude"><input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} className={inputCls} /></Field>
                   <Field label="Longitude"><input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} className={inputCls} /></Field>
                </div>
              </div>
            </Card>

            {/* التسعير */}
            <Card className="p-6 space-y-5">
               <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                 <Banknote className="size-5 text-indigo-600" /> إعدادات التسعير
               </h3>
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="رسوم الزيارة" hint="مبلغ ثابت عند الذهاب">
                    <input name="basePrice" type="number" value={form.basePrice} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="سعر الكيلومتر" hint="يضاف على رسوم الزيارة">
                    <input name="pricePerKm" type="number" value={form.pricePerKm} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="سعر الساعة" hint="للإصلاحات الزمنية">
                    <input name="hourlyRate" type="number" value={form.hourlyRate} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="الحد الأدنى" hint="أقل فاتورة مقبولة">
                    <input name="minPrice" type="number" value={form.minPrice} onChange={handleChange} className={inputCls} />
                  </Field>
               </div>
            </Card>

            <Card className="p-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${form.isAvailable ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                   {form.isAvailable ? <Check className="size-6" /> : <X className="size-6" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">الحالة الحالية</p>
                  <p className="text-sm text-slate-500">هل أنت متاح لاستقبال باقات صيانة فورية الآن؟</p>
                </div>
                <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} className="hidden" />
                <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${form.isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </label>
            </Card>
          </form>
        </div>

        <div className="space-y-6">
          {/* الصورة */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ImagePlus className="size-5 text-indigo-600" /> صورة الورشة
            </h3>
            <div className="relative group aspect-video rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
               {imageUrl ? (
                 <img src={imageUrl} alt="" className="w-full h-full object-cover" />
               ) : (
                 <Car className="size-12 text-slate-300" />
               )}

               {isEdit && (
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="bg-white text-slate-900 rounded-lg px-4 py-2 font-bold text-sm shadow-xl"
                    >
                      تغيير الصورة
                    </button>
                 </div>
               )}
            </div>
            {isEdit && (
              <input
                ref={fileRef} type="file" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) imgMutation.mutate(f);
                }}
              />
            )}
            {!isEdit && <p className="text-[10px] text-slate-400 mt-2 text-center">يمكنك رفع الصورة بعد إنشاء الورشة</p>}
          </Card>

          {/* الخدمات */}
          {isEdit && (
            <Card className="p-6 space-y-4">
               <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                 <Wrench className="size-5 text-indigo-600" /> قائمة الخدمات
               </h3>
               <div className="space-y-3">
                 {workshop.services?.map(s => (
                   <ServiceItem
                     key={s.id} svc={s} workshopId={workshop.id}
                     onSaved={() => qc.invalidateQueries({ queryKey: ['mobile-workshop', 'me'] })}
                     onDeleted={() => qc.invalidateQueries({ queryKey: ['mobile-workshop', 'me'] })}
                   />
                 ))}
                 <ServiceItem
                    svc={{ name: '', nameAr: '', price: '' }} workshopId={workshop.id}
                    onSaved={() => qc.invalidateQueries({ queryKey: ['mobile-workshop', 'me'] })}
                 />
               </div>
            </Card>
          )}

          <div className="sticky top-6">
            <button
              form="workshopForm" type="submit" disabled={saveMutation.isPending}
              className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="size-5" />
              {saveMutation.isPending ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إنشاء الورشة')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
