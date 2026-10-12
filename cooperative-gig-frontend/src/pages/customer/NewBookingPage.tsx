import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getServices } from '../../api/services';
import { createBooking } from '../../api/bookings';
import { ServiceType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Calendar, MapPin, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export const NewBookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('serviceId') ? Number(searchParams.get('serviceId')) : undefined;

  const [services, setServices] = useState<ServiceType[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | undefined>(initialServiceId);
  const [description, setDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState('Flat 402, Green Valley Apartments');
  const [city, setCity] = useState('Hyderabad');
  
  // Set default schedule date-time to tomorrow at 10:00 AM (ISO 8601 string)
  const getTomorrowDefault = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    return d.toISOString().slice(0, 16);
  };

  const [scheduledDateTime, setScheduledDateTime] = useState<string>(getTomorrowDefault());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { success } = useToast();

  useEffect(() => {
    getServices()
      .then((data) => {
        setServices(data);
        if (!selectedServiceId && data.length > 0) {
          setSelectedServiceId(data[0].id);
        }
      })
      .catch(() => {
        setServices([
          { id: 1, name: 'Plumbing', description: 'Certified pipe fitting and leak repair.', basePrice: 200, active: true },
          { id: 2, name: 'Electrical', description: 'Safe domestic wiring and electrical repairs.', basePrice: 250, active: true },
          { id: 3, name: 'Cleaning', description: 'Comprehensive home deep cleaning.', basePrice: 300, active: true },
          { id: 4, name: 'Carpentry', description: 'Custom woodwork and furniture repairs.', basePrice: 250, active: true },
        ]);
        if (!selectedServiceId) setSelectedServiceId(1);
      })
      .finally(() => setLoading(false));
  }, [selectedServiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) {
      setError('Please select a service trade.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe the required work.');
      return;
    }
    if (!serviceAddress.trim()) {
      setError('Please provide the service address.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Backend expects ISO LocalDateTime (e.g. "2026-09-12T10:00:00")
      const formattedDate = scheduledDateTime.length === 16 ? `${scheduledDateTime}:00` : scheduledDateTime;

      const booking = await createBooking({
        serviceTypeId: selectedServiceId,
        description: description.trim(),
        serviceAddress: serviceAddress.trim(),
        city: city.trim(),
        scheduledDateTime: formattedDate,
      });

      success(`Booking #${booking.id} created successfully in PENDING status!`);
      // Immediately navigate to booking details to showcase FAIR MATCHING!
      navigate(`/customer/bookings/${booking.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);

  if (loading) {
    return <LoadingSpinner fullScreen text="Preparing booking form..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Create Service Request"
        description="Request a verified trade specialist. Our algorithmic engine will identify the fairest available match."
      />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-medium text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Service Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {services.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedServiceId === s.id
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="font-bold text-sm">{s.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">₹{s.basePrice?.toFixed(0)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Describe the Issue or Task
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Major kitchen sink drain blockage causing water backup, needs snaking or pipe inspection."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Location & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Service Address
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  placeholder="Street address, apartment, flat no."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Schedule Date & Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Scheduled Date & Time
            </label>
            <div className="relative max-w-sm">
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="datetime-local"
                required
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Must be a future schedule time.</p>
          </div>

          {/* Price & Welfare Transparency Summary */}
          {selectedService && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Transparent Standardized Pricing
                </div>
                <p className="text-xs text-slate-500">
                  Includes worker compensation and automated 5% social welfare contribution pool.
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-slate-400 uppercase font-semibold">Estimated Total</div>
                <div className="text-2xl font-black text-emerald-700">₹{selectedService.basePrice?.toFixed(2)}</div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Submitting & Running Match Engine...' : 'Confirm Request & Find Fair Matches'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
