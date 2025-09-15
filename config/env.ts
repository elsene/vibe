// Configuration des variables d'environnement
export const ENV_CONFIG = {
  // Feature flags
  ADS_ENABLED: process.env.EXPO_PUBLIC_ADS_ENABLED !== 'false',
  PAYWALL_ENABLED: process.env.EXPO_PUBLIC_PAYWALL_ENABLED !== 'false',
  
  // API Keys
  REVENUECAT_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'your_revenuecat_api_key_here',
  ADMOB_APP_ID: process.env.EXPO_PUBLIC_ADMOB_APP_ID || 'ca-app-pub-3940256099942544~3347511713',
};

// Instructions pour créer le fichier .env :
/*
Créez un fichier .env à la racine du projet avec :

EXPO_PUBLIC_ADS_ENABLED=true
EXPO_PUBLIC_PAYWALL_ENABLED=true
EXPO_PUBLIC_REVENUECAT_API_KEY=votre_vraie_cle_revenuecat
EXPO_PUBLIC_ADMOB_APP_ID=votre_vrai_id_admob
*/
