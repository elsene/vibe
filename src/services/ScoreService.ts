import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameCenterService } from './GameCenterService';

// IDs des leaderboards Game Center
export const LEADERBOARD_IDS = {
  WEEKLY_WINS: 'wheel.weekly_wins',
  ELO_RATING: 'wheel.elo'
} as const;

// Clés de stockage local
const STORAGE_KEYS = {
  WEEKLY_WINS: 'weekly_wins_count',
  ELO_RATING: 'elo_rating',
  LAST_WEEK_RESET: 'last_week_reset'
} as const;

export interface PlayerStats {
  weeklyWins: number;
  eloRating: number;
  totalGames: number;
  winStreak: number;
}

export class ScoreService {
  private static instance: ScoreService;
  private currentStats: PlayerStats = {
    weeklyWins: 0,
    eloRating: 1200, // ELO initial
    totalGames: 0,
    winStreak: 0
  };

  static getInstance(): ScoreService {
    if (!ScoreService.instance) {
      ScoreService.instance = new ScoreService();
    }
    return ScoreService.instance;
  }

  private constructor() {
    this.loadStats();
  }

  // Charger les stats depuis le stockage local
  private async loadStats(): Promise<void> {
    try {
      const [weeklyWins, eloRating, totalGames, winStreak] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_WINS),
        AsyncStorage.getItem(STORAGE_KEYS.ELO_RATING),
        AsyncStorage.getItem('total_games'),
        AsyncStorage.getItem('win_streak')
      ]);

      this.currentStats = {
        weeklyWins: weeklyWins ? parseInt(weeklyWins) : 0,
        eloRating: eloRating ? parseInt(eloRating) : 1200,
        totalGames: totalGames ? parseInt(totalGames) : 0,
        winStreak: winStreak ? parseInt(winStreak) : 0
      };

      // Reset hebdomadaire si nécessaire
      await this.checkWeeklyReset();
      
      console.log('📊 ScoreService: Stats chargées', this.currentStats);
    } catch (error) {
      console.error('📊 ScoreService: Erreur chargement stats', error);
    }
  }

  // Vérifier et effectuer le reset hebdomadaire
  private async checkWeeklyReset(): Promise<void> {
    try {
      const lastReset = await AsyncStorage.getItem(STORAGE_KEYS.LAST_WEEK_RESET);
      const now = new Date();
      const lastResetDate = lastReset ? new Date(lastReset) : new Date(0);
      
      // Reset si plus d'une semaine s'est écoulée
      const daysDiff = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 7) {
        console.log('📊 ScoreService: Reset hebdomadaire des victoires');
        this.currentStats.weeklyWins = 0;
        await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_WINS, '0');
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_WEEK_RESET, now.toISOString());
      }
    } catch (error) {
      console.error('📊 ScoreService: Erreur reset hebdomadaire', error);
    }
  }

  // Enregistrer une victoire
  async recordWin(): Promise<void> {
    try {
      this.currentStats.weeklyWins++;
      this.currentStats.totalGames++;
      this.currentStats.winStreak++;
      
      // Sauvegarder localement
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_WINS, this.currentStats.weeklyWins.toString()),
        AsyncStorage.setItem('total_games', this.currentStats.totalGames.toString()),
        AsyncStorage.setItem('win_streak', this.currentStats.winStreak.toString())
      ]);

      // Soumettre aux leaderboards Game Center
      await this.submitToLeaderboards();
      
      console.log('📊 ScoreService: Victoire enregistrée', this.currentStats);
    } catch (error) {
      console.error('📊 ScoreService: Erreur enregistrement victoire', error);
    }
  }

  // Enregistrer une défaite
  async recordLoss(): Promise<void> {
    try {
      this.currentStats.totalGames++;
      this.currentStats.winStreak = 0; // Reset du streak
      
      // Sauvegarder localement
      await Promise.all([
        AsyncStorage.setItem('total_games', this.currentStats.totalGames.toString()),
        AsyncStorage.setItem('win_streak', '0')
      ]);

      console.log('📊 ScoreService: Défaite enregistrée', this.currentStats);
    } catch (error) {
      console.error('📊 ScoreService: Erreur enregistrement défaite', error);
    }
  }

  // Soumettre les scores aux leaderboards Game Center
  private async submitToLeaderboards(): Promise<void> {
    try {
      // Soumettre les victoires hebdomadaires
      await gameCenterService.submitScore(LEADERBOARD_IDS.WEEKLY_WINS, this.currentStats.weeklyWins);
      
      // Soumettre l'ELO rating
      await gameCenterService.submitScore(LEADERBOARD_IDS.ELO_RATING, this.currentStats.eloRating);
      
      console.log('📊 ScoreService: Scores soumis aux leaderboards');
    } catch (error) {
      console.error('📊 ScoreService: Erreur soumission leaderboards', error);
    }
  }

  // Mettre à jour l'ELO (calcul simplifié)
  async updateElo(opponentElo: number, won: boolean): Promise<void> {
    try {
      const K = 32; // Facteur K pour le calcul ELO
      const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - this.currentStats.eloRating) / 400));
      const actualScore = won ? 1 : 0;
      
      const eloChange = Math.round(K * (actualScore - expectedScore));
      this.currentStats.eloRating += eloChange;
      
      // Limiter l'ELO entre 400 et 2400
      this.currentStats.eloRating = Math.max(400, Math.min(2400, this.currentStats.eloRating));
      
      await AsyncStorage.setItem(STORAGE_KEYS.ELO_RATING, this.currentStats.eloRating.toString());
      
      console.log('📊 ScoreService: ELO mis à jour', {
        oldElo: this.currentStats.eloRating - eloChange,
        newElo: this.currentStats.eloRating,
        change: eloChange
      });
    } catch (error) {
      console.error('📊 ScoreService: Erreur mise à jour ELO', error);
    }
  }

  // Obtenir les stats actuelles
  getStats(): PlayerStats {
    return { ...this.currentStats };
  }

  // Obtenir le rang ELO
  getEloRank(): string {
    const elo = this.currentStats.eloRating;
    if (elo >= 2000) return 'Maître';
    if (elo >= 1800) return 'Expert';
    if (elo >= 1600) return 'Avancé';
    if (elo >= 1400) return 'Intermédiaire';
    if (elo >= 1200) return 'Débutant';
    return 'Novice';
  }
}

// Instance singleton
export const scoreService = ScoreService.getInstance();
