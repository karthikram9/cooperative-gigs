import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookingById } from '../../api/bookings';
import { getPaymentByJobId, createPayment, processPayment } from '../../api/payments';
import { recordWelfareDeduction } from '../../api/welfare';
import { BookingResponse, PaymentResponse, WelfareResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { CreditCard, CheckCircle2, ShieldCheck, HeartHandshake, ArrowRight, Star } from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [welfare, setWelfare] = useState<WelfareResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COOP_WALLET'>('UPI');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const b = await getBookingById(bookingId);
        setBooking(b);

        // Check if payment already initiated for this booking's job
        // Note: Booking has workerId or we can look up payment by booking ID or job
        // Let's check payment by booking/job
        try {
          // If booking has an id, we query payment by job ID (for 1-to-1 booking-job in MVP, jobId matches bookingId)
          const existingPayment = await getPaymentByJobId(bookingId);
          setPayment(existingPayment);
        } catch {
          // No payment created yet
        }
      } catch (err) {
        toastError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookingId]);

  const handlePay = async () => {
    if (!booking) return;
    setProcessing(true);

    try {
      let activePayment = payment;

      // 1. Create payment ledger entry if not existing
      if (!activePayment) {
        activePayment = await createPayment({
          jobId: booking.id, // In SIH MVP job maps to booking id
          amount: booking.price || 200,
          paymentMethod: paymentMethod,
        });
        setPayment(activePayment);
      }

      // 2. Process payment state transition PENDING -> SUCCESS
      if (activePayment.paymentStatus !== 'SUCCESS') {
        const paidResult = await processPayment(activePayment.id);
        setPayment(paidResult);
        activePayment = paidResult;
      }

      // 3. Trigger statutory 5% cooperative welfare deduction
      try {
        const w = await recordWelfareDeduction(activePayment.id);
        setWelfare(w);
      } catch {
        // Welfare deduction might already be recorded or handled
      }

      success('Payment successfully processed through cooperative ledger!');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading payment settlement details..." />;
  }

  if (!booking) {
    return <div className="text-center py-12">Booking not found.</div>;
  }

  const isPaid = payment?.paymentStatus === 'SUCCESS';
  const baseAmount = booking.price || 200;
  const welfareAmount = (baseAmount * 0.05).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Service Settlement"
        description={`Payment for Booking #${booking.id} (${booking.serviceName})`}
        badge={<StatusBadge status={isPaid ? 'SUCCESS' : 'PENDING'} />}
      />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Ledger Status Notice */}
        {isPaid ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Settlement Completed Successfully
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Transaction reference: <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono">{payment.transactionReference || 'TXN-COOP-' + payment.id}</code>
            </p>

            {/* Welfare Transparency Box */}
            <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-slate-700 flex items-start gap-2.5">
              <HeartHandshake className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Cooperative Social Security Contribution:</strong> ₹{welfareAmount} (5%) has been credited to the worker welfare pool for healthcare and contingency security.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => navigate(`/customer/rating/${booking.id}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                <Star className="w-4 h-4 fill-white" /> Rate Service Experience
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Bill Breakdown */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Invoice Breakdown</h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">{booking.serviceName} Standard Trade Service</span>
                  <span className="font-semibold text-slate-900">₹{baseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Cooperative Platform Fee</span>
                  <span className="text-emerald-700 font-bold">₹0.00 (Zero Commission)</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Worker Social Welfare Allocation (5%)</span>
                  <span>₹{welfareAmount} (Included)</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-base text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-emerald-700">₹{baseAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Simulated Payment Method (MVP Ledger)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'UPI / QR' },
                  { id: 'CARD', label: 'Debit Card' },
                  { id: 'COOP_WALLET', label: 'Coop Wallet' },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      paymentMethod === m.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                This transaction settles against the Spring Boot PostgreSQL Payment Ledger.
              </p>
            </div>

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              {processing ? 'Recording Settlement...' : `Pay ₹${baseAmount.toFixed(2)} & Disburse Funds`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
