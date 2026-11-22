import React, { useEffect, useState } from 'react';
import {
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Pin,
  Flame,
  PlayCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trophy,
  Radio,
  Hourglass,
} from 'lucide-react';
import { AppSettings, MatchStatus, Prediction, PredictionTier } from '../types';
import { getLiveMatchTiming } from '../utils/matchClock';

interface PredictionsViewProps {
  tier: PredictionTier;
  predictions: Prediction[];
  userTier: PredictionTier;
  isAdmin: boolean;
  hasFreeAdUnlock?: boolean;
  onWatchAdToUnlock?: () => void;
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
  hasFreeAdUnlock,
  settings,
  onOpenPayment,
  onWatchAdToUnlock,
  onPreviewImage,
}) => {
  const todayIso = new Date().toISOString().slice(0, 10);
  const yesterdayIso = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const tomorrowIso = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    setSelectedDate(todayIso);
  }, [tier, todayIso]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const shiftDate = (days: number) => {
    const base = new Date(`${selectedDate}T12:00:00`);
    base.setDate(base.getDate() + days);
    setSelectedDate(base.toISOString().slice(0, 10));
  };

  const hasAccess =
    isAdmin ||
    tier === 'FREE' ||
    userTier === 'VIP_MONTHLY' ||
    (tier === 'DAY_DEAL' && userTier === 'DAY_DEAL');

  const needsAdUnlock =
    tier === 'FREE' &&
    !isAdmin &&
    settings.adsEnabled &&
    settings.freeTipsAdLock &&
    !hasFreeAdUnlock;

  const tierMeta = {
    FREE: {
      title: 'Daily Free 2–5 Odds',
      subtitle: 'Curated Daily High-Confidence Selections',
      accent: 'from-blue-900 via-[#0B0F19] to-slate-900',
      badge: 'FREE ACCESS',
    },
    DAY_DEAL: {
      title: 'Day Deal • 20–70 Odds',
      subtitle: '24-Hour High-Return Accumulator Slip',
      accent: 'from-blue-950 via-[#0B0F19] to-indigo-950',
      badge: `KES ${settings.dayDealPrice}`,
    },
    VIP_MONTHLY: {
      title: 'VIP Monthly • 70–100 Odds',
      subtitle: '30-Day Executive Mega Slip & Priority Desk',
      accent: 'from-red-950 via-[#0B0F19] to-amber-950',
      badge: `KES ${settings.vipMonthlyPrice}`,
    },
  }[tier];

  const filtered = predictions
    .filter((p) => p.tier === tier && p.matchDate === selectedDate)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

  const wonCount = filtered.filter((p) => p.status === 'WON').length;
  const lostCount = filtered.filter((p) => p.status === 'LOST').length;
  const combinedOdds = filtered.reduce((acc, p) => {
    const val = parseFloat(String(p.odds).replace(/[^0-9.]/g, ''));
    return !isNaN(val) && val > 0 ? acc * val : acc;
  }, 1);

  if (!hasAccess) {
    return (
      <div className="bg-white rounded-2xl border-2 border-blue-600/20 p-6 text-center space-y-4 shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-[#0B0F19] text-amber-400 flex items-center justify-center mx-auto shadow">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">VIP Restricted Access</span>
          <h2 className="text-lg font-black text-[#0B0F19]">{tierMeta.title}</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">{tierMeta.subtitle}. Unlock instant access to today’s verified slip &amp; full historical archive.</p>
        </div>
        <button type="button" onClick={() => onOpenPayment(tier)} className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-5 rounded-xl shadow cursor-pointer">
          Unlock {tierMeta.title} ({tierMeta.badge})
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`bg-gradient-to-r ${tierMeta.accent} text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="bg-emerald-500 text-[#0B0F19] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">{tierMeta.badge}</span>
            <h2 className="text-base sm:text-lg font-black mt-1.5">{tierMeta.title}</h2>
            <p className="text-[11px] text-slate-300">{tierMeta.subtitle}</p>
          </div>
          <div className="text-right shrink-0 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            <div className="text-[9px] uppercase text-blue-300 font-bold">Total Odds</div>
            <div className="text-sm font-black text-amber-400">{filtered.length > 0 && combinedOdds > 1 ? combinedOdds.toFixed(2) : '—'}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-white/5 rounded-xl p-2 border border-white/10"><div className="text-sm font-black text-white">{filtered.length}</div><div className="text-[10px] text-slate-400">Matches</div></div>
          <div className="bg-white/5 rounded-xl p-2 border border-white/10"><div className="text-sm font-black text-emerald-400">{wonCount} WON</div><div className="text-[10px] text-slate-400">{lostCount > 0 ? `${lostCount} LOST` : 'Verified'}</div></div>
          <div className="bg-white/5 rounded-xl p-2 border border-white/10"><div className="text-xs font-black text-amber-300 truncate">{selectedDate === todayIso ? 'TODAY' : selectedDate === yesterdayIso ? 'YESTERDAY' : selectedDate}</div><div className="text-[10px] text-slate-400">Active Date</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-1.5">
          <button type="button" onClick={() => shiftDate(-1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
          <div className="grid grid-cols-3 gap-1.5 flex-1">
            <button type="button" onClick={() => setSelectedDate(yesterdayIso)} className={`py-2 rounded-xl text-xs font-black cursor-pointer ${selectedDate === yesterdayIso ? 'bg-[#0B0F19] text-white shadow' : 'bg-slate-100 text-slate-700'}`}>Yesterday</button>
            <button type="button" onClick={() => setSelectedDate(todayIso)} className={`py-2 rounded-xl text-xs font-black cursor-pointer ${selectedDate === todayIso ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700'}`}>Today</button>
            <button type="button" onClick={() => setSelectedDate(tomorrowIso)} className={`py-2 rounded-xl text-xs font-black cursor-pointer ${selectedDate === tomorrowIso ? 'bg-[#0B0F19] text-white shadow' : 'bg-slate-100 text-slate-700'}`}>Tomorrow</button>
          </div>
          <button type="button" onClick={() => shiftDate(1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="flex items-center gap-1.5 font-extrabold text-slate-700"><Calendar className="w-3.5 h-3.5 text-blue-600" /> Jump to Date:</span>
          <input type="date" value={selectedDate} onChange={(e) => e.target.value && setSelectedDate(e.target.value)} className="px-2.5 py-1 text-xs font-bold border border-slate-300 rounded-lg bg-slate-50" />
        </div>
      </div>

      {needsAdUnlock ? (
        <div className="bg-white rounded-2xl border-2 border-blue-600/30 p-6 text-center space-y-3 shadow-md">
          <PlayCircle className="w-10 h-10 text-blue-600 mx-auto" />
          <h3 className="text-sm font-black text-[#0B0F19]">Watch 1 Short Sponsor Ad to Unlock Today’s Free Slip</h3>
          <p className="text-xs text-slate-600">Unlocks all {filtered.length} Daily Free (2–5 Odds) tips for today immediately.</p>
          <button type="button" onClick={onWatchAdToUnlock} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-3 rounded-xl shadow cursor-pointer">Watch Ad &amp; Unlock Today’s Tips</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-black text-[#0B0F19]">No Games Published for {selectedDate === todayIso ? 'Today Yet' : selectedDate}</div>
          <p className="text-xs text-slate-500">Tap <strong>Yesterday</strong> or pick another calendar date above to verify past winning slips.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <PredictionCard key={item.id} item={item} nowMs={nowMs} onPreviewImage={onPreviewImage} />
          ))}
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
  const isImageOnlySlip =
    Boolean(item.betslipImageUrl) &&
    (!item.homeTeam.trim() || item.homeTeam.trim() === 'Verified Betslip');

  const timing = getLiveMatchTiming(item.matchDate, item.kickoffTime, item.status, nowMs);

  const statusStyles: Record<MatchStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    WON: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
    LOST: { bg: 'bg-red-100 border-red-300', text: 'text-red-800', icon: <XCircle className="w-3.5 h-3.5 text-red-600" /> },
    POSTPONED: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> },
    PENDING: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-800', icon: <Clock className="w-3.5 h-3.5 text-blue-600" /> },
  };
  const badge = statusStyles[item.status];

  if (isImageOnlySlip) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="bg-[#0B0F19] text-white px-4 py-2.5 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 font-extrabold">
            {item.pinned && <Pin className="w-3.5 h-3.5 text-red-500 fill-red-500" />}
            <span>{item.league || 'Official Verified Betslip'}</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg} ${badge.text}`}>{badge.icon}<span>{item.status}</span></span>
        </div>
        <div onClick={() => onPreviewImage(item.betslipImageUrl!, item.league || 'Official Betslip', `${item.matchDate} • Status: ${item.status}${item.odds ? ` • Odds: ${item.odds}` : ''}`)} className="bg-slate-950 cursor-pointer relative group">
          <img src={item.betslipImageUrl} alt="Verified Betslip" className="w-full max-h-[420px] object-contain mx-auto" />
          <div className="bg-black/75 text-white text-[11px] font-bold px-3 py-1.5 flex items-center justify-between">
            <span>{item.matchDate}{item.odds ? ` • Combined Odds: ${item.odds}` : ''}</span>
            <span className="text-blue-300 underline">Tap to Zoom Fullscreen</span>
          </div>
        </div>
        {(item.analysisNote || item.resultProofUrl) && (
          <div className="p-3.5 space-y-2">
            {item.analysisNote && <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border">{item.analysisNote}</p>}
            {item.resultProofUrl && (
              <button type="button" onClick={() => onPreviewImage(item.resultProofUrl!, 'Verified Result Proof', `${item.status} • SofaScore / LiveScore Proof`)} className="w-full flex items-center justify-center gap-1.5 bg-emerald-600/10 text-emerald-800 border border-emerald-300 font-extrabold text-xs py-2.5 rounded-xl cursor-pointer">
                <Trophy className="w-4 h-4 text-emerald-600" /><span>View Verified Result Proof</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const homeInitial = (item.homeTeam || 'H').slice(0, 2).toUpperCase();
  const awayInitial = (item.awayTeam || 'A').slice(0, 2).toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden hover:border-blue-500 transition">
      <div className="bg-[#0B0F19] text-white px-4 py-2 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-200 truncate">
          {item.pinned && <Pin className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />}
          <span className="truncate">{item.league}</span>
        </div>
        <span className="text-[10px] font-extrabold text-blue-300 shrink-0">{item.matchDate} • {item.kickoffTime}</span>
      </div>
      <div className={`px-4 py-2 flex items-center justify-between gap-2 text-xs font-black border-b ${timing.phase === 'LIVE_90' ? 'bg-red-600 text-white border-red-700' : timing.phase === 'ENDED_WAIT_ADMIN' ? 'bg-amber-500 text-[#0B0F19] border-amber-600' : timing.phase === 'UPCOMING' ? 'bg-blue-50 text-blue-900 border-blue-200' : item.status === 'WON' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        <div className="flex items-center gap-1.5">
          {timing.phase === 'LIVE_90' ? <Radio className="w-4 h-4 animate-pulse" /> : timing.phase === 'ENDED_WAIT_ADMIN' ? <Hourglass className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span className="tracking-wide">{timing.label}</span>
        </div>
        <span className="text-[10px] font-bold opacity-90">{timing.subLabel}</span>
      </div>
      {timing.phase === 'LIVE_90' && typeof timing.progressPercent === 'number' && (
        <div className="w-full h-1.5 bg-red-950"><div className="h-full bg-amber-300 transition-all duration-700" style={{ width: `${timing.progressPercent}%` }} /></div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">{homeInitial}</span><span className="text-sm sm:text-base font-black text-[#0B0F19] truncate">{item.homeTeam}</span></div>
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-slate-800 text-white text-[10px] font-black flex items-center justify-center shrink-0">{awayInitial}</span><span className="text-sm sm:text-base font-black text-[#0B0F19] truncate">{item.awayTeam}</span></div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {item.odds && <div className="bg-[#0B0F19] text-white px-3 py-1.5 rounded-xl text-center min-w-[68px]"><div className="text-[9px] uppercase tracking-wider text-blue-300 font-bold">Odds</div><div className="text-sm font-black text-amber-400">{item.odds}</div></div>}
            <div className="flex items-center gap-1">
              {item.finalScore && <span className="bg-slate-900 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">{item.finalScore}</span>}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg} ${badge.text}`}>{badge.icon}<span>{item.status}</span></span>
            </div>
          </div>
        </div>
        {item.pick && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div><span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">Expert Selection</span><span className="text-xs sm:text-sm font-black text-[#0B0F19]">{item.pick}</span></div>
            <span className="inline-flex items-center gap-1 bg-blue-700 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shrink-0"><Flame className="w-3 h-3 text-amber-300" />{item.confidence}</span>
          </div>
        )}
        {item.analysisNote && <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-2.5 border border-slate-100"><strong className="text-[#0B0F19]">Desk Insight:</strong> {item.analysisNote}</p>}
        {(item.betslipImageUrl || item.resultProofUrl) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {item.betslipImageUrl && <button type="button" onClick={() => onPreviewImage(item.betslipImageUrl!, `Betslip Preview: ${item.homeTeam} vs ${item.awayTeam}`, `${item.pick} • Odds: ${item.odds}`)} className="flex items-center justify-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-800 border border-blue-300 font-extrabold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer"><ImageIcon className="w-4 h-4 text-blue-600" /><span>View Betslip Image</span></button>}
            {item.resultProofUrl && <button type="button" onClick={() => onPreviewImage(item.resultProofUrl!, `Verified Result Proof: ${item.homeTeam} vs ${item.awayTeam}`, `${item.status}${item.finalScore ? ` (${item.finalScore})` : ''} • SofaScore / LiveScore Proof`)} className="flex items-center justify-center gap-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 border border-emerald-300 font-extrabold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer"><Trophy className="w-4 h-4 text-emerald-600" /><span>View Result Proof (SofaScore)</span></button>}
          </div>
        )}
      </div>
    </div>
  );
};
