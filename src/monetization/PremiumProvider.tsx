import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { trackPaywallShown } from '../analytics/events';
import { ENTITLEMENT_ID, IS_IOS_ONLY, PAYWALL_ENABLED } from './constants';

type PremiumCtx = {
  isPremium: boolean;
  loading: boolean;
  packages: PurchasesPackage[] | null;
  openPaywall: () => void;
  refreshCustomer: () => Promise<void>;
};

const Ctx = createContext<PremiumCtx>({
  isPremium: false,
  loading: true,
  packages: null,
  openPaywall: () => {},
  refreshCustomer: async () => {}
});

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Vérifier que nous sommes sur iOS
        if (IS_IOS_ONLY && Platform.OS !== 'ios') {
          console.log('📱 RevenueCat: iOS uniquement - Plateforme actuelle:', Platform.OS);
          setLoading(false);
          return;
        }

        // Vérifier si nous sommes en mode développement (Expo Go)
        const isExpoGo = __DEV__ && Platform.OS === 'web';
        if (isExpoGo) {
          console.log('📱 RevenueCat: Mode Expo Go détecté - Utilisation du mode développement');
          setPackages([
            {
              identifier: 'monthly',
              packageType: 'MONTHLY',
              product: {
                identifier: 'monthly',
                description: 'Abonnement mensuel Premium',
                title: 'Premium Mensuel',
                price: 1.99,
                priceString: '1,99 €',
                currencyCode: 'EUR'
              }
            } as any,
            {
              identifier: 'annual',
              packageType: 'ANNUAL',
              product: {
                identifier: 'annual',
                description: 'Abonnement annuel Premium',
                title: 'Premium Annuel',
                price: 14.99,
                priceString: '14,99 €',
                currencyCode: 'EUR'
              }
            } as any
          ]);
          setLoading(false);
          return;
        }

        // Initialiser RevenueCat avec la clé iOS
        const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
        console.log('📱 RevenueCat: Initialisation iOS (Sandbox) - Clé détectée:', !!iosApiKey);
        
        if (!iosApiKey || iosApiKey === 'your_revenuecat_ios_key_here') {
          console.log('📱 RevenueCat: Clé API manquante - Mode développement');
          setPackages([
            {
              identifier: 'monthly',
              packageType: 'MONTHLY',
              product: {
                identifier: 'monthly',
                description: 'Abonnement mensuel Premium',
                title: 'Premium Mensuel',
                price: 1.99,
                priceString: '1,99 €',
                currencyCode: 'EUR'
              }
            } as any,
            {
              identifier: 'annual',
              packageType: 'ANNUAL',
              product: {
                identifier: 'annual',
                description: 'Abonnement annuel Premium',
                title: 'Premium Annuel',
                price: 14.99,
                priceString: '14,99 €',
                currencyCode: 'EUR'
              }
            } as any
          ]);
          setLoading(false);
          return;
        }
        
        await Purchases.configure({
          apiKey: iosApiKey
        });

        console.log('📱 RevenueCat: Configuration réussie - Récupération des offerings...');
        const offerings = await Purchases.getOfferings();
        const current = offerings.current;
        setPackages(current?.availablePackages ?? null);
        
        console.log('📱 RevenueCat: Packages disponibles:', current?.availablePackages?.length || 0);
        
        const info: CustomerInfo = await Purchases.getCustomerInfo();
        const premiumStatus = Boolean(info.entitlements.active[ENTITLEMENT_ID]);
        setIsPremium(premiumStatus);
        
        console.log('📱 RevenueCat: État Premium:', premiumStatus ? 'PREMIUM' : 'FREE');
        console.log('📱 RevenueCat: Entitlements actifs:', Object.keys(info.entitlements.active));
        
      } catch (e) {
        console.warn('📱 RevenueCat: Erreur d\'initialisation', e);
        // Mode développement - simuler des packages
        console.log('📱 RevenueCat: Mode développement - Packages simulés');
        setPackages([
          {
            identifier: 'monthly',
            packageType: 'MONTHLY',
            product: {
              identifier: 'monthly',
              description: 'Abonnement mensuel Premium',
              title: 'Premium Mensuel',
              price: 1.99,
              priceString: '1,99 €',
              currencyCode: 'EUR'
            }
          } as any,
          {
            identifier: 'annual',
            packageType: 'ANNUAL',
            product: {
              identifier: 'annual',
              description: 'Abonnement annuel Premium',
              title: 'Premium Annuel',
              price: 14.99,
              priceString: '14,99 €',
              currencyCode: 'EUR'
            }
          } as any
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshCustomer = async () => {
    try {
      // Vérifier si nous sommes en mode développement
      const isExpoGo = __DEV__ && Platform.OS === 'web';
      if (isExpoGo) {
        console.log('📱 RevenueCat: Mode Expo Go - Refresh simulé');
        return;
      }

      console.log('📱 RevenueCat: Refresh customer info...');
      const info = await Purchases.getCustomerInfo();
      const premiumStatus = Boolean(info.entitlements.active[ENTITLEMENT_ID]);
      setIsPremium(premiumStatus);
      console.log('📱 RevenueCat: État Premium mis à jour:', premiumStatus ? 'PREMIUM' : 'FREE');
    } catch (e) {
      console.warn('📱 RevenueCat: Erreur refresh customer', e);
    }
  };

  const openPaywall = () => {
    if (!PAYWALL_ENABLED) {
      console.log('📱 RevenueCat: Paywall désactivé (PAYWALL_ENABLED: false)');
      return;
    }
    console.log('📱 RevenueCat: Ouverture du paywall');
    trackPaywallShown('manual');
    setPaywallVisible(true);
  };

  const value = useMemo(() => ({
    isPremium,
    loading,
    packages,
    openPaywall,
    refreshCustomer
  }), [isPremium, loading, packages]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {/* PaywallModal sera géré par les écrans individuels */}
    </Ctx.Provider>
  );
};

export const usePremium = () => useContext(Ctx);
