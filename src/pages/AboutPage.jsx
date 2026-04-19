import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Info,
  Code2,
  ShieldCheck,
  Zap,
  Globe,
  Smartphone,
  Car,
  Wrench,
  Package,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../components/ui/Card';

const VERSION = '1.0.0';
const BUILD_YEAR = '2025';

const FEATURES = [
  { icon: Car,         labelAr: 'حجز الورش المعتمدة',   labelEn: 'Certified Workshop Booking' },
  { icon: Wrench,      labelAr: 'الورشة المتنقلة',       labelEn: 'Mobile Workshop' },
  { icon: MapPin,      labelAr: 'خدمة الونش',            labelEn: 'Towing Service' },
  { icon: Package,     labelAr: 'سوق قطع الغيار',        labelEn: 'Auto Parts Marketplace' },
  { icon: Zap,         labelAr: 'العناية الشاملة',        labelEn: 'Comprehensive Care' },
  { icon: ShieldCheck, labelAr: 'رحلة أكفيك التأمينية',  labelEn: 'Akfeek Journey (Insurance)' },
  { icon: Smartphone,  labelAr: 'تطبيق موبايل',          labelEn: 'Mobile Application' },
  { icon: Globe,       labelAr: 'لوحة تحكم الويب',       labelEn: 'Web Dashboard' },
];

const TECH_STACK = [
  { category: 'Backend',   items: ['Node.js', 'Express', 'Prisma ORM', 'MySQL', 'Socket.IO', 'JWT'] },
  { category: 'Frontend',  items: ['React 18', 'Vite', 'Tailwind CSS', 'TanStack Query', 'React Router v6'] },
  { category: 'Storage',   items: ['Multer', 'Local uploads', 'Prisma migrations'] },
  { category: 'Docs',      items: ['Swagger / OpenAPI 3', 'JSDoc'] },
];

export default function AboutPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <span className="text-4xl font-black tracking-tight text-white">أ</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {isAr ? 'أكفيك' : 'Akfeek'}
            </h1>
            <p className="mt-1 text-indigo-200">
              {isAr
                ? 'منصة خدمات السيارات الشاملة — الورش، قطع الغيار، الونش، والعناية الكاملة'
                : 'All-in-one automotive services — workshops, parts, towing & care'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                v{VERSION}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                {isAr ? `© ${BUILD_YEAR} حقوق محفوظة` : `© ${BUILD_YEAR} All rights reserved`}
              </span>
            </div>
          </div>
        </div>
        {/* decorative circles */}
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-white/5" />
      </div>

      {/* About text */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <Info className="size-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {isAr ? 'عن المنصة' : 'About the Platform'}
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {isAr
            ? 'أكفيك هي منصة متكاملة لخدمات السيارات في المملكة العربية السعودية. تربط العملاء بمزودي الخدمات المعتمدين — من ورش الصيانة والورش المتنقلة وخدمات الونش والعناية الشاملة وسوق قطع الغيار. تدعم المنصة إدارة الفيندور كاملاً، نظام الفواتير والمدفوعات، برامج الباقات، ومحرك الحجز الذكي (رحلة أكفيك) مع التكامل مع شركات التأمين.'
            : 'Akfeek is a comprehensive automotive services platform in Saudi Arabia. It connects customers with certified service providers — certified workshops, mobile workshops, towing services, comprehensive care, and an auto parts marketplace. The platform supports full vendor management, an invoice & payment system, package subscriptions, and a smart booking engine (Akfeek Journey) with insurance company integration.'}
        </p>
      </Card>

      {/* Features grid */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {isAr ? 'الخدمات والمميزات' : 'Services & Features'}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FEATURES.map(({ icon: Icon, labelAr, labelEn }) => (
            <div
              key={labelEn}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                <Icon className="size-4" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {isAr ? labelAr : labelEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
            <Code2 className="size-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {isAr ? 'التقنيات المستخدمة' : 'Tech Stack'}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_STACK.map(({ category, items }) => (
            <div key={category}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Version / build info */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          {isAr ? 'معلومات الإصدار' : 'Version Info'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: isAr ? 'الإصدار'     : 'Version',      value: `v${VERSION}` },
            { label: isAr ? 'البيئة'      : 'Environment',  value: import.meta.env.MODE === 'production' ? (isAr ? 'إنتاج' : 'Production') : (isAr ? 'تطوير' : 'Development') },
            { label: isAr ? 'الواجهة الخلفية' : 'API Base', value: import.meta.env.VITE_API_URL || 'http://localhost:3000' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white break-all">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Contact */}
      <Card className="p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          {isAr ? 'تواصل معنا' : 'Contact'}
        </h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:support@akfeek.com"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Mail className="size-4" />
            support@akfeek.com
          </a>
          <a
            href="https://akfeek.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Globe className="size-4" />
            akfeek.com
            <ExternalLink className="size-3 text-slate-400" />
          </a>
        </div>
      </Card>

    </div>
  );
}
