import React from 'react';
import { ServiceType } from '../../types';
import { Wrench, Zap, Sparkles, Hammer, ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  service: ServiceType;
  onSelect?: (service: ServiceType) => void;
  actionText?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onSelect,
  actionText = 'Book Service',
}) => {
  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('plumb')) return <Wrench className="w-6 h-6 text-sky-600" />;
    if (lower.includes('electr')) return <Zap className="w-6 h-6 text-amber-500" />;
    if (lower.includes('clean')) return <Sparkles className="w-6 h-6 text-emerald-600" />;
    if (lower.includes('carpent')) return <Hammer className="w-6 h-6 text-amber-700" />;
    return <Wrench className="w-6 h-6 text-slate-600" />;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between group">
      <div>
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-slate-100">
          {getIcon(service.name)}
        </div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {service.name}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            ₹{service.basePrice.toFixed(0)} Base
          </span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-3 mb-6">
          {service.description || 'Reliable and verified local cooperative service professionals.'}
        </p>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(service)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
