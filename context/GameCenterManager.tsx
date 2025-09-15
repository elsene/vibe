import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

interface GameCenterContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  playerId: string | null;
  playerName: string | null;
  authenticate: () => Promise<boolean>;
  submitScore: (score: number, leaderboardId: string) => Promise<void>;
  showLeaderboard: (leaderboardId: string) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  showAchievements: () => Promise<void>;
}

const GameCenterContext = createContext<GameCenterContextType | undefined>(undefined);

// Configuration des leaderboards et achievements
export const LEADERBOARDS = {
  WINS: 'com.wheelcheckers.leaderboard.wins',
  WIN_STREAK: 'com.wheelcheckers.leaderboard.winstreak',
  GAMES_PLAYED: 'com.wheelcheckers.leaderboard.gamesplayed'
};

export const ACHIEVEMENTS = {
  FIRST_WIN: 'com.wheelcheckers.achievement.firstwin',
  WIN_STREAK_5: 'com.wheelcheckers.achievement.winstreak5',
  WIN_STREAK_10: 'com.wheelcheckers.achievement.winstreak10',
  GAMES_100: 'com.wheelcheckers.achievement.games100',
  PERFECT_GAME: 'com.wheelcheckers.achievement.perfectgame'
};

export const GameCenterProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  // Vérification de l'authentification au démarrage
  useEffect(() => {
    if (Platform.OS === 'ios') {
      checkAuthentication();
    }
  }, []);

  const checkAuthentication = async () => {
    try {
      setIsLoading(true);
      
      // Mode développement - Game Center non disponible
      console.log('📱 Mode développement - Game Center non disponible');
      setIsAuthenticated(false);
    } catch (error) {
      console.log('❌ Erreur lors de la vérification Game Center:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async (): Promise<boolean> => {
    try {
      Alert.alert(
        'Game Center',
        'Game Center sera disponible dans une future mise à jour. Cette fonctionnalité est en cours de développement.',
        [{ text: 'OK' }]
      );
      return false;
    } catch (error) {
      console.log('❌ Erreur lors de l\'authentification Game Center:', error);
      return false;
    }
  };

  const submitScore = async (score: number, leaderboardId: string) => {
    try {
      console.log(`📊 Score simulé: ${score} pour ${leaderboardId} (Game Center en développement)`);
    } catch (error) {
      console.log('❌ Erreur lors de la soumission du score:', error);
    }
  };

  const showLeaderboard = async (leaderboardId: string) => {
    try {
      Alert.alert(
        'Game Center',
        'Les classements seront disponibles dans une future mise à jour.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('❌ Erreur lors de l\'affichage du classement:', error);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    try {
      console.log(`🏆 Succès simulé: ${achievementId} (Game Center en développement)`);
    } catch (error) {
      console.log('❌ Erreur lors du déblocage du succès:', error);
    }
  };

  const showAchievements = async () => {
    try {
      Alert.alert(
        'Game Center',
        'Les succès seront disponibles dans une future mise à jour.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('❌ Erreur lors de l\'affichage des succès:', error);
    }
  };

  return (
    <GameCenterContext.Provider value={{
      isAuthenticated,
      isLoading,
      playerId,
      playerName,
      authenticate,
      submitScore,
      showLeaderboard,
      unlockAchievement,
      showAchievements
    }}>
      {children}
    </GameCenterContext.Provider>
  );
};

export const useGameCenter = () => {
  const context = useContext(GameCenterContext);
  if (context === undefined) {
    throw new Error('useGameCenter must be used within a GameCenterProvider');
  }
  return context;
};
