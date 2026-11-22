import React, { useEffect, useState } from 'react';
import { Download, BellRing, Smartphone } from 'lucide-react';

interface InstallPromptBannerProps {
  onInstallClick: () => void;
  canInstallPrompt: boolean;
  onEnableNotifications: () => void;
}

export const InstallPromptBanner: React.FC<InstallPromptBannerProps> = ({
  onInstallClick,
  canInstallPrompt,
  onEnableNotifications,
}) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    if ('Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }
  }, []);

  if (isInstalled && notifGranted) return null;

  return (
    <div className="bg-gradient-to-r from-[#0B0F19] via-blue-950 to-[#0B0F19] text-white border-b border-blue-500/40 px-3 py-2">
      <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-extrabold truncate">
            {!isInstalled && !notifGranted
              ? 'Install App & Enable Matchday Alerts for Instant Tips'
              : !isInstalled
              ? 'Install U.K. Football App on Your Home Screen'
              : 'Enable Live Push Notifications for Instant Win Alerts'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!isInstalled && (
            <button
              type="button"
              onClick={onInstallClick}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{canInstallPrompt ? 'Install App' : 'Add to Home'}</span>
            </button>
          )}
          {!notifGranted && (
            <button
              type="button"
              onClick={async () => {
                await onEnableNotifications();
                if ('Notification' in window && Notification.permission === 'granted') {
                  setNotifGranted(true);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Enable Alerts</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
