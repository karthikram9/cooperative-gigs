import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings } from '../../api/bookings';
import { getServices } from '../../api/services';
import { BookingResponse, ServiceType } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { CalendarCheck, CheckCircle2, Clock, Plus, ArrowRight, Wrench } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyBookings().catch(() => []), getServices().catch(() => [])])
      .then(([bookingsData, servicesData]) => {
        setBookings(bookingsData);
        setServices(servicesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeBookings = bookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'ASSIGNED' || b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'
  );
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${user?.name || 'Customer'}`}
        description="Book fair local services, track active requests, and support cooperative workers."
        action={
          <button
            onClick={() => navigate('/customer/bookings/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Book New Service
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Active Requests"
          value={activeBookings.length}
          subtitle="In dispatch or execution"
          icon={<Clock className="w-6 h-6" />}
          variant="amber"
        />
        <StatCard
          title="Completed Services"
          value={completedBookings.length}
          subtitle="Successfully fulfilled"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          subtitle="Lifetime service history"
          icon={<CalendarCheck className="w-6 h-6" />}
          variant="blue"
        />
      </div>

      {/* Active Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Current & Recent Bookings</h2>
          <Link to="/customer/bookings" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
            View All ({bookings.length})
          </Link>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="You have not requested any cooperative service yet. Choose a category below to get started!"
            action={
              <button
                onClick={() => navigate('/customer/bookings/new')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
              >
                <Plus className="w-4 h-4" /> Request Service
              </button>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => navigate(`/customer/bookings/${booking.id}`)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{booking.serviceName}</h4>
                        <StatusBadge status={booking.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{booking.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>{booking.serviceAddress}</span>
                        <span>•</span>
                        <span>{new Date(booking.scheduledDateTime).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">₹{booking.price?.toFixed(2) || '200.00'}</div>
                      <div className="text-[10px] text-slate-400">Cooperative rate</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Quick Service Booking</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              onClick={() => navigate(`/customer/bookings/new?serviceId=${svc.id}`)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer text-center group"
            >
              <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700">{svc.name}</h4>
              <p className="text-xs text-slate-500 mt-1">From ₹{svc.basePrice?.toFixed(0)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
