import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }) {
  const variantStyles = {
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-700/60',
    info: 'bg-sky-950/80 text-sky-300 border border-sky-700/60',
    contrast: 'bg-yellow-400 text-black font-bold border border-black'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-sm px-2.5 py-1 rounded-md font-medium'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}
