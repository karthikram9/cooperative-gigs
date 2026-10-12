import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../../api/bookings';
import { BookingResponse, BookingStatus } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Plus, ArrowRight, Calendar, MapPin, Wrench, Filter } from 'lucide-react';

export const CustomerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    getMyBookings()
      .then((data) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your service requests..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Service Bookings"
        description="Monitor real-time progress, examine fair match recommendations, and process payment settlements."
        action={
          <button
            onClick={() => navigate('/customer/bookings/new')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Booking
          </button>
        }
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

      {filtered.length === 0 ? (
        <EmptyState
          title="No bookings match criteria"
          description="You do not have any requests in this state. Request a verified trade specialist to get started."
          action={
            <button
              onClick={() => navigate('/customer/bookings/new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Book Service
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              onClick={() => navigate(`/customer/bookings/${booking.id}`)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-xs font-extrabold text-slate-400">#{booking.id}</span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {booking.serviceName}
                    </h3>
                    <StatusBadge status={booking.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 max-w-xl mb-2">{booking.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {booking.serviceAddress}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(booking.scheduledDateTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="text-lg font-black text-slate-900">₹{booking.price?.toFixed(2) || '200.00'}</div>
                  <div className="text-[10px] text-slate-400">Cooperative standard</div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-2 group-hover:translate-x-1 transition-transform">
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
