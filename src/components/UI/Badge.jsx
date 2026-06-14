import React from 'react';

export default function Badge({
  children,
  variant = 'slate',
  className = '',
  ...props
}) {
  const badgeColors = {
    // Standard Colors
    slate: 'bg-slate-100 text-slate-700 border-slate-200/60',
    gray: 'bg-slate-100 text-slate-700 border-slate-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-750 border-yellow-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-250',
    red: 'bg-red-50 text-red-700 border-red-200',

    // Specific CRM Enums
    // Channels
    WhatsApp: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SMS: 'bg-amber-50 text-amber-800 border-amber-200',
    Email: 'bg-blue-50 text-blue-700 border-blue-200',
    RCS: 'bg-purple-50 text-purple-700 border-purple-200',

    // Campaign / Webhook Statuses
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200/60',
    PROCESSING: 'bg-yellow-50 text-yellow-850 border-yellow-200',
    SENT: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
    OPENED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CLICKED: 'bg-amber-50 text-amber-700 border-amber-200',
    CONVERTED: 'bg-emerald-600/10 text-emerald-700 border-emerald-600/20'
  };

  const selectedColor = badgeColors[variant] || badgeColors[children] || badgeColors.slate;

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${selectedColor} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
