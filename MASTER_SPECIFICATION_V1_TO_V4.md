# U.K FOOTBALL FIXTURES INSIGHT — MASTER SPECIFICATION (V1.0 TO V4.0)

## 1. PROJECT IDENTITY & LIVE INFRASTRUCTURE
- **Brand Name:** U.K FOOTBALL FIXTURES INSIGHT (Splash Crest: U.K FOOTBALL INSIGHT)
- **Theme Palette:** Obsidian Black (#0B0F19), Royal Blue (#1D4ED8), Crimson Red (#DC2626), Pure White (#FFFFFF)
- **Chief Admin Email:** jinxzenicon254@gmail.com
- **GitHub Repository:** ://github.com (Branch: main)
- **Live Vercel URL:** uk-football-fixtures-insight.vercel.app
- **Payment Number:** 0754346915 (M-Pesa / Airtel Money — Day Deal: 350/=, VIP Monthly: 3500/=)
- **WhatsApp Verification & Support:** 254704956915
- **Official WhatsApp Group:** https://whatsapp.com
- **Official Telegram Channel:** https://t.me
- **Google AdSense Publisher ID:** ca-pub-3150087316179365 (ads.txt, head script & meta verified)
- **Supabase Cloud Sync Keys:** settings, spotlight, home_posts, predictions, users, announcements

## 2. COMPLETED VERSION MILESTONES (V1.0 – V4.0)
- **V1.0 Core Platform:** 3-tier system (Daily Free 2-5 Odds, Day Deal 350/=, VIP Monthly 3500/=), M-Pesa/Airtel payment modal with pre-filled WhatsApp verification, invisible Admin Command Center for jinxzenicon254@gmail.com, and Supabase cloud sync.
- **V2.0 PWA, Ads & Maintenance:** Installable PWA manifest, 20-second rewarded ads (+5 KES/day non-withdrawable wallet credit), Daily Free ad-lock toggle, and Admin Maintenance Mode.
- **V3.0 AdSense, Navigation & Push Alerts:** Google AdSense integration (<GoogleAdBanner />), strict 1x/day 5 KES reward cap with automatic midnight lock reset, real PNG app icons (192x192 & 512x512), Service Worker background push notifications, slide-out menu drawer, Back button, FAQ, and Legal/Compliance pages.
- **V4.0 Media, Calendar History & Security:**
  - Startup brand splash screen (SplashScreen.tsx)
  - Full-fit uncropped Home Spotlight & Feed Posts with persistent Views and interactive Likes
  - Optional Betslip image uploads with fullscreen zoom lightbox (ImagePreviewModal.tsx)
  - Calendar Betting History explorer (All, Today, Yesterday, Prev/Next Day & Date Picker)
  - Final match scorelines + optional SofaScore / LiveScore result proof uploads
  - Anti-Screenshot & Screen-Capture blackout shield with Admin ON/OFF toggle

## 3. ACTIVE CODEBASE FILE REGISTRY (22 FILES)
- index.html, public/manifest.json, public/sw.js, public/icon.svg, public/icon-192.png, public/icon-512.png, public/ads.txt, public/robots.txt
- src/types.ts, src/data/initialData.ts, src/lib/supabase.ts, src/App.tsx
- src/components/Layout.tsx, HomeView.tsx, PredictionsView.tsx, SettingsView.tsx, PaymentModal.tsx, AuthModal.tsx, AdminPanel.tsx, RewardedAdModal.tsx, GoogleAdBanner.tsx, LegalHub.tsx, FAQView.tsx, SplashScreen.tsx, ImagePreviewModal.tsx

## 4. V5 DEPLOYMENT WORKFLOW (ACODE TERMINAL)
1. Always navigate to project root: cd ~/uk-football-fixtures
2. Apply updates in compact chunks and verify with: npm run build
3. Deploy live to Vercel via GitHub: git add . && git commit -m "V5 Update" && git push origin main
