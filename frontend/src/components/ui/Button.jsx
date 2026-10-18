import React from 'react';

export function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  className = '',
  disabled = false,
  loading = false,
  ariaLabel,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-lg cursor-pointer select-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  };

  const variantStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white btn-solid-white shadow-sm focus-visible:ring-indigo-400 active:scale-[0.98]",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus-visible:ring-slate-400",
    outline: "bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-600 focus-visible:ring-slate-400",
    ghost: "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white focus-visible:ring-slate-400",
    accent: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm focus-visible:ring-amber-300 active:scale-[0.98]",
    danger: "bg-rose-600 hover:bg-rose-500 text-white btn-solid-white focus-visible:ring-rose-400"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  onClick,
  className = '',
  variant = 'ghost',
  size = 'md',
  active = false,
  ...props
}) {
  const sizeStyles = {
    sm: "p-1.5 text-xs",
    md: "p-2 text-sm",
    lg: "p-3 text-base"
  };

  const activeStyles = active ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/50" : "";

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-indigo-400 ${sizeStyles[size]} ${activeStyles} ${className}`}
      onClick={onClick}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
