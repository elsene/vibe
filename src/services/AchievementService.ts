import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameCenterService } from './GameCenterService';
import { scoreService } from './ScoreService';

// IDs des achievements Game Center
export const ACHIEVEMENT_IDS = {
  FIRST_WIN: 'first_win',
  COMBO_3: 'combo_3',
  FLAWLESS: 'flawless',
  WIN_STREAK_5: 'win_streak_5',
  WIN_STREAK_10: 'win_streak_10',
  GAMES_100: 'games_100',
  ELO_1500: 'elo_1500',
  ELO_2000: 'elo_2000'
} as const;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export class AchievementService {
  private static instance: AchievementService;
  private achievements: Map<string, Achievement> = new Map();

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  private constructor() {
    this.initializeAchievements();
    this.loadUnlockedAchievements();
  }

  // Initialiser la liste des achievements
  private initializeAchievements(): void {
    this.achievements.set(ACHIEVEMENT_IDS.FIRST_WIN, {
      id: ACHIEVEMENT_IDS.FIRST_WIN,
      title: 'Première Victoire',
      description: 'Gagnez votre première partie',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    });

    this.achievements.set(ACHIEVEMENT_IDS.COMBO_3, {
      id: ACHIEVEMENT_IDS.COMBO_3,
      title: 'Combo x3',
      description: 'Effectuez 3 prises consécutives',
      unlocked: false,
      progress: 0,
      maxProgress: 3
    });

    this.achievements.set(ACHIEVEMENT_IDS.FLAWLESS, {
      id: ACHIEVEMENT_IDS.FLAWLESS,
      title: 'Victoire Parfaite',
      description: 'Gagnez sans perdre un seul pion',
      unlocked: false,
      progress: 0,
      maxProgress: 1
    });

    this.achievements.set(ACHIEVEMENT_IDS.WIN_STREAK_5, {
      id: ACHIEVEMENT_IDS.WIN_STREAK_5,
      title: 'Série de 5',
      description: 'Gagnez 5 parties consécutives',
      unlocked: false,
      progress: 0,
      maxProgress: 5
    });

    this.achievements.set(ACHIEVEMENT_IDS.WIN_STREAK_10, {
      id: ACHIEVEMENT_IDS.WIN_STREAK_10,
      title: 'Série de 10',
      description: 'Gagnez 10 parties consécutives',
      unlocked: false,
      progress: 0,
      maxProgress: 10
    });

    this.achievements.set(ACHIEVEMENT_IDS.GAMES_100, {
      id: ACHIEVEMENT_IDS.GAMES_100,
      title: 'Centurion',
      description: 'Jouez 100 parties',
      unlocked: false,
      progress: 0,
      maxProgress: 100
    });

    this.achievements.set(ACHIEVEMENT_IDS.ELO_1500, {
      id: ACHIEVEMENT_IDS.ELO_1500,
      title: 'Élite',
      description: 'Atteignez 1500 ELO',
      unlocked: false,
      progress: 0,
      maxProgress: 1500
    });

    this.achievements.set(ACHIEVEMENT_IDS.ELO_2000, {
      id: ACHIEVEMENT_IDS.ELO_2000,
      title: 'Légende',
      description: 'Atteignez 2000 ELO',
      unlocked: false,
      progress: 0,
      maxProgress: 2000
    });
  }

  // Charger les achievements débloqués depuis le stockage
  private async loadUnlockedAchievements(): Promise<void> {
    try {
      const unlockedAchievements = await AsyncStorage.getItem('unlocked_achievements');
      if (unlockedAchievements) {
        const unlocked = JSON.parse(unlockedAchievements);
        unlocked.forEach((id: string) => {
          const achievement = this.achievements.get(id);
          if (achievement) {
            achievement.unlocked = true;
            achievement.progress = achievement.maxProgress;
          }
        });
      }
      console.log('🏆 AchievementService: Achievements chargés');
    } catch (error) {
      console.error('🏆 AchievementService: Erreur chargement achievements', error);
    }
  }

  // Sauvegarder un achievement débloqué
  private async saveUnlockedAchievement(achievementId: string): Promise<void> {
    try {
      const unlockedAchievements = await AsyncStorage.getItem('unlocked_achievements');
      const unlocked = unlockedAchievements ? JSON.parse(unlockedAchievements) : [];
      
      if (!unlocked.includes(achievementId)) {
        unlocked.push(achievementId);
        await AsyncStorage.setItem('unlocked_achievements', JSON.stringify(unlocked));
      }
    } catch (error) {
      console.error('🏆 AchievementService: Erreur sauvegarde achievement', error);
    }
  }

  // Débloquer un achievement
  private async unlockAchievement(achievementId: string): Promise<void> {
    try {
      const achievement = this.achievements.get(achievementId);
      if (!achievement || achievement.unlocked) return;

      achievement.unlocked = true;
      achievement.progress = achievement.maxProgress;

      // Sauvegarder localement
      await this.saveUnlockedAchievement(achievementId);

      // Soumettre à Game Center
      await gameCenterService.reportAchievement(achievementId, 100);

      console.log('🏆 AchievementService: Achievement débloqué', achievement.title);
    } catch (error) {
      console.error('🏆 AchievementService: Erreur déblocage achievement', error);
    }
  }

  // Vérifier les achievements après une victoire
  async checkWinAchievements(): Promise<void> {
    try {
      const stats = scoreService.getStats();

      // Première victoire
      if (stats.totalGames === 1) {
        await this.unlockAchievement(ACHIEVEMENT_IDS.FIRST_WIN);
      }

      // Série de victoires
      if (stats.winStreak === 5) {
        await this.unlockAchievement(ACHIEVEMENT_IDS.WIN_STREAK_5);
      }

      if (stats.winStreak === 10) {
        await this.unlockAchievement(ACHIEVEMENT_IDS.WIN_STREAK_10);
      }

      // 100 parties
      if (stats.totalGames === 100) {
        await this.unlockAchievement(ACHIEVEMENT_IDS.GAMES_100);
      }

      // ELO 1500
      if (stats.eloRating >= 1500) {
        await this.unlockAchievement(ACHIEVEMENT_IDS.ELO_1500);
      }

      // ELO 2000
      if (stats.eloRating >= 2000) {
        await this.unlockAchievement(ACHIEVEMENT_IDS.ELO_2000);
      }
    } catch (error) {
      console.error('🏆 AchievementService: Erreur vérification achievements victoire', error);
    }
  }

  // Vérifier les achievements après une victoire parfaite
  async checkFlawlessAchievement(): Promise<void> {
    try {
      await this.unlockAchievement(ACHIEVEMENT_IDS.FLAWLESS);
    } catch (error) {
      console.error('🏆 AchievementService: Erreur achievement victoire parfaite', error);
    }
  }

  // Vérifier les achievements de combo
  async checkComboAchievement(comboCount: number): Promise<void> {
    try {
      if (comboCount >= 3) {
        await this.unlockAchievement(ACHIEVEMENT_IDS.COMBO_3);
      }
    } catch (error) {
      console.error('🏆 AchievementService: Erreur achievement combo', error);
    }
  }

  // Obtenir tous les achievements
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  // Obtenir les achievements débloqués
  getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.unlocked);
  }

  // Obtenir les achievements non débloqués
  getLockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => !a.unlocked);
  }

  // Obtenir un achievement par ID
  getAchievement(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }
}

// Instance singleton
export const achievementService = AchievementService.getInstance();
