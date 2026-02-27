import React from 'react';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  error,
  helperText,
  className = '',
  ...rest
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          block w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
          disabled:pointer-events-none disabled:opacity-50
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-slate-300'}
        `}
        {...rest}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>}
    </div>
  );
}
