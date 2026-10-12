import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminWorkers, activateWorker, deactivateWorker, createAdminWorker } from '../../api/admin';
import { WorkerAdminResponse } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Users, UserPlus, Shield, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

export const AdminWorkersPage: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // New Worker Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('WorkerPass123');
  const [location, setLocation] = useState('Hyderabad');
  const [skill, setSkill] = useState('Plumbing');

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const loadWorkers = async () => {
    try {
      const data = await getAdminWorkers();
      setWorkers(data);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleToggleStatus = async (workerId: number, currentStatus: string) => {
    setActionLoading(workerId);
    try {
      if (currentStatus === 'ACTIVE') {
        await deactivateWorker(workerId);
        success('Worker deactivated.');
      } else {
        await activateWorker(workerId);
        success('Worker activated.');
      }
      loadWorkers();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createAdminWorker({
        name,
        email,
        phone,
        password,
        location,
        skills: [skill],
      });
      success(`Worker ${name} provisioned successfully!`);
      setModalOpen(false);
      setName('');
      setEmail('');
      loadWorkers();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading registered workers..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cooperative Worker Directory"
        description="Verify worker identities, monitor status, and onboard new service specialists."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" /> Onboard Worker
          </button>
        }
      />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-4 px-6">Worker Name</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Skills</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <div>{worker.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">ID #{worker.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600 space-y-0.5">
                    <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {worker.email}</div>
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {worker.phone}</div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {worker.location || 'Local Zone'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {(worker.skills || []).map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={worker.status} size="sm" />
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(worker.id, worker.status)}
                      disabled={actionLoading === worker.id}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        worker.status === 'ACTIVE'
                          ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {actionLoading === worker.id ? 'Updating...' : worker.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => navigate(`/admin/workers/${worker.id}`)}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Performance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Worker Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Onboard New Cooperative Partner">
        <form onSubmit={handleCreateWorker} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Varma"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                placeholder="9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City / Region</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Initial Trade Skill</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Carpentry">Carpentry</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {creating ? 'Registering...' : 'Provision Partner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
