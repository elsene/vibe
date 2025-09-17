import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import * as GameCenterAnalytics from '../analytics/gameCenterEvents';

// Vérifier si le module natif est disponible
const GameCenterModule = NativeModules.GameCenterModule;
const isNativeModuleAvailable = GameCenterModule && Platform.OS === 'ios';

// Types pour les événements Game Center
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

// Types pour les messages réseau
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

// États du service
export enum GameCenterServiceState {
  IDLE = 'idle',
  AUTHENTICATING = 'authenticating',
  FINDING_MATCH = 'finding_match',
  IN_MATCH = 'in_match',
  DISCONNECTED = 'disconnected'
}

class GameCenterService {
  private eventEmitter: NativeEventEmitter | null = null;
  private currentState: GameCenterServiceState = GameCenterServiceState.IDLE;
  private currentMatch: GameCenterMatchResult | null = null;
  private messageQueue: NetworkMessage[] = [];
  private pingInterval: any = null;
  private lastPongTime: number = 0;
  private timeoutInterval: any = null;

  // Callbacks
  private onStateChange?: (state: GameCenterServiceState) => void;
  private onDataReceived?: (data: GameCenterData) => void;
  private onError?: (error: GameCenterError) => void;
  private onMatchEnded?: () => void;

  constructor() {
    if (isNativeModuleAvailable) {
      this.eventEmitter = new NativeEventEmitter(GameCenterModule);
      this.setupEventListeners();
      console.log('🎮 GameCenterService: Initialisé avec module natif');
    } else {
      console.log('🎮 GameCenterService: Initialisé en mode mock (module natif non disponible)');
    }
  }

  private setupEventListeners() {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener('state', (data: GameCenterServiceState) => {
      console.log('🎮 GameCenterService: État reçu', data);
      this.handleStateChange(data);
    });

    this.eventEmitter.addListener('data', (data: GameCenterData) => {
      console.log('🎮 GameCenterService: Données reçues', data);
      this.handleDataReceived(data);
    });

    this.eventEmitter.addListener('error', (error: GameCenterError) => {
      console.log('🎮 GameCenterService: Erreur reçue', error);
      this.handleError(error);
    });

    this.eventEmitter.addListener('ended', () => {
      console.log('🎮 GameCenterService: Match terminé');
      this.handleMatchEnded();
    });
  }

  // MARK: - Authentification

