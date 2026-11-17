import React, { useState } from 'react';
import {
  ShieldCheck,
  Home,
  Flame,
  Zap,
  Crown,
  Settings,
  Lock,
  LogIn,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  HelpCircle,
  BookOpen,
  Download,
  Bell,
} from 'lucide-react';
import { ADMIN_EMAIL } from '../data/initialData';

export type ActiveTab =
  | 'HOME'
  | 'FREE'
  | 'DAY_DEAL'
  | 'VIP_MONTHLY'
  | 'SETTINGS'
  | 'ADMIN'
  | 'LEGAL'
  | 'FAQ';

interface LayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onGoBack: () => void;
  canGoBack: boolean;
  liveTickerText: string;
  currentUserEmail: string | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onInstallApp: () => void;
  onRequestNotifications: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  setActiveTab,
  onGoBack,
  canGoBack,
  liveTickerText,
  currentUserEmail,
  onOpenAuth,
  onLogout,
  onInstallApp,
  onRequestNotifications,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAdmin =
    Boolean(currentUserEmail) &&
    currentUserEmail!.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
  };
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-[#0B0F19]">
      <header className="sticky top-0 z-40 bg-[#0B0F19] text-white border-b border-blue-900/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shrink-0 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {canGoBack && activeTab !== 'HOME' && (
              <button
                onClick={onGoBack}
                className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 shrink-0 cursor-pointer"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div
              onClick={() => navigateTo('HOME')}
              className="flex items-center gap-2 cursor-pointer select-none min-w-0"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-inner border border-blue-400/40 shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="truncate">
                <h1 className="text-xs sm:text-sm font-extrabold tracking-tight leading-none text-white truncate">
                  U.K FOOTBALL <span className="text-red-500">FIXTURES</span> INSIGHT
                </h1>
                <p className="text-[9px] text-blue-300 font-medium tracking-wider uppercase mt-0.5 truncate">
                  98% Statistical Match Analysis • 18+
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {currentUserEmail ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs font-semibold bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-700 text-white text-[11px] font-semibold py-1 px-3 overflow-hidden whitespace-nowrap border-t border-blue-500/30">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <span className="bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
              LIVE
            </span>
            <span className="truncate">{liveTickerText}</span>
          </div>
        </div>
      </header>

      {/* Slide-Out Navigation Menu Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex">
          <div className="w-72 max-w-[82vw] bg-[#0B0F19] text-white h-full flex flex-col justify-between p-4 border-r border-slate-800 shadow-2xl">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Navigation Menu
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {[
                  { id: 'HOME', label: 'Home Spotlight', icon: <Home className="w-4 h-4 text-blue-400" /> },
                  { id: 'FREE', label: 'Daily Free (2 - 5 Odds)', icon: <Flame className="w-4 h-4 text-emerald-400" /> },
                  { id: 'DAY_DEAL', label: 'Day Deal VIP (20 - 70 Odds)', icon: <Zap className="w-4 h-4 text-amber-400" /> },
                  { id: 'VIP_MONTHLY', label: 'VIP Monthly (70 - 100 Odds)', icon: <Crown className="w-4 h-4 text-red-500" /> },
                  { id: 'LEGAL', label: 'Match Reports & Policies', icon: <BookOpen className="w-4 h-4 text-blue-300" /> },
                  { id: 'FAQ', label: 'Help & FAQ (HAQ)', icon: <HelpCircle className="w-4 h-4 text-amber-300" /> },
                  { id: 'SETTINGS', label: 'Profile, Wallet & Settings', icon: <Settings className="w-4 h-4 text-slate-300" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id as ActiveTab)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                {isAdmin && (
                  <button
                    onClick={() => navigateTo('ADMIN')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black bg-red-600 text-white shadow mt-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Invisible Admin Center</span>
                  </button>
                )}
              </nav>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onInstallApp();
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download App to Phone</span>
              </button>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onRequestNotifications();
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Enable Push Alerts</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 pt-4 pb-24">
        {children}
      </main>

      <footer className="max-w-4xl w-full mx-auto px-3 pb-24 text-center text-[11px] text-slate-500 space-y-1">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-blue-700 pb-2">
          <button onClick={() => navigateTo('FAQ')} className="hover:underline cursor-pointer">FAQ / Help</button>
          <span>•</span>
          <button onClick={() => navigateTo('LEGAL')} className="hover:underline cursor-pointer">Match Reports</button>
          <span>•</span>
          <button onClick={() => navigateTo('LEGAL')} className="hover:underline cursor-pointer">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => navigateTo('LEGAL')} className="hover:underline cursor-pointer">Terms</button>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-red-600/10 text-red-700 border border-red-600/20 px-3 py-1 rounded-full font-bold">
          <span>18+ ONLY</span>
          <span>•</span>
          <span>MATCH ANALYSIS &amp; RESEARCH ONLY</span>
        </div>
        <p className="pt-1">
          No real-money gambling or wagering takes place inside U.K FOOTBALL FIXTURES INSIGHT.
        </p>
      </footer>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0B0F19] border-t border-slate-800 text-slate-300 shadow-2xl">
        <div className="max-w-4xl mx-auto grid grid-cols-5 sm:flex sm:justify-around items-center py-1.5 px-1">
          <button onClick={() => navigateTo("HOME")} className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition cursor-pointer ${activeTab === "HOME" ? "text-blue-400 font-bold" : "hover:text-white"}`}>
            <Home className="w-5 h-5" /><span className="text-[10px] mt-0.5">Home</span>
          </button>
          <button onClick={() => navigateTo("FREE")} className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition cursor-pointer ${activeTab === "FREE" ? "text-blue-400 font-bold" : "hover:text-white"}`}>
            <Flame className="w-5 h-5 text-red-500" /><span className="text-[10px] mt-0.5">Free 2-5</span>
          </button>
          <button onClick={() => navigateTo("DAY_DEAL")} className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition cursor-pointer ${activeTab === "DAY_DEAL" ? "text-blue-400 font-bold" : "hover:text-white"}`}>
            <Zap className="w-5 h-5 text-amber-400" /><span className="text-[10px] mt-0.5">Day 350/=</span>
          </button>
          <button onClick={() => navigateTo("VIP_MONTHLY")} className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition cursor-pointer ${activeTab === "VIP_MONTHLY" ? "text-blue-400 font-bold" : "hover:text-white"}`}>
            <Crown className="w-5 h-5 text-amber-300" /><span className="text-[10px] mt-0.5">VIP 3500/=</span>
          </button>
          {isAdmin ? (
            <button onClick={() => navigateTo("ADMIN")} className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition cursor-pointer ${activeTab === "ADMIN" ? "text-red-400 font-extrabold" : "text-red-400/80 hover:text-red-300"}`}>
              <Lock className="w-5 h-5" /><span className="text-[10px] mt-0.5">Admin</span>
            </button>
          ) : (
            <button onClick={() => navigateTo("SETTINGS")} className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition cursor-pointer ${activeTab === "SETTINGS" ? "text-blue-400 font-bold" : "hover:text-white"}`}>
              <Settings className="w-5 h-5" /><span className="text-[10px] mt-0.5">Settings</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
