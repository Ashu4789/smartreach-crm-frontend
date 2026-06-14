import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  actions,
  hoverable = false,
  className = '',
  bodyClassName = 'p-6',
  ...props
}) {
  return (
    <div
      className={`glass-card ${hoverable ? 'hover-lift cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900 leading-none">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-1 leading-none">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
}
