import React, { useEffect, useState } from 'react';
import { getAdminDemand, getWorkerLocations } from '../../api/admin';
import { DemandResponse, WorkerLocationResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { BarChart3, MapPin, Shield, CheckCircle2 } from 'lucide-react';

export const AdminDemandPage: React.FC = () => {
  const [demand, setDemand] = useState<DemandResponse[]>([]);
  const [locations, setLocations] = useState<WorkerLocationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminDemand().catch(() => []),
      getWorkerLocations().catch(() => []),
    ])
      .then(([d, l]) => {
        setDemand(d);
        setLocations(l);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Aggregating service demand data..." />;
  }

  const maxCount = Math.max(...demand.map((d) => d.count), 1);
  const totalVolume = demand.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Service Demand Analytics"
        description="Transparent dispatch distribution analytics aggregated across trade categories."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Trade Demand Ranking */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Trade Category Demand
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Total bookings recorded: {totalVolume}</p>
          </div>

          <div className="space-y-4">
            {demand.map((d) => {
              const pct = Math.round((d.count / maxCount) * 100);
              return (
                <div key={d.service} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 font-bold">{d.service}</span>
                    <span className="text-emerald-700">{d.count} requests</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Worker Regional Capacity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Regional Partner Capacity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live partner distribution by zone.</p>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {locations.map((loc) => (
              <div key={loc.workerId} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{loc.name}</span>
                  <p className="text-slate-400">{loc.location || 'Central'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    loc.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {loc.availabilityStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
