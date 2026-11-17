import React, { useState } from 'react';
import { X, ShieldCheck, LogIn, AlertTriangle } from 'lucide-react';
import { ADMIN_EMAIL } from '../data/initialData';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (email: string, name: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isOver18, setIsOver18] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isOver18) {
      setError('You must confirm you are 18+ years old to access match analysis.');
      return;
    }

    const displayName =
      name.trim() ||
      (cleanEmail === ADMIN_EMAIL.toLowerCase()
        ? 'Chief Admin'
        : cleanEmail.split('@')[0]);

    onLogin(cleanEmail, displayName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0B0F19] text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              Member Sign In & 18+ Verification
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex M."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
            />
          </div>

          <label className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 p-3 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={isOver18}
              onChange={(e) => setIsOver18(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600"
            />
            <span className="text-xs text-slate-700 leading-snug">
              I confirm I am <strong>18+ years old</strong> and understand this app provides statistical football analysis only (no gambling or staking allowed).
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 border border-red-200 p-2.5 rounded-xl">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-xl shadow flex items-center justify-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Continue to Insights</span>
          </button>
        </form>
      </div>
    </div>
  );
};
