import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'emerald',
}) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-xl border ${colorMap[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
