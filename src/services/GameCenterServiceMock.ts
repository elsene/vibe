
// Version mock pour le développement
export interface GameCenterAuthResult {
  authenticated: boolean;
  playerId?: string;
  alias?: string;
}

export interface GameCenterMatchResult {
  matchId: string;
  isHost: boolean;
}

export interface GameCenterState {
  connected: boolean;
  players: string[];
}

export interface GameCenterData {
  from: string;
  payload: any;
}

export interface GameCenterError {
  code: string;
  msg: string;
}

export interface NetworkMove {
  type: 'MOVE';
  move: {
    kind: 'step' | 'jump';
    from: string;
    to: string;
    over?: string;
    meta?: any;
  };
}

export interface NetworkSync {
  type: 'SYNC';
  state: any;
}

export interface NetworkPing {
  type: 'PING' | 'PONG';
}

export type NetworkMessage = NetworkMove | NetworkSync | NetworkPing;

export enum GameCenterServiceState {
  IDLE = 'idle',
  AUTHENTICATING = 'authenticating',
  FINDING_MATCH = 'finding_match',
  IN_MATCH = 'in_match',
  DISCONNECTED = 'disconnected'
}

class GameCenterServiceMock {
  private currentState: GameCenterServiceState = GameCenterServiceState.IDLE;
  private currentMatch: GameCenterMatchResult | null = null;

  // Callbacks
  private onStateChange?: (state: GameCenterServiceState) => void;
  private onDataReceived?: (data: GameCenterData) => void;
  private onError?: (error: GameCenterError) => void;
  private onMatchEnded?: () => void;

  constructor() {
    console.log('🎮 GameCenterServiceMock: Initialisé (Mode Mock)');
  }

  async authenticate(): Promise<GameCenterAuthResult> {
    console.log('🎮 GameCenterServiceMock: Authentification simulée');
    return { authenticated: false };
  }

  showAccessPoint(visible: boolean) {
    console.log('🎮 GameCenterServiceMock: Access Point visible =', visible);
  }

  showDashboard() {
    console.log('🎮 GameCenterServiceMock: Dashboard simulé');
  }

  async submitScore(leaderboardId: string, value: number): Promise<void> {
    console.log('🎮 GameCenterServiceMock: Score simulé', leaderboardId, value);
  }

  async reportAchievement(achievementId: string, percent: number): Promise<void> {
    console.log('🎮 GameCenterServiceMock: Achievement simulé', achievementId, percent);
  }

  async findMatch(options: any): Promise<GameCenterMatchResult> {
    console.log('🎮 GameCenterServiceMock: Matchmaking simulé');
    throw new Error('Game Center non disponible en mode mock');
  }

  disconnect() {
    console.log('🎮 GameCenterServiceMock: Déconnexion simulée');
  }

  async send(data: NetworkMessage, reliable: boolean = true): Promise<void> {
    console.log('🎮 GameCenterServiceMock: Envoi simulé', data.type);
  }

  getCurrentState(): GameCenterServiceState {
    return this.currentState;
  }

  getCurrentMatch(): GameCenterMatchResult | null {
    return this.currentMatch;
  }

  isConnected(): boolean {
    return false;
  }

  setOnStateChange(callback: (state: GameCenterServiceState) => void) {
    this.onStateChange = callback;
  }

  setOnDataReceived(callback: (data: GameCenterData) => void) {
    this.onDataReceived = callback;
  }

  setOnError(callback: (error: GameCenterError) => void) {
    this.onError = callback;
  }

  setOnMatchEnded(callback: () => void) {
    this.onMatchEnded = callback;
  }

  destroy() {
    console.log('🎮 GameCenterServiceMock: Destruction simulée');
  }
}

export const gameCenterService = new GameCenterServiceMock();
export default gameCenterService;
