import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Shield } from 'lucide-react';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">Cooperative Gig Services</span>
            <span>— SIH 26089 Model Platform</span>
          </div>
          <p>© 2026 Cooperative Gig Services. Transparent algorithmic matching & welfare fund equity.</p>
        </div>
      </footer>
    </div>
  );
};
