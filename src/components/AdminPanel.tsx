import type { PaymentRequest } from '../types';
import React, { useEffect, useState } from 'react';
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
  Save,
  CreditCard,
  CheckCircle2,
  XCircle,
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
import { saveCloudState } from '../lib/supabase';
import { postToTelegramChannel } from '../lib/telegram';

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
  payments: PaymentRequest[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  announcements: string[];
  setAnnouncements: React.Dispatch<React.SetStateAction<string[]>>;
  onPushNotification: (
    type: AppNotification['type'],
    title: string,
    body: string,
    targetTier?: 'ALL' | 'DAY_DEAL' | 'VIP_MONTHLY',
    publicTeaserBody?: string
  ) => void;
  cloudSyncOk: boolean;
  onForceCloudPush?: () => Promise<{ ok: boolean; message: string }>;
}

type AdminSubTab = 'MATCHES' | 'PAYMENTS' | 'SPOTLIGHT' | 'USERS' | 'SYSTEM';

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
  payments,
  setPayments,
  announcements,
  setAnnouncements,
  onPushNotification,
  onForceCloudPush,
}) => {
  const [subTab, setSubTab] = useState<AdminSubTab>('MATCHES');
  const [matchListMode, setMatchListMode] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [historyDateFilter, setHistoryDateFilter] = useState<string>('ALL');
  const [editingMatch, setEditingMatch] = useState<Prediction | null>(null);
  const [toast, setToast] = useState('');
  const [pushingCloud, setPushingCloud] = useState(false);
  const [syncBadge, setSyncBadge] = useState<'SYNCED' | 'SYNCING' | 'ERROR'>('SYNCED');

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
  const [betslipImageUrl, setBetslipImageUrl] = useState("");
  const [initialStatus, setInitialStatus] = useState<MatchStatus>("PENDING");

  const [postBadge, setPostBadge] = useState('MATCHDAY UPDATE');
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');

  const [draftSpotlight, setDraftSpotlight] = useState<SpotlightMedia>(spotlight);
  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setDraftSpotlight(spotlight);
  }, [spotlight]);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  const [boomMessage, setBoomMessage] = useState(
    'BOOM! Today’s Free Bet WON 3/3! Congratulations to everyone who followed! 🎉🔥'
  );
  const [customNotifTitle, setCustomNotifTitle] = useState('');
  const [customNotifBody, setCustomNotifBody] = useState('');
  const [customNotifTier, setCustomNotifTier] = useState<'ALL' | 'DAY_DEAL' | 'VIP_MONTHLY'>('ALL');
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const notify = (msg: string, duration = 3500) => {
    setToast(msg);
    setTimeout(() => setToast(''), duration);
  };

  const broadcastTelegram = async (messageHtml: string, photoDataUrl?: string) => {
    if (settings.autoPostTelegram === false) return;
    await postToTelegramChannel({
      botToken: settings.telegramBotToken,
      channelId: settings.telegramChannelId,
      channelUrl: settings.telegramChannelUrl,
      text: messageHtml,
      appUrl: window.location.origin,
      photoDataUrl,
    });
  };

  const syncKeyNow = async <T,>(key: string, value: T, successMsg: string) => {
    setSyncBadge('SYNCING');
    const res = await saveCloudState(key, value);
    if (res.ok) {
      setSyncBadge('SYNCED');
      notify('✅ ' + successMsg);
    } else {
      setSyncBadge('ERROR');
      notify('⚠️ Cloud sync issue: ' + (res.errorMsg || 'Check connection'), 5500);
    }
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
    const next = predictions.map((p) =>
      p.id === matchId ? { ...p, resultProofUrl: dataUrl } : p
    );
    setPredictions(next);
    await syncKeyNow('predictions', next, 'Result proof saved & synced to cloud!');
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasTextMatch = Boolean(homeTeam.trim() && awayTeam.trim());
    const hasSlipImage = Boolean(betslipImageUrl);
    if (!hasTextMatch && !hasSlipImage) {
      notify("⚠️ Enter match teams OR attach a betslip image first!", 4000);
      return;
    }

    const displayHome = homeTeam.trim() || "Verified Betslip";
    const displayAway = awayTeam.trim() || "";
    const displayPick = pick.trim() || (hasSlipImage ? "Official Betslip Selection" : "");
    const displayOdds = odds.trim() || "";

    const newMatch: Prediction = {
      id: `match-${Date.now()}`,
      tier,
      league: league.trim() || (hasSlipImage && !hasTextMatch ? "Official Verified Betslip" : "U.K. Football"),
      homeTeam: displayHome,
      awayTeam: displayAway,
      kickoffTime: kickoffTime.trim() || "20:00 EAT",
      matchDate: matchDate || todayIso,
      pick: displayPick,
      odds: displayOdds,
      confidence: confidence.trim() || "98%",
      analysisNote: analysisNote.trim(),
      betslipImageUrl: betslipImageUrl || undefined,
      status: initialStatus,
      pinned: false,
    };

    const next = [newMatch, ...predictions];
    setPredictions(next);

    const targetAudience = tier === "FREE" ? "ALL" : tier;
    onPushNotification(
      initialStatus === "WON" ? "WIN" : "NEW_MATCH",
      initialStatus === "WON"
        ? "BOOM! VERIFIED WIN POSTED!"
        : "NEW " + (tier === "VIP_MONTHLY" ? "VIP MONTHLY" : tier === "DAY_DEAL" ? "DAY DEAL" : "FREE") + " SLIP!",
      hasTextMatch
        ? `${displayHome} vs ${displayAway}${displayPick ? ` (${displayPick})` : ""} is now live!`
        : `New verified ${tier === "FREE" ? "Daily Free" : tier === "DAY_DEAL" ? "Day Deal" : "VIP"} betslip is now live!`,
      targetAudience
    );

    setHomeTeam("");
    setAwayTeam("");
    setPick("");
    setOdds("");
    setAnalysisNote("");
    setBetslipImageUrl("");
    setInitialStatus("PENDING");
    await syncKeyNow("predictions", next, "Published & synced live to all devices!");
  };

  const handleSaveEditedMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;
    const next = predictions.map((p) => (p.id === editingMatch.id ? editingMatch : p));
    setPredictions(next);
    setEditingMatch(null);
    await syncKeyNow('predictions', next, 'Match changes saved & synced to cloud!');
  };

  const handleStatusChange = async (id: string, status: MatchStatus) => {
    const target = predictions.find((p) => p.id === id);
    const next = predictions.map((p) => (p.id === id ? { ...p, status } : p));
    setPredictions(next);
    if (target) {
      const scoreTxt = target.finalScore ? ` (${target.finalScore})` : '';
      if (target.tier === 'FREE') {
        const statusHeadline =
          status === 'WON'
            ? '🎉 <b>BOOOOOOM! DAILY FREE PICK WON!</b> ✅🏆'
            : status === 'LOST'
            ? '📊 <b>DAILY FREE RESULT UPDATE: LOST</b> ❌'
            : status === 'POSTPONED'
            ? '⚠️ <b>DAILY FREE MATCH POSTPONED</b> ⏳'
            : '🔄 <b>DAILY FREE STATUS UPDATED: PENDING</b> ⏳';

        const freeProofPhoto = status === 'WON' ? target.resultProofUrl || target.betslipImageUrl : undefined;
        await broadcastTelegram(
          `${statusHeadline}\n━━━━━━━━━━━━━━━━━━\n⚽ <b>${target.homeTeam}${target.awayTeam ? ` vs ${target.awayTeam}` : ''}${scoreTxt}</b>\n🎯 Free Pick: <b>${target.pick}</b>${target.odds ? ` @ <b>${target.odds}</b>` : ''}\n📌 Status: <b>${status}</b> (FREE TIP)\n━━━━━━━━━━━━━━━━━━\n📲 View full SofaScore proof &amp; today’s next slip inside the app!`,
          freeProofPhoto
        );
      } else if (status === 'WON') {
        const vipName = target.tier === 'VIP_MONTHLY' ? 'VIP MONTHLY (70–100 ODDS)' : 'DAY DEAL (20–70 ODDS)';
        const proofPhoto = target.resultProofUrl || target.betslipImageUrl;
        const matchSummary =
          target.homeTeam && target.homeTeam !== 'Verified Betslip'
            ? `\n⚽ <b>${target.homeTeam}${target.awayTeam ? ` vs ${target.awayTeam}` : ''}${scoreTxt}</b>\n✅ Selection: <b>${target.pick}</b>${target.odds ? ` @ <b>${target.odds}</b>` : ''}`
            : scoreTxt
            ? `\n📊 Final Result: <b>${scoreTxt}</b>`
            : '';
        await broadcastTelegram(
          `🎉🔥 <b>BOOOOOOM! ${vipName} WON!</b> 🏆💰${matchSummary}\n\n✅ Verified winning slip settled as <b>WON</b> for our authorized subscribers!\n\n💎 <b>Subscribe to Day Deal or VIP Monthly inside the app to access our next winning slip immediately!</b>`,
          proofPhoto
        );
      }
    }
    await syncKeyNow('predictions', next, `Marked ${status} & synced to cloud!`);
  };

  const handleSaveScore = async () => {
    await syncKeyNow('predictions', predictions, 'Scoreline saved & synced to cloud!');
  };

  const handleTogglePin = async (id: string) => {
    const next = predictions.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p));
    setPredictions(next);
    await syncKeyNow('predictions', next, 'Pin priority synced to cloud!');
  };

  const handleDeleteMatch = async (id: string) => {
    const next = predictions.filter((p) => p.id !== id);
    setPredictions(next);
    await syncKeyNow('predictions', next, 'Match deleted from cloud!');
  };

  const handlePublishHomePost = async (e: React.FormEvent) => {
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
    const next = [newPost, ...homePosts];
    setHomePosts(next);
    setPostTitle('');
    setPostDesc('');
    setPostImageUrl('');
    await syncKeyNow('homePosts', next, 'Home Feed post published & synced!');
  };

  const handleDeleteHomePost = async (id: string) => {
    const next = homePosts.filter((item) => item.id !== id);
    setHomePosts(next);
    await syncKeyNow('homePosts', next, 'Home post deleted permanently!');
  };

  const handleSaveSpotlight = async () => {
    setSpotlight(draftSpotlight);
    await syncKeyNow('spotlight', draftSpotlight, 'Top Spotlight saved & synced!');
  };

  const handleSaveSystemSettings = async () => {
    const cleanedWa = (draftSettings.whatsappGroupUrl || '')
      .replace('https://://', 'https://').replace('http://://', 'http://').trim();
    const finalSettings = { ...draftSettings, whatsappGroupUrl: cleanedWa };
    setDraftSettings(finalSettings);
    setSettings(finalSettings);
    await syncKeyNow('settings', finalSettings, 'All System Settings saved & synced live!');
  };

  const handleGrantTier = async (email: string, newTier: PredictionTier) => {
    const days = newTier === 'VIP_MONTHLY' ? 30 : newTier === 'DAY_DEAL' ? 1 : 0;
    const expiryDate =
      days > 0 ? new Date(Date.now() + days * 86400000).toISOString().slice(0, 10) : null;
    const next = users.map((u) =>
      u.email === email ? { ...u, tier: newTier, expiresAt: expiryDate } : u
    );
    setUsers(next);
    await syncKeyNow('users', next, `Granted ${newTier} to ${email} & synced!`);
  };

  const handleAdjustWallet = async (email: string, delta: number) => {
    const next = users.map((u) =>
      u.email === email ? { ...u, walletBalance: Math.max(0, (u.walletBalance || 0) + delta) } : u
    );
    setUsers(next);
    await syncKeyNow('users', next, `Wallet updated (${delta > 0 ? `+${delta}` : delta} KES) & synced!`);
  };

  const handleToggleBan = async (email: string) => {
    const next = users.map((u) => (u.email === email ? { ...u, isBanned: !u.isBanned } : u));
    setUsers(next);
    await syncKeyNow('users', next, 'User access status synced!');
  };

  const pendingPaymentsCount = payments.filter((p) => p.status === 'PENDING').length;

  const handleApprovePayment = async (payId: string) => {
    const req = payments.find((p) => p.id === payId);
    if (!req) return;
    const nextPayments = payments.map((p) =>
      p.id === payId ? { ...p, status: 'APPROVED' as const } : p
    );
    setPayments(nextPayments);
    await syncKeyNow('payments', nextPayments, 'Payment APPROVED & synced!');
    const days = req.tier === 'VIP_MONTHLY' ? 30 : 1;
    const expiryDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
    const nextUsers = users.map((u) =>
      u.email.toLowerCase() === req.userEmail.toLowerCase()
        ? { ...u, tier: req.tier, expiresAt: expiryDate }
        : u
    );
    setUsers(nextUsers);
    await syncKeyNow('users', nextUsers, `✅ ${req.userName} upgraded to ${req.tier} & synced!`);
    onPushNotification(
      'LIVE_UPDATE',
      'VIP ACCESS ACTIVATED!',
      `${req.userName}, your ${req.tier === 'VIP_MONTHLY' ? 'VIP Monthly' : 'Day Deal'} payment (KES ${req.amountKes}) is verified & active!`,
      req.tier
    );
  };

  const handleRejectPayment = async (payId: string) => {
    const nextPayments = payments.map((p) =>
      p.id === payId ? { ...p, status: 'REJECTED' as const } : p
    );
    setPayments(nextPayments);
    await syncKeyNow('payments', nextPayments, 'Payment marked REJECTED & synced!');
  };

  const handleDeletePayment = async (payId: string) => {
    const nextPayments = payments.filter((p) => p.id !== payId);
    setPayments(nextPayments);
    await syncKeyNow('payments', nextPayments, 'Payment record deleted!');
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
      {toast && (
        <div className="fixed top-16 right-3 left-3 sm:left-auto z-50 bg-[#0B0F19] border border-emerald-500 text-white text-xs font-extrabold px-4 py-3 rounded-xl shadow-2xl">
          {toast}
        </div>
      )}

      {editingMatch && (
        <div onClick={() => setEditingMatch(null)} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSaveEditedMatch} className="bg-white w-full max-w-md rounded-2xl p-4 space-y-2.5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center font-black text-sm text-[#0B0F19]"><span>Edit / Replace Match</span><button type="button" onClick={() => setEditingMatch(null)}><X className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-2 gap-2">
              <select value={editingMatch.tier} onChange={(e) => setEditingMatch({ ...editingMatch, tier: e.target.value as PredictionTier })} className="p-2 border rounded-xl font-bold"><option value="FREE">Daily Free</option><option value="DAY_DEAL">Day Deal</option><option value="VIP_MONTHLY">VIP Monthly</option></select>
              <select value={editingMatch.status} onChange={(e) => setEditingMatch({ ...editingMatch, status: e.target.value as MatchStatus })} className="p-2 border rounded-xl font-bold"><option value="PENDING">PENDING</option><option value="WON">WON</option><option value="LOST">LOST</option><option value="POSTPONED">POSTPONED</option></select>
            </div>
            <div className="grid grid-cols-2 gap-2"><input type="date" value={editingMatch.matchDate} onChange={(e) => setEditingMatch({ ...editingMatch, matchDate: e.target.value })} className="p-2 border rounded-xl" /><input type="text" value={editingMatch.kickoffTime} onChange={(e) => setEditingMatch({ ...editingMatch, kickoffTime: e.target.value })} className="p-2 border rounded-xl" /></div>
            <input type="text" value={editingMatch.league} onChange={(e) => setEditingMatch({ ...editingMatch, league: e.target.value })} className="w-full p-2 border rounded-xl" />
            <div className="grid grid-cols-2 gap-2"><input type="text" value={editingMatch.homeTeam} onChange={(e) => setEditingMatch({ ...editingMatch, homeTeam: e.target.value })} className="p-2 border rounded-xl font-bold" /><input type="text" value={editingMatch.awayTeam} onChange={(e) => setEditingMatch({ ...editingMatch, awayTeam: e.target.value })} className="p-2 border rounded-xl font-bold" /></div>
            <div className="grid grid-cols-3 gap-2"><input type="text" value={editingMatch.pick} onChange={(e) => setEditingMatch({ ...editingMatch, pick: e.target.value })} className="col-span-2 p-2 border rounded-xl" /><input type="text" value={editingMatch.odds} onChange={(e) => setEditingMatch({ ...editingMatch, odds: e.target.value })} className="p-2 border rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-2"><input type="text" value={editingMatch.finalScore || ''} onChange={(e) => setEditingMatch({ ...editingMatch, finalScore: e.target.value })} placeholder="Score (2 - 0 FT)" className="p-2 border rounded-xl" /><input type="text" value={editingMatch.confidence} onChange={(e) => setEditingMatch({ ...editingMatch, confidence: e.target.value })} className="p-2 border rounded-xl" /></div>
            <textarea rows={2} value={editingMatch.analysisNote} onChange={(e) => setEditingMatch({ ...editingMatch, analysisNote: e.target.value })} className="w-full p-2 border rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-1 bg-blue-50 text-blue-800 border border-blue-300 font-bold py-2 rounded-xl cursor-pointer"><Upload className="w-3.5 h-3.5" /><span>{editingMatch.betslipImageUrl ? 'Replace Betslip' : '+ Betslip'}</span><input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.item(0); if (f) setEditingMatch({ ...editingMatch, betslipImageUrl: await compressImageFile(f, 720) }); }} className="hidden" /></label>
              <label className="flex items-center justify-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold py-2 rounded-xl cursor-pointer"><Trophy className="w-3.5 h-3.5" /><span>{editingMatch.resultProofUrl ? 'Replace Proof' : '+ Proof'}</span><input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.item(0); if (f) setEditingMatch({ ...editingMatch, resultProofUrl: await compressImageFile(f, 720) }); }} className="hidden" /></label>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"><Save className="w-4 h-4" /> Save &amp; Sync Match</button>
          </form>
        </div>
      )}

      <div className="bg-[#0B0F19] text-white rounded-2xl p-4 border border-red-500/40 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-red-500" /><h2 className="text-sm font-black uppercase">Admin Command Center</h2></div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${syncBadge === 'SYNCED' ? 'bg-emerald-600 text-white' : syncBadge === 'SYNCING' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-black'}`}><CloudCheck className="w-3 h-3" />{syncBadge === 'SYNCED' ? 'AUTO-SYNCED ✓' : syncBadge === 'SYNCING' ? 'SYNCING...' : 'CHECK SYNC'}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-slate-900 rounded-xl p-2"><div className="text-base font-black text-emerald-400">{onlineUsersCount}</div><div className="text-[10px] text-slate-400">Online</div></div>
          <div className="bg-slate-900 rounded-xl p-2"><div className="text-base font-black text-blue-400">{users.length}</div><div className="text-[10px] text-slate-400">Users</div></div>
          <div className="bg-slate-900 rounded-xl p-2"><div className="text-base font-black text-amber-400">{paidUsersCount}</div><div className="text-[10px] text-slate-400">VIPs</div></div>
        </div>
        <div className="grid grid-cols-5 gap-1 mt-3">
          {[{ id: 'MATCHES', label: 'Matches', icon: <PlusCircle className="w-3.5 h-3.5" /> }, { id: 'PAYMENTS', label: pendingPaymentsCount > 0 ? `Pay (${pendingPaymentsCount})` : 'Payments', icon: <CreditCard className="w-3.5 h-3.5" /> }, { id: 'SPOTLIGHT', label: 'Post', icon: <ImageIcon className="w-3.5 h-3.5" /> }, { id: 'USERS', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> }, { id: 'SYSTEM', label: 'Settings', icon: <SettingsIcon className="w-3.5 h-3.5" /> }].map((tab) => (
            <button key={tab.id} type="button" onClick={() => setSubTab(tab.id as AdminSubTab)} className={`flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-extrabold cursor-pointer ${subTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}>{tab.icon}<span>{tab.label}</span></button>
          ))}
        </div>
      </div>

      {subTab === 'MATCHES' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-950 via-[#0B0F19] to-blue-950 text-white rounded-2xl border border-emerald-500/40 p-4 space-y-2">
            <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5"><Trophy className="w-4 h-4" /> Instant BOOM! Win Celebration</span>
            <div className="flex flex-wrap gap-1.5">{['BOOM! Free Bet WON 3/3! 🎉🔥', 'BOOM! Day Deal Slip WON! 🏆', 'BOOM! VIP Monthly Slip WON! 💰🔥'].map((pr, i) => (<button key={i} type="button" onClick={() => setBoomMessage(pr)} className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded-lg cursor-pointer">Preset {i + 1}</button>))}</div>
            <div className="flex gap-2"><input type="text" value={boomMessage} onChange={(e) => setBoomMessage(e.target.value)} className="flex-1 px-3 py-2 text-xs text-black bg-white rounded-xl" /><button type="button" onClick={() => { if (boomMessage.trim()) { onPushNotification('WIN', 'BOOM! CONGRATULATIONS!', boomMessage.trim()); broadcastTelegram(`🎉 <b>BOOM! CONGRATULATIONS!</b>\n\n${boomMessage.trim()}`); notify('✅ BOOM alert sent to App & Telegram!'); } }} className="bg-emerald-600 text-white text-xs font-black px-4 rounded-xl cursor-pointer">Send</button></div>
          </div>

          <div className="bg-white rounded-2xl border p-4 space-y-2">
            <div className="flex justify-between items-center"><span className="text-xs font-black uppercase text-blue-700 flex items-center gap-1"><Megaphone className="w-4 h-4" /> Custom Notification</span><select value={customNotifTier} onChange={(e) => setCustomNotifTier(e.target.value as 'ALL' | 'DAY_DEAL' | 'VIP_MONTHLY')} className="text-[11px] font-bold bg-slate-100 border rounded-lg px-2 py-1"><option value="ALL">All Users</option><option value="DAY_DEAL">Day Deal</option><option value="VIP_MONTHLY">VIP Monthly</option></select></div>
            <input type="text" value={customNotifTitle} onChange={(e) => setCustomNotifTitle(e.target.value)} placeholder="Title" className="w-full p-2 text-xs border rounded-xl" />
            <div className="flex gap-2"><input type="text" value={customNotifBody} onChange={(e) => setCustomNotifBody(e.target.value)} placeholder="Message..." className="flex-1 p-2 text-xs border rounded-xl" /><button type="button" onClick={() => { if (customNotifBody.trim()) { onPushNotification('LIVE_UPDATE', customNotifTitle.trim() || 'DESK ALERT', customNotifBody.trim(), customNotifTier); setCustomNotifTitle(''); setCustomNotifBody(''); notify('✅ Notification sent!'); } }} className="bg-blue-600 text-white text-xs font-black px-4 rounded-xl cursor-pointer">Send</button></div>
          </div>

          <form onSubmit={handleAddMatch} className="bg-white rounded-2xl border p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-blue-700">Publish Match or Image Betslip</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Image-Only Allowed ✓</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <select value={tier} onChange={(e) => setTier(e.target.value as PredictionTier)} className="p-2 text-xs font-bold border rounded-xl"><option value="FREE">Daily Free</option><option value="DAY_DEAL">Day Deal</option><option value="VIP_MONTHLY">VIP Monthly</option></select>
              <input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="p-2 text-xs font-bold border rounded-xl" />
              <select value={initialStatus} onChange={(e) => setInitialStatus(e.target.value as MatchStatus)} className="p-2 text-xs font-extrabold border rounded-xl bg-slate-50"><option value="PENDING">PENDING</option><option value="WON">WON</option><option value="LOST">LOST</option><option value="POSTPONED">POSTPONED</option></select>
            </div>
            <label className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border-2 border-dashed border-blue-400 font-extrabold text-xs py-2.5 rounded-xl cursor-pointer"><Upload className="w-4 h-4 text-blue-600" /><span>{betslipImageUrl ? "Betslip Image Attached ✓ (Ready to Publish!)" : "Attach Betslip Image (Or Fill Fields Below)"}</span><input type="file" accept="image/*" onChange={handleBetslipUpload} className="hidden" /></label>
            <div className="grid grid-cols-2 gap-2"><input type="text" value={league} onChange={(e) => setLeague(e.target.value)} placeholder="League / Slip Title (Optional)" className="p-2 text-xs border rounded-xl" /><input type="text" value={kickoffTime} onChange={(e) => setKickoffTime(e.target.value)} placeholder="20:00 EAT" className="p-2 text-xs border rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-2"><input type="text" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} placeholder="Home Team (Optional if image)" className="p-2 text-xs border rounded-xl" /><input type="text" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} placeholder="Away Team (Optional if image)" className="p-2 text-xs border rounded-xl" /></div>
            <div className="grid grid-cols-3 gap-2"><input type="text" value={pick} onChange={(e) => setPick(e.target.value)} placeholder="Pick (Optional)" className="col-span-2 p-2 text-xs border rounded-xl" /><input type="text" value={odds} onChange={(e) => setOdds(e.target.value)} placeholder="Odds (Optional)" className="p-2 text-xs border rounded-xl" /></div>
            <div className="grid grid-cols-3 gap-2"><input type="text" value={confidence} onChange={(e) => setConfidence(e.target.value)} placeholder="98%" className="p-2 text-xs border rounded-xl" /><input type="text" value={analysisNote} onChange={(e) => setAnalysisNote(e.target.value)} placeholder="Desk Note (Optional)" className="col-span-2 p-2 text-xs border rounded-xl" /></div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer">Publish &amp; Auto-Sync Live</button>
          </form>

          <div className="bg-[#0B0F19] p-1.5 rounded-2xl grid grid-cols-2 gap-1.5">
            <button type="button" onClick={() => setMatchListMode('ACTIVE')} className={`py-2 rounded-xl text-xs font-black cursor-pointer ${matchListMode === 'ACTIVE' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Active &amp; Live ({activeMatches.length})</button>
            <button type="button" onClick={() => setMatchListMode('HISTORY')} className={`py-2 rounded-xl text-xs font-black cursor-pointer ${matchListMode === 'HISTORY' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>History Archive ({settledHistoryAll.length})</button>
          </div>

          {matchListMode === 'HISTORY' && (
            <div className="bg-white rounded-2xl border p-3 flex flex-wrap items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <button type="button" onClick={() => setHistoryDateFilter('ALL')} className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${historyDateFilter === 'ALL' ? 'bg-[#0B0F19] text-white' : 'bg-slate-100'}`}>All ({settledHistoryAll.length})</button>
              <button type="button" onClick={() => setHistoryDateFilter(todayIso)} className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${historyDateFilter === todayIso ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>Today</button>
              <button type="button" onClick={() => setHistoryDateFilter(yesterdayIso)} className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${historyDateFilter === yesterdayIso ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>Yesterday</button>
              <input type="date" value={historyDateFilter === 'ALL' ? todayIso : historyDateFilter} onChange={(e) => e.target.value && setHistoryDateFilter(e.target.value)} className="ml-auto px-2 py-1 text-[11px] border rounded-lg" />
            </div>
          )}

          <div className="space-y-2.5">
            {(matchListMode === 'ACTIVE' ? activeMatches : settledHistoryFiltered).map((p) => (
              <div key={p.id} className="bg-white rounded-xl border p-3 space-y-2">
                <div className="flex justify-between gap-2">
                  <div><span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{p.tier} • {p.matchDate} • {p.kickoffTime}</span><div className="text-xs font-black mt-1">{p.homeTeam} vs {p.awayTeam} ({p.odds})</div><div className="text-[11px] text-slate-600">{p.pick} • <strong>{p.status}</strong></div></div>
                  <div className="flex gap-1"><button type="button" onClick={() => setEditingMatch(p)} className="p-1.5 rounded-lg bg-blue-50 text-blue-700 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button><button type="button" onClick={() => handleTogglePin(p.id)} className="p-1.5 rounded-lg bg-slate-50 cursor-pointer"><Pin className="w-3.5 h-3.5" /></button><button type="button" onClick={() => handleDeleteMatch(p.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></div>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  <input type="text" value={p.finalScore || ''} onChange={(e) => setPredictions((prev) => prev.map((x) => (x.id === p.id ? { ...x, finalScore: e.target.value } : x)))} placeholder="Score (2-0)" className="col-span-2 p-1.5 text-[11px] border rounded-lg" />
                  <button type="button" onClick={() => handleSaveScore()} className="bg-slate-900 text-white text-[10px] font-bold py-1.5 rounded-lg cursor-pointer">Save</button>
                  <label className="col-span-2 flex items-center justify-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold py-1.5 rounded-lg cursor-pointer"><Trophy className="w-3.5 h-3.5" /><span>{p.resultProofUrl ? 'Proof ✓' : '+ Proof'}</span><input type="file" accept="image/*" onChange={(e) => handleResultProofUpload(p.id, e)} className="hidden" /></label>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button type="button" onClick={() => handleStatusChange(p.id, 'WON')} className="bg-emerald-600 text-white text-[10px] font-bold py-1.5 rounded-lg cursor-pointer">WON</button>
                  <button type="button" onClick={() => handleStatusChange(p.id, 'LOST')} className="bg-red-600 text-white text-[10px] font-bold py-1.5 rounded-lg cursor-pointer">LOST</button>
                  <button type="button" onClick={() => handleStatusChange(p.id, 'POSTPONED')} className="bg-amber-500 text-white text-[10px] font-bold py-1.5 rounded-lg cursor-pointer">POSTP</button>
                  <button type="button" onClick={() => handleStatusChange(p.id, 'PENDING')} className="bg-blue-600 text-white text-[10px] font-bold py-1.5 rounded-lg cursor-pointer">PEND</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {subTab === 'PAYMENTS' && (
        <div className="space-y-3">
          <div className="bg-[#0B0F19] text-white rounded-2xl p-4 border border-amber-500/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-amber-400">M-Pesa Payment Verification Queue</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Approving automatically unlocks the user’s VIP access across all devices.</div>
            </div>
            <span className="bg-amber-500 text-[#0B0F19] text-xs font-black px-3 py-1 rounded-full">{pendingPaymentsCount} Pending</span>
          </div>
          {payments.length === 0 ? (
            <div className="bg-white rounded-2xl border p-8 text-center text-xs text-slate-500">No payment submissions yet.</div>
          ) : (
            <div className="space-y-2.5">
              {payments.map((pm) => (
                <div key={pm.id} className="bg-white rounded-2xl border p-3.5 space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pm.status === 'PENDING' ? 'bg-amber-100 text-amber-900' : pm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{pm.status}</span>
                        <span className="text-[10px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">{pm.tier.replace('_', ' ')} • KES {pm.amountKes}</span>
                      </div>
                      <div className="text-xs font-black text-[#0B0F19] mt-1">{pm.userName}</div>
                      <div className="text-[11px] text-slate-600">📱 {pm.userPhone || 'N/A'} • ✉️ {pm.userEmail}</div>
                    </div>
                    <button type="button" onClick={() => handleDeletePayment(pm.id)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="bg-slate-900 text-amber-300 font-mono text-[11px] p-2.5 rounded-xl break-all">M-Pesa / SMS: {pm.mpesaCode}</div>
                  <div className="text-[10px] text-slate-400">Submitted: {pm.submittedAt}</div>
                  {pm.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button type="button" onClick={() => handleApprovePayment(pm.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer"><CheckCircle2 className="w-4 h-4" /> Approve &amp; Activate VIP</button>
                      <button type="button" onClick={() => handleRejectPayment(pm.id)} className="bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer"><XCircle className="w-4 h-4" /> Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'SPOTLIGHT' && (
        <div className="space-y-4">
          <form onSubmit={handlePublishHomePost} className="bg-white rounded-2xl border p-4 space-y-2.5">
            <h3 className="text-xs font-black uppercase text-blue-700">Publish New Home Feed Post</h3>
            <label className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"><Upload className="w-4 h-4" /><span>{postImageUrl ? 'Image Ready ✓' : 'Upload Post Image'}</span><input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.item(0); if (f) { setPostImageUrl(await compressImageFile(f, 960)); notify('Image attached!'); } }} className="hidden" /></label>
            <input type="text" value={postBadge} onChange={(e) => setPostBadge(e.target.value)} placeholder="Badge" className="w-full p-2 text-xs border rounded-xl" />
            <input type="text" required value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Post Headline" className="w-full p-2 text-xs border rounded-xl" />
            <textarea rows={2} required value={postDesc} onChange={(e) => setPostDesc(e.target.value)} placeholder="Short description..." className="w-full p-2 text-xs border rounded-xl" />
            <button type="submit" className="w-full bg-[#0B0F19] text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer">Publish &amp; Sync Home Post</button>
          </form>
          {homePosts.length > 0 && (
            <div className="bg-white rounded-2xl border p-3.5 space-y-2">
              <div className="text-xs font-black uppercase text-slate-700">Published Home Feed Posts ({homePosts.length})</div>
              {homePosts.map((hp) => (
                <div key={hp.id} className="bg-slate-50 rounded-xl border p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0"><div className="text-xs font-black truncate">{hp.title}</div><div className="text-[10px] text-slate-500">{hp.likesCount} Likes • {hp.viewsCount} Views</div></div>
                  <button type="button" onClick={() => handleDeleteHomePost(hp.id)} className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-black flex items-center gap-1 shrink-0 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              ))}
            </div>
          )}
          <div className="bg-white rounded-2xl border p-4 space-y-2.5">
            <h3 className="text-xs font-black uppercase text-slate-700">Edit Top Featured Spotlight</h3>
            <label className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"><Upload className="w-4 h-4 text-blue-400" /><span>Upload Spotlight Media</span><input type="file" accept="image/*,video/*" onChange={async (e) => { const f = e.target.files?.item(0); if (!f) return; if (f.type.startsWith('video/')) { const r = new FileReader(); r.onload = () => typeof r.result === 'string' && setDraftSpotlight((p) => ({ ...p, mediaType: 'video', mediaUrl: r.result as string, updatedAt: 'Just Now' })); r.readAsDataURL(f); } else { const url = await compressImageFile(f, 960); setDraftSpotlight((p) => ({ ...p, mediaType: 'image', mediaUrl: url, updatedAt: 'Just Now' })); } notify('Loaded — tap Save Spotlight below!'); }} className="hidden" /></label>
            <input type="text" value={draftSpotlight.badgeText} onChange={(e) => setDraftSpotlight((p) => ({ ...p, badgeText: e.target.value }))} className="w-full p-2 text-xs border rounded-xl" />
            <input type="text" value={draftSpotlight.title} onChange={(e) => setDraftSpotlight((p) => ({ ...p, title: e.target.value }))} className="w-full p-2 text-xs border rounded-xl" />
            <textarea rows={2} value={draftSpotlight.description} onChange={(e) => setDraftSpotlight((p) => ({ ...p, description: e.target.value }))} className="w-full p-2 text-xs border rounded-xl" />
            <button type="button" onClick={handleSaveSpotlight} className="w-full bg-blue-600 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"><Save className="w-4 h-4" /> Save &amp; Sync Top Spotlight</button>
          </div>
        </div>
      )}
      {subTab === 'USERS' && (
        <div className="space-y-2.5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between text-xs"><span className="font-black text-blue-900">Registered Accounts ({users.length})</span><span className="text-[10px] font-bold text-emerald-700">Live Cloud Synced ✓</span></div>
          {users.map((u) => (
            <div key={u.email} className="bg-white rounded-xl border p-3 space-y-2">
              <div className="flex justify-between items-start gap-2"><div><div className="text-xs font-black">{u.name}</div><div className="text-[11px] font-bold text-slate-700">📱 {u.phone || 'No phone'} • ✉️ {u.email}</div><div className="text-[11px] font-extrabold text-blue-700">Tier: {u.tier} • Wallet: KES {u.walletBalance || 0}</div></div><button type="button" onClick={() => handleToggleBan(u.email)} className="p-1.5 rounded-lg bg-red-50 text-red-600 cursor-pointer"><Ban className="w-4 h-4" /></button></div>
              <div className="grid grid-cols-2 gap-1.5"><button type="button" onClick={() => handleAdjustWallet(u.email, 50)} className="bg-emerald-50 border text-[10px] font-bold py-1 rounded-lg">+50 KES</button><button type="button" onClick={() => handleAdjustWallet(u.email, 350)} className="bg-emerald-600 text-white text-[10px] font-bold py-1 rounded-lg">+350 KES</button></div>
              <div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => handleGrantTier(u.email, 'FREE')} className="bg-slate-100 text-[10px] font-bold py-1 rounded-lg">FREE</button><button type="button" onClick={() => handleGrantTier(u.email, 'DAY_DEAL')} className="bg-blue-600 text-white text-[10px] font-bold py-1 rounded-lg">DAY DEAL</button><button type="button" onClick={() => handleGrantTier(u.email, 'VIP_MONTHLY')} className="bg-red-600 text-white text-[10px] font-bold py-1 rounded-lg">VIP</button></div>
            </div>
          ))}
        </div>
      )}
      {subTab === 'SYSTEM' && (
        <div className="space-y-3 text-xs">
          <div className="bg-white rounded-2xl border p-4 space-y-2.5">
            <h3 className="text-xs font-black uppercase text-[#0B0F19]">1. Security &amp; Access Controls</h3>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border"><span className="font-bold"><Wrench className="w-3.5 h-3.5 inline mr-1" />Maintenance Mode</span><button type="button" onClick={() => setDraftSettings((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))} className={`px-3 py-1 rounded-lg font-black ${draftSettings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>{draftSettings.maintenanceMode ? 'ON' : 'OFF'}</button></div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border"><span className="font-bold">Force Telegram Gate</span><button type="button" onClick={() => setDraftSettings((p) => ({ ...p, forceTelegramJoin: !p.forceTelegramJoin }))} className={`px-3 py-1 rounded-lg font-black ${draftSettings.forceTelegramJoin ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>{draftSettings.forceTelegramJoin ? 'ON' : 'OFF'}</button></div>
            <input type="text" value={draftSettings.telegramBotToken} onChange={(e) => setDraftSettings((p) => ({ ...p, telegramBotToken: e.target.value }))} placeholder="Telegram Bot Token" className="w-full p-2 border rounded-xl" />
            <div className="grid grid-cols-3 gap-1.5">
              <input type="text" value={draftSettings.telegramChannelId || ''} onChange={(e) => setDraftSettings((p) => ({ ...p, telegramChannelId: e.target.value }))} placeholder="@channel or -100..." className="col-span-2 p-2 border rounded-xl" />
              <button type="button" onClick={() => setDraftSettings((p) => ({ ...p, autoPostTelegram: p.autoPostTelegram === false ? true : false }))} className={`px-2 py-2 rounded-xl font-black text-[10px] cursor-pointer ${draftSettings.autoPostTelegram !== false ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>{draftSettings.autoPostTelegram !== false ? 'AUTO-POST: ON' : 'AUTO-POST: OFF'}</button>
            </div>
            <button type="button" onClick={async () => {
              notify('⏳ Sending test post to Telegram...');
              const r = await postToTelegramChannel({ botToken: draftSettings.telegramBotToken, channelId: draftSettings.telegramChannelId, channelUrl: draftSettings.telegramChannelUrl, text: '✅ <b>U.K. Football Fixtures Insight</b>\nTelegram Auto-Posting is connected & active! 🔥⚽', appUrl: window.location.origin });
              notify(r.ok ? '✅ Test post published to your Telegram Channel!' : '⚠️ ' + (r.errorMsg || 'Failed'), 6000);
            }} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black text-[11px] py-2 rounded-xl cursor-pointer">Test Telegram Channel Auto-Post</button>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border"><span className="font-bold">Screenshot Protection</span><button type="button" onClick={() => setDraftSettings((p) => ({ ...p, screenshotProtection: !p.screenshotProtection }))} className={`px-3 py-1 rounded-lg font-black ${draftSettings.screenshotProtection ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>{draftSettings.screenshotProtection ? 'ON' : 'OFF'}</button></div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border"><span className="font-bold"><PlayCircle className="w-3.5 h-3.5 inline mr-1" />Google Ads Enabled</span><button type="button" onClick={() => setDraftSettings((p) => ({ ...p, adsEnabled: !p.adsEnabled }))} className={`px-3 py-1 rounded-lg font-black ${draftSettings.adsEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>{draftSettings.adsEnabled ? 'ON' : 'OFF'}</button></div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border"><span className="font-bold">Lock Free Tips Behind Ad</span><button type="button" onClick={() => setDraftSettings((p) => ({ ...p, freeTipsAdLock: !p.freeTipsAdLock }))} className={`px-3 py-1 rounded-lg font-black ${draftSettings.freeTipsAdLock ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>{draftSettings.freeTipsAdLock ? 'LOCKED' : 'OPEN'}</button></div>
            <div className="grid grid-cols-2 gap-2"><input type="text" value={draftSettings.googleAdClientId} onChange={(e) => setDraftSettings((p) => ({ ...p, googleAdClientId: e.target.value }))} placeholder="ca-pub-..." className="p-2 border rounded-xl" /><input type="text" value={draftSettings.googleAdSlotId} onChange={(e) => setDraftSettings((p) => ({ ...p, googleAdSlotId: e.target.value }))} placeholder="Slot ID" className="p-2 border rounded-xl" /></div>
            <input type="text" value={draftSettings.whatsappGroupUrl} onChange={(e) => setDraftSettings((p) => ({ ...p, whatsappGroupUrl: e.target.value }))} placeholder="WhatsApp URL" className="w-full p-2 border rounded-xl" />
            <input type="text" value={draftSettings.telegramChannelUrl} onChange={(e) => setDraftSettings((p) => ({ ...p, telegramChannelUrl: e.target.value }))} placeholder="Telegram URL" className="w-full p-2 border rounded-xl" />
            <input type="text" value={draftSettings.paymentNumber} onChange={(e) => setDraftSettings((p) => ({ ...p, paymentNumber: e.target.value }))} placeholder="Payment Number" className="w-full p-2 border rounded-xl font-mono font-bold" />
            <div className="grid grid-cols-2 gap-2"><input type="text" value={draftSettings.dayDealPrice} onChange={(e) => setDraftSettings((p) => ({ ...p, dayDealPrice: e.target.value }))} className="p-2 border rounded-xl font-bold" /><input type="text" value={draftSettings.vipMonthlyPrice} onChange={(e) => setDraftSettings((p) => ({ ...p, vipMonthlyPrice: e.target.value }))} className="p-2 border rounded-xl font-bold" /></div>
            <button type="button" onClick={handleSaveSystemSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer"><Save className="w-4 h-4" /> Save &amp; Sync All System Settings</button>
          </div>
          <div className="bg-white rounded-2xl border p-4 flex gap-2"><input type="text" value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} placeholder="Ticker Announcement..." className="flex-1 p-2 border rounded-xl" /><button type="button" onClick={async () => { if (!newAnnouncement.trim()) return; const m = newAnnouncement.trim(); const next = [m, ...announcements]; setAnnouncements(next); onPushNotification('LIVE_UPDATE', 'DESK ANNOUNCEMENT', m); setNewAnnouncement(''); await syncKeyNow('announcements', next, 'Announcement synced!'); }} className="bg-red-600 text-white font-bold px-4 rounded-xl cursor-pointer">Post</button></div>
          {onForceCloudPush && (
            <button type="button" disabled={pushingCloud} onClick={async () => { setPushingCloud(true); notify('⏳ Force pushing all data to Supabase...'); const res = await onForceCloudPush(); notify(res.ok ? '✅ ' + res.message : '⚠️ ' + res.message, 6000); setPushingCloud(false); }} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black py-3 px-4 rounded-xl shadow cursor-pointer">
              {pushingCloud ? '⏳ Syncing to Supabase Cloud...' : 'Force Push All Local Tips, Images & Users to Supabase Cloud'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
