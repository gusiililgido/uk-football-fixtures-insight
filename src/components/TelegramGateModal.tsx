import React, { useEffect, useState } from 'react';
import {
  Send,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { AppSettings } from '../types';

interface TelegramGateModalProps {
  settings: AppSettings;
  onVerified: (mode: 'JOINED' | 'NO_TELEGRAM') => void;
}

export const TelegramGateModal: React.FC<TelegramGateModalProps> = ({
  settings,
  onVerified,
}) => {
  const [clickedJoin, setClickedJoin] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [telegramInput, setTelegramInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!clickedJoin || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [clickedJoin, secondsLeft]);

  const channelUrl =
    settings.telegramChannelUrl && settings.telegramChannelUrl.includes('t.me/')
      ? settings.telegramChannelUrl
      : 'https://' + 't.me/uk_Football_Insights';

  const channelSlug =
    '@' + channelUrl.split('t.me/').pop()!.replace(/[^a-zA-Z0-9_]/g, '');

  const handleOpenTelegram = () => {
    setClickedJoin(true);
    setErrorMsg('');
    window.open(channelUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVerifyJoined = async () => {
    if (secondsLeft > 0) return;
    setErrorMsg('');

    const botToken = settings.telegramBotToken?.trim();
    if (!botToken) {
      onVerified('JOINED');
      return;
    }

    const raw = telegramInput.trim().replace(/^@/, '');
    if (!raw) {
      setErrorMsg(
        'Enter your numeric Telegram User ID (message @userinfobot on Telegram to get your ID) or @username.'
      );
      return;
    }

    setVerifying(true);
    try {
      let numericUserId = /^\d+$/.test(raw) ? raw : '';

      // If user entered a @username, look up their numeric ID from bot getUpdates
      if (!numericUserId) {
        const updatesUrl =
          'https://' + `api.telegram.org/bot${encodeURIComponent(botToken)}/getUpdates?limit=100`;
        const uRes = await fetch(updatesUrl);
        const uData = await uRes.json();
        if (uData.ok && Array.isArray(uData.result)) {
          for (const upd of uData.result) {
            const from =
              upd.message?.from ||
              upd.chat_member?.from ||
              upd.my_chat_member?.from;
            if (
              from &&
              from.username &&
              from.username.toLowerCase() === raw.toLowerCase()
            ) {
              numericUserId = String(from.id);
              break;
            }
          }
        }
      }

      if (!numericUserId) {
        setErrorMsg(
          'Enter your numeric Telegram ID (send /start to @userinfobot on Telegram to see your ID number) so we can verify your membership!'
        );
        setVerifying(false);
        return;
      }

      const checkUrl =
        'https://' +
        `api.telegram.org/bot${encodeURIComponent(
          botToken
        )}/getChatMember?chat_id=${encodeURIComponent(
          channelSlug
        )}&user_id=${encodeURIComponent(numericUserId)}`;

      const res = await fetch(checkUrl);
      const data = await res.json();

      const validStatuses = ['member', 'administrator', 'creator'];
      if (data.ok && validStatuses.includes(data.result?.status)) {
        onVerified('JOINED');
      } else if (data.description?.includes('chat not found') || data.description?.includes('administrator')) {
        setErrorMsg(
          'Bot setup check: Make sure your bot is added as an Admin inside ' +
            channelSlug +
            ' on Telegram!'
        );
      } else {
        setErrorMsg(
          'Not joined yet! Please tap "1. Join Telegram Channel" above, join ' +
            channelSlug +
            ', and then tap Verify again.'
        );
      }
    } catch {
      setErrorMsg(
        'Network error reaching Telegram. Check your internet connection and tap Verify again.'
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-2 border-blue-600 overflow-hidden">
        <div className="bg-[#0B0F19] text-white px-4 py-4 text-center space-y-1.5 border-b border-blue-900/50">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center shadow-lg">
            <Send className="w-6 h-6 text-white" />
          </div>
          <span className="inline-block bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Mandatory Matchday Access</span>
          <h2 className="text-base sm:text-lg font-black tracking-tight">Join Our Official Telegram Channel to Continue</h2>
          <p className="text-[11px] text-blue-300">Get instant 98% matchday slips, live goal alerts &amp; VIP updates ({channelSlug})</p>
        </div>
        <div className="p-4 space-y-3.5">
          <button type="button" onClick={handleOpenTelegram} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer">
            <Send className="w-4 h-4" />
            <span>1. Join Telegram Channel ({channelSlug})</span>
          </button>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#0B0F19]">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-600" /><span>2. Real Membership Verification</span></span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${secondsLeft === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {!clickedJoin ? 'Tap Join Above First' : secondsLeft > 0 ? `${secondsLeft}s Remaining` : 'Ready to Verify ✓'}
              </span>
            </div>
            {settings.telegramBotToken?.trim() && (
              <div className="space-y-1">
                <input type="text" value={telegramInput} onChange={(e) => setTelegramInput(e.target.value)} placeholder="Enter your Telegram ID (e.g. 6182940123)" className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white" />
                <p className="text-[10px] text-slate-500">Tip: Message <strong>@userinfobot</strong> on Telegram to copy your numeric ID.</p>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold p-2.5 rounded-xl flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            <button type="button" disabled={!clickedJoin || secondsLeft > 0 || verifying} onClick={handleVerifyJoined} className={`w-full font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition ${!clickedJoin || secondsLeft > 0 || verifying ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow cursor-pointer'}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{verifying ? 'Verifying with Telegram...' : secondsLeft > 0 ? `I Have Joined (Wait ${secondsLeft}s)` : 'I Have Joined — Verify & Enter App'}</span>
            </button>
          </div>
          <div className="pt-1 border-t border-slate-100 text-center">
            <button type="button" onClick={() => onVerified('NO_TELEGRAM')} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#0B0F19] underline cursor-pointer">
              <UserCheck className="w-3.5 h-3.5" />
              <span>I don’t have a Telegram account — Continue to App</span>
            </button>
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>18+ Statistical Football Analysis • U.K Football Insight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
