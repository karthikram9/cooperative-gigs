import React from 'react';
import { Check, Clock, Play, CheckCircle2, UserCheck } from 'lucide-react';

interface ProgressStepperProps {
  status: string; // PENDING, ASSIGNED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ status }) => {
  const steps = [
    { key: 'PENDING', label: 'Booking Placed', icon: Clock },
    { key: 'ASSIGNED', label: 'Worker Assigned', icon: UserCheck },
    { key: 'ACCEPTED', label: 'Accepted', icon: Check },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Play },
    { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
  ];

  const getStepIndex = (currentStatus: string): number => {
    switch (currentStatus.toUpperCase()) {
      case 'PENDING':
        return 0;
      case 'ASSIGNED':
      case 'CONFIRMED':
        return 1;
      case 'ACCEPTED':
        return 2;
      case 'IN_PROGRESS':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const isCancelled = status.toUpperCase() === 'CANCELLED' || status.toUpperCase() === 'REJECTED';
  const currentStepIndex = getStepIndex(status);

  if (isCancelled) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-center font-medium">
        This booking has been {status.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
        {/* Active track line */}
        <div
          className="absolute top-5 left-6 h-0.5 bg-emerald-500 -z-0 transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 90}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : isCurrent
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 shadow-md'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center hidden sm:block ${
                  isCurrent ? 'text-emerald-700 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-center sm:hidden mt-3 text-xs font-semibold text-emerald-700">
        Current Stage: {steps[currentStepIndex]?.label}
      </div>
    </div>
  );
};
