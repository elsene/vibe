import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Achievement, achievementService } from '../services/AchievementService';
import { gameCenterService } from '../services/GameCenterService';
import { PlayerStats, scoreService } from '../services/ScoreService';

export default function StatsScreen() {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const currentStats = scoreService.getStats();
    const allAchievements = achievementService.getAllAchievements();
    
    setStats(currentStats);
    setAchievements(allAchievements);
  };

  const handleShowLeaderboards = () => {
    gameCenterService.showDashboard();
  };

  const handleShowAchievements = () => {
    gameCenterService.showDashboard();
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Chargement...</Text>
      </View>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Titre */}
        <Text style={styles.title}>📊 Statistiques</Text>

        {/* Stats principales */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Performance</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Victoires cette semaine</Text>
            <Text style={styles.statValue}>{stats.weeklyWins}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>ELO Rating</Text>
            <Text style={styles.statValue}>{stats.eloRating}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Rang ELO</Text>
            <Text style={styles.statValue}>{scoreService.getEloRank()}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Parties jouées</Text>
            <Text style={styles.statValue}>{stats.totalGames}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Série actuelle</Text>
            <Text style={styles.statValue}>{stats.winStreak}</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>🏆 Achievements ({unlockedCount}/{totalCount})</Text>
          
          {achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementRow}>
              <Text style={[
                styles.achievementTitle,
                achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked
              ]}>
                {achievement.unlocked ? '✅' : '🔒'} {achievement.title}
              </Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
            </View>
          ))}
        </View>

        {/* Boutons Game Center */}
        <View style={styles.buttonsCard}>
          <Pressable style={styles.gameCenterButton} onPress={handleShowLeaderboards}>
            <Text style={styles.buttonText}>📈 Voir les Classements</Text>
          </Pressable>
          
          <Pressable style={styles.gameCenterButton} onPress={handleShowAchievements}>
            <Text style={styles.buttonText}>🏆 Voir les Achievements</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 20,
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  achievementsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  buttonsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementUnlocked: {
    color: '#4ade80',
  },
  achievementLocked: {
    color: '#666',
  },
  achievementDesc: {
    color: '#aaa',
    fontSize: 14,
  },
  gameCenterButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
