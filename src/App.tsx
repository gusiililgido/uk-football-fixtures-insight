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
import {
  fetchCloudState,
  isSupabaseConfigured,
  saveCloudState,
} from './lib/supabase';

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('HOME');
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadSaved('ukffi_settings', INITIAL_SETTINGS)
  );
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
      'Need fast activation? Send payment and tap "I Have Paid" for instant WhatsApp verification.',
    ])
  );

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() =>
    loadSaved('ukffi_current_user', null)
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentModalTier, setPaymentModalTier] = useState<Exclude<
    PredictionTier,
    'FREE'
  > | null>(null);

  const cloudLoaded = useRef(false);

  // Pull live state from Supabase on initial load
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

      if (cSettings) setSettings(cSettings);
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

  const currentUser =
    users.find((u) => u.email.toLowerCase() === currentUserEmail?.toLowerCase()) || null;

  const isAdmin = currentUserEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
          isBanned: false,
          isOnline: true,
        },
      ]);
    }
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    if (activeTab === 'ADMIN') setActiveTab('HOME');
  };

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
      setActiveTab={setActiveTab}
      liveTickerText={settings.liveTickerText}
      currentUserEmail={currentUserEmail}
      onOpenAuth={() => setShowAuthModal(true)}
      onLogout={handleLogout}
    >
      {activeTab === 'HOME' && (
        <HomeView
          spotlight={spotlight}
          settings={settings}
          onNavigate={setActiveTab}
          totalPredictionsCount={predictions.length}
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
          onOpenPayment={(tier) => setPaymentModalTier(tier)}
        />
      )}

      {activeTab === 'SETTINGS' && (
        <SettingsView
          currentUser={currentUser}
          settings={settings}
          announcements={announcements}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenPayment={(tier) => setPaymentModalTier(tier)}
        />
      )}

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
          announcements={announcements}
          setAnnouncements={setAnnouncements}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}

      {paymentModalTier && (
        <PaymentModal
          tier={paymentModalTier}
          settings={settings}
          userEmail={currentUserEmail}
          onClose={() => setPaymentModalTier(null)}
          onRequireLogin={() => {
            setPaymentModalTier(null);
            setShowAuthModal(true);
          }}
        />
      )}
    </Layout>
  );
}

export default App;
