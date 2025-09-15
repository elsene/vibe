import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { usePremium } from '../context/PremiumManager';

export default function PremiumBanner() {
  const { isPremium, openPaywall } = usePremium();
  
  if (isPremium) return null;
  
  return (
    <Pressable onPress={openPaywall} style={styles.container}>
      <Text style={styles.text}>
        🔥 Premium : pas de pubs + online illimité
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0ea5e9',
    padding: 10,
    borderRadius: 12,
    margin: 12,
  },
  text: {
    color: '#022c3a',
    fontWeight: '800',
    textAlign: 'center',
  },
});
