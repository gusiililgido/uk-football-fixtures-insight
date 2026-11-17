import React, { useEffect } from 'react';
import { AppSettings } from '../types';

interface GoogleAdBannerProps {
  settings: AppSettings;
  slotLabel?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export const GoogleAdBanner: React.FC<GoogleAdBannerProps> = ({
  settings,
  slotLabel = 'SPONSORED',
}) => {
  const clientId = settings.googleAdClientId?.trim();
  const slotId = settings.googleAdSlotId?.trim();

  useEffect(() => {
    if (!settings.adsEnabled || !clientId) return;

    const existingScript = document.querySelector(
      'script[data-ukffi-adsense="true"]'
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src =
        'https://' +
        `://googlesyndication.com{encodeURIComponent(
          clientId
        )}`;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ukffi-adsense', 'true');
      document.head.appendChild(script);
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense will initialize once script loads
    }
  }, [settings.adsEnabled, clientId, slotId]);

  if (!settings.adsEnabled) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs overflow-hidden text-center">
      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
        {slotLabel} • GOOGLE ADS
      </div>

      {clientId && slotId ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl py-3 px-3 text-[11px] text-slate-500">
          Google AdSense Slot Ready — Add your <strong>ca-pub-XXX</strong> &amp; <strong>Ad Slot ID</strong> in Admin &rarr; System to serve live Google Ads here.
        </div>
      )}
    </div>
  );
};
