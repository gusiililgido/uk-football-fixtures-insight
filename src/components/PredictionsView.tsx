import React, { useEffect, useState } from 'react';
import {
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Pin,
  Flame,
  Crown,
  Sparkles,
  ArrowRight,
  PlayCircle,
  Coins,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trophy,
  Radio,
  Hourglass,
} from 'lucide-react';
import { AppSettings, MatchStatus, Prediction, PredictionTier } from '../types';
import { GoogleAdBanner } from './GoogleAdBanner';
import { getLiveMatchTiming } from '../utils/matchClock';

interface PredictionsViewProps {
  tier: PredictionTier;
  predictions: Prediction[];
  userTier: PredictionTier;
  isAdmin: boolean;
  settings: AppSettings;
  freeTipsUnlocked: boolean;
  onOpenAdForFreeTips: () => void;
  onOpenPayment: (tier: Exclude<PredictionTier, 'FREE'>) => void;
  onPreviewImage: (url: string, title: string, subtitle?: string) => void;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({
  tier,
  predictions,
  userTier,
  isAdmin,
  settings,
  freeTipsUnlocked,
  onOpenAdForFreeTips,
  onOpenPayment,
  onPreviewImage,
}) => {
  const todayIso = new Date().toISOString().slice(0, 10);
  const yesterdayIso = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const ticker = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const tierAllDates = predictions
    .filter((p) => p.tier === tier)
    .sort((a, b) => {
      const pinDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
      if (pinDiff !== 0) return pinDiff;
      return b.matchDate.localeCompare(a.matchDate);
    });

  const tierPredictions =
    selectedDate === 'ALL'
      ? tierAllDates
      : tierAllDates.filter((p) => p.matchDate === selectedDate);

  const wonCount = tierPredictions.filter((p) => p.status === 'WON').length;
  const lostCount = tierPredictions.filter((p) => p.status === 'LOST').length;

  const isViewingPastHistory =
    selectedDate !== 'ALL' && selectedDate < todayIso;

  const isFreeAdLocked =
    tier === 'FREE' &&
    !isAdmin &&
    settings.adsEnabled &&
    settings.freeTipsAdLock &&
    !freeTipsUnlocked &&
    !isViewingPastHistory;

  const hasPaidAccess =
    isAdmin ||
    tier === 'FREE' ||
    isViewingPastHistory ||
    userTier === 'VIP_MONTHLY' ||
    (tier === 'DAY_DEAL' && userTier === 'DAY_DEAL');

  const shiftDate = (daysDelta: number) => {
    const base = selectedDate === 'ALL' ? todayIso : selectedDate;
    const dt = new Date(base + 'T00:00:00');
    dt.setDate(dt.getDate() + daysDelta);
    setSelectedDate(dt.toISOString().slice(0, 10));
  };

  const sectionMeta = {
    FREE: {
      title: 'DAILY FREE PREDICTIONS',
      oddsRange: '2 - 5 ODDS',
      priceLabel: 'FREE ACCESS',
      badgeColor: 'bg-emerald-600',
      benefits: [
        'Updated every morning with verified U.K. & European fixtures',
        'Live kickoff countdown & 90-minute match progress tracker',
        'Full calendar history archive to verify yesterday & past results',
      ],
    },
    DAY_DEAL: {
      title: 'DAY DEAL VIP SLIP',
      oddsRange: '20 - 70 ODDS',
      priceLabel: `KES ${settings.dayDealPrice}/=`,
      badgeColor: 'bg-blue-600',
      benefits: [
        'High-value 20 to 70 odds curated daily accumulator with betslip preview',
        'Includes live 90-min match clock & SofaScore result verification',
        'Unlock via M-Pesa/Airtel OR redeem Earned Ad Wallet Balance',
      ],
    },
    VIP_MONTHLY: {
      title: 'VIP MONTHLY ELITE',
      oddsRange: '70 - 100 ODDS',
      priceLabel: `KES ${settings.vipMonthlyPrice}/=`,
      badgeColor: 'bg-red-600',
      benefits: [
        'Full 30-day access to VIP Monthly (70–100 Odds) & Day Deal slips',
        'Priority analyst support, betslip previews & verified result proofs',
        'Unlock via M-Pesa/Airtel OR redeem Earned Ad Wallet Balance',
      ],
    },
  }[tier];
  return (
    <div className="space-y-4">
      <div className="bg-[#0B0F19] text-white rounded-2xl p-4 shadow-lg border border-blue-900/40">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`${sectionMeta.badgeColor} text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider`}
          >
            {sectionMeta.oddsRange}
          </span>
          <span className="text-xs font-extrabold text-amber-400">
            {sectionMeta.priceLabel}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black mt-2 tracking-tight">
          {sectionMeta.title}
        </h2>

        <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Pinned Section Benefits</span>
          </div>
          {sectionMeta.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Betting History Navigator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#0B0F19] uppercase">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Match Calendar &amp; History</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold">
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {wonCount} WON
            </span>
            {lostCount > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                {lostCount} LOST
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedDate('ALL')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer ${
              selectedDate === 'ALL'
                ? 'bg-[#0B0F19] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({tierAllDates.length})
          </button>

          <button
            onClick={() => setSelectedDate(todayIso)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer ${
              selectedDate === todayIso
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setSelectedDate(yesterdayIso)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer ${
              selectedDate === yesterdayIso
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yesterday
          </button>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => shiftDate(-1)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate === 'ALL' ? todayIso : selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="px-2 py-1 text-[11px] font-bold border border-slate-300 rounded-xl bg-white text-[#0B0F19]"
            />
            <button
              onClick={() => shiftDate(1)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <GoogleAdBanner settings={settings} slotLabel={`${tier} SECTION SPONSOR`} />

      {isFreeAdLocked ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 text-center shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <PlayCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              <Coins className="w-3 h-3" /> Free Access + Daily Wallet Reward
            </span>
            <h3 className="text-lg font-black text-[#0B0F19] mt-1.5">
              Unlock Today’s Free Predictions
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              Watch one short <strong>{settings.adDurationSeconds}-second sponsored ad</strong> to unlock all Daily Free tips for the rest of today and claim{' '}
              <strong className="text-emerald-700">+KES {settings.adRewardKes}</strong> into your Insight Wallet!
            </p>
          </div>
          <button
            onClick={onOpenAdForFreeTips}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 px-7 rounded-xl shadow-lg inline-flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <PlayCircle className="w-5 h-5" />
            <span>
              Watch {settings.adDurationSeconds}s Ad to Unlock (+{settings.adRewardKes} KES)
            </span>
          </button>
        </div>
      ) : !hasPaidAccess ? (
        <div className="bg-white rounded-2xl border-2 border-blue-600 p-5 text-center shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-200">
            {tier === 'VIP_MONTHLY' ? (
              <Crown className="w-7 h-7 text-red-600" />
            ) : (
              <Lock className="w-7 h-7 text-blue-700" />
            )}
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-600">
              PREMIUM ACCESS LOCKED
            </span>
            <h3 className="text-lg font-black text-[#0B0F19] mt-1">
              Unlock Today’s {sectionMeta.oddsRange} Analysis
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              Get immediate access to today’s verified {sectionMeta.oddsRange} selections &amp; betslip previews ({tierPredictions.length} fixtures). Pay via {settings.paymentNetworkLabel} or redeem your Earned Ad Wallet Balance.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 inline-block">
            <span className="text-xs text-slate-500 font-semibold">Subscription Fee: </span>
            <span className="text-base font-black text-blue-700">{sectionMeta.priceLabel}</span>
          </div>

          <div>
            <button
              onClick={() => onOpenPayment(tier as Exclude<PredictionTier, 'FREE'>)}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black text-sm py-3.5 px-8 rounded-xl shadow-lg inline-flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>JOIN NOW!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {tierPredictions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
              No {sectionMeta.title} records found for <strong>{selectedDate}</strong>. Tap <strong>All</strong> or select another calendar date!
            </div>
          ) : (
            tierPredictions.map((item) => (
              <PredictionCard
                key={item.id}
                item={item}
                nowMs={nowMs}
                onPreviewImage={onPreviewImage}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const PredictionCard: React.FC<{
  item: Prediction;
  nowMs: number;
  onPreviewImage: (url: string, title: string, subtitle?: string) => void;
}> = ({ item, nowMs, onPreviewImage }) => {
  const timing = getLiveMatchTiming(item.matchDate, item.kickoffTime, item.status, nowMs);
  const statusStyles: Record<MatchStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    WON: { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-800", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
    LOST: { bg: "bg-red-100 border-red-300", text: "text-red-800", icon: <XCircle className="w-3.5 h-3.5 text-red-600" /> },
    POSTPONED: { bg: "bg-amber-100 border-amber-300", text: "text-amber-800", icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> },
    PENDING: { bg: "bg-blue-100 border-blue-300", text: "text-blue-800", icon: <Clock className="w-3.5 h-3.5 text-blue-600" /> },
  };
  const badge = statusStyles[item.status];
  const homeInitial = (item.homeTeam || "H").slice(0, 2).toUpperCase();
  const awayInitial = (item.awayTeam || "A").slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden hover:border-blue-500 transition">
      <div className="bg-[#0B0F19] text-white px-4 py-2 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-200 truncate">
          {item.pinned && <Pin className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />}
          <span className="truncate">{item.league}</span>
        </div>
        <span className="text-[10px] font-extrabold text-blue-300 shrink-0">{item.matchDate} • {item.kickoffTime}</span>
      </div>
      <div className={`px-4 py-2 flex items-center justify-between gap-2 text-xs font-black border-b ${timing.phase === "LIVE_90" ? "bg-red-600 text-white border-red-700" : timing.phase === "ENDED_WAIT_ADMIN" ? "bg-amber-500 text-[#0B0F19] border-amber-600" : timing.phase === "UPCOMING" ? "bg-blue-50 text-blue-900 border-blue-200" : item.status === "WON" ? "bg-emerald-600 text-white border-emerald-700" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
        <div className="flex items-center gap-1.5">
          {timing.phase === "LIVE_90" ? <Radio className="w-4 h-4 animate-pulse" /> : timing.phase === "ENDED_WAIT_ADMIN" ? <Hourglass className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span className="tracking-wide">{timing.label}</span>
        </div>
        <span className="text-[10px] font-bold opacity-90">{timing.subLabel}</span>
      </div>
      {timing.phase === "LIVE_90" && typeof timing.progressPercent === "number" && (
        <div className="w-full h-1.5 bg-red-950"><div className="h-full bg-amber-300 transition-all duration-700" style={{ width: `${timing.progressPercent}%` }} /></div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">{homeInitial}</span><span className="text-sm sm:text-base font-black text-[#0B0F19] truncate">{item.homeTeam}</span></div>
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-slate-800 text-white text-[10px] font-black flex items-center justify-center shrink-0">{awayInitial}</span><span className="text-sm sm:text-base font-black text-[#0B0F19] truncate">{item.awayTeam}</span></div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="bg-[#0B0F19] text-white px-3 py-1.5 rounded-xl text-center min-w-[68px]"><div className="text-[9px] uppercase tracking-wider text-blue-300 font-bold">Odds</div><div className="text-sm font-black text-amber-400">{item.odds}</div></div>
            <div className="flex items-center gap-1">
              {item.finalScore && <span className="bg-slate-900 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">{item.finalScore}</span>}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg} ${badge.text}`}>{badge.icon}<span>{item.status}</span></span>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
          <div><span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">Expert Selection</span><span className="text-xs sm:text-sm font-black text-[#0B0F19]">{item.pick}</span></div>
          <span className="inline-flex items-center gap-1 bg-blue-700 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shrink-0"><Flame className="w-3 h-3 text-amber-300" />{item.confidence}</span>
        </div>
        {item.analysisNote && <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-2.5 border border-slate-100"><strong className="text-[#0B0F19]">Desk Insight:</strong> {item.analysisNote}</p>}
        {(item.betslipImageUrl || item.resultProofUrl) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {item.betslipImageUrl && <button onClick={() => onPreviewImage(item.betslipImageUrl!, `Betslip Preview: ${item.homeTeam} vs ${item.awayTeam}`, `${item.pick} • Odds: ${item.odds}`)} className="flex items-center justify-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-800 border border-blue-300 font-extrabold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer"><ImageIcon className="w-4 h-4 text-blue-600" /><span>View Betslip Image</span></button>}
            {item.resultProofUrl && <button onClick={() => onPreviewImage(item.resultProofUrl!, `Verified Result Proof: ${item.homeTeam} vs ${item.awayTeam}`, `${item.status}${item.finalScore ? ` (${item.finalScore})` : ""} • SofaScore / LiveScore Proof`)} className="flex items-center justify-center gap-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 border border-emerald-300 font-extrabold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer"><Trophy className="w-4 h-4 text-emerald-600" /><span>View Result Proof (SofaScore)</span></button>}
          </div>
        )}
      </div>
    </div>
  );
};
