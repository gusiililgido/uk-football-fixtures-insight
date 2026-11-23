import React, { useState } from 'react';
import { ShieldCheck, FileText, Info, Mail, X } from 'lucide-react';

type PolicySection = 'ABOUT' | 'PRIVACY' | 'TERMS' | 'CONTACT' | null;

export const PolicyFooter: React.FC = () => {
  const [openSection, setOpenSection] = useState<PolicySection>(null);

  return (
    <>
      <footer className="mt-8 bg-[#0B0F19] text-slate-300 rounded-3xl p-5 border border-slate-800 space-y-4 text-xs">
        <div className="space-y-1.5">
          <div className="text-sm font-black text-white">
            U.K. Football Fixtures Insight • Editorial Analytics Desk
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Independent U.K. Premier League, EFL Championship, and European football statistical previews, tactical form guides, expected goals (xG) breakdowns, and matchday fixture schedules updated daily by our sports research team.
          </p>
        </div>

        <nav
          aria-label="Legal and Editorial Information"
          className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800"
        >
          <button
            type="button"
            onClick={() => setOpenSection('ABOUT')}
            className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" /> About Us
          </button>
          <button
            type="button"
            onClick={() => setOpenSection('PRIVACY')}
            className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setOpenSection('TERMS')}
            className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" /> Terms &amp; Disclaimer
          </button>
          <button
            type="button"
            onClick={() => setOpenSection('CONTACT')}
            className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-sky-400" /> Contact Desk
          </button>
        </nav>

        <div className="text-[10px] text-slate-500 leading-relaxed">
          18+ Only. All football insights, form statistics, and match previews published on U.K. Football Fixtures Insight are strictly for informational and entertainment purposes. Please enjoy football responsibly. © {new Date().getFullYear()} U.K. Football Fixtures Insight.
        </div>
      </footer>

      {openSection && (
        <div
          onClick={() => setOpenSection(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="bg-[#0B0F19] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase">
                {openSection === 'ABOUT' && 'About U.K. Football Fixtures Insight'}
                {openSection === 'PRIVACY' && 'Privacy Policy & Advertising Disclosure'}
                {openSection === 'TERMS' && 'Terms of Use & Responsible Gaming'}
                {openSection === 'CONTACT' && 'Contact & Editorial Support'}
              </h3>
              <button
                type="button"
                onClick={() => setOpenSection(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs text-slate-700 leading-relaxed">
              {openSection === 'ABOUT' && (
                <>
                  <p>
                    <strong>U.K. Football Fixtures Insight</strong> is a dedicated football research and matchday analytics platform covering the English Premier League, EFL Championship, UEFA Champions League, and major European domestic competitions.
                  </p>
                  <p>
                    Our analysts evaluate team injury reports, head-to-head tactical trends, home/away goal differentials, and recent fixture congestion to publish structured pre-match previews and statistical insights.
                  </p>
                </>
              )}

              {openSection === 'PRIVACY' && (
                <>
                  <p>
                    We respect user privacy and protect account data using encrypted cloud authentication. We never sell personal email addresses or phone numbers to third parties.
                  </p>
                  <p>
                    <strong>Google AdSense &amp; Third-Party Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads to users based on their visit to our site and/or other sites on the Internet.
                  </p>
                  <p>
                    Users may opt out of personalized advertising by visiting{' '}
                    <a
                      href="https://google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-bold"
                    >
                      Google Ads Settings
                    </a>
                    .
                  </p>
                </>
              )}

              {openSection === 'TERMS' && (
                <>
                  <p>
                    All match previews, statistical probabilities, and tactical breakdowns provided on this platform represent independent sports journalism and opinion. Football outcomes involve inherent uncertainty, and no result is ever guaranteed.
                  </p>
                  <p>
                    Users must be at least <strong>18 years of age</strong> to access this service and are solely responsible for complying with local laws in their jurisdiction.
                  </p>
                </>
              )}

              {openSection === 'CONTACT' && (
                <>
                  <p>
                    For editorial inquiries, account assistance, or advertising questions, reach our support desk directly:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-semibold">
                    <li>Editorial &amp; Support Email: support@ukfootballfixtures.com</li>
                    <li>Official Telegram Channel &amp; Community Desk linked in the app header</li>
                    <li>Response Window: Daily 08:00 – 23:00 EAT</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
