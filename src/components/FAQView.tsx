import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../types';

interface FAQViewProps {
  settings: AppSettings;
}

export const FAQView: React.FC<FAQViewProps> = ({ settings }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I unlock Daily Free (2 - 5 Odds) predictions?',
      a: `When the Daily Free ad gate is enabled, simply tap "Watch ${settings.adDurationSeconds}s Ad to Unlock" once per day. All Daily Free predictions unlock immediately for the rest of the day and automatically reset tomorrow.`,
    },
    {
      q: 'How does the Insight Ad Wallet (+5 KES/day) work?',
      a: `You earn KES ${settings.adRewardKes} once per day when watching your daily sponsored ad. Wallet credits cannot be withdrawn to cash—they are strictly used inside the app to unlock Day Deal (${settings.dayDealPrice}/=) or VIP Monthly (${settings.vipMonthlyPrice}/=) once your balance reaches the required amount.`,
    },
    {
      q: 'How do I pay via M-Pesa or Airtel Money and get instant VIP activation?',
      a: `Tap "JOIN NOW!" on Day Deal (${settings.dayDealPrice}/=) or VIP Monthly (${settings.vipMonthlyPrice}/=), send the exact amount to ${settings.paymentNumber} (${settings.paymentNetworkLabel}), and tap "I Have Paid — Verify on WhatsApp". Your pre-filled verification message opens directly with our admin desk.`,
    },
    {
      q: 'How do I download and install this app onto my phone screen?',
      a: 'Tap the "Download App" button on the Home Page or inside Settings. On Android Chrome, tap "Install" on the popup prompt. On iPhone Safari, tap the Share icon and choose "Add to Home Screen".',
    },
    {
      q: 'How do I receive match alerts on my phone notification bar?',
      a: 'Tap "Allow Alerts" on the Home banner or "Enable Push Notifications" in Settings and select "Allow". Whenever our desk posts new match insights or announcements, you will receive an alert banner on your phone.',
    },
    {
      q: 'Is this a gambling or betting app?',
      a: 'No. U.K Football Fixtures Insight provides 18+ statistical sports analysis and match previews only. No wagering, betting, or cash payouts take place on this platform.',
    },
  ];

  const supportHref =
    'https://' +
    `wa.me/${settings.supportWhatsappNumber}?text=${encodeURIComponent(
      'Hello U.K FOOTBALL FIXTURES INSIGHT Help Desk! I have a question.'
    )}`;

  return (
    <div className="space-y-4">
      <div className="bg-[#0B0F19] text-white rounded-2xl p-4 border border-blue-900/40 shadow-lg">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h2 className="text-base sm:text-lg font-black tracking-tight">
            Help &amp; Frequently Asked Questions (FAQ)
          </h2>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Everything you need to know about Daily Free unlocks, Ad Wallet credits, VIP activation, and app installation.
        </p>
      </div>

      <div className="space-y-2.5">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-black text-[#0B0F19]">
                  {item.q}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>Still need help? Chat directly with our 24/7 support desk.</span>
        </div>
        <a
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Help Desk</span>
        </a>
      </div>
    </div>
  );
};
