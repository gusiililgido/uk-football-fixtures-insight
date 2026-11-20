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
  Ban,
  Upload,
  Wrench,
  PlayCircle,
  Trophy,
  Edit3,
  Calendar,
  X,
  CloudCheck,
} from 'lucide-react';
import {
  AppNotification,
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
  onPushNotification: (
    type: AppNotification['type'],
    title: string,
    body: string,
    targetTier?: 'ALL' | 'DAY_DEAL' | 'VIP_MONTHLY',
    publicTeaserBody?: string
  ) => void;
  cloudSyncOk: boolean;
}

type AdminSubTab = 'MATCHES' | 'SPOTLIGHT' | 'USERS' | 'SYSTEM';

function compressImageFile(file: File, maxWidth = 720): Promise<string> {
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
        resolve(canvas.toDataURL('image/jpeg', 0.68));
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
  onPushNotification,
  cloudSyncOk,
}) => {
  const [subTab, setSubTab] = useState<AdminSubTab>('MATCHES');
  const [matchListMode, setMatchListMode] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [historyDateFilter, setHistoryDateFilter] = useState<string>('ALL');
  const [editingMatch, setEditingMatch] = useState<Prediction | null>(null);
  const [toast, setToast] = useState('');

  const todayIso = new Date().toISOString().slice(0, 10);
  const yesterdayIso = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

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

  const [boomMessage, setBoomMessage] = useState(
    'BOOM! Today’s Free Bet WON 3/3! Congratulations to everyone who followed! 🎉🔥'
  );
  const [customNotifTitle, setCustomNotifTitle] = useState('');
  const [customNotifBody, setCustomNotifBody] = useState('');
  const [customNotifTier, setCustomNotifTier] = useState<'ALL' | 'DAY_DEAL' | 'VIP_MONTHLY'>('ALL');
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const handleBetslipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    const dataUrl = await compressImageFile(file, 720);
    setBetslipImageUrl(dataUrl);
    notify('Betslip image attached!');
  };

  const handleResultProofUpload = async (
    matchId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    const dataUrl = await compressImageFile(file, 720);
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
      kickoffTime: kickoffTime.trim() || '20:00 EAT',
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

    const targetAudience = tier === 'FREE' ? 'ALL' : tier;
    const teaser =
      tier === 'VIP_MONTHLY'
        ? 'VIP Monthly (70–100 Odds) slip has been updated! Upgrade to VIP Monthly to view today’s exclusive match.'
        : tier === 'DAY_DEAL'
        ? 'Day Deal (20–70 Odds) slip has been updated! Unlock Day Deal to view today’s exclusive match.'
        : undefined;

    onPushNotification(
      'NEW_MATCH',
      'NEW ' + (tier === 'VIP_MONTHLY' ? 'VIP MONTHLY' : tier === 'DAY_DEAL' ? 'DAY DEAL' : 'FREE') + ' UPDATE!',
      `${homeTeam.trim()} vs ${awayTeam.trim()} (${pick.trim()} @ ${odds.trim()}) is now live!`,
      targetAudience,
      teaser
    );

    setHomeTeam('');
    setAwayTeam('');
    setPick('');
    setOdds('');
    setAnalysisNote('');
    setBetslipImageUrl('');
    notify('Match saved & pushed to cloud!');
  };

  const handleSaveEditedMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;
    setPredictions((prev) =>
      prev.map((p) => (p.id === editingMatch.id ? editingMatch : p))
    );
    setEditingMatch(null);
    notify('Match updated & saved permanently!');
  };

  const handleStatusChange = (id: string, status: MatchStatus) => {
    const target = predictions.find((p) => p.id === id);
    setPredictions((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    const targetAudience = target?.tier === 'FREE' ? 'ALL' : target?.tier;
    if (status === 'WON' && target) {
      const scoreTxt = target.finalScore ? ` (${target.finalScore})` : '';
      const winTeaser =
        target.tier === 'VIP_MONTHLY'
          ? 'BOOM! Our VIP Monthly (70–100 Odds) slip WON! Upgrade to VIP Monthly to access upcoming elite slips! 🏆🔥'
          : target.tier === 'DAY_DEAL'
          ? 'BOOM! Our Day Deal (20–70 Odds) slip WON! Unlock Day Deal to access today’s curated slip! 🎉🔥'
          : undefined;
      onPushNotification(
        'WIN',
        'BOOM! ' + (target.tier === 'FREE' ? 'FREE' : target.tier === 'DAY_DEAL' ? 'DAY DEAL' : 'VIP') + ' MATCH WON!',
        `${target.homeTeam} vs ${target.awayTeam}${scoreTxt} — ${target.pick} WON! 🎉🔥`,
        targetAudience,
        winTeaser
      );
    } else if (target) {
      const statusTeaser =
        target.tier !== 'FREE'
          ? `Live update posted on ${target.tier === 'VIP_MONTHLY' ? 'VIP Monthly' : 'Day Deal'} slip.`
          : undefined;
      onPushNotification(
        'LIVE_UPDATE',
        `LIVE MATCH STATUS: ${status}`,
        `${target.homeTeam} vs ${target.awayTeam} marked as ${status}.`,
        targetAudience,
        statusTeaser
      );
    }
    notify(`Marked as ${status} & saved to cloud!`);
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
    if (file.type.startsWith('video/')) {
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
      const compressed = await compressImageFile(file, 960);
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
    const compressed = await compressImageFile(file, 960);
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

  const activeMatches = predictions.filter((p) => p.status === 'PENDING');
  const settledHistoryAll = predictions.filter((p) => p.status !== 'PENDING');
  const settledHistoryFiltered =
    historyDateFilter === 'ALL'
      ? settledHistoryAll
      : settledHistoryAll.filter((p) => p.matchDate === historyDateFilter);

  const onlineUsersCount = users.filter((u) => u.isOnline).length;
  const paidUsersCount = users.filter((u) => u.tier !== 'FREE').length;
  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-16 right-3 z-50 bg-emerald-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-xl">{toast}</div>}
      {editingMatch && (
        <div onClick={() => setEditingMatch(null)} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSaveEditedMatch} className="bg-white w-full max-w-md rounded-2xl p-4 space-y-2 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center font-black text-sm"><span>Edit / Replace Match</span><button type="button" onClick={() => setEditingMatch(null)}><X className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-2 gap-2">
              <select value={editingMatch.tier} onChange={(e) => setEditingMatch({ ...editingMatch, tier: e.target.value as PredictionTier })} className="p-2 border rounded-xl"><option value="FREE">Daily Free</option><option value="DAY_DEAL">Day Deal</option><option value="VIP_MONTHLY">VIP Monthly</option></select>
              <select value={editingMatch.status} onChange={(e) => setEditingMatch({ ...editingMatch, status: e.target.value as MatchStatus })} className="p-2 border rounded-xl"><option value="PENDING">PENDING</option><option value="WON">WON</option><option value="LOST">LOST</option><option value="POSTPONED">POSTPONED</option></select>
            </div>
            <div className="grid grid-cols-2 gap-2"><input type="date" value={editingMatch.matchDate} onChange={(e) => setEditingMatch({ ...editingMatch, matchDate: e.target.value })} className="p-2 border rounded-xl" /><input type="text" value={editingMatch.kickoffTime} onChange={(e) => setEditingMatch({ ...editingMatch, kickoffTime: e.target.value })} className="p-2 border rounded-xl" /></div>
            <input type="text" value={editingMatch.league} onChange={(e) => setEditingMatch({ ...editingMatch, league: e.target.value })} className="w-full p-2 border rounded-xl" />
            <div className="grid grid-cols-2 gap-2"><input type="text" value={editingMatch.homeTeam} onChange={(e) => setEditingMatch({ ...editingMatch, homeTeam: e.target.value })} className="p-2 border rounded-xl" /><input type="text" value={editingMatch.awayTeam} onChange={(e) => setEditingMatch({ ...editingMatch, awayTeam: e.target.value })} className="p-2 border rounded-xl" /></div>
            <div className="grid grid-cols-3 gap-2"><input type="text" value={editingMatch.pick} onChange={(e) => setEditingMatch({ ...editingMatch, pick: e.target.value })} className="col-span-2 p-2 border rounded-xl" /><input type="text" value={editingMatch.odds} onChange={(e) => setEditingMatch({ ...editingMatch, odds: e.target.value })} className="p-2 border rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-2"><input type="text" value={editingMatch.finalScore || ''} onChange={(e) => setEditingMatch({ ...editingMatch, finalScore: e.target.value })} placeholder="Score (2 - 0 FT)" className="p-2 border rounded-xl" /><input type="text" value={editingMatch.confidence} onChange={(e) => setEditingMatch({ ...editingMatch, confidence: e.target.value })} className="p-2 border rounded-xl" /></div>
            <textarea rows={2} value={editingMatch.analysisNote} onChange={(e) => setEditingMatch({ ...editingMatch, analysisNote: e.target.value })} className="w-full p-2 border rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-1 bg-blue-50 text-blue-800 border border-blue-300 font-bold py-2 rounded-xl cursor-pointer"><Upload className="w-3.5 h-3.5" /><span>{editingMatch.betslipImageUrl ? 'Replace Betslip' : '+ Betslip'}</span><input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.item(0); if (f) setEditingMatch({ ...editingMatch, betslipImageUrl: await compressImageFile(f, 720) }); }} className="hidden" /></label>
              <label className="flex items-center justify-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold py-2 rounded-xl cursor-pointer"><Trophy className="w-3.5 h-3.5" /><span>{editingMatch.resultProofUrl ? 'Replace Proof' : '+ Proof'}</span><input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.item(0); if (f) setEditingMatch({ ...editingMatch, resultProofUrl: await compressImageFile(f, 720) }); }} className="hidden" /></label>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl">Save &amp; Replace Match</button>
          </form>
        </div>
      )}
      <div className="bg-[#0B0F19] text-white rounded-2xl p-4 border border-red-500/40 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-red-500" /><h2 className="text-sm font-black uppercase">Admin Command Center</h2></div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${cloudSyncOk ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-[#0B0F19]'}`}><CloudCheck className="w-3 h-3" />{cloudSyncOk ? 'CLOUD SYNCED' : 'LOCAL + RETRY'}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-slate-900 rounded-xl p-2"><div className="text-base font-black text-emerald-400">{onlineUsersCount}</div><div className="text-[10px] text-slate-400">Online</div></div>
          <div className="bg-slate-900 rounded-xl p-2"><div className="text-base font-black text-blue-400">{users.length}</div><div className="text-[10px] text-slate-400">Users</div></div>
          <div className="bg-slate-900 rounded-xl p-2"><div className="text-base font-black text-amber-400">{paidUsersCount}</div><div className="text-[10px] text-slate-400">VIPs</div></div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {[{ id: 'MATCHES', label: 'Matches', icon: <PlusCircle className="w-3.5 h-3.5" /> }, { id: 'SPOTLIGHT', label: 'Home Post', icon: <ImageIcon className="w-3.5 h-3.5" /> }, { id: 'USERS', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> }, { id: 'SYSTEM', label: 'System', icon: <SettingsIcon className="w-3.5 h-3.5" /> }].map((tab) => (
            <button key={tab.id} onClick={() => setSubTab(tab.id as AdminSubTab)} className={`flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-extrabold ${subTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}>{tab.icon}<span>{tab.label}</span></button>
          ))}
        </div>
      </div>
      {subTab === 'MATCHES' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-950 via-[#0B0F19] to-blue-950 text-white rounded-2xl border border-emerald-500/40 p-4 space-y-2">
            <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5"><Trophy className="w-4 h-4" /> Instant BOOM! Win Celebration</span>
            <div className="flex flex-wrap gap-1.5">{['BOOM! Free Bet WON 3/3! 🎉🔥', 'BOOM! Day Deal Slip WON! 🏆', 'BOOM! VIP Monthly Slip WON! 💰🔥'].map((pr, i) => (<button key={i} type="button" onClick={() => setBoomMessage(pr)} className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded-lg">Preset {i + 1}</button>))}</div>
            <div className="flex gap-2"><input type="text" value={boomMessage} onChange={(e) => setBoomMessage(e.target.value)} className="flex-1 px-3 py-2 text-xs text-black bg-white rounded-xl" /><button type="button" onClick={() => { if (boomMessage.trim()) { onPushNotification('WIN', 'BOOM! CONGRATULATIONS!', boomMessage.trim()); notify('BOOM sent!'); } }} className="bg-emerald-600 text-white text-xs font-black px-4 rounded-xl">Send</button></div>
          </div>
          <div className="bg-white rounded-2xl border p-4 space-y-2">
            <div className="flex justify-between items-center"><span className="text-xs font-black uppercase text-blue-700 flex items-center gap-1"><Megaphone className="w-4 h-4" /> Custom Notification</span><select value={customNotifTier} onChange={(e) => setCustomNotifTier(e.target.value as 'ALL' | 'DAY_DEAL' | 'VIP_MONTHLY')} className="text-[11px] font-bold bg-slate-100 border rounded-lg px-2 py-1"><option value="ALL">All Users</option><option value="DAY_DEAL">Day Deal</option><option value="VIP_MONTHLY">VIP Monthly</option></select></div>
            <input type="text" value={customNotifTitle} onChange={(e) => setCustomNotifTitle(e.target.value)} placeholder="Title" className="w-full p-2 text-xs border rounded-xl" />
            <div className="flex gap-2"><input type="text" value={customNotifBody} onChange={(e) => setCustomNotifBody(e.target.value)} placeholder="Message..." className="flex-1 p-2 text-xs border rounded-xl" /><button type="button" onClick={() => { if (customNotifBody.trim()) { onPushNotification('LIVE_UPDATE', customNotifTitle.trim() || 'DESK ALERT', customNotifBody.trim(), customNotifTier); setCustomNotifTitle(''); setCustomNotifBody(''); notify('Sent!'); } }} className="bg-blue-600 text-white text-xs font-black px-4 rounded-xl">Send</button></div>
          </div>
          <form onSubmit={handleAddMatch} className="bg-white rounded-2xl border p-4 space-y-2">
            <h3 className="text-xs font-black uppercase text-blue-700">Publish New Match</h3>
            <div className="grid grid-cols-2 gap-2">
              <select value={tier} onChange={(e) => setTier(e.target.value as PredictionTier)} className="p-2 text-xs font-bold border rounded-xl"><option value="FREE">Daily Free</option><option value="DAY_DEAL">Day Deal</option><option value="VIP_MONTHLY">VIP Monthly</option></select>
              <input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="p-2 text-xs font-bold border rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2"><input type="text" value={league} onChange={(e) => setLeague(e.target.value)} placeholder="League" className="p-2 text-xs border rounded-xl" /><input type="text" value={kickoffTime} onChange={(e) => setKickoffTime(e.target.value)} placeholder="20:00 EAT" className="p-2 text-xs border rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-2"><input type="text" required value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} placeholder="Home Team" className="p-2 text-xs border rounded-xl" /><input type="text" required value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} placeholder="Away Team" className="p-2 text-xs border rounded-xl" /></div>
            <div className="grid grid-cols-3 gap-2"><input type="text" required value={pick} onChange={(e) => setPick(e.target.value)} placeholder="Pick" className="col-span-2 p-2 text-xs border rounded-xl" /><input type="text" required value={odds} onChange={(e) => setOdds(e.target.value)} placeholder="Odds" className="p-2 text-xs border rounded-xl" /></div>
            <div className="grid grid-cols-3 gap-2"><input type="text" value={confidence} onChange={(e) => setConfidence(e.target.value)} placeholder="98%" className="p-2 text-xs border rounded-xl" /><input type="text" value={analysisNote} onChange={(e) => setAnalysisNote(e.target.value)} placeholder="Tactical Note" className="col-span-2 p-2 text-xs border rounded-xl" /></div>
            <label className="flex items-center justify-center gap-2 bg-slate-100 border border-dashed font-bold text-xs py-2 rounded-xl cursor-pointer"><Upload className="w-4 h-4 text-blue-600" /><span>{betslipImageUrl ? 'Betslip Attached ✓' : 'Attach Betslip Image'}</span><input type="file" accept="image/*" onChange={handleBetslipUpload} className="hidden" /></label>
            <button type="submit" className="w-full bg-blue-600 text-white font-extrabold text-xs py-2.5 rounded-xl">Publish Prediction Live</button>
          </form>
          <div className="bg-[#0B0F19] p-1.5 rounded-2xl grid grid-cols-2 gap-1.5">
            <button type="button" onClick={() => setMatchListMode('ACTIVE')} className={`py-2 rounded-xl text-xs font-black ${matchListMode === 'ACTIVE' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Active &amp; Live ({activeMatches.length})</button>
            <button type="button" onClick={() => setMatchListMode('HISTORY')} className={`py-2 rounded-xl text-xs font-black ${matchListMode === 'HISTORY' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>History Archive ({settledHistoryAll.length})</button>
          </div>
          {matchListMode === 'HISTORY' && (
            <div className="bg-white rounded-2xl border p-3 flex flex-wrap items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <button type="button" onClick={() => setHistoryDateFilter('ALL')} className={`px-2 py-1 rounded-lg text-[11px] font-bold ${historyDateFilter === 'ALL' ? 'bg-[#0B0F19] text-white' : 'bg-slate-100'}`}>All ({settledHistoryAll.length})</button>
              <button type="button" onClick={() => setHistoryDateFilter(todayIso)} className={`px-2 py-1 rounded-lg text-[11px] font-bold ${historyDateFilter === todayIso ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>Today</button>
              <button type="button" onClick={() => setHistoryDateFilter(yesterdayIso)} className={`px-2 py-1 rounded-lg text-[11px] font-bold ${historyDateFilter === yesterdayIso ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>Yesterday</button>
              <input type="date" value={historyDateFilter === 'ALL' ? todayIso : historyDateFilter} onChange={(e) => e.target.value && setHistoryDateFilter(e.target.value)} className="ml-auto px-2 py-1 text-[11px] border rounded-lg" />
            </div>
          )}
          <div className="space-y-2.5">
            {(matchListMode === 'ACTIVE' ? activeMatches : settledHistoryFiltered).map((p) => (
              <div key={p.id} className="bg-white rounded-xl border p-3 space-y-2">
                <div className="flex justify-between gap-2">
                  <div><span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{p.tier} • {p.matchDate} • {p.kickoffTime}</span><div className="text-xs font-black mt-1">{p.homeTeam} vs {p.awayTeam} ({p.odds})</div><div className="text-[11px] text-slate-600">{p.pick} • <strong>{p.status}</strong></div></div>
                  <div className="flex gap-1"><button type="button" onClick={() => setEditingMatch(p)} className="p-1.5 rounded-lg bg-blue-50 text-blue-700"><Edit3 className="w-3.5 h-3.5" /></button><button type="button" onClick={() => handleTogglePin(p.id)} className="p-1.5 rounded-lg bg-slate-50"><Pin className="w-3.5 h-3.5" /></button><button type="button" onClick={() => handleDeleteMatch(p.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div>
                </div>
                <div className="grid grid-cols-2 gap-1.5"><input type="text" value={p.finalScore || ''} onChange={(e) => handleScoreChange(p.id, e.target.value)} placeholder="Score (2 - 0 FT)" className="p-1.5 text-[11px] border rounded-lg" /><label className="flex items-center justify-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold py-1.5 rounded-lg cursor-pointer"><Trophy className="w-3.5 h-3.5" /><span>{p.resultProofUrl ? 'Proof ✓' : '+ Proof'}</span><input type="file" accept="image/*" onChange={(e) => handleResultProofUpload(p.id, e)} className="hidden" /></label></div>
                <div className="grid grid-cols-4 gap-1">
                  <button type="button" onClick={() => handleStatusChange(p.id, 'WON')} className="bg-emerald-600 text-white text-[10px] font-bold py-1.5 rounded-lg">WON</button>
                  <button type="button" onClick={() => handleStatusChange(p.id, 'LOST')} className="bg-red-600 text-white text-[10px] font-bold py-1.5 rounded-lg">LOST</button>
                  <button type="button" onClick={() => handleStatusChange(p.id, 'POSTPONED')} className="bg-amber-500 text-white text-[10px] font-bold py-1.5 rounded-lg">POSTP</button>
                  <button type="button" onClick={() => handleStatusChange(p.id, 'PENDING')} className="bg-blue-600 text-white text-[10px] font-bold py-1.5 rounded-lg">PEND</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {subTab === 'SPOTLIGHT' && (
        <div className="space-y-4">
          <form onSubmit={handlePublishHomePost} className="bg-white rounded-2xl border p-4 space-y-2">
            <h3 className="text-xs font-black uppercase text-blue-700">New Home Feed Post</h3>
            <label className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"><Upload className="w-4 h-4" /><span>{postImageUrl ? 'Ready ✓' : 'Upload Image'}</span><input type="file" accept="image/*" onChange={handleHomePostImageUpload} className="hidden" /></label>
            <input type="text" value={postBadge} onChange={(e) => setPostBadge(e.target.value)} className="w-full p-2 text-xs border rounded-xl" />
            <input type="text" required value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Title" className="w-full p-2 text-xs border rounded-xl" />
            <textarea rows={2} required value={postDesc} onChange={(e) => setPostDesc(e.target.value)} placeholder="Description..." className="w-full p-2 text-xs border rounded-xl" />
            <button type="submit" className="w-full bg-[#0B0F19] text-white font-bold text-xs py-2 rounded-xl">Post</button>
          </form>
          {homePosts.map((hp) => (<div key={hp.id} className="bg-white rounded-xl border p-3 flex justify-between"><span className="text-xs font-black">{hp.title}</span><button onClick={() => setHomePosts((prev) => prev.filter((x) => x.id !== hp.id))} className="text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div>))}
          <div className="bg-white rounded-2xl border p-4 space-y-2">
            <h3 className="text-xs font-black uppercase">Top Spotlight</h3>
            <label className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"><Upload className="w-4 h-4" /><span>Upload Media</span><input type="file" accept="image/*,video/*" onChange={handleLocalMediaUpload} className="hidden" /></label>
            <input type="text" value={spotlight.badgeText} onChange={(e) => setSpotlight((p) => ({ ...p, badgeText: e.target.value }))} className="w-full p-2 text-xs border rounded-xl" />
            <input type="text" value={spotlight.title} onChange={(e) => setSpotlight((p) => ({ ...p, title: e.target.value }))} className="w-full p-2 text-xs border rounded-xl" />
            <textarea rows={2} value={spotlight.description} onChange={(e) => setSpotlight((p) => ({ ...p, description: e.target.value }))} className="w-full p-2 text-xs border rounded-xl" />
          </div>
        </div>
      )}
      {subTab === 'USERS' && (
        <div className="space-y-2">{users.map((u) => (<div key={u.email} className="bg-white rounded-xl border p-3 space-y-2"><div className="flex justify-between"><span className="text-xs font-black">{u.name} ({u.tier}) • KES {u.walletBalance || 0}</span><button onClick={() => handleToggleBan(u.email)} className="text-red-600"><Ban className="w-4 h-4" /></button></div><div className="grid grid-cols-2 gap-1"><button onClick={() => handleAdjustWallet(u.email, 50)} className="bg-emerald-50 text-[10px] font-bold py-1 rounded">+50</button><button onClick={() => handleAdjustWallet(u.email, 350)} className="bg-emerald-600 text-white text-[10px] font-bold py-1 rounded">+350</button></div><div className="grid grid-cols-3 gap-1"><button onClick={() => handleGrantTier(u.email, 'FREE')} className="bg-slate-100 text-[10px] font-bold py-1 rounded">FREE</button><button onClick={() => handleGrantTier(u.email, 'DAY_DEAL')} className="bg-blue-600 text-white text-[10px] font-bold py-1 rounded">DAY DEAL</button><button onClick={() => handleGrantTier(u.email, 'VIP_MONTHLY')} className="bg-red-600 text-white text-[10px] font-bold py-1 rounded">VIP</button></div></div>))}</div>
      )}
      {subTab === 'SYSTEM' && (
        <div className="space-y-3 text-xs">
          <div className="bg-white rounded-xl border p-3 space-y-2">
            <div className="flex justify-between font-bold"><span><Wrench className="w-3.5 h-3.5 inline mr-1" />Maintenance</span><button onClick={() => setSettings((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))} className="px-2.5 py-0.5 rounded bg-slate-200 font-black">{settings.maintenanceMode ? 'ON' : 'OFF'}</button></div>
            <div className="flex justify-between font-bold"><span>Force Telegram Gate</span><button onClick={() => setSettings((p) => ({ ...p, forceTelegramJoin: !p.forceTelegramJoin }))} className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-black">{settings.forceTelegramJoin ? 'ON' : 'OFF'}</button></div>
            <input type="text" value={settings.telegramBotToken} onChange={(e) => setSettings((p) => ({ ...p, telegramBotToken: e.target.value }))} className="w-full p-2 border rounded-xl" />
            <div className="flex justify-between font-bold"><span>Screenshot Block</span><button onClick={() => setSettings((p) => ({ ...p, screenshotProtection: !p.screenshotProtection }))} className="px-2.5 py-0.5 rounded bg-red-600 text-white font-black">{settings.screenshotProtection ? 'ON' : 'OFF'}</button></div>
            <div className="flex justify-between font-bold"><span><PlayCircle className="w-3.5 h-3.5 inline mr-1" />Google Ads</span><button onClick={() => setSettings((p) => ({ ...p, adsEnabled: !p.adsEnabled }))} className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-black">{settings.adsEnabled ? 'ON' : 'OFF'}</button></div>
            <div className="flex justify-between font-bold"><span>Free Tips Ad Lock</span><button onClick={() => setSettings((p) => ({ ...p, freeTipsAdLock: !p.freeTipsAdLock }))} className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-black">{settings.freeTipsAdLock ? 'LOCKED' : 'OPEN'}</button></div>
            <div className="grid grid-cols-2 gap-2"><input type="text" value={settings.googleAdClientId} onChange={(e) => setSettings((p) => ({ ...p, googleAdClientId: e.target.value }))} className="p-2 border rounded-xl" /><input type="text" value={settings.googleAdSlotId} onChange={(e) => setSettings((p) => ({ ...p, googleAdSlotId: e.target.value }))} className="p-2 border rounded-xl" /></div>
            <input type="text" value={settings.whatsappGroupUrl} onChange={(e) => setSettings((p) => ({ ...p, whatsappGroupUrl: e.target.value }))} className="w-full p-2 border rounded-xl" />
            <input type="text" value={settings.telegramChannelUrl} onChange={(e) => setSettings((p) => ({ ...p, telegramChannelUrl: e.target.value }))} className="w-full p-2 border rounded-xl" />
            <input type="text" value={settings.paymentNumber} onChange={(e) => setSettings((p) => ({ ...p, paymentNumber: e.target.value }))} className="w-full p-2 border rounded-xl font-mono" />
            <div className="grid grid-cols-2 gap-2"><input type="text" value={settings.dayDealPrice} onChange={(e) => setSettings((p) => ({ ...p, dayDealPrice: e.target.value }))} className="p-2 border rounded-xl" /><input type="text" value={settings.vipMonthlyPrice} onChange={(e) => setSettings((p) => ({ ...p, vipMonthlyPrice: e.target.value }))} className="p-2 border rounded-xl" /></div>
          </div>
          <div className="bg-white rounded-xl border p-3 flex gap-2"><input type="text" value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} placeholder="Announcement..." className="flex-1 p-2 border rounded-xl" /><button onClick={() => { if (newAnnouncement.trim()) { const m = newAnnouncement.trim(); setAnnouncements((p) => [m, ...p]); onPushNotification('LIVE_UPDATE', 'DESK ANNOUNCEMENT', m); setNewAnnouncement(''); notify('Posted!'); } }} className="bg-red-600 text-white font-bold px-3 rounded-xl">Post</button></div>
        </div>
      )}
    </div>
  );
};
