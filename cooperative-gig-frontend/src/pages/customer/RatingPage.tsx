import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookingById } from '../../api/bookings';
import { submitRating, getWorkerRatingSummary } from '../../api/ratings';
import { BookingResponse, RatingSummaryResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { RatingStars } from '../../components/common/RatingStars';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Star, CheckCircle2, ArrowRight } from 'lucide-react';

export const RatingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('Punctual, highly skilled, and clean execution. Excellent cooperative service.');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [workerSummary, setWorkerSummary] = useState<RatingSummaryResponse | null>(null);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getBookingById(bookingId)
      .then((b) => setBooking(b))
      .catch((err) => toastError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setSubmitting(true);
    try {
      await submitRating({
        jobId: booking.id,
        rating: rating,
        review: review.trim(),
      });

      success('Thank you! Your verified review has been recorded.');
      setSubmitted(true);

      // If worker ID is present, fetch worker's updated summary
      if (booking.workerId) {
        getWorkerRatingSummary(booking.workerId)
          .then((s) => setWorkerSummary(s))
          .catch(() => null);
      }
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading rating screen..." />;
  }

  if (!booking) {
    return <div className="text-center py-12">Booking not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Rate Service Experience"
        description={`Rate the specialist for Booking #${booking.id} (${booking.serviceName})`}
      />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Rating Submitted!</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your transparent review helps maintain quality standards and influences future equitable dispatch algorithms.
            </p>

            {workerSummary && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-xs mx-auto text-xs space-y-1">
                <div className="font-bold text-slate-700">Worker Updated Score</div>
                <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                  ★ {workerSummary.averageRating?.toFixed(1)}
                </div>
                <div className="text-slate-400">Total verified reviews: {workerSummary.totalRatings}</div>
              </div>
            )}

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => navigate('/customer/bookings')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
              >
                Back to Bookings
              </button>
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Star Rating
              </label>
              <div className="flex justify-center py-2">
                <RatingStars value={rating} onChange={setRating} size="lg" />
              </div>
              <p className="text-sm font-semibold text-amber-600">
                {rating === 5 ? 'Excellent (5/5)' : rating === 4 ? 'Very Good (4/5)' : rating === 3 ? 'Average (3/5)' : 'Needs Improvement'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Customer Review / Feedback
              </label>
              <textarea
                required
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience regarding punctuality, skill proficiency, and work quality..."
                className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Star className="w-5 h-5 fill-white" />
              {submitting ? 'Submitting Rating...' : 'Submit Verified Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
