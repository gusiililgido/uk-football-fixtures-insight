import { AppSettings, Prediction, SpotlightMedia, UserProfile } from '../types';

export const ADMIN_EMAIL = 'jinxzenicon254@gmail.com';

export const INITIAL_SETTINGS: AppSettings = {
  paymentNumber: '0754346915',
  paymentNetworkLabel: 'M-Pesa / Airtel Money',
  dayDealPrice: '350',
  vipMonthlyPrice: '3500',
  whatsappGroupUrl: 'https://' + '://whatsapp.com',
  telegramChannelUrl: 'https://' + 't.me/uk_Football_Insights',
  supportWhatsappNumber: '254704956915',
  liveTickerText:
    'LIVE INSIGHT: 98% Historical Analysis Accuracy • Watch 20s Sponsored Ads to Earn KES 5 Wallet Credits • 18+ Match Analysis Only',
  maintenanceMode: false,
  maintenanceMessage:
    'We are currently updating today’s Premier League & EFL statistical models. Back live in a few minutes!',
  adsEnabled: true,
  freeTipsAdLock: true,
  adRewardKes: 5,
  adDurationSeconds: 20,
  googleAdClientId: '',
  adBannerMediaUrl: '',
  adBannerHeadline: 'Sponsored Partner Insight — Watch 20s to Earn KES 5 Wallet Credit!',
};

export const INITIAL_SPOTLIGHT: SpotlightMedia = {
  title: 'U.K Matchday Tactical Breakdown & Form Guide',
  description:
    'Deep statistical analysis covering Premier League, Championship & EFL fixtures. Admin can update this spotlight anytime with matchday graphics, video previews, or tactical guides.',
  mediaType: 'guide',
  mediaUrl: '',
  badgeText: 'FEATURED INSIGHT',
  updatedAt: 'Updated Today',
};

export const INITIAL_PREDICTIONS: Prediction[] = [
  {
    id: 'free-1',
    tier: 'FREE',
    league: 'England • Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Nottingham Forest',
    kickoffTime: '17:00 EAT',
    matchDate: 'Today',
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
    matchDate: 'Today',
    pick: 'Over 2.5 Match Goals',
    odds: '1.78',
    confidence: '96%',
    analysisNote: 'Both sides average over 2.8 goals across their last 6 league fixtures.',
    status: 'WON',
    pinned: false,
  },
  {
    id: 'day-1',
    tier: 'DAY_DEAL',
    league: 'England • Premier League',
    homeTeam: 'Manchester City',
    awayTeam: 'Tottenham Hotspur',
    kickoffTime: '20:30 EAT',
    matchDate: 'Today',
    pick: 'Home Win & Both Teams To Score',
    odds: '2.85',
    confidence: '98%',
    analysisNote: 'High-tempo tactical matchup backed by 5-year head-to-head trends.',
    status: 'PENDING',
    pinned: true,
  },
  {
    id: 'vip-1',
    tier: 'VIP_MONTHLY',
    league: 'U.K & European Elite Slip',
    homeTeam: 'Liverpool',
    awayTeam: 'Aston Villa',
    kickoffTime: '22:00 EAT',
    matchDate: 'Today',
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
    isBanned: false,
    isOnline: true,
  },
];
