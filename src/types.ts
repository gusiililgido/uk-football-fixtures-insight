export type PredictionTier = 'FREE' | 'DAY_DEAL' | 'VIP_MONTHLY';

export type MatchStatus = 'PENDING' | 'WON' | 'LOST' | 'POSTPONED';

export interface Prediction {
  id: string;
  tier: PredictionTier;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  matchDate: string;
  pick: string;
  odds: string;
  confidence: string;
  analysisNote: string;
  status: MatchStatus;
  pinned?: boolean;
  locked?: boolean;
}

export interface SpotlightMedia {
  title: string;
  description: string;
  mediaType: 'image' | 'video' | 'guide';
  mediaUrl: string;
  badgeText: string;
  updatedAt: string;
}

export interface AppSettings {
  paymentNumber: string;
  paymentNetworkLabel: string;
  dayDealPrice: string;
  vipMonthlyPrice: string;
  whatsappGroupUrl: string;
  telegramChannelUrl: string;
  supportWhatsappNumber: string;
  liveTickerText: string;
}

export interface UserProfile {
  email: string;
  name: string;
  tier: PredictionTier;
  expiresAt: string | null;
  isBanned: boolean;
  isOnline: boolean;
}
