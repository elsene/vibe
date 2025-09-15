import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Vérifier si c'est le premier lancement
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        const consentGiven = await AsyncStorage.getItem('consentGiven');
        const onboardingDone = await AsyncStorage.getItem('onboardingDone');

        // Attendre un peu pour l'effet splash
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!hasLaunched) {
          // Premier lancement - marquer comme lancé et aller au consentement
          await AsyncStorage.setItem('hasLaunched', 'true');
          router.replace('/consent');
        } else if (!consentGiven) {
          // Consentement pas encore donné
          router.replace('/consent');
        } else if (!onboardingDone) {
          // Onboarding pas encore fait
          router.replace('/onboarding');
        } else {
          // Tout est fait, aller à l'écran de bienvenue
          router.replace('/welcome');
        }
      } catch (error) {
        console.log('Erreur lors de l\'initialisation:', error);
        // En cas d'erreur, aller au menu principal
        router.replace('/menu');
      }
    };

    initializeApp();
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.title}>
            WHEEL
          </Text>
          <Text style={styles.subtitle}>
            CHECKERS
          </Text>
        </View>
        
        <View style={styles.loading}>
          <Text style={styles.loadingText}>
            Chargement...
          </Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E3440', // Couleur primaire
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: Math.max(48, W * 0.12),
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 10,
    color: '#88C0D0', // Couleur accent
  },
  subtitle: {
    fontSize: Math.max(32, W * 0.08),
    fontWeight: '700',
    letterSpacing: 2,
    color: '#ECEFF4', // Couleur surface
  },
  loading: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '600',
    marginBottom: 20,
    color: '#ECEFF4', // Couleur surface
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#4C566A', // Couleur border
  },
  progressFill: {
    height: '100%',
    width: '60%',
    borderRadius: 2,
    backgroundColor: '#88C0D0', // Couleur accent
  },
});
