import React, { useState } from 'react';
import {
  X,
  UserPlus,
  LogIn,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  existingUsers: UserProfile[];
  onRegister: (data: {
    name: string;
    countryCode: string;
    phone: string;
    email: string;
    password: string;
  }) => { ok: boolean; error?: string };
  onLogin: (identifier: string, password: string) => { ok: boolean; error?: string };
  onClose: () => void;
  contextBanner?: string;
}

const COUNTRY_CODES = [
  { code: '+254', label: '🇰🇪 +254 (Kenya)' },
  { code: '+256', label: '🇺🇬 +256 (Uganda)' },
  { code: '+255', label: '🇹🇿 +255 (Tanzania)' },
  { code: '+250', label: '🇷🇼 +250 (Rwanda)' },
  { code: '+234', label: '🇳🇬 +234 (Nigeria)' },
  { code: '+233', label: '🇬🇭 +233 (Ghana)' },
  { code: '+27', label: '🇿🇦 +27 (South Africa)' },
  { code: '+44', label: '🇬🇧 +44 (U.K.)' },
  { code: '+1', label: '🇺🇸 +1 (USA / Canada)' },
  { code: '+971', label: '🇦🇪 +971 (UAE)' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  onRegister,
  onLogin,
  onClose,
  contextBanner,
}) => {
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+254');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'REGISTER') {
      const cleanPhone = phone.replace(/\D/g, '').replace(/^0+/, '');
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (cleanPhone.length < 7) {
        setErrorMsg('Please enter a valid mobile phone number.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (password.trim().length < 4) {
        setErrorMsg('Create a password with at least 4 characters.');
        return;
      }
      const res = onRegister({
        name: name.trim(),
        countryCode,
        phone: `${countryCode}${cleanPhone}`,
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (!res.ok && res.error) setErrorMsg(res.error);
    } else {
      if (!email.trim()) {
        setErrorMsg('Enter your registered email or phone number.');
        return;
      }
      const res = onLogin(email.trim(), password.trim());
      if (!res.ok && res.error) setErrorMsg(res.error);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-[#0B0F19] text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'REGISTER' ? <UserPlus className="w-5 h-5 text-emerald-400" /> : <LogIn className="w-5 h-5 text-blue-400" />}
            <h3 className="text-sm font-black uppercase tracking-wide">{mode === 'REGISTER' ? 'Create Free Account' : 'Member Sign In'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {contextBanner && (
            <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold p-2.5 rounded-xl">{contextBanner}</div>
          )}

          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => { setMode('REGISTER'); setErrorMsg(''); }} className={`py-2 rounded-lg text-xs font-black cursor-pointer ${mode === 'REGISTER' ? 'bg-blue-600 text-white shadow' : 'text-slate-600'}`}>Create Account</button>
            <button type="button" onClick={() => { setMode('LOGIN'); setErrorMsg(''); }} className={`py-2 rounded-lg text-xs font-black cursor-pointer ${mode === 'LOGIN' ? 'bg-[#0B0F19] text-white shadow' : 'text-slate-600'}`}>Sign In</button>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-2.5 rounded-xl flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {mode === 'REGISTER' && (
              <>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Brian Kamau" className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Country Code &amp; Phone Number</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="col-span-2 px-2 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50">
                      {COUNTRY_CODES.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                    </select>
                    <div className="col-span-3 relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="712345678" className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">{mode === 'REGISTER' ? 'Email Address' : 'Email or Phone Number'}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type={mode === 'REGISTER' ? 'email' : 'text'} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={mode === 'REGISTER' ? 'you@gmail.com' : 'Email or +2547...'} className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full pl-9 pr-9 py-2.5 text-xs border border-slate-300 rounded-xl" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow cursor-pointer">
              {mode === 'REGISTER' ? 'Create Free Account & Unlock Services' : 'Sign In to My Account'}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant Access • Multi-Device Cloud Sync</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
