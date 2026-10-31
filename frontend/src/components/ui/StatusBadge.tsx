import React from 'react';

export type BadgeStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'confirmed'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled'
  | 'draft'
  | 'sent'
  | 'paused'
  | 'closed';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = (status || '').toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = norm.replace('_', ' ');

  switch (norm) {
    case 'active':
    case 'accepted':
    case 'paid':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'converted':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      break;
    case 'pending':
    case 'partially_paid':
    case 'confirmed':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'sent':
      styles = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'rejected':
    case 'inactive':
    case 'overdue':
    case 'expired':
    case 'cancelled':
    case 'closed':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'paused':
      styles = 'bg-violet-50 text-violet-700 border-violet-200';
      break;
    case 'draft':
    default:
      styles = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border capitalize ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current bg-current opacity-80" />
      {label}
    </span>
  );
};
