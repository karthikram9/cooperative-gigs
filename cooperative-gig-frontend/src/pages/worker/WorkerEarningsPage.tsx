import React, { useEffect, useState } from 'react';
import { getWorkerEarnings } from '../../api/workerJobs';
import { getMyWelfareSummary } from '../../api/welfare';
import { WorkerEarningsResponse, WelfareSummaryResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DollarSign, CheckCircle2, HeartHandshake, ShieldCheck, TrendingUp } from 'lucide-react';

export const WorkerEarningsPage: React.FC = () => {
  const [earnings, setEarnings] = useState<WorkerEarningsResponse | null>(null);
  const [welfare, setWelfare] = useState<WelfareSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getWorkerEarnings().catch(() => null),
      getMyWelfareSummary().catch(() => null),
    ])
      .then(([e, w]) => {
        setEarnings(e);
        setWelfare(w);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading earnings and welfare accounting..." />;
  }

  const totalEarnings = earnings?.totalEarnings ?? 0;
  const completedCount = earnings?.completedJobs ?? 0;
  const welfareTotal = welfare?.totalContributions ?? (totalEarnings * 0.05);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Earnings & Welfare Ledger"
        description="Transparent tracking of completed job payouts, zero-commission disbursements, and cooperative welfare safety pool."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Net Earnings"
          value={`₹${totalEarnings.toFixed(2)}`}
          subtitle="Disbursed to bank/UPI"
          icon={<DollarSign className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="Completed Gig Services"
          value={completedCount}
          subtitle="Fulfilled tasks"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Welfare Fund Contributed"
          value={`₹${Number(welfareTotal).toFixed(2)}`}
          subtitle="5% cooperative social reserve"
          icon={<HeartHandshake className="w-6 h-6" />}
          variant="amber"
        />
      </div>

      {/* Welfare Fund Explanation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cooperative Social Security Fund</h3>
            <p className="text-xs text-slate-500">SIH 26089 Welfare Protection Model</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          Unlike private aggregators that extract 20–30% platform commissions for corporate shareholders, the Cooperative Gig Services platform charges <strong>0% commercial commission</strong>. Exactly <strong>5% of each completed job</strong> is pooled directly into your collective worker welfare reserve to fund medical emergencies, accident cover, and social security.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-1">
            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 100% Direct Payout
            </div>
            <p className="text-xs text-slate-600">Immediate settlement directly upon task completion.</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-1">
            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Community Dividend
            </div>
            <p className="text-xs text-slate-600">Unused welfare reserves are audited and distributed collectively.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
