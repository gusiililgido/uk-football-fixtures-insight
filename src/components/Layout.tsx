import React, { useEffect, useState } from 'react';
import {
  Home,
  Flame,
  Crown,
  Settings,
  ShieldCheck,
  Radio,
  LogIn,
  LogOut,
  Lock,
} from 'lucide-react';
import { ADMIN_EMAIL } from '../data/initialData';

export type ActiveTab = 'HOME' | 'FREE' | 'DAY_DEAL' | 'VIP_MONTHLY' | 'SETTINGS' | 'ADMIN' | 'LEGAL';

interface LayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  liveTickerText: string;
  currentUserEmail: string | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  setActiveTab,
  liveTickerText,
  currentUserEmail,
  onOpenAuth,
  onLogout,
  children,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin = currentUserEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const formattedDate = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-[#0B0F19] pb-20">
      {/* Top Obsidian Black Brand Header */}
      <header className="sticky top-0 z-40 bg-[#0B0F19] text-white shadow-lg border-b border-blue-900/50">
        <div className="max-w-3xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
          <div
            onClick={() => setActiveTab('HOME')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border border-blue-400/30 shadow">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-none text-white">
                U.K FOOTBALL <span className="text-blue-400">FIXTURES</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold tracking-widest uppercase text-red-500">
                  INSIGHT
                </span>
                <span className="text-[10px] text-slate-400">• 98% ANALYTICS</span>
              </div>
            </div>
          </div>

          {/* Live Date, Clock & Auth Button */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>{formattedTime}</span>
              </div>
              <div className="text-[10px] text-slate-400">{formattedDate}</div>
            </div>

            {currentUserEmail ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 bg-slate-800 hover:bg-red-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Date Bar for Phones + Crimson Live Ticker */}
        <div className="bg-blue-950/90 border-t border-blue-900/60 px-3 py-1 flex items-center justify-between text-[11px] text-blue-100">
          <div className="flex items-center gap-1.5 shrink-0 font-bold text-red-400 mr-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE</span>
          </div>
          <div className="truncate font-medium">{liveTickerText}</div>
          <div className="shrink-0 ml-2 font-mono text-[10px] text-blue-300 sm:hidden">
            {formattedTime}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 py-4">{children}</main>

      {/* Mandatory 18+ Non-Gambling Compliance Footer */}
      <footer className="max-w-3xl w-full mx-auto px-3 py-6 mt-4 border-t border-slate-200 text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-blue-700 pb-2">
          <button onClick={() => setActiveTab('LEGAL')} className="hover:underline cursor-pointer">Match Reports</button>
          <span>•</span>
          <button onClick={() => setActiveTab('LEGAL')} className="hover:underline cursor-pointer">About Us</button>
          <span>•</span>
          <button onClick={() => setActiveTab('LEGAL')} className="hover:underline cursor-pointer">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => setActiveTab('LEGAL')} className="hover:underline cursor-pointer">Terms</button>
          <span>•</span>
          <button onClick={() => setActiveTab('LEGAL')} className="hover:underline cursor-pointer">Contact</button>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full">
          <span>18+ ONLY</span>
          <span>•</span>
          <span>SPORTS ANALYSIS PLATFORM</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-xl mx-auto">
          <strong>Disclaimer:</strong> U.K Football Fixtures Insight provides independent statistical match analysis only. This is <strong>not a gambling or betting app</strong>. No staking or wagering is permitted inside this platform, and past accuracy does not guarantee 100% future outcomes. Users only purchase analyzed match insights.
        </p>
        <p className="text-[11px] text-slate-400">
          © {now.getFullYear()} U.K FOOTBALL FIXTURES INSIGHT. All Rights Reserved.
        </p>
      </footer>

      {/* Expert Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0B0F19] border-t border-slate-800 shadow-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-around py-1.5 px-1">
          <NavButton
            active={activeTab === 'HOME'}
            onClick={() => setActiveTab('HOME')}
            icon={<Home className="w-4 h-4" />}
            label="Home"
          />
          <NavButton
            active={activeTab === 'FREE'}
            onClick={() => setActiveTab('FREE')}
            icon={<Flame className="w-4 h-4" />}
            label="Free 2-5"
          />
          <NavButton
            active={activeTab === 'DAY_DEAL'}
            onClick={() => setActiveTab('DAY_DEAL')}
            icon={<Lock className="w-4 h-4 text-amber-400" />}
            label="Day 350/="
          />
          <NavButton
            active={activeTab === 'VIP_MONTHLY'}
            onClick={() => setActiveTab('VIP_MONTHLY')}
            icon={<Crown className="w-4 h-4 text-blue-400" />}
            label="VIP 3500/="
          />
          <NavButton
            active={activeTab === 'SETTINGS'}
            onClick={() => setActiveTab('SETTINGS')}
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
          />
          {/* INVISIBLE ADMIN BUTTON: Only renders for jinxzenicon254@gmail.com */}
          {isAdmin && (
            <NavButton
              active={activeTab === 'ADMIN'}
              onClick={() => setActiveTab('ADMIN')}
              icon={<ShieldCheck className="w-4 h-4 text-red-500" />}
              label="Admin"
              isAdminBtn
            />
          )}
        </div>
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isAdminBtn?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  isAdminBtn,
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition min-w-[54px] ${
      active
        ? isAdminBtn
          ? 'bg-red-600 text-white font-bold'
          : 'bg-blue-600 text-white font-bold'
        : 'text-slate-400 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-[10px] mt-0.5 tracking-tight">{label}</span>
  </button>
);
