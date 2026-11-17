import React, { useState } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Trash2,
  Pin,
  Users,
  Image as ImageIcon,
  Megaphone,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Ban,
  Crown,
  Upload,
  Wrench,
  PlayCircle,
  Wallet,
} from 'lucide-react';
import {
  AppSettings,
  MatchStatus,
  Prediction,
  PredictionTier,
  SpotlightMedia,
  UserProfile,
} from '../types';

interface AdminPanelProps {
  predictions: Prediction[];
  setPredictions: React.Dispatch<React.SetStateAction<Prediction[]>>;
  spotlight: SpotlightMedia;
  setSpotlight: React.Dispatch<React.SetStateAction<SpotlightMedia>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  setAnnouncements: React.Dispatch<React.SetStateAction<string[]>>;
}

type AdminSubTab = 'MATCHES' | 'SPOTLIGHT' | 'USERS' | 'SYSTEM';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  predictions,
  setPredictions,
  spotlight,
  setSpotlight,
  settings,
  setSettings,
  users,
  setUsers,
  setAnnouncements,
}) => {
  const [subTab, setSubTab] = useState<AdminSubTab>('MATCHES');
  const [toast, setToast] = useState('');

  const [tier, setTier] = useState<PredictionTier>('FREE');
  const [league, setLeague] = useState('England • Premier League');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [kickoffTime, setKickoffTime] = useState('20:00 EAT');
  const [pick, setPick] = useState('');
  const [odds, setOdds] = useState('');
  const [confidence, setConfidence] = useState('98%');
  const [analysisNote, setAnalysisNote] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim() || !pick.trim() || !odds.trim()) return;

    const newMatch: Prediction = {
      id: `match-${Date.now()}`,
      tier,
      league: league.trim() || 'U.K. Football',
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      kickoffTime: kickoffTime.trim() || 'Today',
      matchDate: 'Today',
      pick: pick.trim(),
      odds: odds.trim(),
      confidence: confidence.trim() || '98%',
      analysisNote: analysisNote.trim(),
      status: 'PENDING',
      pinned: false,
    };

    setPredictions((prev) => [newMatch, ...prev]);
    setHomeTeam('');
    setAwayTeam('');
    setPick('');
    setOdds('');
    setAnalysisNote('');
    notify('Match analysis published live!');
  };

  const handleStatusChange = (id: string, status: MatchStatus) => {
    setPredictions((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    notify(`Marked match as ${status}`);
  };

  const handleTogglePin = (id: string) => {
    setPredictions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p))
    );
    notify('Updated pin priority');
  };

  const handleDeleteMatch = (id: string) => {
    setPredictions((prev) => prev.filter((p) => p.id !== id));
    notify('Match deleted');
  };

  const handleLocalMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSpotlight((prev) => ({
          ...prev,
          mediaType: isVideo ? 'video' : 'image',
          mediaUrl: reader.result as string,
          updatedAt: 'Just Now',
        }));
        notify(`${isVideo ? 'Video' : 'Image'} uploaded to Home Spotlight!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGrantTier = (email: string, newTier: PredictionTier) => {
    const days = newTier === 'VIP_MONTHLY' ? 30 : newTier === 'DAY_DEAL' ? 1 : 0;
    const expiryDate =
      days > 0
        ? new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)
        : null;

    setUsers((prev) =>
      prev.map((u) =>
        u.email === email ? { ...u, tier: newTier, expiresAt: expiryDate } : u
      )
    );
    notify(`Granted ${newTier} to ${email}`);
  };

  const handleAdjustWallet = (email: string, delta: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email
          ? { ...u, walletBalance: Math.max(0, (u.walletBalance || 0) + delta) }
          : u
      )
    );
    notify(`Updated wallet by ${delta > 0 ? `+${delta}` : delta} KES`);
  };

  const handleToggleBan = (email: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, isBanned: !u.isBanned } : u))
    );
    notify('Updated user ban status');
  };

  const onlineUsersCount = users.filter((u) => u.isOnline).length;
  const paidUsersCount = users.filter((u) => u.tier !== 'FREE').length;
  return (
    <div className="space-y-4">
      <div className="bg-[#0B0F19] text-white rounded-2xl p-4 border border-red-600/50 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider">
              Invisible Admin Command Center
            </h2>
          </div>
          <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            {settings.maintenanceMode ? 'MAINTENANCE ON' : 'LIVE MODE'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-3 text-center">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <div className="text-sm font-black text-white">{users.length}</div>
            <div className="text-[10px] text-slate-400">Users</div>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <div className="text-sm font-black text-emerald-400">{onlineUsersCount}</div>
            <div className="text-[10px] text-slate-400">Online</div>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <div className="text-sm font-black text-amber-400">{paidUsersCount}</div>
            <div className="text-[10px] text-slate-400">VIP/Day</div>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <div className="text-sm font-black text-blue-400">{predictions.length}</div>
            <div className="text-[10px] text-slate-400">Slips</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {[
            { id: 'MATCHES', label: 'Matches', icon: <PlusCircle className="w-3.5 h-3.5" /> },
            { id: 'SPOTLIGHT', label: 'Spotlight', icon: <ImageIcon className="w-3.5 h-3.5" /> },
            { id: 'USERS', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'SYSTEM', label: 'Ads & Sys', icon: <SettingsIcon className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as AdminSubTab)}
              className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition ${
                subTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow text-center">
          {toast}
        </div>
      )}

      {subTab === 'MATCHES' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddMatch}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700">
              Publish New Match Analysis
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as PredictionTier)}
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50"
              >
                <option value="FREE">Daily Free (2-5 Odds)</option>
                <option value="DAY_DEAL">Day Deal (350/=)</option>
                <option value="VIP_MONTHLY">VIP Monthly (3500/=)</option>
              </select>
              <input
                type="text"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                placeholder="League"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                placeholder="Home Team *"
                required
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="Away Team *"
                required
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                placeholder="Pick *"
                required
                className="col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                placeholder="Odds *"
                required
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={kickoffTime}
                onChange={(e) => setKickoffTime(e.target.value)}
                placeholder="Kickoff (20:00 EAT)"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                placeholder="Accuracy (98%)"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
            <input
              type="text"
              value={analysisNote}
              onChange={(e) => setAnalysisNote(e.target.value)}
              placeholder="Short tactical insight note..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl shadow"
            >
              + Publish Match Insight
            </button>
          </form>

          <div className="space-y-2.5">
            {predictions.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 rounded mr-1.5">
                      {p.tier}
                    </span>
                    <span className="text-xs font-extrabold text-[#0B0F19]">
                      {p.homeTeam} vs {p.awayTeam}
                    </span>
                    <div className="text-[11px] text-blue-700 font-bold mt-0.5">
                      {p.pick} (@ {p.odds}) • {p.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(p.id)}
                      className={`p-1.5 rounded-lg border ${
                        p.pinned ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(p.id)}
                      className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-100">
                  <button onClick={() => handleStatusChange(p.id, 'WON')} className="flex items-center justify-center gap-1 bg-emerald-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" /> WON
                  </button>
                  <button onClick={() => handleStatusChange(p.id, 'LOST')} className="flex items-center justify-center gap-1 bg-red-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg">
                    <XCircle className="w-3 h-3" /> LOST
                  </button>
                  <button onClick={() => handleStatusChange(p.id, 'POSTPONED')} className="flex items-center justify-center gap-1 bg-amber-500 text-white text-[10px] font-extrabold py-1.5 rounded-lg">
                    <AlertTriangle className="w-3 h-3" /> POSTP
                  </button>
                  <button onClick={() => handleStatusChange(p.id, 'PENDING')} className="flex items-center justify-center gap-1 bg-blue-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg">
                    <Clock className="w-3 h-3" /> PEND
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'SPOTLIGHT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-700">
            Home Spotlight Card (Image / Video / Guide)
          </h3>

          <label className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer transition">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Upload Image or Video from Phone Gallery</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleLocalMediaUpload}
              className="hidden"
            />
          </label>

          <input
            type="text"
            value={spotlight.badgeText}
            onChange={(e) => setSpotlight((p) => ({ ...p, badgeText: e.target.value }))}
            placeholder="Badge Label"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
          />

          <input
            type="text"
            value={spotlight.title}
            onChange={(e) => setSpotlight((p) => ({ ...p, title: e.target.value }))}
            placeholder="Spotlight Headline"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
          />

          <textarea
            rows={3}
            value={spotlight.description}
            onChange={(e) => setSpotlight((p) => ({ ...p, description: e.target.value }))}
            placeholder="Guide / Analysis Description"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
          />
        </div>
      )}

      {subTab === 'USERS' && (
        <div className="space-y-2.5">
          {users.map((u) => (
            <div key={u.email} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-xs font-black text-[#0B0F19]">{u.name}</span>
                    {u.isBanned && (
                      <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">BANNED</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{u.email}</div>
                  <div className="text-[11px] font-bold text-blue-700 mt-0.5">
                    Tier: {u.tier} • Wallet: KES {u.walletBalance || 0} ({u.adsWatchedCount || 0} ads)
                  </div>
                </div>
                <button
                  onClick={() => handleToggleBan(u.email)}
                  className={`p-2 rounded-xl border text-xs font-bold ${
                    u.isBanned ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAdjustWallet(u.email, 50)}
                  className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1"
                >
                  <Wallet className="w-3 h-3" /> +50 KES Wallet
                </button>
                <button
                  onClick={() => handleAdjustWallet(u.email, 350)}
                  className="bg-emerald-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1"
                >
                  <Wallet className="w-3 h-3" /> +350 KES Wallet
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                <button onClick={() => handleGrantTier(u.email, 'FREE')} className="bg-slate-100 text-slate-800 text-[10px] font-extrabold py-1.5 rounded-lg">
                  Set FREE
                </button>
                <button onClick={() => handleGrantTier(u.email, 'DAY_DEAL')} className="bg-blue-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg">
                  Grant DAY DEAL
                </button>
                <button onClick={() => handleGrantTier(u.email, 'VIP_MONTHLY')} className="bg-red-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3" /> Grant VIP
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'SYSTEM' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-amber-400/60 p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                <span>App Maintenance Mode</span>
              </h3>
              <button
                onClick={() =>
                  setSettings((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))
                }
                className={`text-[11px] font-black px-3 py-1 rounded-full ${
                  settings.maintenanceMode
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {settings.maintenanceMode ? 'ON (LOCKED)' : 'OFF (LIVE)'}
              </button>
            </div>
            <input
              type="text"
              value={settings.maintenanceMessage}
              onChange={(e) =>
                setSettings((p) => ({ ...p, maintenanceMessage: e.target.value }))
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4" />
              <span>Ads & Rewarded Wallet Controls</span>
            </h3>

            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Rewarded Ads System</span>
              <button
                onClick={() => setSettings((p) => ({ ...p, adsEnabled: !p.adsEnabled }))}
                className={`text-[11px] font-black px-3 py-1 rounded-full ${
                  settings.adsEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {settings.adsEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Lock Daily Free Tips Behind Ad</span>
              <button
                onClick={() =>
                  setSettings((p) => ({ ...p, freeTipsAdLock: !p.freeTipsAdLock }))
                }
                className={`text-[11px] font-black px-3 py-1 rounded-full ${
                  settings.freeTipsAdLock ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {settings.freeTipsAdLock ? 'LOCKED (AD)' : 'OPEN (NO AD)'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={settings.adRewardKes}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, adRewardKes: Number(e.target.value) || 5 }))
                }
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
              />
              <input
                type="number"
                value={settings.adDurationSeconds}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    adDurationSeconds: Number(e.target.value) || 20,
                  }))
                }
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                value={settings.googleAdClientId}
                onChange={(e) => setSettings((p) => ({ ...p, googleAdClientId: e.target.value }))}
                placeholder="Google AdSense ID (ca-pub-...)"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={settings.googleAdSlotId}
                onChange={(e) => setSettings((p) => ({ ...p, googleAdSlotId: e.target.value }))}
                placeholder="Google Ad Slot ID (1234567890)"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700">
              Payment Number & Prices
            </h3>
            <input
              type="text"
              value={settings.paymentNumber}
              onChange={(e) => setSettings((p) => ({ ...p, paymentNumber: e.target.value }))}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={settings.dayDealPrice}
                onChange={(e) => setSettings((p) => ({ ...p, dayDealPrice: e.target.value }))}
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={settings.vipMonthlyPrice}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, vipMonthlyPrice: e.target.value }))
                }
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <textarea
            rows={3}
            value={spotlight.description}
            onChange={(e) => setSpotlight((p) => ({ ...p, description: e.target.value }))}
            placeholder="Guide / Analysis Description"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
          />
        </div>
      )}

      {subTab === 'USERS' && (
        <div className="space-y-2.5">
          {users.map((u) => (
            <div key={u.email} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-xs font-black text-[#0B0F19]">{u.name}</span>
                    {u.isBanned && (
                      <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">BANNED</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{u.email}</div>
                  <div className="text-[11px] font-bold text-blue-700 mt-0.5">
                    Tier: {u.tier} • Wallet: KES {u.walletBalance || 0} ({u.adsWatchedCount || 0} ads)
                  </div>
                </div>
                <button
                  onClick={() => handleToggleBan(u.email)}
                  className={`p-2 rounded-xl border text-xs font-bold ${
                    u.isBanned ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAdjustWallet(u.email, 50)}
                  className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1"
                >
                  <Wallet className="w-3 h-3" /> +50 KES Wallet
                </button>
                <button
                  onClick={() => handleAdjustWallet(u.email, 350)}
                  className="bg-emerald-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1"
                >
                  <Wallet className="w-3 h-3" /> +350 KES Wallet
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                <button onClick={() => handleGrantTier(u.email, 'FREE')} className="bg-slate-100 text-slate-800 text-[10px] font-extrabold py-1.5 rounded-lg">
                  Set FREE
                </button>
                <button onClick={() => handleGrantTier(u.email, 'DAY_DEAL')} className="bg-blue-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg">
                  Grant DAY DEAL
                </button>
                <button onClick={() => handleGrantTier(u.email, 'VIP_MONTHLY')} className="bg-red-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3" /> Grant VIP
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'SYSTEM' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-amber-400/60 p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                <span>App Maintenance Mode</span>
              </h3>
              <button
                onClick={() =>
                  setSettings((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))
                }
                className={`text-[11px] font-black px-3 py-1 rounded-full ${
                  settings.maintenanceMode
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {settings.maintenanceMode ? 'ON (LOCKED)' : 'OFF (LIVE)'}
              </button>
            </div>
            <input
              type="text"
              value={settings.maintenanceMessage}
              onChange={(e) =>
                setSettings((p) => ({ ...p, maintenanceMessage: e.target.value }))
              }
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4" />
              <span>Ads & Rewarded Wallet Controls</span>
            </h3>

            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Rewarded Ads System</span>
              <button
                onClick={() => setSettings((p) => ({ ...p, adsEnabled: !p.adsEnabled }))}
                className={`text-[11px] font-black px-3 py-1 rounded-full ${
                  settings.adsEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {settings.adsEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Lock Daily Free Tips Behind Ad</span>
              <button
                onClick={() =>
                  setSettings((p) => ({ ...p, freeTipsAdLock: !p.freeTipsAdLock }))
                }
                className={`text-[11px] font-black px-3 py-1 rounded-full ${
                  settings.freeTipsAdLock ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {settings.freeTipsAdLock ? 'LOCKED (AD)' : 'OPEN (NO AD)'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={settings.adRewardKes}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, adRewardKes: Number(e.target.value) || 5 }))
                }
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
              />
              <input
                type="number"
                value={settings.adDurationSeconds}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    adDurationSeconds: Number(e.target.value) || 20,
                  }))
                }
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700">
              Payment Number & Prices
            </h3>
            <input
              type="text"
              value={settings.paymentNumber}
              onChange={(e) => setSettings((p) => ({ ...p, paymentNumber: e.target.value }))}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={settings.dayDealPrice}
                onChange={(e) => setSettings((p) => ({ ...p, dayDealPrice: e.target.value }))}
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={settings.vipMonthlyPrice}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, vipMonthlyPrice: e.target.value }))
                }
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
              <Megaphone className="w-4 h-4" />
              <span>Send Desk Announcement</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Write announcement..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
              <button
                onClick={() => {
                  if (!newAnnouncement.trim()) return;
                  setAnnouncements((prev) => [newAnnouncement.trim(), ...prev]);
                  setNewAnnouncement('');
                  notify('Announcement published!');
                }}
                className="bg-red-600 text-white text-xs font-extrabold px-4 rounded-xl"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
