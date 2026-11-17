import React, { useEffect, useState } from 'react';
import { X, PlayCircle, CheckCircle2, Coins, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../types';
import { GoogleAdBanner } from './GoogleAdBanner';

interface RewardedAdModalProps {
  settings: AppSettings;
  purpose: 'EARN_WALLET' | 'UNLOCK_FREE';
  onComplete: () => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  settings,
  purpose,
  onComplete,
  onClose,
}) => {
  const duration = Math.max(5, Number(settings.adDurationSeconds) || 20);
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const progressPercent = Math.round(((duration - secondsLeft) / duration) * 100);

  const handleClaim = () => {
    if (claimed || secondsLeft > 0) return;
    setClaimed(true);
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0B0F19] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider">
              Sponsored Ad • {secondsLeft > 0 ? `${secondsLeft}s Remaining` : 'Reward Ready!'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
            title="Close Ad"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-4 space-y-3.5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-center">
            <p className="text-xs font-extrabold text-[#0B0F19]">
              {purpose === 'UNLOCK_FREE'
                ? `Watch ${duration}s to Unlock All Daily Free Tips Today + Earn KES ${settings.adRewardKes}!`
                : `Watch ${duration}s to Claim Your Daily KES ${settings.adRewardKes} Wallet Credit!`}
            </p>
          </div>

          {/* Real Google AdSense Unit */}
          <GoogleAdBanner settings={settings} slotLabel="SPONSORED PARTNER AD" />

          {secondsLeft > 0 ? (
            <div className="w-full bg-slate-900 text-slate-300 font-bold text-xs py-3 px-4 rounded-xl text-center">
              Please wait <strong>{secondsLeft} seconds</strong> to claim your daily reward...
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {purpose === 'UNLOCK_FREE'
                  ? `Unlock Free Tips & Claim +KES ${settings.adRewardKes}`
                  : `Claim +KES ${settings.adRewardKes} Daily Credit`}
              </span>
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              Max 1 reward (KES {settings.adRewardKes}) per day
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              18+ Analysis Only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
