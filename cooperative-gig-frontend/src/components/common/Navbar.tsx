import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Menu, X, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = () => {
    if (user?.role === 'CUSTOMER') return '/customer/dashboard';
    if (user?.role === 'WORKER') return '/worker/dashboard';
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200 group-hover:bg-emerald-700 transition-colors">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">CooperativeGig</span>
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                SIH 26089
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none">Fair Community Services</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <Link to="/customer/services" className="hover:text-emerald-600 transition-colors">Services</Link>
          {isAuthenticated && (
            <Link to={getDashboardPath()} className="text-emerald-700 font-semibold hover:text-emerald-800 transition-colors">
              My Dashboard
            </Link>
          )}
        </nav>

        {/* User / Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <UserIcon className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-800">{user.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-white text-emerald-800 border font-bold uppercase text-[10px]">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : !isAuthPage ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-200"
              >
                Register
              </button>
            </div>
          ) : null}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/customer/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Service Catalog
          </Link>

          {isAuthenticated && user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="px-3 text-xs text-slate-500">
                Logged in as <strong className="text-slate-800">{user.name}</strong> ({user.role})
              </div>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50"
              >
                Open Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-medium rounded-xl border border-slate-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
