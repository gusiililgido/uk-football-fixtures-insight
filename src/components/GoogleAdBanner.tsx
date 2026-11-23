import React, { useEffect, useRef } from 'react';
import { AppSettings } from '../types';

interface GoogleAdBannerProps {
  settings?: AppSettings;
  slotLabel?: string;
  clientId?: string;
  slotId?: string;
  enabled?: boolean;
  className?: string;
}

export const GoogleAdBanner: React.FC<GoogleAdBannerProps> = ({
  settings,
  slotLabel,
  clientId,
  slotId,
  enabled,
  className = '',
}) => {
  const pushedRef = useRef(false);
  const isEnabled = enabled !== undefined ? enabled : settings ? settings.adsEnabled : true;
  const activeClient = (
    clientId ||
    settings?.adSenseClientId ||
    'ca-pub-3150087316179365'
  ).trim();
  const activeSlot = (
    slotId ||
    (settings as any)?.adSenseSlotId ||
    (settings as any)?.adSenseBannerSlot ||
    ''
  ).trim();

  useEffect(() => {
    if (!isEnabled || !activeClient || pushedRef.current) return;
    try {
      const w = window as any;
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {}
  }, [isEnabled, activeClient]);

  if (!isEnabled || !activeClient) return null;

  return (
    <aside
      aria-label="Advertisement"
      className={`my-3 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2.5 text-center overflow-hidden ${className}`}
    >
      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
        {slotLabel ? `Advertisement • ${slotLabel}` : 'Advertisement'}
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '60px' }}
        data-ad-client={activeClient}
        {...(activeSlot ? { 'data-ad-slot': activeSlot } : {})}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
};
