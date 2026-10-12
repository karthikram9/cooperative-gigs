import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Shield, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginUser } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate phone number format (^[6-9][0-9]{9}$)
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const data = await register(name, email, phone, password);
      loginUser(data.token, data.user);
      success(`Welcome to Cooperative Gig Services, ${data.user.name}!`);
      navigate('/customer/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md shadow-emerald-200 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Customer Account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Join the community cooperative for fair, transparent local services.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-medium text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anita Sharma"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

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
                  placeholder="anita@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mobile Number (10 Digits)
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Must start with 6, 7, 8, or 9</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password (min 8 characters)
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
              className="w-full py-3.5 px-4 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
