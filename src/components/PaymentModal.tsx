import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { AppSettings, PredictionTier } from '../types';

interface PaymentModalProps {
  tier: Exclude<PredictionTier, 'FREE'>;
  settings: AppSettings;
  userEmail: string | null;
  onClose: () => void;
  onRequireLogin: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  tier,
  settings,
  userEmail,
  onClose,
  onRequireLogin,
}) => {
  const [copied, setCopied] = useState(false);
  const [mpesaNameOrRef, setMpesaNameOrRef] = useState('');

  const isDayDeal = tier === 'DAY_DEAL';
  const planTitle = isDayDeal ? 'DAY DEAL (20 - 70 ODDS)' : 'VIP MONTHLY (70 - 100 ODDS)';
  const amount = isDayDeal ? settings.dayDealPrice : settings.vipMonthlyPrice;

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
      `• Amount: KES ${amount}/=`,
      `• Account Email: ${userEmail}`,
      mpesaNameOrRef ? `• Payment Name/Ref: ${mpesaNameOrRef}` : '',
      `Please verify and activate my access immediately. Thank you!`,
    ]
      .filter(Boolean)
      .join('\n');

    const whatsappUrl = `https://wa.me{settings.supportWhatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Obsidian & Royal Blue Header */}
        <div className="bg-[#0B0F19] text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              Manual Subscription Activation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Selected Plan Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-blue-700">
                Selected Package
              </div>
              <div className="text-sm font-black text-[#0B0F19]">{planTitle}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-500">Total Fee</div>
              <div className="text-lg font-black text-red-600">KES {amount}/=</div>
            </div>
          </div>

          {/* Payment Number Card */}
          <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
              Step 1: Send KES {amount}/= via {settings.paymentNetworkLabel}
            </div>
            <div className="flex items-center justify-between bg-slate-800 px-3 py-2.5 rounded-lg border border-slate-700">
              <div>
                <div className="text-[10px] text-slate-400">Send Money Number</div>
                <div className="text-lg font-mono font-black tracking-wider text-emerald-400">
                  {settings.paymentNumber}
                </div>
              </div>
              <button
                onClick={handleCopyNumber}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Optional M-Pesa Name / Ref Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Step 2: Enter M-Pesa/Airtel Sender Name or Code (Optional)
            </label>
            <input
              type="text"
              value={mpesaNameOrRef}
              onChange={(e) => setMpesaNameOrRef(e.target.value)}
              placeholder="e.g. John Kamau or QK89..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
            />
          </div>

          {!userEmail && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Please <strong>Login / Sign Up</strong> first so we know which email account to unlock!
              </span>
            </div>
          )}

          {/* Direct WhatsApp Verification Button */}
          <button
            onClick={handleIHavePaid}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{userEmail ? 'I Have Paid — Verify on WhatsApp' : 'Login First to Verify'}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>18+ Match Analysis Only • Instant Admin Approval</span>
          </div>
        </div>
      </div>
    </div>
  );
};
