import {
  AppSettings,
  HomeFeedPost,
  Prediction,
  SpotlightMedia,
  UserProfile,
} from '../types';

export const ADMIN_EMAIL = 'jinxzenicon254@gmail.com';

const todayIso = new Date().toISOString().slice(0, 10);
const yesterdayIso = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

export const INITIAL_SETTINGS: AppSettings = {
  paymentNumber: '0754346915',
  paymentNetworkLabel: 'M-Pesa / Airtel Money',
  dayDealPrice: '350',
  vipMonthlyPrice: '3500',
  whatsappGroupUrl: 'https://' + '://whatsapp.com',
  telegramChannelUrl: 'https://' + 't.me/uk_Football_Insights',
  supportWhatsappNumber: '254704956915',
  liveTickerText:
    'LIVE INSIGHT: 98% Historical Analysis Accuracy • Watch 20s Sponsored Ad Once Daily for +5 KES Wallet Credit • 18+ Match Analysis Only',
  maintenanceMode: false,
  screenshotProtection: true,
  forceTelegramJoin: true,
  telegramBotToken: '',
  maintenanceMessage:
    'We are currently updating today’s Premier League & EFL statistical models. Back live in a few minutes!',
  adsEnabled: true,
  freeTipsAdLock: true,
  adRewardKes: 5,
  adDurationSeconds: 20,
  googleAdClientId: 'ca-pub-3150087316179365',
  googleAdSlotId: '',
  adBannerMediaUrl: '',
  adBannerHeadline: 'Sponsored Partner Insight — Watch 20s to Earn KES 5 Daily Wallet Credit!',
};

export const INITIAL_SPOTLIGHT: SpotlightMedia = {
  title: 'U.K Matchday Tactical Breakdown & Form Guide',
  description:
    'Deep statistical analysis covering Premier League, Championship & EFL fixtures. Admin can upload full-size matchday graphics, betslip previews, or video breakdowns anytime.',
  mediaType: 'guide',
  mediaUrl: '',
  badgeText: 'FEATURED INSIGHT',
  updatedAt: 'Updated Today',
  likesCount: 148,
  viewsCount: 1240,
};

export const INITIAL_HOME_POSTS: HomeFeedPost[] = [
  {
    id: 'post-1',
    badge: 'MATCHDAY BRIEFING',
    title: 'Premier League & EFL Weekend Statistical Edge',
    description:
      'Our analytics desk has filtered 42 fixtures using xG differential, squad injury news, and home/away form matrices. Check Daily Free (2-5 Odds) or unlock our high-value Day Deal & VIP Slips.',
    createdAt: 'Today • Analyst Desk',
    likesCount: 94,
    viewsCount: 812,
  },
];

export const INITIAL_PREDICTIONS: Prediction[] = [
  {
    id: 'free-1',
    tier: 'FREE',
    league: 'England • Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Nottingham Forest',
    kickoffTime: '17:00 EAT',
    matchDate: todayIso,
    pick: 'Home Win & Over 1.5 Goals',
    odds: '1.65',
    confidence: '98%',
    analysisNote: 'Strong home unbeaten streak with dominant xG metrics.',
    status: 'PENDING',
    pinned: true,
  },
  {
    id: 'free-2',
    tier: 'FREE',
    league: 'England • Championship',
    homeTeam: 'Leeds United',
    awayTeam: 'Swansea City',
    kickoffTime: '19:30 EAT',
    matchDate: yesterdayIso,
    pick: 'Over 2.5 Match Goals',
    odds: '1.78',
    confidence: '96%',
    analysisNote: 'Both sides average over 2.8 goals across their last 6 league fixtures.',
    status: 'WON',
    finalScore: '3 - 1 FT',
    pinned: false,
  },
  {
    id: 'day-1',
    tier: 'DAY_DEAL',
    league: 'England • Premier League',
    homeTeam: 'Manchester City',
    awayTeam: 'Tottenham Hotspur',
    kickoffTime: '20:30 EAT',
    matchDate: todayIso,
    pick: 'Home Win & Both Teams To Score',
    odds: '2.85',
    confidence: '98%',
    analysisNote: 'High-tempo tactical matchup backed by 5-year head-to-head trends.',
    status: 'PENDING',
    pinned: true,
  },
  {
    id: 'day-prev-1',
    tier: 'DAY_DEAL',
    league: 'England • Premier League',
    homeTeam: 'Aston Villa',
    awayTeam: 'Crystal Palace',
    kickoffTime: '18:00 EAT',
    matchDate: yesterdayIso,
    pick: 'Home Win & Over 1.5 Goals',
    odds: '2.15',
    confidence: '97%',
    analysisNote: 'Villa Park home dominance backed by strong set-piece xG.',
    status: 'WON',
    finalScore: '2 - 0 FT',
    pinned: false,
  },
  {
    id: 'vip-1',
    tier: 'VIP_MONTHLY',
    league: 'U.K & European Elite Slip',
    homeTeam: 'Liverpool',
    awayTeam: 'Aston Villa',
    kickoffTime: '22:00 EAT',
    matchDate: todayIso,
    pick: 'Correct Score Range 2-1 / 3-1 & Home Win (VIP Slip: 84.20 Odds)',
    odds: '4.40',
    confidence: '98%',
    analysisNote: 'Exclusive VIP algorithmic value selection with injury & lineup verification.',
    status: 'PENDING',
    pinned: true,
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    email: 'jinxzenicon254@gmail.com',
    name: 'Chief Admin',
    tier: 'VIP_MONTHLY',
    expiresAt: '2099-12-31',
    walletBalance: 5000,
    adsWatchedCount: 0,
    lastAdRewardDate: null,
    isBanned: false,
    isOnline: true,
  },
  {
    email: 'brian.kiprop@example.com',
    name: 'Brian K.',
    tier: 'DAY_DEAL',
    expiresAt: '2026-11-18',
    walletBalance: 120,
    adsWatchedCount: 24,
    lastAdRewardDate: null,
    isBanned: false,
    isOnline: true,
  },
];
