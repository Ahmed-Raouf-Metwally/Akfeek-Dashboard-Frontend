import React from 'react';

export function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`border-b border-slate-100 px-6 py-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function CardBody({ className = '', children, ...rest }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}
