import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import Purchases from 'react-native-purchases';
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
        // Configuration RevenueCat pour EAS Build
        const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
        
        if (apiKey) {
          console.log('📱 RevenueCat: Configuration EAS Build');
          await Purchases.configure({
            apiKey: apiKey,
            appUserID: undefined, // Anonymous user
          });
          
          // Charger les packages
          const offerings = await Purchases.getOfferings();
          if (offerings.current) {
            setPackages(offerings.current.availablePackages);
            console.log('📱 RevenueCat: Packages chargés', offerings.current.availablePackages.length);
          }
          
          // Vérifier le statut Premium
          const customerInfo = await Purchases.getCustomerInfo();
          setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
          console.log('📱 RevenueCat: Statut Premium', customerInfo.entitlements.active['premium'] !== undefined);
        } else {
          // Mode développement - simuler les packages
          console.log('📱 RevenueCat: Mode développement - Packages simulés');
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
        }
      } catch (e) {
        console.warn('📱 RevenueCat: Erreur d\'initialisation', e);
        setIsPremium(false);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshCustomer = async () => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      
      if (apiKey) {
        console.log('📱 RevenueCat: Refresh customer info');
        const customerInfo = await Purchases.getCustomerInfo();
        setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
        console.log('📱 RevenueCat: Statut Premium mis à jour', customerInfo.entitlements.active['premium'] !== undefined);
      } else {
        console.log('📱 RevenueCat: Mode développement - Refresh simulé');
      }
    } catch (e) {
      console.warn('📱 RevenueCat: Erreur de refresh', e);
    }
  };

  const openPaywall = () => {
    if (!PAYWALL_ENABLED) return;
    trackPaywallShown('manual');
    setPaywallVisible(true);
  };

  const purchasePackage = async (pkg: any) => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      
      if (apiKey) {
        console.log('📱 RevenueCat: Tentative d\'achat - Package:', pkg.identifier);
        console.log('📱 RevenueCat: Achat en cours - Produit:', pkg.product.title);
        
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
        trackPurchaseSuccess(pkg.identifier);
        setPaywallVisible(false);
        Alert.alert('Succès', 'Votre abonnement Premium est maintenant actif !');
      } else {
        // Mode développement - simuler l'achat
        console.log('📱 RevenueCat: Mode développement - Achat simulé:', pkg.identifier);
        setIsPremium(true);
        trackPurchaseSuccess(pkg.identifier);
        setPaywallVisible(false);
        Alert.alert('Succès', 'Votre abonnement Premium est maintenant actif !');
      }
    } catch (e: any) {
      console.warn('📱 RevenueCat: Erreur d\'achat', e);
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
