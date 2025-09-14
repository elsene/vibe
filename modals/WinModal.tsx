import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

export default function WinModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const winner = params.winner as 'A' | 'B';

  const handleReplay = () => {
    // TODO: Implement replay functionality
    router.back();
  };

  const handleMenu = () => {
    router.push('/menu');
  };

  const winnerText = winner === 'A' ? '🔴 Rouge' : '🔵 Bleu';
  const winnerColor = winner === 'A' ? '#FF6B6B' : '#4ECDC4';

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.congrats, { color: colors.text }]}>
            🎉 Félicitations ! 🎉
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.winnerSection}>
            <Text style={[styles.winner, { color: winnerColor }]}>
              {winnerText} gagne !
            </Text>
          </View>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Une partie exceptionnelle s&apos;est terminée. 
            Voulez-vous rejouer ou retourner au menu principal ?
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.replayButton, { backgroundColor: colors.primary }]}
            onPress={handleReplay}
          >
            <Text style={[styles.replayButtonText, { color: colors.surface }]}>
              🎮 Rejouer
            </Text>
          </Pressable>

          <Pressable
            style={[styles.menuButton, { borderColor: colors.accent }]}
            onPress={handleMenu}
          >
            <Text style={[styles.menuButtonText, { color: colors.accent }]}>
              🏠 Menu
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  congrats: {
    fontSize: Math.max(24, W * 0.06),
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    marginBottom: 30,
  },
  winnerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  winner: {
    fontSize: Math.max(28, W * 0.07),
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    fontSize: Math.max(16, W * 0.04),
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: 15,
  },
  replayButton: {
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#F5DEB3',
    alignItems: 'center',
  },
  replayButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
  menuButton: {
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
});
