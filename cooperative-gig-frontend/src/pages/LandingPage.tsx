import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getServices } from '../api/services';
import { ServiceType } from '../types';
import { ServiceCard } from '../components/customer/ServiceCard';
import { ShieldCheck, Scale, HeartHandshake, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const LandingPage: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getServices()
      .then((data) => setServices(data))
      .catch(() => {
        // Fallback to seeded services if unauthenticated / offline
        setServices([
          { id: 1, name: 'Plumbing', description: 'Certified pipe fitting, leak repair, drainage, and sanitary installation.', basePrice: 200, active: true },
          { id: 2, name: 'Electrical', description: 'Safe domestic wiring, switchboards, lighting, and circuit breaker servicing.', basePrice: 250, active: true },
          { id: 3, name: 'Cleaning', description: 'Comprehensive home deep cleaning, sanitization, and floor polishing.', basePrice: 300, active: true },
          { id: 4, name: 'Carpentry', description: 'Custom woodwork, furniture repairs, door fittings, and cabinetry.', basePrice: 250, active: true },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <Scale className="w-3.5 h-3.5" /> Smart India Hackathon — SIH 26089 Model
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Fair, transparent and <br className="hidden sm:block" />
            <span className="text-emerald-700">cooperative local services.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminating middleman platform exploitation. Connect with verified service professionals through explainable fair matching and community welfare equity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/customer/services')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-md shadow-emerald-200 transition-all hover:-translate-y-0.5"
            >
              Find a Service
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-sm transition-all"
            >
              Register as Customer
            </button>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Why Cooperative Gig Services?</h2>
          <p className="text-sm text-slate-500 mt-2">
            A cooperative model engineered for transparency, worker protection, and customer trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Verified Workers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every worker is verified with validated skill proficiencies, phone records, and police vetting.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Explainable Fair Matching</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our transparent dispatch algorithm weights skill competency and proximity while rotating opportunities fairly.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Standardized Pricing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent service base prices prevent predatory surge pricing or arbitrary platform commissions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Cooperative Welfare Fund</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              A 5% allocation from completed jobs directly builds a worker health, emergency, and social security pool.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Available Services</h2>
            <p className="text-sm text-slate-500 mt-1">Book trusted neighborhood experts with transparent rates.</p>
          </div>
          <Link
            to="/customer/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Browse Full Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading verified services..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={() => navigate(`/customer/bookings/new?serviceId=${service.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Demonstration Pathway Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="max-w-3xl">
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Ready to experience transparent community gig services?</h3>
            <p className="text-sm text-emerald-100 mb-6 leading-relaxed">
              Experience the end-to-end flow: from automated dispatch with transparent match explanation to job completion, simulated payment ledger, and cooperative welfare contribution.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-5 py-3 rounded-xl bg-white text-emerald-900 font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-sm"
              >
                Create Customer Account
              </Link>
              <Link
                to="/login"
                className="px-5 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-sm border border-emerald-700 transition-colors"
              >
                Sign In to Existing Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
