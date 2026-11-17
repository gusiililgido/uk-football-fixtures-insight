import React from 'react';
import { X, ShieldCheck, FileText, Info, Mail } from 'lucide-react';

export type LegalDocType = 'PRIVACY' | 'TERMS' | 'ABOUT' | 'CONTACT';

interface LegalAndGuidesModalProps {
  docType: LegalDocType;
  onSelectDoc: (doc: LegalDocType) => void;
  onClose: () => void;
}

export const LegalAndGuidesModal: React.FC<LegalAndGuidesModalProps> = ({
  docType,
  onSelectDoc,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-2xl max-h-[88vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="bg-[#0B0F19] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              Official Policies & Editorial Information
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Pills */}
        <div className="bg-slate-100 px-3 py-2 flex flex-wrap gap-1.5 border-b border-slate-200 shrink-0">
          {[
            { id: 'ABOUT', label: 'About Us', icon: <Info className="w-3.5 h-3.5" /> },
            { id: 'PRIVACY', label: 'Privacy Policy', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: 'TERMS', label: 'Terms of Service', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'CONTACT', label: 'Contact Us', icon: <Mail className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectDoc(tab.id as LegalDocType)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                docType === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {docType === 'ABOUT' && (
            <>
              <h4 className="text-base font-black text-[#0B0F19]">
                About U.K. Football Fixtures Insight
              </h4>
              <p>
                <strong>U.K. Football Fixtures Insight</strong> is an independent football analytics and statistical research publication dedicated to English Premier League, EFL Championship, League One, and major European club competitions.
              </p>
              <p>
                Our editorial methodology evaluates Expected Goals (xG), Expected Goals Against (xGA), squad injury reports, tactical pressing metrics, home/away fixture congestion, and multi-season head-to-head trends to produce clear, educational match previews for football enthusiasts aged 18 and above.
              </p>
              <p>
                <strong>Non-Gambling Editorial Commitment:</strong> We are strictly a sports data and editorial research platform. We do not operate as a bookmaker, accept wagers, or process gambling transactions.
              </p>
            </>
          )}

          {docType === 'PRIVACY' && (
            <>
              <h4 className="text-base font-black text-[#0B0F19]">
                Privacy Policy &amp; Google AdSense Disclosure
              </h4>
              <p>
                Last Updated: November 2026. At <strong>U.K. Football Fixtures Insight</strong>, we respect your privacy and protect any information you share when creating a member profile.
              </p>
              <p>
                <strong>Information We Collect:</strong> When you sign in, we store your email address, display name, and membership preferences securely via encrypted cloud storage (Supabase) solely to synchronize your account access across devices.
              </p>
              <p>
                <strong>Google AdSense &amp; Advertising Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Google Ads Settings.
              </p>
              <p>
                <strong>Data Security &amp; Deletion:</strong> We never sell or rent personal email addresses to third parties. You may request account deletion anytime by contacting our support desk.
              </p>
            </>
          )}

          {docType === 'TERMS' && (
            <>
              <h4 className="text-base font-black text-[#0B0F19]">
                Terms of Service &amp; 18+ Editorial Disclaimer
              </h4>
              <p>
                By accessing <strong>U.K. Football Fixtures Insight</strong>, you confirm that you are at least <strong>18 years of age</strong>.
              </p>
              <p>
                <strong>Informational Purpose Only:</strong> All match previews, statistical probabilities, and tactical breakdowns published on this platform are provided strictly for informational and educational entertainment purposes. Past statistical accuracy does not guarantee future match results.
              </p>
              <p>
                <strong>In-App Credits &amp; Subscriptions:</strong> Optional premium research packages (Day Deal and VIP Monthly) grant access to extended editorial match reports. Any promotional in-app credits earned through sponsored engagement timers are non-withdrawable and redeemable solely for in-app research access.
              </p>
            </>
          )}

          {docType === 'CONTACT' && (
            <>
              <h4 className="text-base font-black text-[#0B0F19]">
                Contact Our Editorial &amp; Support Desk
              </h4>
              <p>
                Have a question about our matchday research, account access, or advertising partnerships? Reach our team directly:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <p>
                  <strong>Official Email:</strong> jinxzenicon254@gmail.com
                </p>
                <p>
                  <strong>WhatsApp Support Desk:</strong> +254 704 956 915
                </p>
                <p>
                  <strong>Editorial Hours:</strong> Monday – Sunday, 08:00 – 23:00 EAT
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
