import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { rcInit, rcOnCustomerInfoChange, rcIsPremium } from '../services/revenuecat';

type Ctx = {
  premium: boolean;
  setPremium: (v: boolean) => void;
};
const PremiumContext = createContext<Ctx>({ premium: false, setPremium: () => {} });

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    (async () => {
      await rcInit();
      setPremium(await rcIsPremium());
    })();
    const sub = rcOnCustomerInfoChange(async () => {
      setPremium(await rcIsPremium());
    });
    return () => { sub?.remove?.(); };
  }, []);

  const value = useMemo(() => ({ premium, setPremium }), [premium]);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  return useContext(PremiumContext);
}
