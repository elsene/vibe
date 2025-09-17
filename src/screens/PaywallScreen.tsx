import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { rcGetOfferings, rcPurchaseByIdentifier, rcRestore, rcDiagLog } from '../services/revenuecat';
import { usePremium } from '../state/PremiumContext';

export default function PaywallScreen() {
  const { premium } = usePremium();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      await rcDiagLog(); // log diag en dev
      const offerings = await rcGetOfferings();
      const list = offerings?.current?.availablePackages ?? [];
      setPackages(list);
      setLoading(false);
    })();
  }, []);

  const buy = async (identifier: string) => {
    try {
      setLoading(true);
      await rcPurchaseByIdentifier(identifier);
      Alert.alert('Merci !', 'Premium activé.');
    } catch (e: any) {
      if (e?.userCancelled) return;
      Alert.alert('Achat', e?.message ?? 'Erreur achat');
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    try {
      setLoading(true);
      await rcRestore();
      Alert.alert('Restauré', 'Vos achats ont été restaurés.');
    } catch (e: any) {
      Alert.alert('Restore', e?.message ?? 'Erreur restauration');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.loading} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passez en Premium</Text>
      {premium ? (
        <Text style={styles.premiumActive}>Premium actif ✅</Text>
      ) : (
        <Text style={styles.subtitle}>Publicités retirées • Online illimité</Text>
      )}

      {packages.map((p) => (
        <Pressable 
          key={p.identifier} 
          onPress={() => buy(p.identifier)} 
          style={styles.packageButton}
        >
          <Text style={styles.packageText}>
            {p.identifier} — {p.product.priceString}
          </Text>
        </Pressable>
      ))}

      <Pressable onPress={restore} style={styles.restoreButton}>
        <Text style={styles.restoreText}>Restaurer les achats</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
    backgroundColor: '#1a1a1a',
  },
  loading: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumActive: {
    color: '#4ade80',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 16,
  },
  packageButton: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#22c55e',
  },
  packageText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  restoreButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    marginTop: 20,
  },
  restoreText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
