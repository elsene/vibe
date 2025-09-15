import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAds } from '../src/monetization/AdProvider';
import { PaywallModal } from '../src/monetization/PaywallModal';
import { usePremium } from '../src/monetization/PremiumProvider';
import { ADS_ENABLED, IS_IOS_ONLY, PAYWALL_ENABLED } from '../src/monetization/constants';
import { useOnlineQuota } from '../src/monetization/useOnlineQuota';

const { width: W, height: H } = Dimensions.get('window');

export default function DevMonetizationScreen() {
  const router = useRouter();
  const { isPremium, loading, packages, openPaywall } = usePremium();
  const { showInterstitialIfEligible } = useAds();
  const { count, remaining, tryConsume } = useOnlineQuota();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleTestInterstitial = async () => {
    console.log('🧪 Dev: Test interstitial demandé');
    await showInterstitialIfEligible('dev_test');
  };

  const handleTestOnlineQuota = async () => {
    console.log('🧪 Dev: Test quota online');
    const result = await tryConsume();
    Alert.alert(
      'Test Quota Online',
      `Résultat: ${result.allowed ? 'Autorisé' : 'Bloqué'}\nParties jouées: ${result.count}`
    );
  };

  const handleOpenPaywall = () => {
    console.log('🧪 Dev: Ouverture paywall');
    setShowPaywall(true);
  };

  const getStatusColor = (status: boolean) => status ? '#22c55e' : '#ef4444';
  const getStatusText = (status: boolean) => status ? 'ACTIF' : 'INACTIF';
  
  // Vérifier le mode de développement
  const isExpoGo = __DEV__ && Platform.OS === 'web';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Dev - Monétisation</Text>
        <Text style={styles.subtitle}>Tests iOS (AdMob + RevenueCat)</Text>
      </View>

      {/* État général */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 État Général</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Plateforme:</Text>
          <Text style={[styles.statusValue, { color: Platform.OS === 'ios' ? '#22c55e' : '#ef4444' }]}>
            {Platform.OS.toUpperCase()}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>iOS Only:</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(IS_IOS_ONLY) }]}>
            {getStatusText(IS_IOS_ONLY)}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Ads Enabled:</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(ADS_ENABLED) }]}>
            {getStatusText(ADS_ENABLED)}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Paywall Enabled:</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(PAYWALL_ENABLED) }]}>
            {getStatusText(PAYWALL_ENABLED)}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>État Premium:</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(isPremium) }]}>
            {loading ? 'CHARGEMENT...' : (isPremium ? 'PREMIUM' : 'FREE')}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Mode Dev:</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(isExpoGo) }]}>
            {isExpoGo ? 'EXPO GO' : 'NATIVE'}
          </Text>
        </View>
      </View>

      {/* Packages RevenueCat */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Packages RevenueCat</Text>
        {packages && packages.length > 0 ? (
          packages.map((pkg, index) => (
            <View key={index} style={styles.packageRow}>
              <Text style={styles.packageText}>
                {pkg.product.title} - {pkg.product.priceString}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noPackages}>Aucun package disponible</Text>
        )}
      </View>

      {/* Quota Online */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Quota Online</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Parties jouées:</Text>
          <Text style={styles.statusValue}>{count}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Restantes:</Text>
          <Text style={styles.statusValue}>{remaining}</Text>
        </View>
      </View>

      {/* Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Tests</Text>
        
        <Pressable style={styles.testButton} onPress={handleTestInterstitial}>
          <Text style={styles.testButtonText}>📺 Test Interstitial</Text>
        </Pressable>

        <Pressable style={styles.testButton} onPress={handleTestOnlineQuota}>
          <Text style={styles.testButtonText}>🌐 Test Quota Online</Text>
        </Pressable>

        <Pressable style={styles.testButton} onPress={handleOpenPaywall}>
          <Text style={styles.testButtonText}>💎 Ouvrir Paywall</Text>
        </Pressable>

        <Pressable style={styles.testButton} onPress={openPaywall}>
          <Text style={styles.testButtonText}>👑 Test Premium (Menu)</Text>
        </Pressable>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Instructions QA</Text>
        <Text style={styles.instructionText}>
          • Vérifiez que la plateforme est iOS{'\n'}
          • En FREE: Testez l'interstitial et le quota{'\n'}
          • Testez l'achat Premium (Sandbox){'\n'}
          • Vérifiez que les pubs disparaissent en Premium{'\n'}
          • Testez la restauration des achats{'\n'}
          • Mode Expo Go: Achats simulés{'\n'}
          • Mode Native: Vraies transactions
        </Text>
      </View>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </Pressable>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E3440',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#4C566A',
  },
  title: {
    fontSize: Math.max(24, W * 0.06),
    fontWeight: '800',
    color: '#88C0D0',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: Math.max(16, W * 0.04),
    color: '#D8DEE9',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: '#3B4252',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    color: '#ECEFF4',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: Math.max(14, W * 0.035),
    color: '#D8DEE9',
  },
  statusValue: {
    fontSize: Math.max(14, W * 0.035),
    fontWeight: '600',
  },
  packageRow: {
    padding: 8,
    backgroundColor: '#4C566A',
    borderRadius: 8,
    marginBottom: 8,
  },
  packageText: {
    fontSize: Math.max(14, W * 0.035),
    color: '#ECEFF4',
  },
  noPackages: {
    fontSize: Math.max(14, W * 0.035),
    color: '#D8DEE9',
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: '#0ea5e9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#022c3a',
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '700',
  },
  instructionText: {
    fontSize: Math.max(14, W * 0.035),
    color: '#D8DEE9',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#4C566A',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ECEFF4',
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
  },
});
