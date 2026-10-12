import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Briefcase,
  ToggleLeft,
  Award,
  TrendingUp,
  User,
  Users,
  BarChart3,
  HeartHandshake,
  Wrench,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'CUSTOMER':
        return [
          { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/customer/services', label: 'Find Services', icon: Wrench },
          { to: '/customer/bookings', label: 'My Bookings', icon: CalendarCheck },
          { to: '/customer/payments', label: 'Payment Ledger', icon: CreditCard },
        ];
      case 'WORKER':
        return [
          { to: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/worker/jobs', label: 'My Jobs', icon: Briefcase },
          { to: '/worker/availability', label: 'Availability', icon: ToggleLeft },
          { to: '/worker/skills', label: 'My Skills', icon: Award },
          { to: '/worker/earnings', label: 'Earnings & Welfare', icon: TrendingUp },
          { to: '/worker/profile', label: 'Profile', icon: User },
        ];
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/workers', label: 'Workers', icon: Users },
          { to: '/admin/bookings', label: 'Bookings & Dispatch', icon: CalendarCheck },
          { to: '/admin/demand', label: 'Demand Analytics', icon: BarChart3 },
          { to: '/admin/welfare', label: 'Welfare Fund', icon: HeartHandshake },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {user?.role} Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
};
