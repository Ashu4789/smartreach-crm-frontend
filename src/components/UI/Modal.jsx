import React, { useEffect } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  ...props
}) {
  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" {...props}>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200" 
        onClick={onClose}
      />

      {/* Modal Alignment Container */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className={`relative w-full ${maxWidth} transform overflow-hidden rounded-xl bg-white border border-slate-200 text-left align-middle shadow-xl transition-all duration-200 p-6`}>
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-450 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
