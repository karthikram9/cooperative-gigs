import React, { useState } from 'react';
import { updateMyAvailability } from '../../api/workers';
import { PageHeader } from '../../components/common/PageHeader';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { ToggleLeft, ToggleRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export const WorkerAvailabilityPage: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const { success, error: toastError } = useToast();

  const handleToggle = async (targetStatus: 'AVAILABLE' | 'UNAVAILABLE') => {
    setUpdating(true);
    try {
      await updateMyAvailability(targetStatus);
      setIsAvailable(targetStatus === 'AVAILABLE');
      success(`Availability successfully set to ${targetStatus}`);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Dispatch Availability Status"
        description="Control when you appear in the fair matching engine and receive automated service dispatch notifications."
      />

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Active State</div>
            <div className="text-2xl font-black flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className={isAvailable ? 'text-emerald-800' : 'text-slate-600'}>
                {isAvailable ? 'AVAILABLE FOR GIG DISPATCH' : 'UNAVAILABLE (OFF-DUTY)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isAvailable
                ? 'Your profile is eligible for algorithmic candidate scoring in your service zone.'
                : 'You will not receive new task assignments while marked unavailable.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggle('AVAILABLE')}
              disabled={updating || isAvailable}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isAvailable
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Set Available
            </button>
            <button
              onClick={() => handleToggle('UNAVAILABLE')}
              disabled={updating || !isAvailable}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                !isAvailable
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Set Unavailable
            </button>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800">Cooperative Fair Scheduling Rules</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Transparent Matching
              </div>
              <p>Only verified partners with active availability are considered by customer match requests.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" /> Rest & Rotation Equity
              </div>
              <p>Toggle offline whenever resting; the cooperative algorithm prevents penalty or score decay.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
