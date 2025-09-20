import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { trackAdShown } from '../analytics/events';
import { usePremium } from './PremiumProvider';
import { ADMOB_TEST_IDS, IS_IOS_ONLY } from './constants';
import { effectiveFlags } from '../config/FeatureFlags';

// Import conditionnel d'AdMob avec gestion robuste des erreurs
let mobileAds: any = null;
let isAdMobAvailable = false;
let adMobInitialized = false;

try {
  // Essayer d'importer AdMob
  mobileAds = require('react-native-google-mobile-ads').default;
  isAdMobAvailable = true;
  console.log('📱 AdMob: Module importé avec succès');
} catch (error) {
  console.log('📱 AdMob: Module non disponible - mode simulation activé');
  mobileAds = null;
  isAdMobAvailable = false;
}

// Fonction d'initialisation lazy d'AdMob
async function initializeAdMobLazy() {
  if (adMobInitialized || !isAdMobAvailable || !mobileAds) return false;
  
  try {
    const flags = await effectiveFlags();
    if (!flags.ADS_ENABLED) {
      console.log('📱 AdMob: Désactivé par SafeMode ou flags');
      return false;
    }
    
    console.log('📱 AdMob: Initialisation lazy...');
    await mobileAds().initialize();
    adMobInitialized = true;
    console.log('✅ AdMob: Initialisé avec succès (lazy)');
    return true;
  } catch (error) {
    console.error('❌ AdMob: Erreur initialisation lazy:', error);
    return false;
  }
}

type CtxType = { showInterstitialIfEligible: (context?: string) => Promise<void> };
const Ctx = createContext<CtxType>({ showInterstitialIfEligible: async () => {} });

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPremium } = usePremium();
  const [loaded, setLoaded] = useState(false);
  const [lastShown, setLastShown] = useState<number>(0);
  const [gamesSinceLast, setGamesSinceLast] = useState(0);

  const load = async () => {
    try {
      const flags = await effectiveFlags();
      
      if (!flags.ADS_ENABLED || isPremium) {
        console.log('📱 AdMob: Publicités désactivées (SafeMode:', flags.SAFE_MODE, 'isPremium:', isPremium, ')');
        return;
      }

      // Vérifier que nous sommes sur iOS
      if (IS_IOS_ONLY && Platform.OS !== 'ios') {
        console.log('📱 AdMob: iOS uniquement - Plateforme actuelle:', Platform.OS);
        return;
      }
      
      // Initialisation lazy d'AdMob
      const initialized = await initializeAdMobLazy();
      
      if (initialized) {
        // Charger la publicité interstitielle de test
        console.log('📱 AdMob: Chargement publicité interstitielle (Test ID iOS:', ADMOB_TEST_IDS.INTERSTITIAL, ')');
        setLoaded(true);
        console.log('✅ AdMob: Publicité interstitielle test chargée (iOS)');
      } else {
        // Mode simulation
        console.log('📱 AdMob: Mode simulation - Test ID iOS:', ADMOB_TEST_IDS.INTERSTITIAL);
        setTimeout(() => {
          setLoaded(true);
          console.log('✅ AdMob: Publicité interstitielle simulée chargée');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ AdMob: Erreur d\'initialisation:', error);
      // En cas d'erreur, passer en mode simulation
      console.log('📱 AdMob: Passage en mode simulation suite à l\'erreur');
      setTimeout(() => {
        setLoaded(true);
        console.log('✅ AdMob: Publicité interstitielle simulée chargée (fallback)');
      }, 1000);
    }
  };

  useEffect(() => {
    load();
  }, [isPremium]);

  const showInterstitialIfEligible = async (context = 'game_end') => {
    if (!ADS_ENABLED || isPremium) {
      console.log('📱 AdMob: Interstitial non affiché (ADS_ENABLED:', ADS_ENABLED, 'isPremium:', isPremium, ')');
      return;
    }
    
    // Vérifier que nous sommes sur iOS
    if (IS_IOS_ONLY && Platform.OS !== 'ios') {
      console.log('📱 AdMob: iOS uniquement - Interstitial non affiché sur:', Platform.OS);
      return;
    }
    
    // Pour les utilisateurs gratuits, afficher une pub après chaque action
    const now = Date.now();
    
    // Cooldown réduit à 30 secondes pour plus de publicités
    if (now - lastShown < 30_000) {
      console.log('⏰ AdMob: Cooldown publicité actif (30s)');
      return;
    }
    
    if (loaded) {
      try {
        if (isAdMobAvailable && mobileAds) {
          // Afficher la vraie publicité interstitielle de test
          console.log(`✅ AdMob: Affichage publicité interstitielle test (${context}) - ID: ${ADMOB_TEST_IDS.INTERSTITIAL}`);
          setLastShown(now);
          setLoaded(false); // Recharger pour la prochaine fois
          trackAdShown(context, 'interstitial');
          
          // Recharger après 2 secondes
          setTimeout(() => {
            load();
          }, 2000);
        } else {
          // Mode simulation
          console.log(`📱 AdMob: Simulation affichage publicité (${context}) - ID: ${ADMOB_TEST_IDS.INTERSTITIAL}`);
          setLastShown(now);
          setLoaded(false);
          trackAdShown(context, 'interstitial');
          
          // Recharger après 2 secondes
          setTimeout(() => {
            load();
          }, 2000);
        }
      } catch (error) {
        console.error('❌ AdMob: Erreur affichage publicité:', error);
        // En cas d'erreur, simuler l'affichage
        console.log('📱 AdMob: Simulation d\'affichage suite à l\'erreur');
        setLastShown(now);
        setLoaded(false);
        trackAdShown(context, 'interstitial');
      }
    } else {
      console.log('📱 AdMob: Interstitial non chargé');
    }
  };

  return <Ctx.Provider value={{ showInterstitialIfEligible }}>{children}</Ctx.Provider>;
};

export const useAds = () => useContext(Ctx);