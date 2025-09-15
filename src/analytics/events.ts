export const track = (name: string, props?: Record<string, any>) => {
  console.log('[ANALYTICS]', name, props ?? {});
};

// Fonctions de tracking spécifiques
export const trackPaywallShown = (context: string) => track('paywall_shown', { context });
export const trackPurchaseSuccess = (productId: string) => track('purchase_success', { productId });
export const trackAdShown = (context: string, adType: 'interstitial' | 'rewarded') => track('ad_shown', { context, adType });
export const trackOnlineBlocked = (count: number) => track('online_blocked', { count });
export const trackGameEnd = (isPremium: boolean) => track('game_end', { isPremium });
