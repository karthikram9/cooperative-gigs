import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, badge }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3 flex-shrink-0">{action}</div>}
    </div>
  );
};
