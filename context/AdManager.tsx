import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { usePremium } from './PremiumManager';

interface AdManagerContextType {
  showBanner: boolean;
  showInterstitial: () => Promise<void>;
  showRewardedAd: () => Promise<boolean>;
  loadInterstitial: () => Promise<void>;
}

const AdManagerContext = createContext<AdManagerContextType | undefined>(undefined);

// Configuration des unités publicitaires
const AD_UNITS = {
  BANNER: Platform.OS === 'ios' 
    ? 'ca-app-pub-3940256099942544/2934735716' // Test iOS
    : 'ca-app-pub-3940256099942544/6300978111', // Test Android
  INTERSTITIAL: Platform.OS === 'ios'
    ? 'ca-app-pub-3940256099942544/4411468910' // Test iOS
    : 'ca-app-pub-3940256099942544/1033173712', // Test Android
  REWARDED: Platform.OS === 'ios'
    ? 'ca-app-pub-3940256099942544/1712485313' // Test iOS
    : 'ca-app-pub-3940256099942544/5224354917' // Test Android
};

export const AdManagerProvider = ({ children }: { children: ReactNode }) => {
  const { isPremium } = usePremium();
  const [showBanner, setShowBanner] = useState(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  // Configuration initiale
  useEffect(() => {
    initializeAds();
  }, []);

  // Gestion de l'affichage des bannières selon le statut Premium
  useEffect(() => {
    setShowBanner(!isPremium);
  }, [isPremium]);

  const initializeAds = async () => {
    try {
      // Configuration AdMob pour EAS Build
      await mobileAds().initialize();
      console.log('📱 AdMob: Initialisé pour EAS Build');
      
      // Charger la première publicité interstitielle
      await loadInterstitial();
    } catch (error) {
      console.log('📱 AdMob: Erreur d\'initialisation', error);
    }
  };

  const loadInterstitial = async () => {
    try {
      const { InterstitialAd, AdEventType, TestIds } = await import('react-native-google-mobile-ads');
      
      const interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
      });

      interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('📱 AdMob: Publicité interstitielle chargée');
        setInterstitialLoaded(true);
      });

      interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('📱 AdMob: Erreur publicité interstitielle', error);
        setInterstitialLoaded(false);
      });

      interstitialAd.load();
    } catch (error) {
      console.log('📱 AdMob: Erreur lors du chargement de la publicité interstitielle:', error);
      setInterstitialLoaded(false);
    }
  };

  const showInterstitial = async () => {
    try {
      // Ne pas afficher de publicités si l'utilisateur est Premium
      if (isPremium) {
        console.log('📱 AdMob: Utilisateur Premium - pas de publicité');
        return;
      }

      if (!interstitialLoaded) {
        console.log('📱 AdMob: Publicité interstitielle pas encore chargée');
        return;
      }

      const { InterstitialAd, AdEventType } = await import('react-native-google-mobile-ads');
      
      const interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL);
      
      interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
        console.log('📱 AdMob: Publicité interstitielle ouverte');
      });

      interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('📱 AdMob: Publicité interstitielle fermée');
        setInterstitialLoaded(false);
        
        // Recharger une nouvelle publicité pour la prochaine fois
        setTimeout(() => {
          loadInterstitial();
        }, 1000);
      });

      await interstitialAd.show();
    } catch (error) {
      console.log('📱 AdMob: Erreur lors de l\'affichage de la publicité interstitielle:', error);
      setInterstitialLoaded(false);
    }
  };

  const showRewardedAd = async (): Promise<boolean> => {
    try {
      // Ne pas afficher de publicités si l'utilisateur est Premium
      if (isPremium) {
        console.log('✅ Utilisateur Premium - pas de publicité récompensée');
        return true; // Retourner true car l'utilisateur Premium a déjà accès
      }

      console.log('✅ Publicité récompensée simulée affichée');
      return true; // Simuler un succès
    } catch (error) {
      console.log('❌ Erreur lors de l\'affichage de la publicité récompensée:', error);
      return false;
    }
  };

  return (
    <AdManagerContext.Provider value={{
      showBanner,
      showInterstitial,
      showRewardedAd,
      loadInterstitial
    }}>
      {children}
    </AdManagerContext.Provider>
  );
};

export const useAdManager = () => {
  const context = useContext(AdManagerContext);
  if (context === undefined) {
    throw new Error('useAdManager must be used within an AdManagerProvider');
  }
  return context;
};
