import React, { useState } from 'react';
import { Send, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';

interface TelegramJoinModalProps {
  telegramUrl: string;
  onVerified: () => void;
}

export const TelegramJoinModal: React.FC<TelegramJoinModalProps> = ({
  telegramUrl,
  onVerified,
}) => {
  const [clickedJoin, setClickedJoin] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B0F19] via-blue-950 to-[#0B0F19] text-white px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">Step 2 of 2 • Community Access</span>
            <h3 className="text-sm sm:text-base font-black">Join Our Official Telegram Channel</h3>
          </div>
        </div>

        <div className="p-5 space-y-3.5 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Get instant live betslip drops, in-play goal alerts, and daily winning proofs directly on Telegram.
          </p>

          <a
            href={telegramUrl || 'https://t.me'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setClickedJoin(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl shadow flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>1. Open &amp; Join Telegram Channel</span>
          </a>

          <button
            type="button"
            onClick={onVerified}
            className={`w-full font-black py-3 px-4 rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer ${
              clickedJoin
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>2. I’ve Joined — Enter Full App</span>
          </button>

          <button
            type="button"
            onClick={onVerified}
            className="w-full text-[11px] font-bold text-slate-500 hover:text-slate-800 py-1.5 underline cursor-pointer"
          >
            I don’t have Telegram app — Continue to App
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Member Access Unlocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
