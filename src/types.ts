export type PredictionTier = 'FREE' | 'DAY_DEAL' | 'VIP_MONTHLY';

export type MatchStatus = 'PENDING' | 'WON' | 'LOST' | 'POSTPONED';

export interface Prediction {
  id: string;
  tier: PredictionTier;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  matchDate: string; // YYYY-MM-DD for calendar history navigation
  pick: string;
  odds: string;
  confidence: string;
  analysisNote: string;
  status: MatchStatus;
  finalScore?: string;
  betslipImageUrl?: string;
  resultProofUrl?: string;
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
  likesCount?: number;
  viewsCount?: number;
}

export interface HomeFeedPost {
  id: string;
  badge: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  viewsCount: number;
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
  maintenanceMode: boolean;
  screenshotProtection: boolean;
  forceTelegramJoin: boolean;
  telegramBotToken: string;
  maintenanceMessage: string;
  adsEnabled: boolean;
  freeTipsAdLock: boolean;
  adRewardKes: number;
  adDurationSeconds: number;
  googleAdClientId: string;
  googleAdSlotId: string;
  adBannerMediaUrl: string;
  adBannerHeadline: string;
}

export interface UserProfile {
  phone?: string;
  countryCode?: string;
  password?: string;
  registeredAt?: string;
  email: string;
  name: string;
  tier: PredictionTier;
  expiresAt: string | null;
  walletBalance: number;
  adsWatchedCount: number;
  lastAdRewardDate: string | null;
  isBanned: boolean;
  isOnline: boolean;
}

export interface AppNotification {
  id: string;
  type: "WIN" | "NEW_MATCH" | "LIVE_UPDATE";
  title: string;
  body: string;
  targetTier?: "ALL" | "DAY_DEAL" | "VIP_MONTHLY";
  publicTeaserBody?: string;
  createdAt: string;
}
