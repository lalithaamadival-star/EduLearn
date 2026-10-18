import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

export function Drawer({ isOpen, onClose, title, children, position = 'right', width = 'w-96' }) {
  const drawerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      if (drawerRef.current) {
        drawerRef.current.focus();
      }

      const handleKey = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener('keydown', handleKey);
      return () => {
        window.removeEventListener('keydown', handleKey);
        if (triggerRef.current && triggerRef.current.focus) {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClass = position === 'right' ? 'right-0 top-0 bottom-0' : 'left-0 top-0 bottom-0';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        tabIndex="-1"
        onClick={(e) => e.stopPropagation()}
        className={`fixed ${positionClass} ${width} max-w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          <IconButton icon={X} label="Close panel" onClick={onClose} size="sm" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
