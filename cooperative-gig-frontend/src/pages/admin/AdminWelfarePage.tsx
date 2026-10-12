import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin';
import { AdminDashboardResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HeartHandshake, ShieldCheck, DollarSign, Award, Users, CheckCircle2 } from 'lucide-react';

export const AdminWelfarePage: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then((d) => setDashboard(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading welfare reserve ledger..." />;
  }

  const welfarePool = dashboard?.welfareFund ? Number(dashboard.welfareFund).toFixed(2) : '0.00';
  const grossVolume = dashboard?.totalEarnings ? Number(dashboard.totalEarnings).toFixed(2) : '0.00';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Cooperative Welfare Reserve"
        description="Accounting transparency for worker social security, emergency funds, and collective welfare dividends."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          title="Current Welfare Fund Pool"
          value={`₹${welfarePool}`}
          subtitle="Collected through statutory 5% allocation"
          icon={<HeartHandshake className="w-6 h-6" />}
          variant="amber"
        />
        <StatCard
          title="Gross Disbursed Volume"
          value={`₹${grossVolume}`}
          subtitle="100% direct gig payouts"
          icon={<DollarSign className="w-6 h-6" />}
          variant="emerald"
        />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          SIH 26089 Welfare Architecture & Governance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Automated 5% Levy
            </div>
            <p>Every settled booking automatically deducts 5% into the collective fund before net worker disbursement.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-amber-600" /> Medical & Contingency Cover
            </div>
            <p>Provides zero-interest emergency loans, hospitalization support, and accident coverage for active gig workers.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" /> Zero Commercial Commission
            </div>
            <p>The platform retains 0% corporate cut. All surplus funds belong to worker cooperatives.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
