import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminDashboard, getAdminDemand } from '../../api/admin';
import { AdminDashboardResponse, DemandResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Users, UserCheck, ToggleRight, Briefcase, DollarSign, HeartHandshake, ArrowRight, BarChart2 } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [demand, setDemand] = useState<DemandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getAdminDashboard().catch(() => null),
      getAdminDemand().catch(() => []),
    ])
      .then(([dash, dem]) => {
        setDashboard(dash);
        setDemand(dem);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading administrative control analytics..." />;
  }

  const maxDemandCount = Math.max(...demand.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Administrative Console"
        description="Monitor system-wide cooperative health, worker capacity, booking dispatch, and welfare reserves."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/workers')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Manage Workers
            </button>
            <button
              onClick={() => navigate('/admin/bookings')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Dispatch Bookings
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Registered Workers"
          value={dashboard?.totalWorkers ?? 0}
          subtitle="Enrolled cooperative partners"
          icon={<Users className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Active Workers"
          value={dashboard?.activeWorkers ?? 0}
          subtitle="Account status: ACTIVE"
          icon={<UserCheck className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="Available for Dispatch"
          value={dashboard?.availableWorkers ?? 0}
          subtitle="Currently on-duty"
          icon={<ToggleRight className="w-6 h-6" />}
          variant="indigo"
        />
        <StatCard
          title="Today's Bookings"
          value={dashboard?.todaysJobs ?? 0}
          subtitle="Active requests"
          icon={<Briefcase className="w-6 h-6" />}
          variant="amber"
        />
        <StatCard
          title="Gross Payout Volume"
          value={`₹${dashboard?.totalEarnings ? Number(dashboard.totalEarnings).toFixed(2) : '0.00'}`}
          subtitle="100% disbursed to workers"
          icon={<DollarSign className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="Cooperative Welfare Fund"
          value={`₹${dashboard?.welfareFund ? Number(dashboard.welfareFund).toFixed(2) : '0.00'}`}
          subtitle="Social security reserve pool"
          icon={<HeartHandshake className="w-6 h-6" />}
          variant="amber"
        />
      </div>

      {/* Demand Insights Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              Service Demand Analytics
            </h3>
            <p className="text-xs text-slate-500">Live booking volume aggregated by service category.</p>
          </div>
          <button
            onClick={() => navigate('/admin/demand')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {demand.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No bookings recorded yet for demand distribution.</p>
        ) : (
          <div className="space-y-4">
            {demand.map((item) => {
              const percentage = Math.round((item.count / maxDemandCount) * 100);
              return (
                <div key={item.service} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.service}</span>
                    <span className="text-emerald-700 font-bold">{item.count} bookings</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
