import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNewJobs, getActiveJobs, getCompletedJobs, getWorkerEarnings, workerAcceptJob, workerStartJob, workerCompleteJob } from '../../api/workerJobs';
import { updateMyAvailability } from '../../api/workers';
import { WorkerJobResponse, WorkerEarningsResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import {
  Briefcase,
  Play,
  CheckCircle2,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  MapPin,
  Calendar,
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [newJobs, setNewJobs] = useState<WorkerJobResponse[]>([]);
  const [activeJobs, setActiveJobs] = useState<WorkerJobResponse[]>([]);
  const [completedJobs, setCompletedJobs] = useState<WorkerJobResponse[]>([]);
  const [earnings, setEarnings] = useState<WorkerEarningsResponse | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [n, a, c, e] = await Promise.all([
        getNewJobs().catch(() => []),
        getActiveJobs().catch(() => []),
        getCompletedJobs().catch(() => []),
        getWorkerEarnings().catch(() => null),
      ]);
      setNewJobs(n);
      setActiveJobs(a);
      setCompletedJobs(c);
      setEarnings(e);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async () => {
    const nextStatus = isAvailable ? 'UNAVAILABLE' : 'AVAILABLE';
    try {
      await updateMyAvailability(nextStatus);
      setIsAvailable(!isAvailable);
      success(`Availability updated: Now ${nextStatus}`);
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  const handleAccept = async (jobId: number) => {
    setActionLoading(jobId);
    try {
      await workerAcceptJob(jobId);
      success(`Job #${jobId} accepted!`);
      loadData();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (jobId: number) => {
    setActionLoading(jobId);
    try {
      await workerStartJob(jobId);
      success(`Job #${jobId} started (IN PROGRESS)!`);
      loadData();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (jobId: number) => {
    setActionLoading(jobId);
    try {
      await workerCompleteJob(jobId);
      success(`Job #${jobId} marked COMPLETED! Payout credited to ledger.`);
      loadData();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading worker operations dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Worker Console: ${user?.name || 'Partner'}`}
        description="Manage assigned gig tasks, toggle dispatch availability, and track cooperative earnings."
        action={
          <button
            onClick={handleToggleAvailability}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all border ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {isAvailable ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
            Status: {isAvailable ? 'AVAILABLE FOR DISPATCH' : 'UNAVAILABLE'}
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatCard
          title="New Jobs"
          value={newJobs.length}
          subtitle="Waiting for acceptance"
          icon={<Briefcase className="w-6 h-6" />}
          variant="amber"
        />
        <StatCard
          title="Active Jobs"
          value={activeJobs.length}
          subtitle="Accepted or In-Progress"
          icon={<Play className="w-6 h-6" />}
          variant="indigo"
        />
        <StatCard
          title="Completed Jobs"
          value={earnings?.completedJobs ?? completedJobs.length}
          subtitle="Successfully delivered"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="Total Earnings"
          value={`₹${earnings?.totalEarnings?.toFixed(2) || '0.00'}`}
          subtitle="Net after welfare contribution"
          icon={<DollarSign className="w-6 h-6" />}
          variant="blue"
        />
      </div>

      {/* Priority Action: New & In-Progress Jobs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Immediate Task Actions</h2>
          <button
            onClick={() => navigate('/worker/jobs')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View All Jobs
          </button>
        </div>

        {newJobs.length === 0 && activeJobs.length === 0 ? (
          <EmptyState
            title="No active tasks right now"
            description="You are caught up! When a customer booking matches your verified skills and area, it will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* New Jobs */}
            {newJobs.map((job) => (
              <div
                key={job.jobId}
                className="bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">NEW ASSIGNMENT</span>
                    <h3 className="text-base font-bold text-slate-900">{job.service}</h3>
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location} {job.city && `(${job.city})`}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(job.scheduledDateTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">₹{job.price?.toFixed(2) || '200.00'}</div>
                    <div className="text-[10px] text-slate-400">Guaranteed payout</div>
                  </div>
                  <button
                    onClick={() => handleAccept(job.jobId)}
                    disabled={actionLoading === job.jobId}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50"
                  >
                    {actionLoading === job.jobId ? 'Accepting...' : 'Accept Job'}
                  </button>
                </div>
              </div>
            ))}

            {/* Active / In Progress Jobs */}
            {activeJobs.map((job) => (
              <div
                key={job.jobId}
                className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-slate-900">{job.service}</h3>
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(job.scheduledDateTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">₹{job.price?.toFixed(2) || '200.00'}</div>
                  </div>

                  {job.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStart(job.jobId)}
                      disabled={actionLoading === job.jobId}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      {actionLoading === job.jobId ? 'Starting...' : 'Start Job'}
                    </button>
                  )}

                  {job.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleComplete(job.jobId)}
                      disabled={actionLoading === job.jobId}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {actionLoading === job.jobId ? 'Completing...' : 'Mark Completed'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
