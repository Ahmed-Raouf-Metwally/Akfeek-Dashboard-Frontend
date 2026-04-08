import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card with hover lift, subtle glow, and smooth shadow.
 * Use for stat cards, content blocks, and dashboards.
 */
export function AnimatedCard({ className = '', children, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -2,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(99 102 241 / 0.05)',
        transition: { duration: 0.2 },
      }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-200 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
