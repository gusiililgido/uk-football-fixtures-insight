import React from 'react';
import { X, Trophy, Flame, Bell, Sparkles, Lock } from 'lucide-react';
import { AppNotification, PredictionTier } from '../types';

interface NotificationsModalProps {
  notifications: AppNotification[];
  userTier: PredictionTier;
  isAdmin: boolean;
  onUpgradeTier: (tier: Exclude<PredictionTier, 'FREE'>) => void;
  onClose: () => void;
  onEnablePush: () => void;
  pushGranted: boolean;
}

export function resolveNotificationText(
  n: AppNotification,
  userTier: PredictionTier,
  isAdmin: boolean
): { text: string; isLockedTeaser: boolean; requiredTier?: Exclude<PredictionTier, 'FREE'> } {
  const target = n.targetTier || 'ALL';
  if (target === 'ALL' || isAdmin) {
    return { text: n.body, isLockedTeaser: false };
  }
  const hasAccess =
    userTier === 'VIP_MONTHLY' || (target === 'DAY_DEAL' && userTier === 'DAY_DEAL');

  if (hasAccess) {
    return { text: n.body, isLockedTeaser: false };
  }

  const fallbackTeaser =
    target === 'VIP_MONTHLY'
      ? 'VIP Monthly (70–100 Odds) slip has been updated! Upgrade to VIP Monthly to view full match details.'
      : 'Day Deal (20–70 Odds) slip has been updated! Unlock Day Deal to view full match details.';

  return {
    text: n.publicTeaserBody || fallbackTeaser,
    isLockedTeaser: true,
    requiredTier: target,
  };
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  userTier,
  isAdmin,
  onUpgradeTier,
  onClose,
  onEnablePush,
  pushGranted,
}) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col"
      >
        <div className="bg-[#0B0F19] text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-wide">
              Live Matchday Alerts ({notifications.length})
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!pushGranted && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2.5 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-blue-900">
              Enable phone pop-up alerts for instant matchday &amp; BOOM! notifications.
            </span>
            <button
              onClick={onEnablePush}
              className="bg-blue-600 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
            >
              Allow
            </button>
          </div>
        )}

        <div className="p-3.5 space-y-2.5 overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No live alerts yet. Check back soon!
            </p>
          ) : (
            notifications.map((n) => {
              const resolved = resolveNotificationText(n, userTier, isAdmin);
              return (
                <div
                  key={n.id}
                  className={`rounded-xl p-3 border space-y-1.5 ${
                    resolved.isLockedTeaser
                      ? 'bg-amber-50/80 border-amber-300'
                      : n.type === 'WIN'
                      ? 'bg-emerald-50/90 border-emerald-300'
                      : n.type === 'NEW_MATCH'
                      ? 'bg-blue-50/80 border-blue-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-extrabold">
                    <span className="flex items-center gap-1 uppercase text-[#0B0F19]">
                      {resolved.isLockedTeaser ? (
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                      ) : n.type === 'WIN' ? (
                        <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                      ) : n.type === 'NEW_MATCH' ? (
                        <Flame className="w-3.5 h-3.5 text-red-600" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      {n.title}
                    </span>
                    <span className="text-slate-400">{n.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {resolved.text}
                  </p>

                  {resolved.isLockedTeaser && resolved.requiredTier && (
                    <button
                      onClick={() => {
                        onClose();
                        onUpgradeTier(resolved.requiredTier!);
                      }}
                      className="mt-1 inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <Lock className="w-3 h-3" />
                      <span>
                        Unlock {resolved.requiredTier === 'VIP_MONTHLY' ? 'VIP Monthly' : 'Day Deal'} Now
                      </span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
