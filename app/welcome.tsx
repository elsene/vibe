import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { trackPaywallShown } from '../src/analytics/events';
import { PaywallModal } from '../src/monetization/PaywallModal';
import { usePremium } from '../src/monetization/PremiumProvider';

const { width: W, height: H } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { isPremium, loading } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    // Si l'utilisateur n'est pas Premium, montrer le paywall après 2 secondes
    if (!loading && !isPremium) {
      const timer = setTimeout(() => {
        setShowPaywall(true);
        trackPaywallShown('app_start');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPremium, loading]);

  const handleContinue = () => {
    router.replace('/menu');
  };

  const handleUpgrade = () => {
    setShowPaywall(true);
    trackPaywallShown('welcome_screen');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.title}>WHEEL CHECKERS</Text>
          <Text style={styles.subtitle}>Le jeu de dames moderne</Text>
        </View>

        {isPremium ? (
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>👑 Bienvenue, joueur Premium !</Text>
            <Text style={styles.premiumText}>
              Profitez de toutes les fonctionnalités sans publicités !
            </Text>
            <Pressable style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Commencer à jouer</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.freeContent}>
            <Text style={styles.freeTitle}>🎮 Version Gratuite</Text>
            <Text style={styles.freeText}>
              Découvrez Wheel Checkers avec des fonctionnalités limitées
            </Text>
            <View style={styles.features}>
              <Text style={styles.featureText}>✅ Jeu local et contre l'IA</Text>
              <Text style={styles.featureText}>✅ 5 parties en ligne par semaine</Text>
              <Text style={styles.featureText}>❌ Publicités entre les parties</Text>
            </View>
            <View style={styles.buttons}>
              <Pressable style={styles.upgradeButton} onPress={handleUpgrade}>
                <Text style={styles.upgradeButtonText}>👑 Passer Premium</Text>
              </Pressable>
              <Pressable style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continuer gratuitement</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E3440',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  logo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: Math.max(32, W * 0.08),
    fontWeight: '900',
    color: '#88C0D0',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Math.max(18, W * 0.045),
    color: '#ECEFF4',
    textAlign: 'center',
  },
  premiumContent: {
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: Math.max(24, W * 0.06),
    fontWeight: '800',
    color: '#22c55e',
    textAlign: 'center',
    marginBottom: 15,
  },
  premiumText: {
    fontSize: Math.max(16, W * 0.04),
    color: '#D8DEE9',
    textAlign: 'center',
    marginBottom: 30,
  },
  freeContent: {
    alignItems: 'center',
  },
  freeTitle: {
    fontSize: Math.max(24, W * 0.06),
    fontWeight: '800',
    color: '#0ea5e9',
    textAlign: 'center',
    marginBottom: 15,
  },
  freeText: {
    fontSize: Math.max(16, W * 0.04),
    color: '#D8DEE9',
    textAlign: 'center',
    marginBottom: 20,
  },
  features: {
    marginBottom: 30,
  },
  featureText: {
    fontSize: Math.max(14, W * 0.035),
    color: '#ECEFF4',
    marginBottom: 8,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: 15,
  },
  upgradeButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#052e16',
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '800',
  },
  continueButton: {
    backgroundColor: '#4C566A',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ECEFF4',
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
  },
  loadingText: {
    fontSize: Math.max(18, W * 0.045),
    color: '#ECEFF4',
  },
});
