import React from 'react';

export function Switch({ checked, onChange, label, description, id, disabled = false }) {
  const switchId = id || `switch-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex flex-col">
        <label htmlFor={switchId} className="text-sm font-medium text-slate-100 cursor-pointer select-none">
          {label}
        </label>
        {description && (
          <span className="text-xs text-slate-400 select-none">
            {description}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-indigo-400 ${
          checked ? 'bg-indigo-600' : 'bg-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
