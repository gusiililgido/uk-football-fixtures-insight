import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Scale,
  Info,
  Mail,
  BookOpen,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AppSettings } from '../types';

export type LegalPageKey =
  | 'ABOUT'
  | 'PRIVACY'
  | 'TERMS'
  | 'DISCLAIMER'
  | 'CONTACT'
  | 'ARCHIVE';

interface LegalHubProps {
  initialPage?: LegalPageKey;
  settings: AppSettings;
}

const ARCHIVE_ARTICLES = [
  {
    date: 'Nov 16, 2026',
    league: 'England • Premier League',
    fixture: 'Arsenal 2 - 0 Nottingham Forest',
    pick: 'Home Win & Over 1.5 Goals',
    result: 'WON',
    summary:
      'Arsenal controlled 68% possession at the Emirates with 2.45 xG, converting twice in the second half while restricting Forest to 0.38 xG.',
  },
  {
    date: 'Nov 15, 2026',
    league: 'England • Championship',
    fixture: 'Leeds United 3 - 1 Swansea City',
    pick: 'Over 2.5 Match Goals',
    result: 'WON',
    summary:
      'High pressing transitions produced 19 shots on target combined, confirming our pre-match expected-goals model.',
  },
  {
    date: 'Nov 14, 2026',
    league: 'UEFA Nations League',
    fixture: 'England 2 - 1 Republic of Ireland',
    pick: 'Home Win & Both Teams To Score',
    result: 'WON',
    summary:
      'Wembley tactical breakdown highlighted wide overloads and set-piece vulnerability, landing both legs cleanly.',
  },
  {
    date: 'Nov 12, 2026',
    league: 'England • EFL Trophy',
    fixture: 'Birmingham City 2 - 0 Bolton Wanderers',
    pick: 'Home Win',
    result: 'WON',
    summary:
      'Squad rotation report confirmed Birmingham fielded a near full-strength midfield, dominating aerial duels.',
  },
  {
    date: 'Nov 10, 2026',
    league: 'England • Premier League',
    fixture: 'Liverpool 2 - 0 Aston Villa',
    pick: 'Home Win & Under 4.5 Goals',
    result: 'WON',
    summary:
      'Anfield defensive compactness neutralized Villa’s counter-attacks while clinical transition play secured a 2-0 victory.',
  },
  {
    date: 'Nov 09, 2026',
    league: 'England • Premier League',
    fixture: 'Brighton 2 - 1 Manchester City',
    pick: 'Both Teams To Score (GG)',
    result: 'WON',
    summary:
      'Injury tracking on City’s holding midfield indicated transition exposure, accurately forecasting goals at both ends.',
  },
];
export const LegalHub: React.FC<LegalHubProps> = ({
  initialPage = 'ARCHIVE',
  settings,
}) => {
  const [page, setPage] = useState<LegalPageKey>(initialPage);

  const navItems: { id: LegalPageKey; label: string; icon: React.ReactNode }[] = [
    { id: 'ARCHIVE', label: 'Match Reports', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'ABOUT', label: 'About Us', icon: <Info className="w-3.5 h-3.5" /> },
    { id: 'PRIVACY', label: 'Privacy Policy', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'TERMS', label: 'Terms', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'DISCLAIMER', label: '18+ Disclaimer', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'CONTACT', label: 'Contact', icon: <Mail className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#0B0F19] text-white rounded-2xl p-4 border border-blue-900/40 shadow-lg">
        <h2 className="text-base sm:text-lg font-black tracking-tight">
          Editorial Archive &amp; Compliance Center
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Transparent U.K. football statistical reports, editorial standards, and user privacy policies.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                page === item.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {page === 'ARCHIVE' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-black uppercase text-blue-700">
              Verified Post-Match Statistical Reports
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Our analytics desk publishes transparent post-match tactical reviews across the English Premier League, EFL Championship, and European competitions.
            </p>
          </div>

          {ARCHIVE_ARTICLES.map((art, i) => (
            <article
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-500">
                  {art.date} • {art.league}
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  {art.result === 'WON' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {art.result}
                </span>
              </div>
              <h4 className="text-sm font-black text-[#0B0F19]">{art.fixture}</h4>
              <div className="text-xs font-bold text-blue-700">
                Pre-Match Analysis: {art.pick}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{art.summary}</p>
            </article>
          ))}
        </div>
      )}

      {page === 'ABOUT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-black uppercase text-blue-700">
            About U.K Football Fixtures Insight
          </h3>
          <p>
            <strong>U.K Football Fixtures Insight</strong> is an independent sports journalism and statistical football analytics platform. Our editorial team evaluates expected goals (xG), squad injury reports, head-to-head trends, and tactical matchups across British and European football leagues.
          </p>
          <p>
            We do not operate as a bookmaker, casino, or wagering operator. No bets or financial wagers are accepted on this website. All insights are published strictly for informational and educational sports research for adults aged 18 and older.
          </p>
        </div>
      )}

      {page === 'PRIVACY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-black uppercase text-blue-700">
            Privacy Policy &amp; Google AdSense Cookies
          </h3>
          <p>
            We respect your privacy. When you create a member profile, we store your display name, email address, and subscription status solely to synchronize your account preferences and Insight Ad Wallet credits.
          </p>
          <p>
            <strong>Third-Party Advertising (Google AdSense):</strong> Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the Internet.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting Google Ads Settings (://google.com).
          </p>
        </div>
      )}

      {page === 'TERMS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-black uppercase text-blue-700">Terms of Service</h3>
          <p>
            1. <strong>Age Restriction (18+):</strong> By accessing U.K Football Fixtures Insight, you confirm that you are at least 18 years of age.
          </p>
          <p>
            2. <strong>Informational Analysis Only:</strong> All match previews, statistical ratings, and VIP research slips are informational opinions only. Past accuracy does not guarantee future match outcomes.
          </p>
          <p>
            3. <strong>In-App Ad Wallet:</strong> Promotional wallet credits earned via sponsored ads are non-withdrawable, hold zero cash value outside this platform, and may only be redeemed toward in-app subscription tiers.
          </p>
        </div>
      )}

      {page === 'DISCLAIMER' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-black uppercase text-red-600">
            18+ Non-Gambling &amp; Editorial Disclaimer
          </h3>
          <p>
            U.K Football Fixtures Insight is <strong>not a gambling or betting platform</strong>. Users cannot deposit funds to stake on matches, and we never process payouts or wagers.
          </p>
          <p>
            Football matches are inherently unpredictable. Users purchase access to independent statistical research and editorial match analysis at their own discretion.
          </p>
        </div>
      )}

      {page === 'CONTACT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-black uppercase text-blue-700">
            Contact Editorial &amp; Support Desk
          </h3>
          <p>
            Have a question about our match analysis, privacy policy, or subscription access? Reach our team directly:
          </p>
          <ul className="space-y-1 font-semibold">
            <li>• Official Support WhatsApp: +{settings.supportWhatsappNumber}</li>
            <li>• Editorial Admin Email: jinxzenicon254@gmail.com</li>
            <li>• Operating Hours: 24/7 Matchday Desk</li>
          </ul>
        </div>
      )}
    </div>
  );
};
