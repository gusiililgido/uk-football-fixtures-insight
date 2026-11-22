import React from 'react';
import {
  Wallet,
  Crown,
  ShieldCheck,
  PlayCircle,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  Phone,
  Mail,
  Sparkles,
} from 'lucide-react';
import { AppSettings, PaymentRequest, UserProfile } from '../types';

interface AccountViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  settings: AppSettings;
  payments: PaymentRequest[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenPayment: (tier: 'DAY_DEAL' | 'VIP_MONTHLY') => void;
  onWatchAdForCredits: () => void;
  onUnlockWithWallet: (tier: 'DAY_DEAL' | 'VIP_MONTHLY', cost: number) => boolean;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  isAdmin,
  settings,
  payments,
  onOpenAuth,
  onLogout,
  onOpenPayment,
  onWatchAdForCredits,
  onUnlockWithWallet,
}) => {
  if (!user) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-[#0B0F19] text-amber-400 flex items-center justify-center mx-auto"><Wallet className="w-7 h-7" /></div>
        <h2 className="text-lg font-black text-[#0B0F19]">Member Wallet &amp; Account Center</h2>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">Create a free account or sign in to manage your KES wallet balance, earn sponsor ad credits, and track VIP activations across all devices.</p>
        <button type="button" onClick={onOpenAuth} className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 px-6 rounded-xl shadow cursor-pointer">Create Free Account / Sign In</button>
      </div>
    );
  }

  const walletBalance = user.walletBalance || 0;
  const dayDealCost = parseInt(String(settings.dayDealPrice).replace(/\D/g, ''), 10) || 350;
  const vipCost = parseInt(String(settings.vipMonthlyPrice).replace(/\D/g, ''), 10) || 1500;
  const userPayments = payments.filter((p) => p.userEmail.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#0B0F19] via-blue-950 to-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-blue-500/30 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-[#0B0F19] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase"><ShieldCheck className="w-3 h-3" /> {isAdmin ? 'ADMIN MASTER' : user.tier.replace('_', ' ')}</span>
            <h2 className="text-lg font-black mt-1.5">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300 mt-0.5">
              {user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-blue-400" />{user.phone}</span>}
              <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-400" />{user.email}</span>
            </div>
          </div>
          <button type="button" onClick={onLogout} className="bg-white/10 hover:bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"><LogOut className="w-3.5 h-3.5" /> Logout</button>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 border border-white/15 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-blue-300 font-bold flex items-center gap-1"><Wallet className="w-3.5 h-3.5 text-amber-400" /> Available KES Wallet</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5">KES {walletBalance}</div>
            <div className="text-[10px] text-slate-300 mt-0.5">{user.expiresAt ? `VIP Valid Until: ${user.expiresAt}` : 'Earn KES credits via sponsor ads or M-Pesa'}</div>
          </div>
          <div className="text-right shrink-0"><div className="text-[10px] text-slate-400 font-bold">Ads Watched</div><div className="text-base font-black text-emerald-400">{user.adsWatchedCount || 0}</div></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onWatchAdForCredits} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"><PlayCircle className="w-4 h-4" /><span>Earn +50 KES (Ad)</span></button>
          <button type="button" onClick={() => onOpenPayment('VIP_MONTHLY')} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"><CreditCard className="w-4 h-4" /><span>Submit M-Pesa</span></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between"><h3 className="text-xs font-black uppercase text-[#0B0F19] flex items-center gap-1.5"><Crown className="w-4 h-4 text-amber-500" /> Instant VIP Activation</h3><span className="text-[10px] font-bold text-slate-500">Wallet or M-Pesa</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-xs font-black text-[#0B0F19]">Day Deal (20–70 Odds)</span><span className="text-xs font-black text-blue-700">KES {dayDealCost}</span></div>
            <p className="text-[11px] text-slate-600">24-hour full access to high-return daily accumulator.</p>
            {walletBalance >= dayDealCost ? (
              <button type="button" onClick={() => onUnlockWithWallet('DAY_DEAL', dayDealCost)} className="w-full bg-emerald-600 text-white text-xs font-black py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"><Sparkles className="w-3.5 h-3.5" /> Activate with Wallet</button>
            ) : (
              <button type="button" onClick={() => onOpenPayment('DAY_DEAL')} className="w-full bg-blue-600 text-white text-xs font-black py-2 rounded-xl cursor-pointer">Pay KES {dayDealCost} via M-Pesa</button>
            )}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-xs font-black text-[#0B0F19]">VIP Monthly (70–100 Odds)</span><span className="text-xs font-black text-red-600">KES {vipCost}</span></div>
            <p className="text-[11px] text-slate-600">30-day unlimited access across all VIP &amp; Day Deal slips.</p>
            {walletBalance >= vipCost ? (
              <button type="button" onClick={() => onUnlockWithWallet('VIP_MONTHLY', vipCost)} className="w-full bg-emerald-600 text-white text-xs font-black py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"><Sparkles className="w-3.5 h-3.5" /> Activate with Wallet</button>
            ) : (
              <button type="button" onClick={() => onOpenPayment('VIP_MONTHLY')} className="w-full bg-[#0B0F19] text-white text-xs font-black py-2 rounded-xl cursor-pointer">Pay KES {vipCost} via M-Pesa</button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-xs">
        <h3 className="text-xs font-black uppercase text-[#0B0F19]">Payment Verification History ({userPayments.length})</h3>
        {userPayments.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No M-Pesa payment submissions yet. Any payment submitted appears here with live approval status.</p>
        ) : (
          <div className="space-y-2">
            {userPayments.map((pm) => (
              <div key={pm.id} className="bg-slate-50 border rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="font-black text-[#0B0F19]">{pm.tier.replace('_', ' ')} • KES {pm.amountKes}</div>
                  <div className="text-[11px] font-mono text-slate-600 truncate">Code: {pm.mpesaCode}</div>
                  <div className="text-[10px] text-slate-400">{pm.submittedAt}</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${pm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : pm.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                  {pm.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : pm.status === 'REJECTED' ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {pm.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
