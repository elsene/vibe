import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { usePremium } from './PremiumManager';

interface AdManagerContextType {
  showBanner: boolean;
  showInterstitial: () => Promise<void>;
  showRewardedAd: () => Promise<boolean>;
  loadInterstitial: () => Promise<void>;
}

const AdManagerContext = createContext<AdManagerContextType | undefined>(undefined);

// Configuration des unités publicitaires (mode développement)
const AD_UNITS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111', // Test Android
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712', // Test Android
  REWARDED: 'ca-app-pub-3940256099942544/5224354917' // Test Android
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
      console.log('✅ AdManager initialisé (mode développement)');
    } catch (error) {
      console.log('❌ Erreur lors de l\'initialisation AdManager:', error);
    }
  };

  const loadInterstitial = async () => {
    try {
      console.log('✅ Publicité interstitielle simulée chargée');
      setInterstitialLoaded(true);
    } catch (error) {
      console.log('❌ Erreur lors du chargement de la publicité interstitielle:', error);
      setInterstitialLoaded(false);
    }
  };

  const showInterstitial = async () => {
    try {
      // Ne pas afficher de publicités si l'utilisateur est Premium
      if (isPremium) {
        console.log('✅ Utilisateur Premium - pas de publicité');
        return;
      }

      console.log('✅ Publicité interstitielle simulée affichée');
      setInterstitialLoaded(false);
      
      // Recharger une nouvelle publicité pour la prochaine fois
      setTimeout(() => {
        loadInterstitial();
      }, 1000);
    } catch (error) {
      console.log('❌ Erreur lors de l\'affichage de la publicité interstitielle:', error);
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
