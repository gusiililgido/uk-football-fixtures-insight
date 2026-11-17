import React from 'react';
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
} from 'lucide-react';
import { AppSettings, MatchStatus, Prediction, PredictionTier } from '../types';
import { GoogleAdBanner } from './GoogleAdBanner';

interface PredictionsViewProps {
  tier: PredictionTier;
  predictions: Prediction[];
  userTier: PredictionTier;
  isAdmin: boolean;
  settings: AppSettings;
  freeTipsUnlocked: boolean;
  onOpenAdForFreeTips: () => void;
  onOpenPayment: (tier: Exclude<PredictionTier, 'FREE'>) => void;
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
}) => {
  const tierPredictions = predictions
    .filter((p) => p.tier === tier)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

  const isFreeAdLocked =
    tier === 'FREE' &&
    !isAdmin &&
    settings.adsEnabled &&
    settings.freeTipsAdLock &&
    !freeTipsUnlocked;

  const hasPaidAccess =
    isAdmin ||
    tier === 'FREE' ||
    userTier === 'VIP_MONTHLY' ||
    (tier === 'DAY_DEAL' && userTier === 'DAY_DEAL');

  const sectionMeta = {
    FREE: {
      title: 'DAILY FREE PREDICTIONS',
      oddsRange: '2 - 5 ODDS',
      priceLabel: 'FREE ACCESS',
      badgeColor: 'bg-emerald-600',
      benefits: [
        'Updated every morning with verified U.K. & European fixtures',
        '2 to 5 combined odds focused on high-probability outcomes',
        '98% historical statistical research accuracy',
      ],
    },
    DAY_DEAL: {
      title: 'DAY DEAL VIP SLIP',
      oddsRange: '20 - 70 ODDS',
      priceLabel: `KES ${settings.dayDealPrice}/=`,
      badgeColor: 'bg-blue-600',
      benefits: [
        'High-value 20 to 70 odds curated daily accumulator',
        'Includes full tactical breakdown & kickoff alerts',
        'Unlock via M-Pesa/Airtel OR use your Earned Ad Wallet Balance',
      ],
    },
    VIP_MONTHLY: {
      title: 'VIP MONTHLY ELITE',
      oddsRange: '70 - 100 ODDS',
      priceLabel: `KES ${settings.vipMonthlyPrice}/=`,
      badgeColor: 'bg-red-600',
      benefits: [
        'Full 30-day access to both VIP Monthly (70–100 Odds) & Day Deal slips',
        'Priority analyst support & early lineup injury insights',
        'Unlock via M-Pesa/Airtel OR use your Earned Ad Wallet Balance',
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

      <GoogleAdBanner settings={settings} slotLabel={`${tier} SECTION SPONSOR`} />

      {isFreeAdLocked ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 text-center shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <PlayCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              <Coins className="w-3 h-3" /> Free Access + Wallet Reward
            </span>
            <h3 className="text-lg font-black text-[#0B0F19] mt-1.5">
              Unlock Today’s {tierPredictions.length} Free Predictions
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              Watch one short <strong>{settings.adDurationSeconds}-second sponsored ad</strong> to unlock all Daily Free tips immediately and earn{' '}
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
              Get immediate access to today’s verified {sectionMeta.oddsRange} selections ({tierPredictions.length} active fixtures ready). Pay via {settings.paymentNetworkLabel} or redeem your Earned Ad Wallet Balance.
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
        <div className="space-y-3">
          {tierPredictions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-500">
              New {sectionMeta.title} analysis is being finalized by our desk. Check back shortly!
            </div>
          ) : (
            tierPredictions.map((item) => <PredictionCard key={item.id} item={item} />)
          )}
        </div>
      )}
    </div>
  );
};

const PredictionCard: React.FC<{ item: Prediction }> = ({ item }) => {
  const statusStyles: Record<
    MatchStatus,
    { bg: string; text: string; icon: React.ReactNode }
  > = {
    WON: {
      bg: 'bg-emerald-100 border-emerald-300',
      text: 'text-emerald-800',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    LOST: {
      bg: 'bg-red-100 border-red-300',
      text: 'text-red-800',
      icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
    },
    POSTPONED: {
      bg: 'bg-amber-100 border-amber-300',
      text: 'text-amber-800',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    },
    PENDING: {
      bg: 'bg-blue-100 border-blue-300',
      text: 'text-blue-800',
      icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
    },
  };

  const badge = statusStyles[item.status];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-blue-400 transition">
      <div className="flex items-center justify-between gap-2 text-xs mb-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-600">
          {item.pinned && <Pin className="w-3.5 h-3.5 text-red-600 fill-red-600" />}
          <span>{item.league}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badge.bg} ${badge.text}`}
        >
          {badge.icon}
          <span>{item.status}</span>
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 py-1">
        <div>
          <h4 className="text-base font-black text-[#0B0F19]">
            {item.homeTeam} <span className="text-red-600 font-bold">vs</span> {item.awayTeam}
          </h4>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {item.matchDate} • Kickoff: {item.kickoffTime}
          </div>
        </div>
        <div className="text-right shrink-0 bg-[#0B0F19] text-white px-3 py-1.5 rounded-xl">
          <div className="text-[9px] uppercase tracking-wider text-blue-300 font-bold">Odds</div>
          <div className="text-sm font-black text-amber-400">{item.odds}</div>
        </div>
      </div>
      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase text-blue-700 block">Analysed Selection</span>
          <span className="text-xs sm:text-sm font-black text-[#0B0F19]">{item.pick}</span>
        </div>
        <span className="inline-flex items-center gap-1 bg-blue-700 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shrink-0">
          <Flame className="w-3 h-3 text-amber-300" />
          {item.confidence}
        </span>
      </div>
      {item.analysisNote && (
        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
          <strong>Insight:</strong> {item.analysisNote}
        </p>
      )}
    </div>
  );
};
