import React, { useEffect, useState } from 'react';
import { updateMyAvailability, updateWorkerProfile } from '../../api/workers';
import { WorkerProfile } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { User, Phone, MapPin, DollarSign, Calendar, Save } from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Hyderabad');
  const [address, setAddress] = useState('Kukatpally, Phase 2');
  const [hourlyRate, setHourlyRate] = useState<number>(200);
  const [experienceYears, setExperienceYears] = useState<number>(5);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    updateMyAvailability('AVAILABLE')
      .then((data: any) => {
        setProfile(data);
        if (data.bio) setBio(data.bio);
        if (data.location) setLocation(data.location);
        if (data.address) setAddress(data.address);
        if (data.hourlyRate) setHourlyRate(data.hourlyRate);
        if (data.experienceYears) setExperienceYears(data.experienceYears);
      })
      .catch((err) => toastError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);

    try {
      const updated = await updateWorkerProfile(profile.id, {
        bio,
        location,
        address,
        hourlyRate,
        experienceYears,
      });
      setProfile(updated);
      success('Worker profile updated successfully!');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading profile details..." />;
  }

  if (!profile) {
    return <div className="text-center py-12">Worker profile not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Worker Partner Profile"
        description="Maintain your professional contact, dispatch locality, and experience record."
      />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-2xl">
            {profile.name?.charAt(0) || 'W'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
            <p className="text-xs text-slate-500">{profile.email} • {profile.phone}</p>
            <div className="mt-1 flex gap-2">
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                {profile.verificationStatus}
              </span>
              <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                {profile.availabilityStatus}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Service Zone / City
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Street Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Experience (Years)
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={0}
                  max={50}
                  required
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Standard Hourly Rate (₹)
              </label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={50}
                  step={10}
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Professional Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your trade background, certifications, and work ethic..."
              className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