  async authenticate(): Promise<GameCenterAuthResult> {
    if (!isNativeModuleAvailable) {
      console.log('🎮 GameCenterService: Module natif non disponible - mode mock activé');
      return { authenticated: false };
    }

    console.log('🎮 GameCenterService: Authentification...');
    this.currentState = GameCenterServiceState.AUTHENTICATING;

    try {
      const result = await GameCenterModule.authenticate();
      console.log('🎮 GameCenterService: Authentification réussie', result);
      this.currentState = GameCenterServiceState.IDLE;
      
      if (result.authenticated && result.playerId && result.alias) {
        GameCenterAnalytics.trackAuthSuccess(result.playerId, result.alias);
      }
      
      return result;
    } catch (error) {
      console.error('🎮 GameCenterService: Erreur authentification', error);
      this.currentState = GameCenterServiceState.IDLE;
      GameCenterAnalytics.trackAuthFail(error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    }
  }

  // MARK: - Access Point & Dashboard

  showAccessPoint(visible: boolean) {
    if (!isNativeModuleAvailable) {
      console.log('🎮 GameCenterService: Module natif non disponible - Access Point non modifié');
      return;
    }
    console.log('🎮 GameCenterService: Access Point visible =', visible);
    NativeModules.GameCenterModule.showAccessPoint(visible);
  }

  showDashboard() {
    if (!isNativeModuleAvailable) {
      console.log('🎮 GameCenterService: Module natif non disponible - dashboard non affiché');
      return;
    }
    console.log('🎮 GameCenterService: Affichage dashboard');
    NativeModules.GameCenterModule.showDashboard();
  }

  // MARK: - Leaderboards & Achievements

  async submitScore(leaderboardId: string, value: number): Promise<void> {
    if (!isNativeModuleAvailable) {
      console.log('🎮 GameCenterService: Module natif non disponible - score non soumis');
      return;
    }
    console.log('🎮 GameCenterService: Soumission score', leaderboardId, value);
    
    try {
      await NativeModules.GameCenterModule.submitScore(leaderboardId, value);
      console.log('🎮 GameCenterService: Score soumis avec succès');
      GameCenterAnalytics.trackLeaderboardSubmitOk(leaderboardId, value);
    } catch (error) {
      console.error('🎮 GameCenterService: Erreur soumission score', error);
      GameCenterAnalytics.trackLeaderboardSubmitFail(leaderboardId, error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    }
  }

  async reportAchievement(achievementId: string, percent: number): Promise<void> {
    if (!isNativeModuleAvailable) {
      console.log('🎮 GameCenterService: Module natif non disponible - achievement non rapporté');
      return;
    }
    console.log('🎮 GameCenterService: Rapport achievement', achievementId, percent);
    
    try {
      await NativeModules.GameCenterModule.reportAchievement(achievementId, percent);
      console.log('🎮 GameCenterService: Achievement rapporté avec succès');
      GameCenterAnalytics.trackAchievementOk(achievementId, percent);
    } catch (error) {
      console.error('🎮 GameCenterService: Erreur rapport achievement', error);
      GameCenterAnalytics.trackAchievementFail(achievementId, error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    }
  }

  // MARK: - Matchmaking

  async findMatch(options: { minPlayers?: number; maxPlayers?: number; inviteMessage?: string }): Promise<GameCenterMatchResult> {
    if (!isNativeModuleAvailable) {
      throw new Error('Game Center non disponible - module natif non trouvé');
    }

    console.log('🎮 GameCenterService: Recherche de match', options);
    this.currentState = GameCenterServiceState.FINDING_MATCH;

    try {
      const result = await NativeModules.GameCenterModule.findMatch({
        minPlayers: options.minPlayers || 2,
        maxPlayers: options.maxPlayers || 2,
        inviteMessage: options.inviteMessage || 'Voulez-vous jouer à WheelCheckers ?'
      });

      console.log('🎮 GameCenterService: Match trouvé', result);
      this.currentMatch = result;
      this.currentState = GameCenterServiceState.IN_MATCH;
      this.startPingPong();
      this.processMessageQueue();

      GameCenterAnalytics.trackMatchFound(result.matchId, result.isHost, []);
      return result;
    } catch (error) {
      console.error('🎮 GameCenterService: Erreur matchmaking', error);
      this.currentState = GameCenterServiceState.IDLE;
      GameCenterAnalytics.trackMatchError(error instanceof Error ? error.message : 'Erreur inconnue');
      throw error;
    }
  }

  disconnect() {
    if (!isNativeModuleAvailable) {
      console.log('🎮 GameCenterService: Module natif non disponible - déconnexion simulée');
      this.currentMatch = null;
      this.currentState = GameCenterServiceState.IDLE;
      this.messageQueue = [];
      return;
    }
    console.log('🎮 GameCenterService: Déconnexion');
    
    this.stopPingPong();
    this.stopTimeout();
    this.currentMatch = null;
    this.currentState = GameCenterServiceState.IDLE;
    this.messageQueue = [];
    
    GameCenterAnalytics.trackDisconnect('manual');
    NativeModules.GameCenterModule.disconnect();
  }

  // MARK: - Envoi de données

  async send(data: NetworkMessage, reliable: boolean = true): Promise<void> {
    if (!isNativeModuleAvailable) {
      console.log('🎮 GameCenterService: Module natif non disponible - message non envoyé');
      return;
    }

    // Si pas encore connecté, mettre en file d'attente
    if (this.currentState !== GameCenterServiceState.IN_MATCH) {
      console.log('🎮 GameCenterService: Message mis en file d\'attente');
      this.messageQueue.push(data);
      return;
    }

    try {
      const payload = JSON.stringify(data);
      await NativeModules.GameCenterModule.send(payload, reliable);
      console.log('🎮 GameCenterService: Message envoyé', data.type);
      
      if (data.type === 'MOVE') {
        GameCenterAnalytics.trackMoveSent(data.move.kind, data.move.from, data.move.to);
      }
    } catch (error) {
      console.error('🎮 GameCenterService: Erreur envoi message', error);
      GameCenterAnalytics.trackError('send', error instanceof Error ? error.message : 'Erreur inconnue', data.type);
      throw error;
    }
  }

  // MARK: - Ping/Pong & Timeout

  private startPingPong() {
    this.stopPingPong();
    this.lastPongTime = Date.now();

    this.pingInterval = setInterval(() => {
      this.send({ type: 'PING' }, false);
      this.startTimeout();
    }, 5000); // Ping toutes les 5 secondes
  }

  private stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.stopTimeout();
  }

  private startTimeout() {
    this.stopTimeout();
    this.timeoutInterval = setTimeout(() => {
      console.log('🎮 GameCenterService: Timeout - pas de PONG reçu');
      GameCenterAnalytics.trackTimeout('ping');
      this.handleError({ code: 'TIMEOUT', msg: 'Pas de réponse de l\'adversaire' });
    }, 10000); // Timeout après 10 secondes
  }

  private stopTimeout() {
    if (this.timeoutInterval) {
      clearTimeout(this.timeoutInterval);
      this.timeoutInterval = null;
    }
  }

  // MARK: - Gestion des événements

  private handleStateChange(data: GameCenterServiceState) {
    // Mettre à jour l'état interne
    this.currentState = data;
    
    // Si on est connecté, mettre à jour le ping
    if (data === GameCenterServiceState.IN_MATCH) {
      this.lastPongTime = Date.now();
      this.stopTimeout();
    }
    
    this.onStateChange?.(data);
  }

  private handleDataReceived(data: GameCenterData) {
    try {
      const message: NetworkMessage = JSON.parse(data.payload);
      
      if (message.type === 'PONG') {
        this.lastPongTime = Date.now();
        this.stopTimeout();
        return;
      }
      
      if (message.type === 'MOVE') {
        GameCenterAnalytics.trackMoveReceived(message.move.kind, message.move.from, message.move.to);
      }
      
      this.onDataReceived?.(data);
    } catch (error) {
      console.error('🎮 GameCenterService: Erreur parsing message', error);
      GameCenterAnalytics.trackError('parse', error instanceof Error ? error.message : 'Erreur inconnue', 'message');
    }
  }

  private handleError(error: GameCenterError) {
    GameCenterAnalytics.trackError('gamecenter', error.msg, error.code);
    this.onError?.(error);
  }

  private handleMatchEnded() {
    this.stopPingPong();
    this.currentMatch = null;
    this.currentState = GameCenterServiceState.IDLE;
    this.messageQueue = [];
    this.onMatchEnded?.();
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.currentState === GameCenterServiceState.IN_MATCH) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  // MARK: - Getters & Setters

  getCurrentState(): GameCenterServiceState {
    return this.currentState;
  }

  getCurrentMatch(): GameCenterMatchResult | null {
    return this.currentMatch;
  }

  isConnected(): boolean {
    return this.currentState === GameCenterServiceState.IN_MATCH;
  }

  // Callbacks
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

  // MARK: - Cleanup

  destroy() {
    this.disconnect();
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners('state');
      this.eventEmitter.removeAllListeners('data');
      this.eventEmitter.removeAllListeners('error');
      this.eventEmitter.removeAllListeners('ended');
    }
  }
}

// Instance singleton
export const gameCenterService = new GameCenterService();
export default gameCenterService;
