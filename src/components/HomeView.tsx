import React, { useEffect, useRef } from 'react';
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
  Download,
  Bell,
  PlayCircle,
  Wallet,
  Heart,
  Eye,
  ZoomIn,
} from 'lucide-react';
import { AppSettings, HomeFeedPost, Prediction, SpotlightMedia } from '../types';
import { ActiveTab } from './Layout';
import { GoogleAdBanner } from './GoogleAdBanner';

interface HomeViewProps {
  spotlight: SpotlightMedia;
  homePosts: HomeFeedPost[];
  likedIds: string[];
  onToggleLike: (id: string) => void;
  onIncrementViews: () => void;
  topPrediction?: Prediction;
  settings: AppSettings;
  onNavigate: (tab: ActiveTab) => void;
  totalPredictionsCount: number;
  walletBalance: number;
  dailyRewardClaimed: boolean;
  onWatchAdForWallet: () => void;
  canInstallApp: boolean;
  onInstallApp: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotifications: () => void;
  onPreviewImage: (url: string, title: string, subtitle?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  spotlight,
  homePosts,
  likedIds,
  onToggleLike,
  onIncrementViews,
  topPrediction,
  settings,
  onNavigate,
  totalPredictionsCount,
  walletBalance,
  dailyRewardClaimed,
  onWatchAdForWallet,
  canInstallApp,
  onInstallApp,
  notificationPermission,
  onRequestNotifications,
  onPreviewImage,
}) => {
  const countedView = useRef(false);

  useEffect(() => {
    if (!countedView.current) {
      countedView.current = true;
      onIncrementViews();
    }
  }, [onIncrementViews]);

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const whatsappGroupHref =
    settings.whatsappGroupUrl && settings.whatsappGroupUrl.includes('://whatsapp.com')
      ? settings.whatsappGroupUrl
      : 'https://' + '://whatsapp.comEDMcQr54KTW7D2KqrqiMkI';
  const spotlightLiked = likedIds.includes('spotlight');

  return (
    <div className="space-y-4">
      {(canInstallApp || notificationPermission === 'default') && (
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-3.5 shadow-md border border-blue-400/30 flex flex-wrap items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-300" />
              <span>Install Official Mobile App</span>
            </div>
            <p className="text-[11px] text-blue-100">
              Add to your phone screen for fast access &amp; instant matchday alerts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canInstallApp && (
              <button
                onClick={onInstallApp}
                className="bg-white text-[#0B0F19] hover:bg-amber-300 font-black text-xs px-3.5 py-2 rounded-xl shadow transition cursor-pointer"
              >
                Download App
              </button>
            )}
            {notificationPermission === 'default' && (
              <button
                onClick={onRequestNotifications}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow flex items-center gap-1 transition cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Allow Alerts</span>
              </button>
            )}
          </div>
        </div>
      )}

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
          Professional U.K. Football Fixtures &amp; Statistical Match Insights
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Data-driven match analysis across Premier League, EFL Championship, and elite fixtures. Explore daily free insights, calendar history, or unlock high-odds curated slips.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => onNavigate('FREE')}
            className="bg-white text-[#0B0F19] hover:bg-blue-50 font-extrabold text-xs py-2.5 px-2 rounded-xl shadow flex flex-col items-center justify-center transition cursor-pointer"
          >
            <Flame className="w-4 h-4 text-red-600 mb-1" />
            <span>Daily Free</span>
            <span className="text-[10px] font-semibold text-blue-700">2 - 5 Odds</span>
          </button>

          <button
            onClick={() => onNavigate('DAY_DEAL')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-2 rounded-xl shadow flex flex-col items-center justify-center border border-blue-400/30 transition cursor-pointer"
          >
            <Lock className="w-4 h-4 text-amber-300 mb-1" />
            <span>Day Deal</span>
            <span className="text-[10px] font-semibold text-blue-100">
              {settings.dayDealPrice}/= • 20-70 Odds
            </span>
          </button>

          <button
            onClick={() => onNavigate('VIP_MONTHLY')}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 px-2 rounded-xl shadow flex flex-col items-center justify-center transition cursor-pointer"
          >
            <Crown className="w-4 h-4 text-amber-200 mb-1" />
            <span>VIP Monthly</span>
            <span className="text-[10px] font-semibold text-red-100">
              {settings.vipMonthlyPrice}/= • 70-100 Odds
            </span>
          </button>
        </div>
      </section>

      {settings.adsEnabled && (
        <section className="bg-white rounded-2xl border-2 border-emerald-600/30 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                <Wallet className="w-3 h-3" /> WALLET: KES {walletBalance}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                1x Daily Reward • Non-Withdrawable
              </span>
            </div>
            <h3 className="text-sm font-black text-[#0B0F19]">
              Watch {settings.adDurationSeconds}s Sponsored Ad &amp; Earn +KES {settings.adRewardKes}
            </h3>
            <p className="text-xs text-slate-600">
              Collect daily wallet credits to unlock <strong>Day Deal ({settings.dayDealPrice}/=)</strong> or{' '}
              <strong>VIP Monthly ({settings.vipMonthlyPrice}/=)</strong> automatically!
            </p>
          </div>

          {dailyRewardClaimed ? (
            <div className="shrink-0 bg-slate-100 border border-slate-300 text-slate-600 font-extrabold text-xs py-2.5 px-3.5 rounded-xl text-center">
              Daily +{settings.adRewardKes} KES Claimed • Resets Tomorrow
            </div>
          ) : (
            <button
              onClick={onWatchAdForWallet}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Watch Ad (+{settings.adRewardKes} KES)</span>
            </button>
          )}
        </section>
      )}

      <GoogleAdBanner settings={settings} slotLabel="HOME MATCHDAY SPONSOR" />
      {/* 4. Full-Fit Uncropped Admin Spotlight Media Card with Likes & Views */}
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

        {spotlight.mediaType === 'video' && spotlight.mediaUrl ? (
          <div className="bg-black w-full">
            <video src={spotlight.mediaUrl} controls className="w-full max-h-[540px] object-contain mx-auto" />
          </div>
        ) : spotlight.mediaType === 'image' && spotlight.mediaUrl ? (
          <div
            onClick={() =>
              onPreviewImage(spotlight.mediaUrl, spotlight.title, spotlight.updatedAt)
            }
            className="relative w-full bg-slate-950 flex items-center justify-center cursor-pointer group"
          >
            <img
              src={spotlight.mediaUrl}
              alt={spotlight.title}
              className="w-full h-auto max-h-[540px] object-contain"
            />
            <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ZoomIn className="w-3 h-3 text-blue-400" /> Tap Fullscreen
            </span>
          </div>
        ) : null}

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#0B0F19]">
              {spotlight.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">
              {spotlight.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
            <button
              onClick={() => onToggleLike('spotlight')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                spotlightLiked
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${spotlightLiked ? 'fill-red-600 text-red-600' : ''}`} />
              <span>{spotlight.likesCount ?? 148} Likes</span>
            </button>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>{(spotlight.viewsCount ?? 1240).toLocaleString()} Views</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Admin Home Feed Posts (Full-Fit Images + Likes + Real Views) */}
      {homePosts.length > 0 && (
        <section className="space-y-3">
          {homePosts.map((post) => {
            const isLiked = likedIds.includes(post.id);
            return (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="px-4 pt-3.5 pb-2 flex items-center justify-between text-[11px]">
                  <span className="bg-blue-100 text-blue-800 font-black px-2.5 py-0.5 rounded-full uppercase">
                    {post.badge || 'DESK UPDATE'}
                  </span>
                  <span className="text-slate-400 font-semibold">{post.createdAt}</span>
                </div>

                {post.imageUrl && (
                  <div
                    onClick={() =>
                      onPreviewImage(post.imageUrl!, post.title, post.createdAt)
                    }
                    className="relative w-full bg-slate-950 flex items-center justify-center my-1 cursor-pointer"
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-auto max-h-[540px] object-contain"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ZoomIn className="w-3 h-3 text-blue-400" /> View Full
                    </span>
                  </div>
                )}

                <div className="p-4 pt-2 space-y-2.5">
                  <h4 className="text-base font-black text-[#0B0F19]">{post.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onToggleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                        isLiked
                          ? 'bg-red-50 border-red-300 text-red-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
                      <span>{post.likesCount} Likes</span>
                    </button>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>{post.viewsCount.toLocaleString()} Views</span>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* 6. Today's Top Pick Highlight & Quick History Shortcut */}
      {topPrediction && (
        <section className="bg-white rounded-2xl border-2 border-blue-600/20 p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-600" /> Today’s Featured Free Insight
            </span>
            <button
              onClick={() => onNavigate('FREE')}
              className="text-[11px] font-extrabold text-red-600 hover:underline cursor-pointer"
            >
              View Calendar History &rarr;
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-black text-[#0B0F19]">
                {topPrediction.homeTeam} vs {topPrediction.awayTeam}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Pick: <strong>{topPrediction.pick}</strong> • Odds: <strong>{topPrediction.odds}</strong>
              </div>
            </div>
            <button
              onClick={() => onNavigate('FREE')}
              className="bg-[#0B0F19] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shrink-0 cursor-pointer"
            >
              Open Tips
            </button>
          </div>
        </section>
      )}

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

      <section className="bg-white rounded-2xl border-2 border-blue-600/20 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-blue-700">Why Members Trust U.K Football Insight</h3>
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">PINNED</span>
        </div>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span><strong>98% Historical Research Accuracy:</strong> Every fixture is filtered by team news, xG form, and head-to-head data.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span><strong>Verified Betslips &amp; SofaScore Proofs:</strong> Browse past dates using our Match Calendar and inspect verified results.</span>
          </li>
          <li className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span><strong>18+ Analysis Only:</strong> Strictly non-gambling educational match research. No staking or betting inside the app.</span>
          </li>
        </ul>
      </section>

      <section className="bg-[#0B0F19] text-white rounded-2xl p-4 shadow-md border border-slate-800">
        <h3 className="text-sm font-extrabold tracking-wide">Join Our Official Matchday Channels</h3>
        <p className="text-xs text-slate-400 mt-1">Get instant match alerts, free slip notifications, and live community updates.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
          <a href={whatsappGroupHref} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition">
            <MessageCircle className="w-4 h-4" /><span>Join Official WhatsApp Group</span>
          </a>
          <a href={settings.telegramChannelUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition">
            <Send className="w-4 h-4" /><span>Join Telegram Channel</span>
          </a>
        </div>
      </section>
    
      <GoogleAdBanner clientId={settings.adSenseClientId} enabled={settings.adsEnabled} />

      <section className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            Editorial Football Research Desk
          </span>
          <span className="text-[10px] font-bold text-slate-400">Updated Daily</span>
        </div>
        <h3 className="text-base font-black text-[#0B0F19]">
          How Our U.K. &amp; European Football Analysts Evaluate Matchday Fixtures
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Every fixture featured on <strong>U.K. Football Fixtures Insight</strong> undergoes a structured multi-factor pre-match evaluation covering the English Premier League, EFL Championship, UEFA Champions League, and top European domestic leagues. Rather than relying on surface-level league standings, our desk examines expected goals (xG) trends, home versus away defensive resilience, squad rotation after midweek European fixtures, and confirmed injury news.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1">
            <div className="font-black text-[#0B0F19]">1. Tactical Form &amp; xG Differential</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              We compare five-match rolling expected goals created and conceded to identify teams outperforming or underperforming market expectations.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1">
            <div className="font-black text-[#0B0F19]">2. Verified Post-Match Accountability</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every published fixture is tracked in real time with live 90-minute match clocks and archived transparently in our date calendar with verified scorelines.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
