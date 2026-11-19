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
  const [showAuthModal, setShowAuthModal] = useState(false);
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
        setSettings((prev) => ({ ...prev, ...cSettings, whatsappGroupUrl: validWa }));
      }
      if (cSpotlight) setSpotlight(cSpotlight);
      if (cHomePosts) setHomePosts(cHomePosts);
      if (cPredictions) setPredictions(cPredictions);
      if (cUsers) setUsers(cUsers);
      if (cAnnouncements) setAnnouncements(cAnnouncements);
      if (cNotifications) setNotifications(cNotifications);

      cloudLoaded.current = true;
    }

    syncFromCloud();
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

  const handleLogin = (email: string, name: string) => {
    setCurrentUserEmail(email);
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      setUsers((prev) => [
        ...prev,
        {
          email,
          name,
          tier: 'FREE',
          expiresAt: null,
          walletBalance: guestWallet,
          adsWatchedCount: guestAdsCount,
          lastAdRewardDate: guestLastRewardDate,
          isBanned: false,
          isOnline: true,
        },
      ]);
      setGuestWallet(0);
      setGuestAdsCount(0);
    }
  };

  const handlePushNotification = (
    type: AppNotification["type"],
    title: string,
    body: string,
    targetTier: "ALL" | "DAY_DEAL" | "VIP_MONTHLY" = "ALL",
    publicTeaserBody?: string
  ) => {
    const newItem: AppNotification = {
      id: "notif-" + Date.now(),
      type,
      title,
      body,
      targetTier,
      publicTeaserBody,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setNotifications((prev) => [newItem, ...prev.slice(0, 29)]);
    const activeTier = currentUser?.tier || "FREE";
    const resolved = resolveNotificationText(newItem, activeTier, isAdmin);
    if ("serviceWorker" in navigator && Notification.permission === "granted") {
      navigator.serviceWorker.ready
        .then((reg) =>
          reg.showNotification(title, {
            body: resolved.text,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          })
        )
        .catch(() => {});
    }
  };

  const unreadCount = notifications.filter((n) => n.id !== lastSeenNotifId).length > 0 && lastSeenNotifId !== notifications.slice(0, 1).shift()?.id
    ? Math.max(1, notifications.findIndex((n) => n.id === lastSeenNotifId) === -1 ? notifications.length : notifications.findIndex((n) => n.id === lastSeenNotifId))
    : 0;

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
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />}
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
          setShowNotificationsModal(true);
          if (notifications.slice(0, 1).shift()?.id) {
            setLastSeenNotifId(notifications.slice(0, 1).shift()!.id);
            localStorage.setItem("ukffi_last_seen_notif", JSON.stringify(notifications.slice(0, 1).shift()!.id));
          }
        }}
      >
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
            onOpenPayment={(tier) => setPaymentModalTier(tier)}
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
          />
        )}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />}
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
