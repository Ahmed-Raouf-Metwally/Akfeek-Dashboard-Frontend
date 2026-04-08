import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 focus:ring-indigo-500/50',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 focus:ring-slate-300',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
  danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 focus:ring-red-500/50',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

/**
 * Button with gradient option and hover scale/glow.
 */
export function GlowButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  ...rest
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
