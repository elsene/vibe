import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { usePremium } from './PremiumManager';
import { trackAdShown } from './analytics';
import { ADS_ENABLED } from './constants';

type AdContextType = {
  showInterstitialIfEligible: (context?: string) => Promise<void>;
};

const AdContext = createContext<AdContextType>({
  showInterstitialIfEligible: async () => {}
});

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
    
    // Limiter: 1 pub toutes les 2 parties, cooldown 120s
    const now = Date.now();
    if (gamesSinceLast < 1 || now - lastShown < 120_000) {
      setGamesSinceLast(v => v + 1);
      return;
    }
    
    if (loaded) {
      // Mode développement - simuler l'affichage
      console.log('✅ Publicité interstitielle simulée affichée');
      setLastShown(now);
      setGamesSinceLast(0);
      setLoaded(false); // Recharger pour la prochaine fois
      trackAdShown(context, 'interstitial');
      
      // Recharger après 2 secondes
      setTimeout(() => {
        load();
      }, 2000);
    }
  };

  return (
    <AdContext.Provider value={{ showInterstitialIfEligible }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => useContext(AdContext);