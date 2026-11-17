import React, { useEffect, useState } from 'react';
import { X, PlayCircle, Gift, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { AppSettings } from '../types';

interface RewardedAdModalProps {
  settings: AppSettings;
  purpose: 'UNLOCK_FREE' | 'EARN_WALLET';
  onComplete: () => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  settings,
  purpose,
  onComplete,
  onClose,
}) => {
  const duration = Math.max(5, settings.adDurationSeconds || 20);
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
  const isFinished = secondsLeft === 0;

  const handleClaim = () => {
    if (!isFinished || claimed) return;
    setClaimed(true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-[#0B0F19] text-white w-full max-w-md rounded-2xl border border-blue-700/50 shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
              Sponsored Partner Ad • +{settings.adRewardKes} KES Reward
            </span>
          </div>
          {isFinished && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Ad Media / Google AdSense Container */}
        <div className="p-4 space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-950 via-slate-900 to-black border border-blue-800/40 p-4 text-center space-y-2.5 min-h-[180px] flex flex-col items-center justify-center relative overflow-hidden">
            {settings.adBannerMediaUrl ? (
              settings.adBannerMediaUrl.match(/\.(mp4|webm|ogg)$/i) ||
              settings.adBannerMediaUrl.startsWith('data:video') ? (
                <video
                  src={settings.adBannerMediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-44 object-cover rounded-lg"
                />
              ) : (
                <img
                  src={settings.adBannerMediaUrl}
                  alt="Sponsored Ad"
                  className="w-full h-44 object-cover rounded-lg"
                />
              )
            ) : (
              <>
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  REWARDED INSIGHT SPONSOR
                </span>
                <h4 className="text-base font-black text-white leading-snug">
                  {settings.adBannerHeadline ||
                    'Watch this short 20-second sponsor message to earn KES 5 in your Insight Wallet!'}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Collect KES 5 per ad in your non-withdrawable wallet to unlock Day Deal (350/=) or VIP Monthly (3500/=) free!
                </p>
              </>
            )}

            {settings.googleAdClientId && (
              <div className="text-[10px] text-slate-500 font-mono">
                AdSense Verified: {settings.googleAdClientId}
              </div>
            )}
          </div>

          {/* Progress Bar & Countdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {isFinished
                  ? 'Ad Completed! Ready to claim.'
                  : `Keep watching: ${secondsLeft}s remaining...`}
              </span>
              <span className="text-amber-400">+{settings.adRewardKes} KES</span>
            </div>

            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClaim}
            disabled={!isFinished}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition ${
              isFinished
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isFinished ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {purpose === 'UNLOCK_FREE'
                    ? `Claim +${settings.adRewardKes} KES & Unlock Free Tips`
                    : `Claim +${settings.adRewardKes} KES to Wallet`}
                </span>
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                <span>Wait {secondsLeft}s to Unlock Reward...</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
