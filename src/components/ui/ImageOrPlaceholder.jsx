import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FALLBACK_SVG = (
  <svg className="size-full text-slate-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
  </svg>
);

/**
 * Renders image with optional placeholder on error or while loading.
 * @param {string} src - Image URL
 * @param {string} alt - Alt text
 * @param {string} className - Wrapper classes
 * @param {object} imgClassName - Img classes
 * @param {React.ReactNode} placeholder - Custom placeholder (default: icon)
 * @param {string} aspect - 'square' | 'video' | 'auto'
 */
export function ImageOrPlaceholder({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  placeholder = null,
  aspect = 'square',
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const showPlaceholder = !src || error;
  const content = placeholder ?? FALLBACK_SVG;

  const aspectClass = aspect === 'video' ? 'aspect-video' : aspect === 'square' ? 'aspect-square' : '';

  if (showPlaceholder) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden rounded-lg bg-slate-100 ${aspectClass} ${className}`}
        aria-hidden
      >
        {content}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg bg-slate-100 ${aspectClass} ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          {content}
        </div>
      )}
      <motion.img
        src={src}
        alt={alt}
        className={`size-full object-cover ${imgClassName}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}

export default ImageOrPlaceholder;
