import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { trackPaywallShown, trackPurchaseSuccess } from './analytics';
import { PAYWALL_ENABLED } from './constants';

export interface PremiumProduct {
  productId: string;
  price: string;
  title: string;
  description: string;
  type: 'monthly' | 'annual';
}

interface PremiumContextType {
  isPremium: boolean;
  loading: boolean;
  packages: any[] | null;
  openPaywall: () => void;
  refreshCustomer: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// Configuration des produits Premium
const PREMIUM_PRODUCTS = {
  monthly: {
    productId: 'com.wheelcheckers.premium.monthly',
    price: '1.99€',
    title: 'Premium Mensuel',
    description: 'Accès Premium pendant 1 mois',
    type: 'monthly' as const
  },
  annual: {
    productId: 'com.wheelcheckers.premium.annual',
    price: '14.99€',
    title: 'Premium Annuel',
    description: 'Accès Premium pendant 1 an (économisez 25%)',
    type: 'annual' as const
  }
};

const PREMIUM_STORAGE_KEY = 'premium_status';

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [packages, setPackages] = useState<any[] | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Mode développement - simuler les packages
        console.log('📱 Mode développement - Packages Premium simulés');
        setPackages([
          {
            identifier: 'monthly',
            product: {
              title: 'Premium Mensuel',
              priceString: '1.99€'
            }
          },
          {
            identifier: 'annual',
            product: {
              title: 'Premium Annuel',
              priceString: '14.99€'
            }
          }
        ]);
        setIsPremium(false);
      } catch (e) {
        console.warn('Premium init fail', e);
        setIsPremium(false);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshCustomer = async () => {
    try {
      // Mode développement - simuler le refresh
      console.log('📱 Mode développement - Refresh Premium simulé');
    } catch (e) {
      console.warn('Premium refresh fail', e);
    }
  };

  const openPaywall = () => {
    if (!PAYWALL_ENABLED) return;
    trackPaywallShown('manual');
    setPaywallVisible(true);
  };

  const purchasePackage = async (pkg: any) => {
    try {
      // Mode développement - simuler l'achat
      console.log('📱 Mode développement - Achat simulé:', pkg.identifier);
      setIsPremium(true);
      trackPurchaseSuccess(pkg.identifier);
      setPaywallVisible(false);
      Alert.alert('Succès', 'Votre abonnement Premium est maintenant actif !');
    } catch (e: any) {
      console.warn('purchase error', e);
      Alert.alert('Erreur', 'L\'achat a échoué. Veuillez réessayer.');
    }
  };

  return (
    <PremiumContext.Provider value={{
      isPremium,
      loading,
      packages,
      openPaywall,
      refreshCustomer
    }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};
