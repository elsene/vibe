export const ENTITLEMENT_ID = 'pro'; // RevenueCat entitlement
export const WEEKLY_ONLINE_FREE_LIMIT = 5;

// Feature flags via .env (avec valeurs par défaut)
export const ADS_ENABLED = process.env.EXPO_PUBLIC_ADS_ENABLED !== 'false';
export const PAYWALL_ENABLED = process.env.EXPO_PUBLIC_PAYWALL_ENABLED !== 'false';

// AdMob Test IDs (pour le développement)
export const ADMOB_TEST_IDS = {
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712', // Test Android
  BANNER: 'ca-app-pub-3940256099942544/6300978111', // Test Android
  REWARDED: 'ca-app-pub-3940256099942544/5224354917' // Test Android
};

// Production IDs (à remplacer par les vrais)
export const ADMOB_PRODUCTION_IDS = {
  INTERSTITIAL: 'ca-app-pub-XXXX/YYYY',
  BANNER: 'ca-app-pub-XXXX/YYYY',
  REWARDED: 'ca-app-pub-XXXX/YYYY'
};
