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
  Trophy,
} from 'lucide-react';
import {
  AppSettings,
  HomeFeedPost,
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
  homePosts: HomeFeedPost[];
  setHomePosts: React.Dispatch<React.SetStateAction<HomeFeedPost[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  setAnnouncements: React.Dispatch<React.SetStateAction<string[]>>;
}

type AdminSubTab = 'MATCHES' | 'SPOTLIGHT' | 'USERS' | 'SYSTEM';

function compressImageFile(file: File, maxWidth = 900): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  predictions,
  setPredictions,
  spotlight,
  setSpotlight,
  homePosts,
  setHomePosts,
  settings,
  setSettings,
  users,
  setUsers,
  setAnnouncements,
}) => {
  const [subTab, setSubTab] = useState<AdminSubTab>('MATCHES');
  const [toast, setToast] = useState('');

  const todayIso = new Date().toISOString().slice(0, 10);
  const [tier, setTier] = useState<PredictionTier>('FREE');
  const [league, setLeague] = useState('England • Premier League');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState(todayIso);
  const [kickoffTime, setKickoffTime] = useState('20:00 EAT');
  const [pick, setPick] = useState('');
  const [odds, setOdds] = useState('');
  const [confidence, setConfidence] = useState('98%');
  const [analysisNote, setAnalysisNote] = useState('');
  const [betslipImageUrl, setBetslipImageUrl] = useState('');

  const [postBadge, setPostBadge] = useState('MATCHDAY UPDATE');
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');

  const [newAnnouncement, setNewAnnouncement] = useState('');

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const handleBetslipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    const dataUrl = await compressImageFile(file, 900);
    setBetslipImageUrl(dataUrl);
    notify('Betslip image attached!');
  };

  const handleResultProofUpload = async (
    matchId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    const dataUrl = await compressImageFile(file, 800);
    setPredictions((prev) =>
      prev.map((p) => (p.id === matchId ? { ...p, resultProofUrl: dataUrl } : p))
    );
    notify('SofaScore / LiveScore result proof attached!');
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
      matchDate: matchDate || todayIso,
      pick: pick.trim(),
      odds: odds.trim(),
      confidence: confidence.trim() || '98%',
      analysisNote: analysisNote.trim(),
      betslipImageUrl: betslipImageUrl || undefined,
      status: 'PENDING',
      pinned: false,
    };

    setPredictions((prev) => [newMatch, ...prev]);
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready
        .then((reg) =>
          reg.showNotification('New Match Insight Published!', {
            body: `${homeTeam.trim()} vs ${awayTeam.trim()} — ${pick.trim()}`,
            icon: '/icon-192.png',
          })
        )
        .catch(() => {});
    }

    setHomeTeam('');
    setAwayTeam('');
    setPick('');
    setOdds('');
    setAnalysisNote('');
    setBetslipImageUrl('');
    notify('Match analysis published live!');
  };

  const handleStatusChange = (id: string, status: MatchStatus) => {
    setPredictions((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    notify(`Marked match as ${status}`);
  };

  const handleScoreChange = (id: string, finalScore: string) => {
    setPredictions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, finalScore } : p))
    );
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
  const handleLocalMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    if (isVideo) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSpotlight((prev) => ({
            ...prev,
            mediaType: 'video',
            mediaUrl: reader.result as string,
            updatedAt: 'Just Now',
          }));
          notify('Video uploaded to Home Spotlight!');
        }
      };
      reader.readAsDataURL(file);
    } else {
      const compressed = await compressImageFile(file, 1080);
      setSpotlight((prev) => ({
        ...prev,
        mediaType: 'image',
        mediaUrl: compressed,
        updatedAt: 'Just Now',
      }));
      notify('Full-fit image uploaded to Home Spotlight!');
    }
  };

  const handleHomePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    const compressed = await compressImageFile(file, 1080);
    setPostImageUrl(compressed);
    notify('Home post image ready!');
  };

  const handlePublishHomePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDesc.trim()) return;
    const newPost: HomeFeedPost = {
      id: `post-${Date.now()}`,
      badge: postBadge.trim() || 'DESK UPDATE',
      title: postTitle.trim(),
      description: postDesc.trim(),
      imageUrl: postImageUrl || undefined,
      createdAt: 'Just Now • Analyst Desk',
      likesCount: 1,
      viewsCount: 1,
    };
    setHomePosts((prev) => [newPost, ...prev]);
    setPostTitle('');
    setPostDesc('');
    setPostImageUrl('');
    notify('Home Feed post published live!');
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
      {toast && (
        <div className="fixed top-16 right-3 z-50 bg-emerald-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="bg-[#0B0F19] text-white rounded-2xl p-4 border border-red-500/40 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider">
              Invisible Admin Command Center
            </h2>
          </div>
          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
            CHIEF ADMIN
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
            <div className="text-base font-black text-emerald-400">{onlineUsersCount}</div>
            <div className="text-[10px] text-slate-400">Online Now</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
            <div className="text-base font-black text-blue-400">{users.length}</div>
            <div className="text-[10px] text-slate-400">Total Users</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
            <div className="text-base font-black text-amber-400">{paidUsersCount}</div>
            <div className="text-[10px] text-slate-400">Active VIPs</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {[
            { id: 'MATCHES', label: 'Matches', icon: <PlusCircle className="w-3.5 h-3.5" /> },
            { id: 'SPOTLIGHT', label: 'Home Post', icon: <ImageIcon className="w-3.5 h-3.5" /> },
            { id: 'USERS', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'SYSTEM', label: 'System', icon: <SettingsIcon className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as AdminSubTab)}
              className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-extrabold transition cursor-pointer ${
                subTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {subTab === 'MATCHES' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddMatch}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5"
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
                <option value="DAY_DEAL">Day Deal (20-70 Odds)</option>
                <option value="VIP_MONTHLY">VIP Monthly (70-100 Odds)</option>
              </select>

              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                placeholder="League (e.g. Premier League)"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={kickoffTime}
                onChange={(e) => setKickoffTime(e.target.value)}
                placeholder="Kickoff (e.g. 20:00 EAT)"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                placeholder="Home Team"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                required
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="Away Team"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                placeholder="Pick (e.g. Home Win)"
                className="col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                required
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                placeholder="Odds (2.10)"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                placeholder="Confidence (98%)"
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
              <input
                type="text"
                value={analysisNote}
                onChange={(e) => setAnalysisNote(e.target.value)}
                placeholder="Tactical Analysis Note"
                className="col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <label className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#0B0F19] border border-dashed border-slate-400 font-bold text-xs py-2.5 px-3 rounded-xl cursor-pointer transition">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>
                {betslipImageUrl
                  ? 'Betslip Image Attached (Tap to Change)'
                  : 'Attach Optional Betslip Image'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBetslipUpload}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl shadow cursor-pointer"
            >
              Publish Prediction Live
            </button>
          </form>

          <div className="space-y-2.5">
            {predictions.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {p.tier} • {p.matchDate}
                    </span>
                    <div className="text-xs font-black mt-1">
                      {p.homeTeam} vs {p.awayTeam} ({p.odds})
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {p.pick} • Status: <strong>{p.status}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(p.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        p.pinned
                          ? 'bg-red-50 border-red-300 text-red-600'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(p.id)}
                      className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Final Scoreline + Optional SofaScore / LiveScore Result Proof */}
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={p.finalScore || ''}
                    onChange={(e) => handleScoreChange(p.id, e.target.value)}
                    placeholder="Scoreline (e.g. 2 - 0 FT)"
                    className="px-2.5 py-1.5 text-[11px] font-bold border border-slate-300 rounded-lg"
                  />
                  <label className="flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold py-1.5 px-2 rounded-lg cursor-pointer">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{p.resultProofUrl ? 'Proof Attached ✓' : '+ SofaScore Proof'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleResultProofUpload(p.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleStatusChange(p.id, 'WON')}
                    className="bg-emerald-600 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" /> WON
                  </button>
                  <button
                    onClick={() => handleStatusChange(p.id, 'LOST')}
                    className="bg-red-600 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3 h-3" /> LOST
                  </button>
                  <button
                    onClick={() => handleStatusChange(p.id, 'POSTPONED')}
                    className="bg-amber-500 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3 h-3" /> POSTP
                  </button>
                  <button
                    onClick={() => handleStatusChange(p.id, 'PENDING')}
                    className="bg-blue-600 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3 h-3" /> PEND
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {subTab === 'SPOTLIGHT' && (
        <div className="space-y-4">
          <form onSubmit={handlePublishHomePost} className="bg-white rounded-2xl border-2 border-blue-600/20 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700">Publish New Home Feed Post (Full-Fit Image + Likes &amp; Views)</h3>
            <label className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>{postImageUrl ? 'Feed Image Ready ✓ (Change)' : 'Upload Full-Fit Post Image'}</span>
              <input type="file" accept="image/*" onChange={handleHomePostImageUpload} className="hidden" />
            </label>
            <input type="text" value={postBadge} onChange={(e) => setPostBadge(e.target.value)} placeholder="Badge" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
            <input type="text" required value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Post Headline" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
            <textarea rows={3} required value={postDesc} onChange={(e) => setPostDesc(e.target.value)} placeholder="Short description..." className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
            <button type="submit" className="w-full bg-[#0B0F19] text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer">Post to Home Feed</button>
          </form>

          {homePosts.length > 0 && (
            <div className="space-y-2">
              {homePosts.map((hp) => (
                <div key={hp.id} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate">{hp.title}</div>
                    <div className="text-[11px] text-slate-500">{hp.likesCount} Likes • {hp.viewsCount} Views</div>
                  </div>
                  <button onClick={() => { setHomePosts((prev) => prev.filter((item) => item.id !== hp.id)); notify('Home post removed'); }} className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 shrink-0 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Edit Featured Top Spotlight Card</h3>
            <label className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Upload Spotlight Image or Video</span>
              <input type="file" accept="image/*,video/*" onChange={handleLocalMediaUpload} className="hidden" />
            </label>
            <input type="text" value={spotlight.badgeText} onChange={(e) => setSpotlight((p) => ({ ...p, badgeText: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
            <input type="text" value={spotlight.title} onChange={(e) => setSpotlight((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
            <textarea rows={3} value={spotlight.description} onChange={(e) => setSpotlight((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
          </div>
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
                  </div>
                  <div className="text-[11px] text-slate-500">{u.email}</div>
                  <div className="text-[11px] font-bold text-blue-700 mt-0.5">Tier: {u.tier} • Wallet: KES {u.walletBalance || 0}</div>
                </div>
                <button onClick={() => handleToggleBan(u.email)} className={`p-2 rounded-xl border text-xs font-bold cursor-pointer ${u.isBanned ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  <Ban className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => handleAdjustWallet(u.email, 50)} className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"><Wallet className="w-3 h-3" /> +50 KES</button>
                <button onClick={() => handleAdjustWallet(u.email, 350)} className="bg-emerald-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"><Wallet className="w-3 h-3" /> +350 KES</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                <button onClick={() => handleGrantTier(u.email, 'FREE')} className="bg-slate-100 text-slate-800 text-[10px] font-extrabold py-1.5 rounded-lg cursor-pointer">FREE</button>
                <button onClick={() => handleGrantTier(u.email, 'DAY_DEAL')} className="bg-blue-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg cursor-pointer">DAY DEAL</button>
                <button onClick={() => handleGrantTier(u.email, 'VIP_MONTHLY')} className="bg-red-600 text-white text-[10px] font-extrabold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"><Crown className="w-3 h-3" /> VIP</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'SYSTEM' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-amber-400/60 p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5"><Wrench className="w-4 h-4" /><span>App Maintenance Mode</span></h3>
              <button onClick={() => setSettings((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))} className={`text-[11px] font-black px-3 py-1 rounded-full cursor-pointer ${settings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}`}>{settings.maintenanceMode ? 'ON (LOCKED)' : 'OFF (LIVE)'}</button>
            </div>
            <input type="text" value={settings.maintenanceMessage} onChange={(e) => setSettings((p) => ({ ...p, maintenanceMessage: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
          </div>

          <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5"><PlayCircle className="w-4 h-4" /><span>Security, Google AdSense &amp; Daily 5 KES Controls</span></h3>
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Screenshot &amp; Screen-Capture Block</span>
              <button onClick={() => setSettings((p) => ({ ...p, screenshotProtection: !p.screenshotProtection }))} className={`text-[11px] font-black px-3 py-1 rounded-full cursor-pointer ${settings.screenshotProtection ? 'bg-red-600 text-white' : 'bg-slate-300 text-slate-700'}`}>{settings.screenshotProtection ? 'PROTECTED (ON)' : 'OFF'}</button>
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Google Ads System</span>
              <button onClick={() => setSettings((p) => ({ ...p, adsEnabled: !p.adsEnabled }))} className={`text-[11px] font-black px-3 py-1 rounded-full cursor-pointer ${settings.adsEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}>{settings.adsEnabled ? 'ENABLED' : 'DISABLED'}</button>
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Lock Daily Free Tips Behind Ad</span>
              <button onClick={() => setSettings((p) => ({ ...p, freeTipsAdLock: !p.freeTipsAdLock }))} className={`text-[11px] font-black px-3 py-1 rounded-full cursor-pointer ${settings.freeTipsAdLock ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'}`}>{settings.freeTipsAdLock ? 'LOCKED (AD)' : 'OPEN (NO AD)'}</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" value={settings.googleAdClientId} onChange={(e) => setSettings((p) => ({ ...p, googleAdClientId: e.target.value }))} placeholder="Google AdSense ID (ca-pub-...)" className="px-3 py-2 text-xs border border-slate-300 rounded-xl" />
              <input type="text" value={settings.googleAdSlotId} onChange={(e) => setSettings((p) => ({ ...p, googleAdSlotId: e.target.value }))} placeholder="Google Ad Slot ID" className="px-3 py-2 text-xs border border-slate-300 rounded-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700">Channels, Payment Number &amp; Prices</h3>
            <input type="text" value={settings.whatsappGroupUrl} onChange={(e) => setSettings((p) => ({ ...p, whatsappGroupUrl: e.target.value }))} placeholder="WhatsApp Group URL" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl" />
            <input type="text" value={settings.paymentNumber} onChange={(e) => setSettings((p) => ({ ...p, paymentNumber: e.target.value }))} placeholder="Payment Number" className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={settings.dayDealPrice} onChange={(e) => setSettings((p) => ({ ...p, dayDealPrice: e.target.value }))} className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl" />
              <input type="text" value={settings.vipMonthlyPrice} onChange={(e) => setSettings((p) => ({ ...p, vipMonthlyPrice: e.target.value }))} className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5"><Megaphone className="w-4 h-4" /><span>Send Desk Announcement + Push Alert</span></h3>
            <div className="flex gap-2">
              <input type="text" value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} placeholder="Write announcement..." className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl" />
              <button onClick={() => { if (!newAnnouncement.trim()) return; const msg = newAnnouncement.trim(); setAnnouncements((prev) => [msg, ...prev]); if ('serviceWorker' in navigator && Notification.permission === 'granted') { navigator.serviceWorker.ready.then((reg) => reg.showNotification('U.K FOOTBALL INSIGHT', { body: msg, icon: '/icon-192.png' })).catch(() => {}); } setNewAnnouncement(''); notify('Announcement published & pushed!'); }} className="bg-red-600 text-white text-xs font-extrabold px-4 rounded-xl cursor-pointer">Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
