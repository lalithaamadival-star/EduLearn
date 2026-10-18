import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Focus modal container
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Handle Escape key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <div
        ref={modalRef}
        tabIndex="-1"
        className={`relative w-full ${maxWidth} bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h2 id="modal-headline" className="text-xl font-bold text-slate-100">
            {title}
          </h2>
          <IconButton
            icon={X}
            label="Close modal dialog"
            onClick={onClose}
            size="sm"
          />
        </div>

        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
