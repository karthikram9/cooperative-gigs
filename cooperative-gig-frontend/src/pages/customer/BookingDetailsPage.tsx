import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookingById, cancelBooking } from '../../api/bookings';
import { findMatches, findBestMatch } from '../../api/matching';
import { BookingResponse, MatchResult } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProgressStepper } from '../../components/common/ProgressStepper';
import { FairMatchCard } from '../../components/customer/FairMatchCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import {
  Calendar,
  MapPin,
  FileText,
  CreditCard,
  Star,
  XCircle,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [bestMatch, setBestMatch] = useState<MatchResult | null>(null);
  const [allMatches, setAllMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const loadBooking = async () => {
    try {
      const data = await getBookingById(bookingId);
      setBooking(data);

      // If booking is PENDING, fetch live fair match candidates
      if (data.status === 'PENDING') {
        setMatchLoading(true);
        try {
          const [best, matches] = await Promise.all([
            findBestMatch(bookingId).catch(() => null),
            findMatches(bookingId).catch(() => []),
          ]);
          setBestMatch(best);
          setAllMatches(matches);
        } finally {
          setMatchLoading(false);
        }
      }
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      await cancelBooking(bookingId);
      success('Booking cancelled.');
      loadBooking();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading booking details..." />;
  }

  if (!booking) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Booking not found</h2>
        <Link to="/customer/bookings" className="text-emerald-600 font-medium text-sm mt-2 inline-block">
          Return to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title={`${booking.serviceName} Request #${booking.id}`}
        description={`Submitted on ${new Date(booking.createdAt).toLocaleDateString()}`}
        badge={<StatusBadge status={booking.status} />}
        action={
          booking.status === 'PENDING' ? (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Cancel Request
            </button>
          ) : undefined
        }
      />

      {/* Visual Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Request Progression</h3>
        <ProgressStepper status={booking.status} />
      </div>

      {/* Booking Core Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Service Details</h3>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description of Work</span>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {booking.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Service Location</span>
                <p className="text-sm font-semibold text-slate-800">{booking.serviceAddress}</p>
                {booking.city && <p className="text-xs text-slate-500">{booking.city}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Scheduled Window</span>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date(booking.scheduledDateTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Actions Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Settlement Summary</h3>
            <div className="space-y-3 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Service Fee</span>
                <span className="font-semibold text-slate-800">₹{booking.price?.toFixed(2) || '200.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Platform Commission</span>
                <span className="font-semibold text-emerald-700">₹0.00 (Coop 0%)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 border-t border-slate-100 pt-2">
                <span>Welfare Allocation</span>
                <span>5% (Included)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-2">
                <span>Total Amount</span>
                <span className="text-emerald-700">₹{booking.price?.toFixed(2) || '200.00'}</span>
              </div>
            </div>
          </div>

          {/* Contextual Action Button */}
          {booking.status === 'COMPLETED' ? (
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/customer/payment/${booking.id}`)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-colors"
              >
                <CreditCard className="w-4 h-4" /> Proceed to Payment
              </button>
              <button
                onClick={() => navigate(`/customer/rating/${booking.id}`)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Rate Service Experience
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
              Payment is unlocked immediately after the worker finishes the task.
            </div>
          )}
        </div>
      </div>

      {/* CORE SIH 26089 SHOWCASE: FAIR MATCHING SYSTEM */}
      {booking.status === 'PENDING' && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Explainable Algorithmic Equity Engine
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Fair Matching Recommendations</h2>
              <p className="text-xs text-slate-500">
                Unlike nearest-driver commercial algorithms, our cooperative engine matches skill competence, verified status, and geographic proximity to prevent worker exhaustion and ensure optimal service delivery.
              </p>
            </div>
          </div>

          {matchLoading ? (
            <LoadingSpinner text="Querying available verified workers and calculating fairness scores..." />
          ) : bestMatch ? (
            <div className="space-y-6">
              {/* Top Best Match Highlight */}
              <FairMatchCard match={bestMatch} isBest={true} />

              {/* Other Matching Candidates */}
              {allMatches.length > 1 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-500" /> Alternate Verified Candidates ({allMatches.length - 1})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allMatches
                      .filter((m) => m.workerId !== bestMatch.workerId)
                      .map((alt) => (
                        <FairMatchCard key={alt.workerId} match={alt} isBest={false} />
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <Clock className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="text-base font-bold text-amber-900">Matching in progress</h4>
              <p className="text-xs text-amber-700 max-w-md mx-auto">
                No verified worker with matching skills is currently marked as AVAILABLE in this zone. Our automated dispatch will assign an expert as soon as availability is updated.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
