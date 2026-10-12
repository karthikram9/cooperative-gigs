import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Shield, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginUser } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      loginUser(data.token, data.user);
      success(`Welcome back, ${data.user.name}!`);

      // Role-based redirection
      if (data.user.role === 'CUSTOMER') {
        navigate('/customer/dashboard');
      } else if (data.user.role === 'WORKER') {
        navigate('/worker/dashboard');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role: 'admin' | 'worker' | 'customer') => {
    if (role === 'admin') {
      setEmail('admin@cooperativegig.com');
      setPassword('AdminPassword123');
    } else if (role === 'worker') {
      setEmail('ramesh@worker.com');
      setPassword('WorkerPassword123');
    } else {
      setEmail('anita.sharma@example.com');
      setPassword('CustomerPass123');
    }
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md shadow-emerald-200 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Access your cooperative services, worker dispatch, or admin console.
          </p>
        </div>

        {searchParams.get('expired') && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 text-center">
            Your session has expired. Please log in again to continue.
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-medium text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons for SIH Presentation */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Presentation Quick-Fill
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('customer')}
                className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('worker')}
                className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Worker
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/60 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500">
          Do not have an account yet?{' '}
          <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Register as Customer
          </Link>
        </p>
      </div>
    </div>
  );
};
