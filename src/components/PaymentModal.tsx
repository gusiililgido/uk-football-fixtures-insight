import React, { useState } from 'react';
import {
  X,
  Crown,
  Copy,
  CheckCircle2,
  Smartphone,
  Wallet,
  Clock,
  ShieldCheck,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { AppSettings, PaymentRequest, UserProfile } from '../types';

interface PaymentModalProps {
  initialTier: 'DAY_DEAL' | 'VIP_MONTHLY';
  settings: AppSettings;
  user: UserProfile | null;
  pendingPayments: PaymentRequest[];
  onSubmitPayment: (tier: 'DAY_DEAL' | 'VIP_MONTHLY', mpesaCode: string) => Promise<void>;
  onUnlockWithWallet: (tier: 'DAY_DEAL' | 'VIP_MONTHLY', cost: number) => boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  initialTier,
  settings,
  user,
  pendingPayments,
  onSubmitPayment,
  onUnlockWithWallet,
  onClose,
}) => {
  const [selectedTier, setSelectedTier] = useState<'DAY_DEAL' | 'VIP_MONTHLY'>(initialTier);
  const [mpesaCode, setMpesaCode] = useState('');
  const [copiedField, setCopiedField] = useState<'NUMBER' | 'ACCOUNT' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedDone, setSubmittedDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const amountStr =
    selectedTier === 'DAY_DEAL' ? settings.dayDealPrice : settings.vipMonthlyPrice;
  const amountNum =
    parseInt(String(amountStr).replace(/\D/g, ''), 10) ||
    (selectedTier === 'DAY_DEAL' ? 350 : 1500);
  const walletBalance = user?.walletBalance || 0;
  const canPayWithWallet = walletBalance >= amountNum;

  const existingPending = pendingPayments.find(
    (p) =>
      user &&
      p.userEmail.toLowerCase() === user.email.toLowerCase() &&
      p.status === 'PENDING'
  );

  const copyText = (val: string, field: 'NUMBER' | 'ACCOUNT') => {
    navigator.clipboard?.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleaned = mpesaCode.trim();
    if (cleaned.length < 6) {
      setErrorMsg('Please paste your valid M-Pesa transaction code or full confirmation SMS.');
      return;
    }
    setSubmitting(true);
    await onSubmitPayment(selectedTier, cleaned);
    setSubmitting(false);
    setSubmittedDone(true);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3">
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#0B0F19] via-blue-950 to-[#0B0F19] text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide">Official VIP Payment Desk</h3>
              <p className="text-[10px] text-blue-300">Instant Verification &amp; Automatic Activation</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button type="button" onClick={() => { setSelectedTier('DAY_DEAL'); setSubmittedDone(false); }} className={`py-2.5 px-2 rounded-xl font-black cursor-pointer ${selectedTier === 'DAY_DEAL' ? 'bg-blue-600 text-white shadow' : 'text-slate-700'}`}>
              Day Deal • KES {settings.dayDealPrice}
            </button>
            <button type="button" onClick={() => { setSelectedTier('VIP_MONTHLY'); setSubmittedDone(false); }} className={`py-2.5 px-2 rounded-xl font-black cursor-pointer ${selectedTier === 'VIP_MONTHLY' ? 'bg-red-600 text-white shadow' : 'text-slate-700'}`}>
              VIP Monthly • KES {settings.vipMonthlyPrice}
            </button>
          </div>

          {canPayWithWallet && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between font-black text-emerald-900">
                <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-600" /> Wallet Balance: KES {walletBalance}</span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">INSTANT</span>
              </div>
              <button type="button" onClick={() => { if (onUnlockWithWallet(selectedTier, amountNum)) onClose(); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl shadow cursor-pointer">
                Activate Instantly Using Wallet (KES {amountNum})
              </button>
            </div>
          )}

          {submittedDone || existingPending ? (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 text-center space-y-2">
              <Clock className="w-9 h-9 text-blue-600 mx-auto" />
              <div className="text-sm font-black text-[#0B0F19]">Payment Submitted for Verification</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Transaction <strong>{existingPending?.mpesaCode || mpesaCode}</strong> is now in our live verification queue. Your VIP access unlocks automatically once approved!
              </p>
              <button type="button" onClick={onClose} className="w-full bg-[#0B0F19] text-white font-black py-2.5 rounded-xl mt-2 cursor-pointer">Done &amp; Return to App</button>
            </div>
          ) : (
            <>
              {settings.paymentPosterUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-sm">
                  <img src={settings.paymentPosterUrl} alt="Official Payment Poster" className="w-full max-h-56 object-contain mx-auto" />
                </div>
              )}

              <div className="bg-gradient-to-br from-[#0B0F19] to-slate-900 text-white rounded-2xl p-3.5 space-y-2.5 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" /> {settings.paymentMethodTitle || 'M-Pesa / Paybill / Till'}
                  </span>
                  <span className="text-xs font-black bg-amber-400 text-[#0B0F19] px-2.5 py-0.5 rounded-full">KES {amountStr}</span>
                </div>

                <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/15 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[9px] uppercase text-blue-300 font-bold">Paybill / Till / Phone Number</div>
                    <div className="font-mono text-sm font-black tracking-wider">{settings.paymentNumber}</div>
                  </div>
                  <button type="button" onClick={() => copyText(settings.paymentNumber, 'NUMBER')} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer">
                    {copiedField === 'NUMBER' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>

                {settings.paymentAccountNumber && (
                  <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/15 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[9px] uppercase text-amber-300 font-bold">Account Number / Reference</div>
                      <div className="font-mono text-sm font-black tracking-wider">{settings.paymentAccountNumber}</div>
                    </div>
                    <button type="button" onClick={() => copyText(settings.paymentAccountNumber!, 'ACCOUNT')} className="bg-amber-400 hover:bg-amber-300 text-[#0B0F19] text-[11px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer">
                      {copiedField === 'ACCOUNT' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                )}

                {settings.paymentAccountName && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300 pt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Recipient Name: <strong className="text-white">{settings.paymentAccountName}</strong></span>
                  </div>
                )}

                {settings.paymentInstructions && (
                  <p className="text-[11px] text-slate-300 bg-black/30 p-2 rounded-xl leading-relaxed">
                    {settings.paymentInstructions}
                  </p>
                )}
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 font-bold p-2.5 rounded-xl flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Paste M-Pesa Transaction Code or Full SMS</label>
                  <textarea rows={2} required value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value)} placeholder="e.g. SJK84L9P2X Confirmed. Ksh350.00 sent to..." className="w-full p-2.5 text-xs border border-slate-300 rounded-xl font-mono" />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black py-3 rounded-xl shadow cursor-pointer">
                  {submitting ? '⏳ Submitting to Verification Desk...' : `Submit KES ${amountStr} Payment for Instant Approval`}
                </button>
              </form>
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automatic Cloud Activation • 24/7 Verification Desk</span>
          </div>
        </div>
      </div>
    </div>
  );
};
