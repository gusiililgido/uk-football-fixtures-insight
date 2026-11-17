import React from 'react';
import {
  Flame,
  Crown,
  Lock,
  CheckCircle2,
  TrendingUp,
  Users,
  MessageCircle,
  Send,
  Sparkles,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { AppSettings, SpotlightMedia } from '../types';
import { ActiveTab } from './Layout';

interface HomeViewProps {
  spotlight: SpotlightMedia;
  settings: AppSettings;
  onNavigate: (tab: ActiveTab) => void;
  totalPredictionsCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  spotlight,
  settings,
  onNavigate,
  totalPredictionsCount,
}) => {
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5">
      {/* 1. Premium Obsidian & Royal Blue Hero Card */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0B0F19] via-[#111827] to-blue-950 text-white p-5 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            98% Analysis Accuracy
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-blue-200 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            {todayFormatted}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
          Professional U.K. Football Fixtures & Statistical Match Insights
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Data-driven match analysis across Premier League, EFL Championship, and elite fixtures. Explore daily free insights or unlock high-odds curated analysis slips.
        </p>

        {/* Quick Action Tier Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => onNavigate('FREE')}
            className="bg-white text-[#0B0F19] hover:bg-blue-50 font-extrabold text-xs py-2.5 px-2 rounded-xl shadow flex flex-col items-center justify-center transition"
          >
            <Flame className="w-4 h-4 text-red-600 mb-1" />
            <span>Daily Free</span>
            <span className="text-[10px] font-semibold text-blue-700">2 - 5 Odds</span>
          </button>

          <button
            onClick={() => onNavigate('DAY_DEAL')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-2 rounded-xl shadow flex flex-col items-center justify-center border border-blue-400/30 transition"
          >
            <Lock className="w-4 h-4 text-amber-300 mb-1" />
            <span>Day Deal</span>
            <span className="text-[10px] font-semibold text-blue-100">
              {settings.dayDealPrice}/= • 20-70 Odds
            </span>
          </button>

          <button
            onClick={() => onNavigate('VIP_MONTHLY')}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 px-2 rounded-xl shadow flex flex-col items-center justify-center transition"
          >
            <Crown className="w-4 h-4 text-amber-200 mb-1" />
            <span>VIP Monthly</span>
            <span className="text-[10px] font-semibold text-red-100">
              {settings.vipMonthlyPrice}/= • 70-100 Odds
            </span>
          </button>
        </div>
      </section>

      {/* 2. Large Admin Spotlight Media Card (Image / Video / Guide) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="bg-[#0B0F19] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">
              {spotlight.badgeText || 'FEATURED MATCHDAY SPOTLIGHT'}
            </span>
          </div>
          <span className="text-[11px] text-blue-300 font-medium">{spotlight.updatedAt}</span>
        </div>

        {/* Media Display Area */}
        {spotlight.mediaType === 'video' && spotlight.mediaUrl ? (
          <div className="bg-black aspect-video w-full">
            <video
              src={spotlight.mediaUrl}
              controls
              className="w-full h-full object-cover"
            />
          </div>
        ) : spotlight.mediaType === 'image' && spotlight.mediaUrl ? (
          <div className="relative aspect-video sm:aspect-[21/9] w-full bg-slate-900 overflow-hidden">
            <img
              src={spotlight.mediaUrl}
              alt={spotlight.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/80 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
              Official Matchday Brief
            </span>
          </div>
        ) : null}

        <div className="p-4">
          <h3 className="text-base sm:text-lg font-extrabold text-[#0B0F19]">
            {spotlight.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">
            {spotlight.description}
          </p>
        </div>
      </section>

      {/* 3. Live Stats Strip */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-base font-black text-[#0B0F19]">98%</div>
          <div className="text-[11px] font-medium text-slate-500">Analysis Rate</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <Flame className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <div className="text-base font-black text-[#0B0F19]">{totalPredictionsCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Active Slips</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <div className="text-base font-black text-[#0B0F19]">24/7</div>
          <div className="text-[11px] font-medium text-slate-500">Live Desk</div>
        </div>
      </section>

      {/* 4. Pinned Benefits & Trust Card */}
      <section className="bg-white rounded-2xl border-2 border-blue-600/20 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-blue-700">
            Why Members Trust U.K Fixtures Insight
          </h3>
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            PINNED
          </span>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>98% Historical Research Accuracy:</strong> Every fixture is filtered by team news, xG form, and head-to-head data.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Clear Tier Options:</strong> Start with Daily Free (2–5 Odds), upgrade to Day Deal ({settings.dayDealPrice}/= for 20–70 Odds), or unlock VIP Monthly ({settings.vipMonthlyPrice}/= for 70–100 Odds).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Instant WhatsApp Activation:</strong> Fast manual verification and direct analyst support whenever you need help.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              <strong>18+ Analysis Only:</strong> Strictly non-gambling educational match research. No staking or betting inside the app.
            </span>
          </li>
        </ul>
      </section>

      {/* 5. Official Community Links Card */}
      <section className="bg-[#0B0F19] text-white rounded-2xl p-4 shadow-md border border-slate-800">
        <h3 className="text-sm font-extrabold tracking-wide">
          Join Our Official Matchday Channels
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Get instant match alerts, free slip notifications, and live community updates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
          <a
            href={settings.whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Join Official WhatsApp Group</span>
          </a>

          <a
            href={settings.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition"
          >
            <Send className="w-4 h-4" />
            <span>Join Telegram Channel</span>
          </a>
        </div>
      </section>
    </div>
  );
};
