// Analytics spécifiques à Game Center
export const track = (name: string, props?: Record<string, any>) => {
  console.log('[GAMECENTER_ANALYTICS]', name, props ?? {});
};

// Authentification
export const trackAuthSuccess = (playerId: string, alias: string) => 
  track('gc_auth_success', { playerId, alias });

export const trackAuthFail = (error: string) => 
  track('gc_auth_fail', { error });

// Matchmaking
export const trackMatchFound = (matchId: string, isHost: boolean, players: string[]) => 
  track('gc_match_found', { matchId, isHost, players });

export const trackMatchError = (error: string) => 
  track('gc_match_error', { error });

export const trackMatchCancel = () => 
  track('gc_match_cancel');

// Messages réseau
export const trackMoveSent = (moveType: string, from: string, to: string) => 
  track('gc_move_sent', { moveType, from, to });

export const trackMoveReceived = (moveType: string, from: string, to: string) => 
  track('gc_move_received', { moveType, from, to });

export const trackSyncRequested = (reason: string) => 
  track('gc_sync_requested', { reason });

// Déconnexions & Timeouts
export const trackDisconnect = (reason: string) => 
  track('gc_disconnect', { reason });

export const trackTimeout = (timeoutType: 'ping' | 'match') => 
  track('gc_timeout', { timeoutType });

export const trackQuit = (reason: string) => 
  track('gc_quit', { reason });

// Leaderboards
export const trackLeaderboardSubmitOk = (leaderboardId: string, value: number) => 
  track('gc_leaderboard_submit_ok', { leaderboardId, value });

export const trackLeaderboardSubmitFail = (leaderboardId: string, error: string) => 
  track('gc_leaderboard_submit_fail', { leaderboardId, error });

// Achievements
export const trackAchievementOk = (achievementId: string, percent: number) => 
  track('gc_achievement_ok', { achievementId, percent });

export const trackAchievementFail = (achievementId: string, error: string) => 
  track('gc_achievement_fail', { achievementId, error });

// Parties
export const trackGameStart = (matchId: string, isHost: boolean) => 
  track('gc_game_start', { matchId, isHost });

export const trackGameEnd = (matchId: string, result: 'win' | 'lose' | 'disconnect', duration: number) => 
  track('gc_game_end', { matchId, result, duration });

export const trackGameAbandon = (matchId: string, reason: string) => 
  track('gc_game_abandon', { matchId, reason });

// Performance
export const trackLatency = (latency: number) => 
  track('gc_latency', { latency });

export const trackMessageQueue = (queueSize: number) => 
  track('gc_message_queue', { queueSize });

// Erreurs
export const trackError = (errorType: string, error: string, context?: string) => 
  track('gc_error', { errorType, error, context });
