import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ADMIN_EMAIL,
  INITIAL_HOME_POSTS,
  INITIAL_PREDICTIONS,
  INITIAL_SETTINGS,
  INITIAL_SPOTLIGHT,
  INITIAL_USERS,
} from './data/initialData';
import {
  AppNotification,
  AppSettings,
  HomeFeedPost,
  Prediction,
  PredictionTier,
  SpotlightMedia,
  UserProfile,
} from './types';
import { ActiveTab, Layout } from './components/Layout';
import { HomeView } from './components/HomeView';
import { PredictionsView } from './components/PredictionsView';
import { SettingsView } from './components/SettingsView';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { RewardedAdModal } from './components/RewardedAdModal';
import { LegalHub } from './components/LegalHub';
import { FAQView } from './components/FAQView';
import { SplashScreen } from './components/SplashScreen';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { NotificationsModal, resolveNotificationText } from './components/NotificationsModal';
import { TelegramGateModal } from './components/TelegramGateModal';
import {
  fetchCloudState,
  isSupabaseConfigured,
  saveCloudState,
} from './lib/supabase';
import { Wrench, LogIn, ShieldAlert } from 'lucide-react';

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('HOME');
  const [tabHistory, setTabHistory] = useState<ActiveTab[]>([]);

  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...INITIAL_SETTINGS,
    ...loadSaved('ukffi_settings', INITIAL_SETTINGS),
  }));
  const [spotlight, setSpotlight] = useState<SpotlightMedia>(() =>
    loadSaved('ukffi_spotlight', INITIAL_SPOTLIGHT)
  );
  const [homePosts, setHomePosts] = useState<HomeFeedPost[]>(() =>
    loadSaved('ukffi_home_posts', INITIAL_HOME_POSTS)
  );
  const [likedIds, setLikedIds] = useState<string[]>(() =>
    loadSaved('ukffi_liked_ids', [])
  );
  const [predictions, setPredictions] = useState<Prediction[]>(() =>
    loadSaved('ukffi_predictions', INITIAL_PREDICTIONS)
  );
  const [users, setUsers] = useState<UserProfile[]>(() =>
    loadSaved('ukffi_users', INITIAL_USERS)
  );
  const [announcements, setAnnouncements] = useState<string[]>(() =>
    loadSaved('ukffi_announcements', [
      'Welcome to U.K FOOTBALL INSIGHT! Daily Free (2-5 Odds) & VIP Slips are updated every morning.',
      'Earn KES 5 once daily via sponsored ads to unlock VIP & Day Deal access!',
    ])
  );

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() =>
    loadSaved('ukffi_current_user', null)
  );
  const [guestWallet, setGuestWallet] = useState<number>(() =>
    loadSaved('ukffi_guest_wallet', 0)
  );
  const [guestAdsCount, setGuestAdsCount] = useState<number>(() =>
    loadSaved('ukffi_guest_ads', 0)
  );
  const [freeUnlockedDate, setFreeUnlockedDate] = useState<string | null>(() =>
    loadSaved('ukffi_free_unlocked_date', null)
  );
  const [guestLastRewardDate, setGuestLastRewardDate] = useState<string | null>(() =>
    loadSaved('ukffi_guest_reward_date', null)
  );

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadSaved("ukffi_notifications", [
      {
        id: "welcome-win",
        type: "WIN",
        title: "BOOM! YESTERDAY’S SLIPS WON!",
        body: "Leeds United 3-1 & Aston Villa 2-0 landed cleanly! Check Match Calendar for verified results.",
        createdAt: "Recent",
      },
    ])
  );
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [lastSeenNotifId, setLastSeenNotifId] = useState<string>(() =>
    loadSaved("ukffi_last_seen_notif", "")
  );
  const [telegramVerifiedMap, setTelegramVerifiedMap] = useState<Record<string, boolean>>(() =>
    loadSaved("ukffi_telegram_verified_map", {})
  );
  const activeIdentityKey = currentUserEmail ? currentUserEmail.trim().toLowerCase() : "guest";
  const telegramVerified = Boolean(telegramVerifiedMap[activeIdentityKey]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authContextBanner, setAuthContextBanner] = useState("");
  const [paymentModalTier, setPaymentModalTier] = useState<Exclude<
    PredictionTier,
    'FREE'
  > | null>(null);
  const [adModalPurpose, setAdModalPurpose] = useState<
    'EARN_WALLET' | 'UNLOCK_FREE' | null
  >(null);
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const [privacyShieldActive, setPrivacyShieldActive] = useState(false);
  const cloudSyncOk = true;
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  const cloudLoaded = useRef(false);
  const isAdmin = currentUserEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Screenshot & Screen-Capture Protection Listener
  useEffect(() => {
    if (!settings.screenshotProtection || isAdmin) {
      setPrivacyShieldActive(false);
      return;
    }

    const handleVisibility = () => {
      if (document.hidden) setPrivacyShieldActive(true);
    };
    const handleBlur = () => setPrivacyShieldActive(true);
    const handleFocus = () => setTimeout(() => setPrivacyShieldActive(false), 350);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        ((e.ctrlKey || e.metaKey) && ['p', 's', 'u'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        setPrivacyShieldActive(true);
        navigator.clipboard?.writeText('').catch(() => {});
        setTimeout(() => setPrivacyShieldActive(false), 1800);
      }
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [settings.screenshotProtection, isAdmin]);
  const handleSelectTab = (nextTab: ActiveTab) => {
    if (nextTab !== activeTab) {
      setTabHistory((prev) => [...prev.slice(-10), activeTab]);
      setActiveTab(nextTab);
    }
  };

  const handleGoBack = () => {
    setTabHistory((prev) => {
      if (prev.length === 0) {
        setActiveTab('HOME');
        return [];
      }
      const copy = [...prev];
      const last = copy.pop()!;
      setActiveTab(last);
      return copy;
    });
  };

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      cloudLoaded.current = true;
      return;
    }

    async function syncFromCloud() {
      const [cSettings, cSpotlight, cHomePosts, cPredictions, cUsers, cAnnouncements, cNotifications] =
        await Promise.all([
          fetchCloudState<AppSettings>('settings'),
          fetchCloudState<SpotlightMedia>('spotlight'),
          fetchCloudState<HomeFeedPost[]>('home_posts'),
          fetchCloudState<Prediction[]>('predictions'),
          fetchCloudState<UserProfile[]>('users'),
          fetchCloudState<string[]>('announcements'),
          fetchCloudState<AppNotification[]>('notifications'),
        ]);

      if (cSettings) {
        const validWa =
          cSettings.whatsappGroupUrl &&
          cSettings.whatsappGroupUrl.includes('://whatsapp.com')
            ? cSettings.whatsappGroupUrl
            : 'https://' + '://whatsapp.comEDMcQr54KTW7D2KqrqiMkI';
        setSettings((prev) => ({
          ...prev,
          ...cSettings,
          whatsappGroupUrl: validWa,
          telegramChannelUrl: cSettings.telegramChannelUrl && cSettings.telegramChannelUrl.includes("+_yIGcgKWAxZkMzg8") ? cSettings.telegramChannelUrl : "https://t.me/+_yIGcgKWAxZkMzg8",
          telegramBotToken: cSettings.telegramBotToken?.trim() || "9235004140:AAFQnk7qv6ABm9aIRXiHbrtOcUcnGnYcDiY",
          forceTelegramJoin: cSettings.forceTelegramJoin !== undefined ? cSettings.forceTelegramJoin : true,
        }));
      }
      if (cSpotlight) setSpotlight(cSpotlight);
      if (cHomePosts) setHomePosts(cHomePosts);
      if (cPredictions) setPredictions(cPredictions);
      if (cUsers && Array.isArray(cUsers)) {
        setUsers((localUsers) => {
          const map = new Map<string, UserProfile>();
          for (const u of cUsers) map.set(u.email.toLowerCase(), u);
          for (const u of localUsers) {
            const existing = map.get(u.email.toLowerCase());
            map.set(u.email.toLowerCase(), existing ? { ...existing, ...u } : u);
          }
          const mergedUsers = Array.from(map.values());
          saveCloudState("users", mergedUsers);
          return mergedUsers;
        });
      }
      if (cAnnouncements) setAnnouncements(cAnnouncements);
      if (cNotifications) setNotifications(cNotifications);

      cloudLoaded.current = true;
    }

    syncFromCloud();
    const livePoll = setInterval(async () => {
      const [uList, pList, sSpot, sPosts, sSet, sAnn, sNotif] = await Promise.all([
        fetchCloudState<UserProfile[]>("users"),
        fetchCloudState<Prediction[]>("predictions"),
        fetchCloudState<SpotlightMedia>("spotlight"),
        fetchCloudState<HomeFeedPost[]>("homePosts"),
        fetchCloudState<AppSettings>("settings"),
        fetchCloudState<string[]>("announcements"),
        fetchCloudState<AppNotification[]>("notifications"),
      ]);
      if (Array.isArray(uList) && uList.length > 0) {
        setUsers((prev) => {
          const map = new Map<string, UserProfile>();
          for (const u of prev) map.set(u.email.toLowerCase(), u);
          for (const u of uList) map.set(u.email.toLowerCase(), u);
          return Array.from(map.values());
        });
      }
      if (Array.isArray(pList) && pList.length > 0) setPredictions(pList);
      if (sSpot) setSpotlight(sSpot);
      if (Array.isArray(sPosts)) setHomePosts(sPosts);
      if (sSet) setSettings((prev) => ({ ...prev, ...sSet }));
      if (Array.isArray(sAnn)) setAnnouncements(sAnn);
      if (Array.isArray(sNotif)) setNotifications(sNotif);
    }, 10000);
    return () => clearInterval(livePoll);
  }, []);

  useEffect(() => {
    localStorage.setItem('ukffi_settings', JSON.stringify(settings));
    if (cloudLoaded.current) saveCloudState('settings', settings);
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('ukffi_spotlight', JSON.stringify(spotlight));
    } catch {
      // Ignore quota if large video
    }
    if (cloudLoaded.current) saveCloudState('spotlight', spotlight);
  }, [spotlight]);

  useEffect(() => {
    try {
      localStorage.setItem('ukffi_home_posts', JSON.stringify(homePosts));
    } catch {
      // Ignore quota
    }
    if (cloudLoaded.current) saveCloudState('home_posts', homePosts);
  }, [homePosts]);

  useEffect(() => {
    localStorage.setItem('ukffi_liked_ids', JSON.stringify(likedIds));
  }, [likedIds]);

  useEffect(() => {
    localStorage.setItem('ukffi_predictions', JSON.stringify(predictions));
    if (cloudLoaded.current) saveCloudState('predictions', predictions);
  }, [predictions]);

  useEffect(() => {
    localStorage.setItem('ukffi_users', JSON.stringify(users));
    if (cloudLoaded.current) saveCloudState('users', users);
  }, [users]);

  useEffect(() => {
    localStorage.setItem("ukffi_announcements", JSON.stringify(announcements));
    localStorage.setItem("ukffi_notifications", JSON.stringify(notifications));
    if (cloudLoaded.current) saveCloudState("notifications", notifications);
    if (cloudLoaded.current) saveCloudState('announcements', announcements);
  }, [announcements, notifications]);

  useEffect(() => {
    localStorage.setItem('ukffi_current_user', JSON.stringify(currentUserEmail));
    localStorage.setItem('ukffi_guest_wallet', JSON.stringify(guestWallet));
    localStorage.setItem('ukffi_guest_ads', JSON.stringify(guestAdsCount));
    localStorage.setItem('ukffi_free_unlocked_date', JSON.stringify(freeUnlockedDate));
    localStorage.setItem('ukffi_guest_reward_date', JSON.stringify(guestLastRewardDate));
  }, [
    currentUserEmail,
    guestWallet,
    guestAdsCount,
    freeUnlockedDate,
    guestLastRewardDate,
  ]);

  const handleIncrementViews = useCallback(() => {
    setSpotlight((prev) => ({
      ...prev,
      viewsCount: (prev.viewsCount ?? 1240) + 1,
    }));
    setHomePosts((prev) =>
      prev.map((p) => ({ ...p, viewsCount: (p.viewsCount || 0) + 1 }))
    );
  }, []);

  const handleToggleLike = (id: string) => {
    const alreadyLiked = likedIds.includes(id);
    const delta = alreadyLiked ? -1 : 1;
    setLikedIds((prev) =>
      alreadyLiked ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (id === 'spotlight') {
      setSpotlight((prev) => ({
        ...prev,
        likesCount: Math.max(0, (prev.likesCount ?? 148) + delta),
      }));
    } else {
      setHomePosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, likesCount: Math.max(0, p.likesCount + delta) } : p
        )
      );
    }
  };
  const currentUser =
    users.find((u) => u.email.toLowerCase() === currentUserEmail?.toLowerCase()) || null;

  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyRewardClaimed = currentUser
    ? currentUser.lastAdRewardDate === todayKey
    : guestLastRewardDate === todayKey;
  const freeTipsUnlockedToday = freeUnlockedDate === todayKey || dailyRewardClaimed;

  const activeWalletBalance = currentUser ? currentUser.walletBalance || 0 : guestWallet;
  const activeAdsWatched = currentUser ? currentUser.adsWatchedCount || 0 : guestAdsCount;

  const handleRegisterUser = (data: { name: string; countryCode: string; phone: string; email: string; password: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const exists = users.find((u) => u.email.toLowerCase() === cleanEmail || (u.phone && u.phone === data.phone));
    if (exists) return { ok: false, error: "Account already exists. Tap Sign In above." };
    const newUser: UserProfile = { email: cleanEmail, name: data.name, phone: data.phone, countryCode: data.countryCode, password: data.password, registeredAt: new Date().toISOString().slice(0, 10), tier: "FREE", expiresAt: null, isBanned: false, isOnline: true, walletBalance: 0, adsWatchedCount: 0, lastAdRewardDate: null };
    const updated = [newUser, ...users];
    setUsers(updated);
    try { localStorage.setItem("ukffi_users", JSON.stringify(updated)); } catch {}
    fetchCloudState<UserProfile[]>("users").then((cloudList) => {
      const base = Array.isArray(cloudList) ? cloudList : users;
      const dedup = [newUser, ...base.filter((u) => u.email.toLowerCase() !== cleanEmail)];
      setUsers(dedup);
      saveCloudState("users", dedup);
    });
    setCurrentUserEmail(cleanEmail);
    localStorage.setItem("ukffi_current_email", cleanEmail);
    setShowAuthModal(false); setAuthContextBanner("");
    return { ok: true };
  };
  const handleLoginUser = (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const digits = identifier.replace(/\D/g, "");
    const found = users.find((u) => u.email.toLowerCase() === cleanId || (digits.length >= 7 && (u.phone || "").replace(/\D/g, "").endsWith(digits.slice(-9))));
    if (!found) return { ok: false, error: "Account not found. Tap Create Account first!" };
    if (found.password && found.password !== password && found.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return { ok: false, error: "Incorrect password." };
    const updated = users.map((u) => u.email.toLowerCase() === found.email.toLowerCase() ? { ...u, isOnline: true } : u);
    setUsers(updated); saveCloudState("users", updated);
    setCurrentUserEmail(found.email.toLowerCase());
    localStorage.setItem("ukffi_current_email", found.email.toLowerCase());
    setShowAuthModal(false); setAuthContextBanner("");
    return { ok: true };
  };
  const handlePushNotification = (type: AppNotification["type"], title: string, body: string, targetTier: "ALL" | "DAY_DEAL" | "VIP_MONTHLY" = "ALL", publicTeaserBody?: string) => {
    const newItem: AppNotification = { id: "notif-" + Date.now(), type, title, body, targetTier, publicTeaserBody, createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setNotifications((prev) => [newItem, ...prev.slice(0, 29)]);
    const resolved = resolveNotificationText(newItem, currentUser?.tier || "FREE", isAdmin);
    if ("serviceWorker" in navigator && Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, { body: resolved.text, icon: "/icon-192.png", badge: "/icon-192.png" })).catch(() => {});
    }
  };
  const firstNotifId = notifications.slice(0, 1).shift()?.id;
  const unreadCount = firstNotifId && lastSeenNotifId !== firstNotifId ? Math.max(1, notifications.findIndex((n) => n.id === lastSeenNotifId) === -1 ? notifications.length : notifications.findIndex((n) => n.id === lastSeenNotifId)) : 0;
  const handleLogout = () => {
    setCurrentUserEmail(null);
    if (activeTab === 'ADMIN') setActiveTab('HOME');
  };

  const handleAdRewardEarned = (rewardKes: number) => {
    if (adModalPurpose === 'UNLOCK_FREE') {
      setFreeUnlockedDate(todayKey);
    }
    if (dailyRewardClaimed) return;
    if (currentUserEmail) {
      setUsers((prev) =>
        prev.map((u) =>
          u.email.toLowerCase() === currentUserEmail.toLowerCase()
            ? {
                ...u,
                walletBalance: (u.walletBalance || 0) + rewardKes,
                adsWatchedCount: (u.adsWatchedCount || 0) + 1,
                lastAdRewardDate: todayKey,
              }
            : u
        )
      );
    } else {
      setGuestWallet((w) => w + rewardKes);
      setGuestAdsCount((c) => c + 1);
      setGuestLastRewardDate(todayKey);
    }
  };

  const handleRedeemWallet = (tier: Exclude<PredictionTier, 'FREE'>, cost: number) => {
    if (!currentUserEmail) return;
    const days = tier === 'VIP_MONTHLY' ? 30 : 1;
    const expiryDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

    setUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === currentUserEmail.toLowerCase()
          ? {
              ...u,
              tier,
              expiresAt: expiryDate,
              walletBalance: Math.max(0, (u.walletBalance || 0) - cost),
            }
          : u
      )
    );
  };

  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported on this browser.');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('U.K FOOTBALL INSIGHT', {
        body: 'Matchday alerts enabled! You will receive live updates on your notification bar.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    }
  };

  const handleInstallApp = async () => {
    if (installPromptEvent) {
      await installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      setInstallPromptEvent(null);
      if (choice.outcome === 'accepted') {
        handleRequestNotifications();
      }
    } else {
      alert(
        'To install on your phone: Tap your browser menu (⋮ or Share) and select "Install App" or "Add to Home Screen".'
      );
      handleRequestNotifications();
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (settings.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400"><Wrench className="w-8 h-8" /></div>
        <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase">Scheduled Maintenance</span>
        <h1 className="text-xl font-black">U.K FOOTBALL INSIGHT</h1>
        <p className="text-xs text-slate-300 max-w-md leading-relaxed">{settings.maintenanceMessage}</p>
        <button onClick={() => setShowAuthModal(true)} className="text-xs text-slate-400 hover:text-white underline flex items-center gap-1 pt-4"><LogIn className="w-3.5 h-3.5" /><span>Admin Desk Access</span></button>
        {settings.forceTelegramJoin && !telegramVerified && !isAdmin && (
          <TelegramGateModal
            settings={settings}
            onVerified={() => {
              setTelegramVerifiedMap((prev) => {
                const updated = { ...prev, [activeIdentityKey]: true };
                localStorage.setItem("ukffi_telegram_verified_map", JSON.stringify(updated));
                return updated;
              });
            }}
          />
        )}
        {showNotificationsModal && (
          <NotificationsModal
            notifications={notifications}
            userTier={currentUser?.tier || "FREE"}
            isAdmin={isAdmin}
            onUpgradeTier={(tier) => setPaymentModalTier(tier)}
            onClose={() => setShowNotificationsModal(false)}
            onEnablePush={handleRequestNotifications}
            pushGranted={notificationPermission === "granted"}
          />
        )}
        {showAuthModal && <AuthModal existingUsers={users} onRegister={handleRegisterUser} onLogin={handleLoginUser} contextBanner={authContextBanner} onClose={() => { setShowAuthModal(false); setAuthContextBanner(""); }} />}
      </div>
    );
  }

  if (currentUser?.isBanned && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
        <h1 className="text-xl font-black text-red-500">ACCOUNT SUSPENDED</h1>
        <p className="text-xs text-slate-300 max-w-sm">Your access to U.K FOOTBALL INSIGHT has been restricted by the administrator.</p>
        <button onClick={handleLogout} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Sign Out</button>
      </div>
    );
  }

  const topFreePrediction = predictions.find((p) => p.tier === 'FREE' && p.pinned) || predictions.find((p) => p.tier === 'FREE');

  return (
    <div className={settings.screenshotProtection && !isAdmin ? 'select-none' : undefined}>
      {privacyShieldActive && settings.screenshotProtection && !isAdmin && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-red-500" />
          <h2 className="text-lg font-black uppercase tracking-wider">Content Protected</h2>
          <p className="text-xs text-slate-300 max-w-xs">Screenshots and screen capture are restricted by U.K FOOTBALL INSIGHT to protect exclusive match analysis.</p>
        </div>
      )}
      <Layout
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onGoBack={handleGoBack}
        canGoBack={tabHistory.length > 0}
        liveTickerText={settings.liveTickerText}
        currentUserEmail={currentUserEmail}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onInstallApp={handleInstallApp}
        onRequestNotifications={handleRequestNotifications}
        unreadCount={unreadCount}
        onOpenNotifications={() => {
          if (!currentUser) {
            setAuthContextBanner("Register or sign in to view live matchday notifications.");
            setShowAuthModal(true);
            return;
          }
          setShowNotificationsModal(true);
          if (notifications.slice(0, 1).shift()?.id) {
            setLastSeenNotifId(notifications.slice(0, 1).shift()!.id);
            localStorage.setItem("ukffi_last_seen_notif", JSON.stringify(notifications.slice(0, 1).shift()!.id));
          }
        }}
      >
        {activeTab === "HOME" && !currentUser && (
          <div className="bg-gradient-to-r from-blue-900 via-[#0B0F19] to-red-950 text-white rounded-2xl p-4 border-2 border-blue-500 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-500 text-[#0B0F19] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Free Member Access Required</span>
              <span className="text-[10px] font-bold text-blue-300">Instant Activation</span>
            </div>
            <h3 className="text-sm sm:text-base font-black">Create Your Free Account to Access All App Services</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Register with your phone number, email &amp; password to unlock <strong>Daily Free (2–5 Odds)</strong>, <strong>Rewarded Ads Wallet</strong>, <strong>VIP Slips</strong> &amp; <strong>Live Matchday Dashboards</strong>.
            </p>
            <button
              onClick={() => {
                setAuthContextBanner("Register below to unlock Daily Free games, Rewarded Ads & Live Dashboards.");
                setShowAuthModal(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl shadow cursor-pointer"
            >
              Register Free Account / Sign In Now
            </button>
          </div>
        )}
        {activeTab === 'HOME' && (
          <HomeView
            spotlight={spotlight}
            homePosts={homePosts}
            likedIds={likedIds}
            onToggleLike={handleToggleLike}
            onIncrementViews={handleIncrementViews}
            topPrediction={topFreePrediction}
            settings={settings}
            onNavigate={handleSelectTab}
            totalPredictionsCount={predictions.length}
            walletBalance={activeWalletBalance}
            dailyRewardClaimed={dailyRewardClaimed}
            onWatchAdForWallet={() => setAdModalPurpose('EARN_WALLET')}
            canInstallApp={Boolean(installPromptEvent)}
            onInstallApp={handleInstallApp}
            notificationPermission={notificationPermission}
            onRequestNotifications={handleRequestNotifications}
            onPreviewImage={(url, title, subtitle) => setPreviewMedia({ url, title, subtitle })}
          />
        )}
        {(activeTab === 'FREE' || activeTab === 'DAY_DEAL' || activeTab === 'VIP_MONTHLY') && (
          <PredictionsView
            tier={activeTab}
            predictions={predictions}
            userTier={currentUser?.tier || 'FREE'}
            isAdmin={isAdmin}
            settings={settings}
            freeTipsUnlocked={freeTipsUnlockedToday}
            onOpenAdForFreeTips={() => setAdModalPurpose('UNLOCK_FREE')}
            onOpenPayment={(tier) => {
              if (!currentUser) {
                setAuthContextBanner("Create a free account or sign in first to unlock Day Deal or VIP Monthly.");
                setShowAuthModal(true);
                return;
              }
              setPaymentModalTier(tier);
            }}
            onPreviewImage={(url, title, subtitle) => setPreviewMedia({ url, title, subtitle })}
          />
        )}
        {activeTab === 'SETTINGS' && (
          <SettingsView
            currentUser={currentUser}
            walletBalance={activeWalletBalance}
            adsWatchedCount={activeAdsWatched}
            dailyRewardClaimed={dailyRewardClaimed}
            settings={settings}
            announcements={announcements}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenPayment={(tier) => setPaymentModalTier(tier)}
            onWatchAdForWallet={() => setAdModalPurpose('EARN_WALLET')}
            canInstallApp={Boolean(installPromptEvent)}
            onInstallApp={handleInstallApp}
            notificationPermission={notificationPermission}
            onRequestNotifications={handleRequestNotifications}
          />
        )}
        {activeTab === 'LEGAL' && <LegalHub settings={settings} />}
        {activeTab === 'FAQ' && <FAQView settings={settings} />}
        {activeTab === 'ADMIN' && isAdmin && (
          <AdminPanel
            predictions={predictions}
            setPredictions={setPredictions}
            spotlight={spotlight}
            setSpotlight={setSpotlight}
            homePosts={homePosts}
            setHomePosts={setHomePosts}
            settings={settings}
            setSettings={setSettings}
            users={users}
            setUsers={setUsers}
            setAnnouncements={setAnnouncements}
            onPushNotification={handlePushNotification}
            cloudSyncOk={cloudSyncOk}
            onForceCloudPush={async () => {
              const results = await Promise.all([
                saveCloudState("predictions", predictions),
                saveCloudState("users", users),
                saveCloudState("spotlight", spotlight),
                saveCloudState("homePosts", homePosts),
                saveCloudState("settings", settings),
                saveCloudState("announcements", announcements),
                saveCloudState("notifications", notifications),
              ]);
              const failed = results.find((r) => !r.ok);
              return failed ? { ok: false, message: failed.errorMsg || "Sync failed" } : { ok: true, message: "All tips, images, users & settings pushed to Supabase!" };
            }}
          />
        )}
        {showAuthModal && <AuthModal existingUsers={users} onRegister={handleRegisterUser} onLogin={handleLoginUser} contextBanner={authContextBanner} onClose={() => { setShowAuthModal(false); setAuthContextBanner(""); }} />}
        {paymentModalTier && (
          <PaymentModal
            tier={paymentModalTier}
            settings={settings}
            userEmail={currentUserEmail}
            walletBalance={activeWalletBalance}
            onRedeemWallet={handleRedeemWallet}
            onClose={() => setPaymentModalTier(null)}
            onRequireLogin={() => { setPaymentModalTier(null); setShowAuthModal(true); }}
          />
        )}
        {adModalPurpose && (
          <RewardedAdModal
            settings={settings}
            purpose={adModalPurpose}
            onComplete={() => handleAdRewardEarned(settings.adRewardKes)}
            onClose={() => setAdModalPurpose(null)}
          />
        )}
        {previewMedia && (
          <ImagePreviewModal
            imageUrl={previewMedia.url}
            title={previewMedia.title}
            subtitle={previewMedia.subtitle}
            onClose={() => setPreviewMedia(null)}
          />
        )}
      </Layout>
    </div>
  );
}

export default App;
