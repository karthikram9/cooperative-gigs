import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../../api/services';
import { ServiceType } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getServices()
      .then((data) => setServices(data))
      .catch(() => {
        setServices([
          { id: 1, name: 'Plumbing', description: 'Certified pipe fitting, leak repair, drainage, and sanitary installation.', basePrice: 200, active: true },
          { id: 2, name: 'Electrical', description: 'Safe domestic wiring, switchboards, lighting, and circuit breaker servicing.', basePrice: 250, active: true },
          { id: 3, name: 'Cleaning', description: 'Comprehensive home deep cleaning, sanitization, and floor polishing.', basePrice: 300, active: true },
          { id: 4, name: 'Carpentry', description: 'Custom woodwork, furniture repairs, door fittings, and cabinetry.', basePrice: 250, active: true },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Catalog"
        description="Select a verified trade service category with standardized, transparent cooperative pricing."
      />

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by trade (e.g. Plumbing, Electrical)..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
        />
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching verified service types..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={() => navigate(`/customer/bookings/new?serviceId=${service.id}`)}
              actionText="Book This Trade"
            />
          ))}
        </div>
      )}
    </div>
  );
};
