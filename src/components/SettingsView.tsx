import React, { useState } from 'react';
import {
  User,
  Crown,
  Bell,
  MessageCircle,
  Send,
  Headphones,
  LayoutDashboard,
  CheckCircle2,
  ShieldCheck,
  LogIn,
  ArrowUpRight,
} from 'lucide-react';
import { AppSettings, PredictionTier, UserProfile } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile | null;
  settings: AppSettings;
  announcements: string[];
  onOpenAuth: () => void;
  onOpenPayment: (tier: Exclude<PredictionTier, 'FREE'>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  settings,
  announcements,
  onOpenAuth,
  onOpenPayment,
}) => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const tierLabel =
    currentUser?.tier === 'VIP_MONTHLY'
      ? 'VIP MONTHLY (70 - 100 ODDS)'
      : currentUser?.tier === 'DAY_DEAL'
      ? 'DAY DEAL (20 - 70 ODDS)'
      : 'DAILY FREE MEMBER (2 - 5 ODDS)';

  const supportUrl = `https://` + `wa.me/${settings.supportWhatsappNumber}?text=${encodeURIComponent(
    'Hello U.K FOOTBALL FIXTURES INSIGHT Support! I need assistance with my account.'
  )}`;

  return (
    <div className="space-y-4">
      {/* 1. User Dashboard & Profile Header */}
      <section className="bg-[#0B0F19] text-white rounded-2xl p-4 shadow-lg border border-blue-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-lg border border-blue-400/40">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Member Dashboard & Profile
                </span>
              </div>
              <h2 className="text-base font-black mt-0.5">
                {currentUser ? currentUser.name : 'Guest Visitor'}
              </h2>
              <p className="text-xs text-slate-400">
                {currentUser ? currentUser.email : 'Sign in to sync your VIP membership'}
              </p>
            </div>
          </div>

          {!currentUser && (
            <button
              onClick={onOpenAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Membership Status Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black uppercase tracking-wide text-[#0B0F19]">
              Membership Status
            </h3>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            ACTIVE
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Current Access Tier</div>
            <div className="text-sm font-black text-blue-700 mt-0.5">{tierLabel}</div>
            {currentUser?.expiresAt && currentUser.tier !== 'FREE' && (
              <div className="text-[11px] text-slate-500 mt-0.5">
                Valid Until: <strong>{currentUser.expiresAt}</strong>
              </div>
            )}
          </div>
          <ShieldCheck className="w-7 h-7 text-blue-600 shrink-0" />
        </div>

        {/* Upgrade Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onOpenPayment('DAY_DEAL')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition"
          >
            <span>Day Deal ({settings.dayDealPrice}/=)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onOpenPayment('VIP_MONTHLY')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition"
          >
            <span>VIP Monthly ({settings.vipMonthlyPrice}/=)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 3. Notifications & Live Desk Announcements */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-black uppercase tracking-wide text-[#0B0F19]">
              Notifications & Desk Alerts
            </h3>
          </div>
          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`text-[11px] font-extrabold px-3 py-1 rounded-full transition ${
              alertsEnabled
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {alertsEnabled ? 'ALERTS ON' : 'ALERTS OFF'}
          </button>
        </div>

        <div className="space-y-2">
          {announcements.map((note, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 text-xs text-slate-700"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Join Official Groups & Direct WhatsApp Support */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
        <h3 className="text-sm font-black uppercase tracking-wide text-[#0B0F19] mb-1">
          Official Channels & 24/7 Support
        </h3>

        <a
          href={settings.whatsappGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition"
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>Join Official WhatsApp Group</span>
          </span>
          <ArrowUpRight className="w-4 h-4" />
        </a>

        <a
          href={settings.telegramChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition"
        >
          <span className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span>Join Official Telegram Channel</span>
          </span>
          <ArrowUpRight className="w-4 h-4" />
        </a>

        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between bg-[#0B0F19] hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition"
        >
          <span className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-red-500" />
            <span>Support / Help Direct WhatsApp ({settings.supportWhatsappNumber})</span>
          </span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </section>
    </div>
  );
};
