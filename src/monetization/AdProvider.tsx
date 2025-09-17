import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { trackAdShown } from '../analytics/events';
import { usePremium } from './PremiumProvider';
import { ADMOB_TEST_IDS, ADS_ENABLED, IS_IOS_ONLY } from './constants';

// AdMob complètement désactivé pour éviter les crashes
let mobileAds: any = null;

type CtxType = { showInterstitialIfEligible: (context?: string) => Promise<void> };
const Ctx = createContext<CtxType>({ showInterstitialIfEligible: async () => {} });

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPremium } = usePremium();
  const [loaded, setLoaded] = useState(false);
  const [lastShown, setLastShown] = useState<number>(0);
  const [gamesSinceLast, setGamesSinceLast] = useState(0);

  const load = async () => {
    if (!ADS_ENABLED || isPremium) {
      console.log('📱 AdMob: Publicités désactivées (ADS_ENABLED:', ADS_ENABLED, 'isPremium:', isPremium, ')');
      return;
    }

    // Vérifier que nous sommes sur iOS
    if (IS_IOS_ONLY && Platform.OS !== 'ios') {
      console.log('📱 AdMob: iOS uniquement - Plateforme actuelle:', Platform.OS);
      return;
    }
    
    try {
      if (mobileAds) {
        // Initialiser AdMob avec les IDs de test (build EAS uniquement)
        await mobileAds().initialize();
        console.log('✅ AdMob: SDK initialisé avec succès');
        
        // Charger la publicité interstitielle de test
        console.log('📱 AdMob: Chargement publicité interstitielle (Test ID iOS:', ADMOB_TEST_IDS.INTERSTITIAL, ')');
        setLoaded(true);
        console.log('✅ AdMob: Publicité interstitielle test chargée (iOS)');
      } else {
        // Mode simulation pour Expo Go
        console.log('📱 AdMob: Mode simulation (Expo Go) - Test ID iOS:', ADMOB_TEST_IDS.INTERSTITIAL);
        setTimeout(() => {
          setLoaded(true);
          console.log('✅ AdMob: Publicité interstitielle simulée chargée');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ AdMob: Erreur d\'initialisation:', error);
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
        // Afficher la vraie publicité interstitielle de test
        console.log(`✅ AdMob: Affichage publicité interstitielle test (${context}) - ID: ${ADMOB_TEST_IDS.INTERSTITIAL}`);
        setLastShown(now);
        setLoaded(false); // Recharger pour la prochaine fois
        trackAdShown(context, 'interstitial');
        
        // Recharger après 2 secondes
        setTimeout(() => {
          load();
        }, 2000);
      } catch (error) {
        console.error('❌ AdMob: Erreur affichage publicité:', error);
      }
    } else {
      console.log('📱 AdMob: Interstitial non chargé');
    }
  };

  return <Ctx.Provider value={{ showInterstitialIfEligible }}>{children}</Ctx.Provider>;
};

export const useAds = () => useContext(Ctx);