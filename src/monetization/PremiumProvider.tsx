import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { trackPaywallShown } from '../analytics/events';
import { ENTITLEMENT_ID, PAYWALL_ENABLED } from './constants';

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
        // Initialiser RevenueCat
        await Purchases.configure({
          apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'your_revenuecat_api_key_here'
        });

        const offerings = await Purchases.getOfferings();
        const current = offerings.current;
        setPackages(current?.availablePackages ?? null);
        const info: CustomerInfo = await Purchases.getCustomerInfo();
        setIsPremium(Boolean(info.entitlements.active[ENTITLEMENT_ID]));
      } catch (e) {
        console.warn('RC init fail', e);
        // Mode développement - simuler des packages
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
      const info = await Purchases.getCustomerInfo();
      setIsPremium(Boolean(info.entitlements.active[ENTITLEMENT_ID]));
    } catch (e) {
      console.warn('RC refresh fail', e);
    }
  };

  const openPaywall = () => {
    if (!PAYWALL_ENABLED) return;
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
