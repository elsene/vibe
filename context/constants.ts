export const ENTITLEMENT_ID = 'pro'; // RevenueCat entitlement
export const WEEKLY_ONLINE_FREE_LIMIT = 5;

// Feature flags via .env
export const ADS_ENABLED = process.env.EXPO_PUBLIC_ADS_ENABLED !== 'false';
export const PAYWALL_ENABLED = process.env.EXPO_PUBLIC_PAYWALL_ENABLED !== 'false';

// Mode développement - publicités simulées
export const SIMULATED_ADS = {
  BANNER: 'simulated_banner_ad',
  INTERSTITIAL: 'simulated_interstitial_ad',
  REWARDED: 'simulated_rewarded_ad'
};
