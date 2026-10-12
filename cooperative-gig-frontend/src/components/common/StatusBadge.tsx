import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'COMPLETED':
      case 'SUCCESS':
      case 'VERIFIED':
      case 'AVAILABLE':
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';

      case 'IN_PROGRESS':
      case 'ACCEPTED':
      case 'BUSY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';

      case 'PENDING':
      case 'ASSIGNED':
      case 'CONFIRMED':
        return 'bg-amber-100 text-amber-800 border-amber-200';

      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
      case 'UNAVAILABLE':
      case 'INACTIVE':
        return 'bg-rose-100 text-rose-800 border-rose-200';

      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide ${sizeClasses} ${getStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {normalized.replace('_', ' ')}
    </span>
  );
};
