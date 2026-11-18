import React from 'react';
import { X, Trophy, Flame, Bell, Sparkles } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  notifications: AppNotification[];
  onClose: () => void;
  onEnablePush: () => void;
  pushGranted: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
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
              Enable phone pop-up alerts for instant BOOM! win notifications.
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
            notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl p-3 border space-y-1 ${
                  n.type === 'WIN'
                    ? 'bg-emerald-50/90 border-emerald-300'
                    : n.type === 'NEW_MATCH'
                    ? 'bg-blue-50/80 border-blue-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-extrabold">
                  <span className="flex items-center gap-1 uppercase text-[#0B0F19]">
                    {n.type === 'WIN' ? (
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
                  {n.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
