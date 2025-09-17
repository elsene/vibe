import { usePremium } from '../state/PremiumContext';

export function useOnlineLimits() {
  const { premium } = usePremium();
  return {
    canPlayOnlineUnlimited: premium,
    weeklyOnlineLimit: premium ? Infinity : 5
  };
}
