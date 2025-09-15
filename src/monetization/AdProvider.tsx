import React, { createContext, useContext, useEffect, useState } from 'react';
import { trackAdShown } from '../analytics/events';
import { usePremium } from './PremiumProvider';
import { ADS_ENABLED } from './constants';

type CtxType = { showInterstitialIfEligible: (context?: string) => Promise<void> };
const Ctx = createContext<CtxType>({ showInterstitialIfEligible: async () => {} });

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPremium } = usePremium();
  const [loaded, setLoaded] = useState(false);
  const [lastShown, setLastShown] = useState<number>(0);
  const [gamesSinceLast, setGamesSinceLast] = useState(0);

  const load = () => {
    if (!ADS_ENABLED || isPremium) return;
    
    // Mode développement - simuler le chargement
    setTimeout(() => {
      setLoaded(true);
      console.log('✅ Publicité interstitielle simulée chargée');
    }, 1000);
  };

  useEffect(() => {
    load();
  }, [isPremium]);

  const showInterstitialIfEligible = async (context = 'game_end') => {
    if (!ADS_ENABLED || isPremium) return;
    
    // Pour les utilisateurs gratuits, afficher une pub après chaque action
    const now = Date.now();
    
    // Cooldown réduit à 30 secondes pour plus de publicités
    if (now - lastShown < 30_000) {
      console.log('⏰ Cooldown publicité actif');
      return;
    }
    
    if (loaded) {
      // Mode développement - simuler l'affichage
      console.log(`✅ Publicité interstitielle simulée affichée (${context})`);
      setLastShown(now);
      setLoaded(false); // Recharger pour la prochaine fois
      trackAdShown(context, 'interstitial');
      
      // Recharger après 2 secondes
      setTimeout(() => {
        load();
      }, 2000);
    }
  };

  return <Ctx.Provider value={{ showInterstitialIfEligible }}>{children}</Ctx.Provider>;
};

export const useAds = () => useContext(Ctx);