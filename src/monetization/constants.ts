export const ENTITLEMENT_ID = 'pro'; // RevenueCat entitlement
export const WEEKLY_ONLINE_FREE_LIMIT = 5;

// Feature flags via .env (avec valeurs par défaut)
export const ADS_ENABLED = false; // Désactivé temporairement pour éviter le crash EAS
export const PAYWALL_ENABLED = process.env.EXPO_PUBLIC_PAYWALL_ENABLED !== 'false';

// AdMob Test IDs iOS (pour le développement et QA)
export const ADMOB_TEST_IDS = {
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712', // Test iOS
  BANNER: 'ca-app-pub-3940256099942544/6300978111', // Test iOS
  REWARDED: 'ca-app-pub-3940256099942544/5224354917' // Test iOS
};

// Production IDs iOS (à remplacer par les vrais pour la release)
export const ADMOB_PRODUCTION_IDS = {
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712', // Remplacez par votre ID Interstitial
  BANNER: 'ca-app-pub-3940256099942544/6300978111', // Remplacez par votre ID Banner
  REWARDED: 'ca-app-pub-3940256099942544/5224354917' // Remplacez par votre ID Rewarded
};

// Configuration iOS uniquement
export const IS_IOS_ONLY = true;
