import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { AppSettings, PredictionTier } from '../types';

interface PaymentModalProps {
  tier: Exclude<PredictionTier, 'FREE'>;
  settings: AppSettings;
  userEmail: string | null;
  walletBalance: number;
  onRedeemWallet: (tier: Exclude<PredictionTier, 'FREE'>, cost: number) => void;
  onClose: () => void;
  onRequireLogin: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  tier,
  settings,
  userEmail,
  walletBalance,
  onRedeemWallet,
  onClose,
  onRequireLogin,
}) => {
  const [copied, setCopied] = useState(false);
  const [mpesaNameOrRef, setMpesaNameOrRef] = useState('');

  const isDayDeal = tier === 'DAY_DEAL';
  const planTitle = isDayDeal ? 'DAY DEAL (20 - 70 ODDS)' : 'VIP MONTHLY (70 - 100 ODDS)';
  const amountStr = isDayDeal ? settings.dayDealPrice : settings.vipMonthlyPrice;
  const numericCost = Number(amountStr) || (isDayDeal ? 350 : 3500);
  const canAffordWithWallet = Boolean(userEmail) && walletBalance >= numericCost;

  const handleCopyNumber = () => {
    navigator.clipboard?.writeText(settings.paymentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIHavePaid = () => {
    if (!userEmail) {
      onRequireLogin();
      return;
    }

    const message = [
      `Hello U.K FOOTBALL FIXTURES INSIGHT Admin!`,
      `I HAVE PAID for subscription access:`,
      `• Plan: ${planTitle}`,
      `• Amount: KES ${amountStr}/=`,
      `• Account Email: ${userEmail}`,
      mpesaNameOrRef ? `• Payment Name/Ref: ${mpesaNameOrRef}` : '',
      `Please verify and activate my access immediately. Thank you!`,
    ]
      .filter(Boolean)
      .join('\n');

    const base = 'https://' + 'wa.me/';
    const whatsappUrl = `${base}${settings.supportWhatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="bg-[#0B0F19] text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              Unlock {isDayDeal ? 'Day Deal' : 'VIP Monthly'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-blue-700">Selected Plan</div>
              <div className="text-sm font-black text-[#0B0F19]">{planTitle}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-500">Fee</div>
              <div className="text-lg font-black text-red-600">KES {amountStr}/=</div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>In-App Ad Wallet Balance</span>
              </span>
              <span className="text-sm font-black text-emerald-700">
                KES {walletBalance}
              </span>
            </div>

            {canAffordWithWallet ? (
              <button
                onClick={() => {
                  onRedeemWallet(tier, numericCost);
                  onClose();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Activate Now Using Wallet (KES {numericCost})</span>
              </button>
            ) : (
              <p className="text-[11px] text-emerald-800 leading-snug">
                Watch 20s ads to earn KES {settings.adRewardKes}/ad. Reach{' '}
                <strong>KES {numericCost}</strong> to unlock this plan automatically (non-withdrawable).
              </p>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
              Or Pay via {settings.paymentNetworkLabel}
            </div>
            <div className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
              <div>
                <div className="text-[10px] text-slate-400">Send Money Number</div>
                <div className="text-base font-mono font-black tracking-wider text-emerald-400">
                  {settings.paymentNumber}
                </div>
              </div>
              <button
                onClick={handleCopyNumber}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <input
            type="text"
            value={mpesaNameOrRef}
            onChange={(e) => setMpesaNameOrRef(e.target.value)}
            placeholder="Optional: Enter M-Pesa/Airtel Name or Ref Code"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
          />

          {!userEmail && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Please <strong>Sign In</strong> first so we know which account to activate!</span>
            </div>
          )}

          <button
            onClick={handleIHavePaid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{userEmail ? 'I Have Paid — Verify on WhatsApp' : 'Sign In First'}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>18+ Match Analysis Only • Instant Approval</span>
          </div>
        </div>
      </div>
    </div>
  );
};
