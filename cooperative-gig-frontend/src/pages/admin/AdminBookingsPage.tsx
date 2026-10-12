import React, { useEffect, useState } from 'react';
import { getAdminBookings, getAdminWorkers } from '../../api/admin';
import { createJob } from '../../api/jobs';
import { AdminBookingResponse, WorkerAdminResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { CalendarCheck, UserCheck, MapPin, Calendar, Filter } from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBookingResponse[]>([]);
  const [workers, setWorkers] = useState<WorkerAdminResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Dispatch Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingResponse | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | undefined>(undefined);
  const [dispatching, setDispatching] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = async () => {
    try {
      const [b, w] = await Promise.all([
        getAdminBookings().catch(() => []),
        getAdminWorkers().catch(() => []),
      ]);
      setBookings(b);
      setWorkers(w);
      if (w.length > 0) setSelectedWorkerId(w[0].id);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDispatch = (booking: AdminBookingResponse) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !selectedWorkerId) return;
    setDispatching(true);

    try {
      await createJob(selectedBooking.bookingId, selectedWorkerId);
      success(`Worker assigned to Booking #${selectedBooking.bookingId}! Status: ASSIGNED`);
      setModalOpen(false);
      loadData();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setDispatching(false);
    }
  };

  const filtered = statusFilter === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading platform bookings..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings & Dispatch Console"
        description="Monitor system-wide service demand and dispatch qualified cooperative workers."
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-4 px-6">ID & Service</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Scheduled</th>
                <th className="py-4 px-6">Assigned Worker</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b) => (
                <tr key={b.bookingId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{b.bookingId}</span>
                      <span>{b.service}</span>
                    </div>
                    <div className="text-xs font-normal text-emerald-700">₹{b.price?.toFixed(2) || '200.00'}</div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-700 font-semibold">{b.customerName}</td>
                  <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.location}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(b.scheduledDateTime).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs font-semibold text-slate-800">
                    {b.workerName ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <UserCheck className="w-3.5 h-3.5" /> {b.workerName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    {b.status === 'PENDING' ? (
                      <button
                        onClick={() => openDispatch(b)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Dispatch Worker
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Dispatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Dispatch Worker for Booking #${selectedBooking?.bookingId}`}>
        <form onSubmit={handleDispatch} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700">
            <div><strong>Service:</strong> {selectedBooking?.service}</div>
            <div><strong>Customer:</strong> {selectedBooking?.customerName}</div>
            <div><strong>Address:</strong> {selectedBooking?.location}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Qualified Worker Partner
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.skills?.join(', ') || 'General'}) — {w.location || 'Local'} [{w.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={dispatching}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {dispatching ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
