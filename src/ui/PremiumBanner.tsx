import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePremium } from '../monetization/PremiumProvider';
import { ADMOB_TEST_IDS } from '../monetization/constants';

export default function PremiumBanner() {
  const { isPremium, openPaywall } = usePremium();
  
  if (isPremium) {
    return (
      <View style={styles.premiumContainer}>
        <Text style={styles.premiumText}>
          👑 Premium Actif - Profitez de toutes les fonctionnalités !
        </Text>
      </View>
    );
  }
  
  return (
    <View>
      {/* Bannière AdMob Test */}
      <View style={styles.adBanner}>
        <Text style={styles.adText}>
          📺 Bannière AdMob Test (ID: {ADMOB_TEST_IDS.BANNER})
        </Text>
      </View>
      
      {/* Bannière Premium */}
      <Pressable onPress={openPaywall} style={styles.container}>
        <Text style={styles.text}>
          🔥 Version Gratuite - Passez Premium pour plus de fonctionnalités !
        </Text>
        <Text style={styles.subText}>
          👑 Pas de pubs • 🌐 Online illimité • 🎮 Fonctionnalités exclusives
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0ea5e9',
    padding: 15,
    borderRadius: 12,
    margin: 12,
    borderWidth: 2,
    borderColor: '#0284c7',
  },
  text: {
    color: '#022c3a',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 5,
  },
  subText: {
    color: '#022c3a',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  premiumContainer: {
    backgroundColor: '#22c55e',
    padding: 15,
    borderRadius: 12,
    margin: 12,
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  premiumText: {
    color: '#052e16',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
  },
  adBanner: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    margin: 12,
    marginBottom: 0,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  adText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },
});
