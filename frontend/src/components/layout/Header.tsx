import React from 'react';
import { Menu, Bell, Search, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, title }) => {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-lg font-bold tracking-tight text-slate-900 hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotations, subscriptions..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#183630] focus:bg-white transition"
          />
        </div>

        {/* Currency / Hackathon badge */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#183630]/10 text-[#183630] px-3 py-1 rounded-full text-xs font-bold border border-[#183630]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#183630]" />
          <span>INR (₹) Enabled</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#183630] ring-2 ring-white" />
          </button>
        </div>

        {/* User initials circle */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#183630] text-[#E5C690] font-black text-xs flex items-center justify-center border border-[#183630]/20 shadow-xs">
            {user?.name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-slate-800 leading-tight">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <span className="block text-[10px] text-slate-400 capitalize">
              {user?.role || 'staff'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
