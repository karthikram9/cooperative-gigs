import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminWorkerDetails } from '../../api/admin';
import { AdminWorkerDetailsResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Briefcase, CheckCircle2, DollarSign, Award, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export const AdminWorkerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workerId = Number(id);

  const [details, setDetails] = useState<AdminWorkerDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminWorkerDetails(workerId)
      .then((d) => setDetails(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [workerId]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading worker performance records..." />;
  }

  if (!details) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-900">Worker details not found</h3>
        <Link to="/admin/workers" className="text-emerald-700 font-semibold text-sm mt-2 inline-block">
          Return to directory
        </Link>
      </div>
    );
  }

  const { worker, currentJobs, completedJobs, earnings } = details;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/admin/workers" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Worker Directory
      </Link>

      <PageHeader
        title={worker.name}
        description={`Cooperative Partner ID #${worker.id}`}
        badge={<StatusBadge status={worker.status} />}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="In-Progress Jobs"
          value={currentJobs}
          subtitle="Currently assigned"
          icon={<Briefcase className="w-6 h-6" />}
          variant="indigo"
        />
        <StatCard
          title="Completed Services"
          value={completedJobs}
          subtitle="Verified fulfillments"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="Total Lifetime Payout"
          value={`₹${earnings ? Number(earnings).toFixed(2) : '0.00'}`}
          subtitle="Net distributed"
          icon={<DollarSign className="w-6 h-6" />}
          variant="amber"
        />
      </div>

      {/* Contact & Skills Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Worker Credentials</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">Email Address</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {worker.email}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">Phone Number</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {worker.phone}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">Location Zone</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {worker.location || 'Local Region'}
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Competencies</h4>
          <div className="flex flex-wrap gap-2">
            {(worker.skills || []).map((skill, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-emerald-600" /> {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
