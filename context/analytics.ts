// Analytics stub - pourra pointer vers Amplitude plus tard
export const track = (name: string, props?: Record<string, any>) => {
  console.log('[ANALYTICS]', name, props ?? {});
};

// Événements spécifiques
export const trackPaywallShown = (context?: string) => {
  track('paywall_shown', { context });
};

export const trackPurchaseSuccess = (productId: string) => {
  track('purchase_success', { productId });
};

export const trackAdShown = (context: string, adType: string) => {
  track('ad_shown', { context, adType });
};

export const trackOnlineBlocked = (count: number) => {
  track('online_blocked', { count });
};

export const trackGameEnd = (isPremium: boolean) => {
  track('game_end', { isPremium });
};

export const trackOnlineGameStarted = (isPremium: boolean, count: number) => {
  track('online_game_started', { isPremium, count });
};
