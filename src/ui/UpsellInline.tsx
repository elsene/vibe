import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePremium } from '../monetization/PremiumProvider';

export default function UpsellInline() {
  const { isPremium, openPaywall } = usePremium();
  
  if (isPremium) return null;
  
  return (
    <View style={styles.container}>
      <Pressable onPress={openPaywall} style={styles.button}>
        <Text style={styles.text}>
          Passez Premium – plus de pubs & online illimité
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#22c55e',
  },
  text: {
    color: '#052e16',
    fontWeight: '700',
  },
});
