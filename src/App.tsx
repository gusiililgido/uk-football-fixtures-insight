import { useEffect, useRef, useState } from 'react';
import {
  ADMIN_EMAIL,
  INITIAL_PREDICTIONS,
  INITIAL_SETTINGS,
  INITIAL_SPOTLIGHT,
  INITIAL_USERS,
} from './data/initialData';
import {
  AppSettings,
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
import { LegalHub } from './components/LegalHub';
import { FAQView } from './components/FAQView';
import { RewardedAdModal } from './components/RewardedAdModal';
import {
  fetchCloudState,
  isSupabaseConfigured,
  saveCloudState,
} from './lib/supabase';
import { Wrench, LogIn } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("HOME");
  const [tabHistory, setTabHistory] = useState<ActiveTab[]>([]);

  const handleSelectTab = (nextTab: ActiveTab) => {
    if (nextTab !== activeTab) {
      setTabHistory((prev) => [...prev.slice(-10), activeTab]);
      setActiveTab(nextTab);
    }
  };

  const handleGoBack = () => {
    setTabHistory((prev) => {
      if (prev.length === 0) {
        setActiveTab("HOME");
        return [];
      }
      const copy = [...prev];
      const last = copy.pop()!;
      setActiveTab(last);
      return copy;
    });
  };
  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...INITIAL_SETTINGS,
    ...loadSaved('ukffi_settings', INITIAL_SETTINGS),
  }));
  const [spotlight, setSpotlight] = useState<SpotlightMedia>(() =>
    loadSaved('ukffi_spotlight', INITIAL_SPOTLIGHT)
  );
  const [predictions, setPredictions] = useState<Prediction[]>(() =>
    loadSaved('ukffi_predictions', INITIAL_PREDICTIONS)
  );
  const [users, setUsers] = useState<UserProfile[]>(() =>
    loadSaved('ukffi_users', INITIAL_USERS)
  );
  const [announcements, setAnnouncements] = useState<string[]>(() =>
    loadSaved('ukffi_announcements', [
      'Welcome to U.K FOOTBALL FIXTURES INSIGHT! Daily Free (2-5 Odds) & VIP Slips are updated every morning.',
      'Earn KES 5 per 20s sponsored ad in your Insight Wallet to unlock VIP & Day Deal plans!',
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

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentModalTier, setPaymentModalTier] = useState<Exclude<
    PredictionTier,
    'FREE'
  > | null>(null);
  const [adModalPurpose, setAdModalPurpose] = useState<'EARN_WALLET' | 'UNLOCK_FREE' | null>(
    null
  );

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
      const [cSettings, cSpotlight, cPredictions, cUsers, cAnnouncements] =
        await Promise.all([
          fetchCloudState<AppSettings>('settings'),
          fetchCloudState<SpotlightMedia>('spotlight'),
          fetchCloudState<Prediction[]>('predictions'),
          fetchCloudState<UserProfile[]>('users'),
          fetchCloudState<string[]>('announcements'),
        ]);

      if (cSettings) {
        const fixedWa = cSettings.whatsappGroupUrl && cSettings.whatsappGroupUrl.includes("://whatsapp.com")
          ? cSettings.whatsappGroupUrl
          : "https://://whatsapp.com";
        setSettings((prev) => ({ ...prev, ...cSettings, whatsappGroupUrl: fixedWa }));
      }
      if (cSpotlight) setSpotlight(cSpotlight);
      if (cPredictions) setPredictions(cPredictions);
      if (cUsers) setUsers(cUsers);
      if (cAnnouncements) setAnnouncements(cAnnouncements);

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
      // Ignore quota if large media
    }
    if (cloudLoaded.current) saveCloudState('spotlight', spotlight);
  }, [spotlight]);

  useEffect(() => {
    localStorage.setItem('ukffi_predictions', JSON.stringify(predictions));
    if (cloudLoaded.current) saveCloudState('predictions', predictions);
  }, [predictions]);

  useEffect(() => {
    localStorage.setItem('ukffi_users', JSON.stringify(users));
    if (cloudLoaded.current) saveCloudState('users', users);
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ukffi_announcements', JSON.stringify(announcements));
    if (cloudLoaded.current) saveCloudState('announcements', announcements);
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('ukffi_current_user', JSON.stringify(currentUserEmail));
  }, [currentUserEmail]);

  useEffect(() => {
    localStorage.setItem('ukffi_guest_wallet', JSON.stringify(guestWallet));
  }, [guestWallet]);

  useEffect(() => {
    localStorage.setItem('ukffi_guest_ads', JSON.stringify(guestAdsCount));
  }, [guestAdsCount]);

  useEffect(() => {
    localStorage.setItem('ukffi_free_unlocked_date', JSON.stringify(freeUnlockedDate));
    localStorage.setItem('ukffi_guest_reward_date', JSON.stringify(guestLastRewardDate));
  }, [freeUnlockedDate, guestLastRewardDate]);

  const currentUser =
    users.find((u) => u.email.toLowerCase() === currentUserEmail?.toLowerCase()) || null;

  const isAdmin = currentUserEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
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

  const handleLogout = () => {
    setCurrentUserEmail(null);
    if (activeTab === 'ADMIN') setActiveTab('HOME');
  };

  const handleAdRewardEarned = (rewardKes: number) => {
    if (adModalPurpose === "UNLOCK_FREE") {
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
    if (!("Notification" in window)) {
      alert("Notifications are not supported on this browser.");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
    if (perm === "granted") {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification("U.K FOOTBALL FIXTURES INSIGHT", {
          body: "Matchday push alerts are now active! You will receive live updates on your screen.",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        });
      }
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
        'To install on your phone: Tap your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install App".'
      );
      handleRequestNotifications();
    }
  };

  if (settings.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
          <Wrench className="w-8 h-8" />
        </div>
        <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase">
          Scheduled Maintenance
        </span>
        <h1 className="text-xl font-black">U.K FOOTBALL FIXTURES INSIGHT</h1>
        <p className="text-xs text-slate-300 max-w-md leading-relaxed">
          {settings.maintenanceMessage}
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="text-xs text-slate-400 hover:text-white underline flex items-center gap-1 pt-4"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Admin Desk Access</span>
        </button>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />
        )}
      </div>
    );
  }

  if (currentUser?.isBanned && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
        <h1 className="text-xl font-black text-red-500">ACCOUNT SUSPENDED</h1>
        <p className="text-xs text-slate-300 max-w-sm">
          Your access to U.K FOOTBALL FIXTURES INSIGHT has been restricted by the administrator.
        </p>
        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={handleSelectTab}
      onGoBack={handleGoBack}
      canGoBack={tabHistory.length > 0}
      onInstallApp={handleInstallApp}
      onRequestNotifications={handleRequestNotifications}
      liveTickerText={settings.liveTickerText}
      currentUserEmail={currentUserEmail}
      onOpenAuth={() => setShowAuthModal(true)}
      onLogout={handleLogout}
    >
      {activeTab === 'HOME' && (
        <HomeView
          spotlight={spotlight}
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
        />
      )}

      {(activeTab === 'FREE' ||
        activeTab === 'DAY_DEAL' ||
        activeTab === 'VIP_MONTHLY') && (
        <PredictionsView
          tier={activeTab}
          predictions={predictions}
          userTier={currentUser?.tier || 'FREE'}
          isAdmin={isAdmin}
          settings={settings}
          freeTipsUnlocked={freeTipsUnlockedToday}
          onOpenAdForFreeTips={() => setAdModalPurpose('UNLOCK_FREE')}
          onOpenPayment={(tier) => setPaymentModalTier(tier)}
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
          settings={settings}
          setSettings={setSettings}
          users={users}
          setUsers={setUsers}
          setAnnouncements={setAnnouncements}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />
      )}

      {paymentModalTier && (
        <PaymentModal
          tier={paymentModalTier}
          settings={settings}
          userEmail={currentUserEmail}
          walletBalance={activeWalletBalance}
          onRedeemWallet={handleRedeemWallet}
          onClose={() => setPaymentModalTier(null)}
          onRequireLogin={() => {
            setPaymentModalTier(null);
            setShowAuthModal(true);
          }}
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
    </Layout>
  );
}

export default App;
