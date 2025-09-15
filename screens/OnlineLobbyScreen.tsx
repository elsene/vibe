import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { trackOnlineBlocked } from '../src/analytics/events';
import { PaywallModal } from '../src/monetization/PaywallModal';
import { usePremium } from '../src/monetization/PremiumProvider';
import { useOnlineQuota } from '../src/monetization/useOnlineQuota';

const { width: W, height: H } = Dimensions.get('window');

export default function OnlineLobbyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const { count, remaining, tryConsume } = useOnlineQuota();
  const [paywallVisible, setPaywallVisible] = useState(false);

  const handleStartGame = async () => {
    const result = await tryConsume();
    if (result.allowed) {
      // Démarrer une partie en ligne
      Alert.alert('Succès', 'Partie en ligne démarrée !');
    } else {
      trackOnlineBlocked(result.count);
      setPaywallVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            🌐 Mode En Ligne
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Jouez contre des joueurs du monde entier
          </Text>
        </View>

        <View style={[styles.comingSoonCard, { backgroundColor: colors.surface }]}>
          <View style={styles.comingSoonIcon}>
            <Text style={styles.iconText}>🚧</Text>
          </View>
          
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
            Bientôt Disponible
          </Text>
          
          <Text style={[styles.comingSoonDescription, { color: colors.textSecondary }]}>
            Nous travaillons actuellement sur le mode multijoueur en ligne. 
            Cette fonctionnalité sera disponible dans une prochaine mise à jour.
          </Text>

          <View style={styles.features}>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              🎮 Parties en temps réel
            </Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              🌍 Joueurs du monde entier
            </Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              🏆 Classements et statistiques
            </Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              💬 Chat en jeu
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.quotaInfo}>
            <Text style={[styles.quotaText, { color: colors.textSecondary }]}>
              {isPremium ? 'Parties illimitées' : `${remaining} parties restantes cette semaine`}
            </Text>
            <Text style={[styles.quotaText, { color: colors.textSecondary }]}>
              Parties jouées: {count}
            </Text>
          </View>

          <Pressable 
            style={[styles.startButton, { backgroundColor: colors.accent }]}
            onPress={handleStartGame}
          >
            <Text style={[styles.startButtonText, { color: colors.surface }]}>
              🎮 Démarrer une partie
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.surface }]}>
              🏠 Retour au menu
            </Text>
          </Pressable>
        </View>
      </View>

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: Math.max(28, W * 0.07),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Math.max(16, W * 0.04),
    textAlign: 'center',
  },
  comingSoonCard: {
    borderRadius: 20,
    padding: 30,
    borderWidth: 2,
    borderColor: '#F5DEB3',
    alignItems: 'center',
    marginBottom: 40,
  },
  comingSoonIcon: {
    marginBottom: 20,
  },
  iconText: {
    fontSize: 80,
  },
  comingSoonTitle: {
    fontSize: Math.max(24, W * 0.06),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 15,
  },
  comingSoonDescription: {
    fontSize: Math.max(16, W * 0.04),
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  features: {
    width: '100%',
  },
  featureText: {
    fontSize: Math.max(14, W * 0.035),
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  quotaInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quotaText: {
    fontSize: Math.max(14, W * 0.035),
    marginBottom: 5,
  },
  startButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  startButtonText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  backButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
});
