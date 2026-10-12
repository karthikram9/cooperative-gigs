import React, { useEffect, useState } from 'react';
import { getNewJobs, getActiveJobs, getCompletedJobs, workerAcceptJob, workerStartJob, workerCompleteJob } from '../../api/workerJobs';
import { WorkerJobResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Play, CheckCircle2, MapPin, Calendar, Check } from 'lucide-react';

export const WorkerJobsPage: React.FC = () => {
  const [tab, setTab] = useState<'NEW' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [jobs, setJobs] = useState<WorkerJobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const { success, error: toastError } = useToast();

  const loadJobs = async () => {
    setLoading(true);
    try {
      let data: WorkerJobResponse[] = [];
      if (tab === 'NEW') data = await getNewJobs();
      else if (tab === 'ACTIVE') data = await getActiveJobs();
      else if (tab === 'COMPLETED') data = await getCompletedJobs();
      setJobs(data);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [tab]);

  const handleAccept = async (jobId: number) => {
    setActionLoading(jobId);
    try {
      await workerAcceptJob(jobId);
      success(`Job #${jobId} accepted!`);
      loadJobs();
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
      success(`Job #${jobId} started!`);
      loadJobs();
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
      success(`Job #${jobId} marked as completed! Payout posted.`);
      loadJobs();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker Job Management"
        description="Execute dispatched trade tasks through the verified cooperative state machine."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'ACTIVE', label: 'In Progress / Active' },
          { key: 'NEW', label: 'New Assigned' },
          { key: 'COMPLETED', label: 'Completed History' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading tasks..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          title={`No ${tab.toLowerCase()} jobs found`}
          description="There are currently no tasks in this state."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div
              key={job.jobId}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-extrabold text-slate-400">Job #{job.jobId}</span>
                  <h3 className="text-lg font-bold text-slate-900">{job.service}</h3>
                  <StatusBadge status={job.status} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" /> {job.location} {job.city && `(${job.city})`}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" /> {new Date(job.scheduledDateTime).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 gap-3">
                <div className="text-left sm:text-right">
                  <div className="text-lg font-black text-slate-900">₹{job.price?.toFixed(2) || '200.00'}</div>
                  <div className="text-[10px] text-slate-400">Rate</div>
                </div>

                {job.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleAccept(job.jobId)}
                    disabled={actionLoading === job.jobId}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                  >
                    {actionLoading === job.jobId ? 'Accepting...' : 'Accept Job'}
                  </button>
                )}

                {job.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleStart(job.jobId)}
                    disabled={actionLoading === job.jobId}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    {actionLoading === job.jobId ? 'Starting...' : 'Start Job'}
                  </button>
                )}

                {job.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleComplete(job.jobId)}
                    disabled={actionLoading === job.jobId}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {actionLoading === job.jobId ? 'Completing...' : 'Mark Completed'}
                  </button>
                )}

                {job.status === 'COMPLETED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <Check className="w-4 h-4 stroke-[2.5]" /> Fulfilled & Paid
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
