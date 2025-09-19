import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { trackPurchaseSuccess } from '../analytics/events';
import { usePremium } from './PremiumProvider';

export const PaywallModal: React.FC<{ visible: boolean; onClose: () => void; }> = ({ visible, onClose }) => {
  const { packages, refreshCustomer } = usePremium();
  const [busy, setBusy] = useState(false);
  
  if (!visible) return null;

  const buy = async (pkgId: string) => {
    try {
      setBusy(true);
      console.log('📱 RevenueCat: Tentative d\'achat - Package:', pkgId);
      
      // Vérifier si nous sommes en mode développement
      const isExpoGo = __DEV__ || Platform.OS === 'web';
      if (isExpoGo) {
        console.log('📱 RevenueCat: Mode Expo Go - Achat simulé');
        Alert.alert(
          'Mode Développement',
          'Achat simulé en mode Expo Go. En production, l\'achat se ferait via RevenueCat.',
          [
            {
              text: 'OK',
              onPress: () => {
                trackPurchaseSuccess(pkgId);
                onClose();
              }
            }
          ]
        );
        return;
      }

      const offeringPkg = packages?.find(p => p.identifier === pkgId) || packages?.[0];
      if (!offeringPkg) {
        console.log('📱 RevenueCat: Package non trouvé:', pkgId);
        return;
      }
      
      console.log('📱 RevenueCat: Achat en cours - Produit:', offeringPkg.product.title);
      const { customerInfo } = await Purchases.purchasePackage(offeringPkg);
      console.log('📱 RevenueCat: Achat réussi - Entitlements:', Object.keys(customerInfo.entitlements.active));
      
      await refreshCustomer();
      trackPurchaseSuccess(pkgId);
      onClose();
    } catch (e: any) {
      if (!e?.userCancelled) {
        console.warn('📱 RevenueCat: Erreur d\'achat', e);
        Alert.alert('Erreur', 'L\'achat a échoué. Veuillez réessayer.');
      } else {
        console.log('📱 RevenueCat: Achat annulé par l\'utilisateur');
      }
    } finally {
      setBusy(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setBusy(true);
      console.log('📱 RevenueCat: Restauration des achats...');
      
      // Vérifier si nous sommes en mode développement
      const isExpoGo = __DEV__ || Platform.OS === 'web';
      if (isExpoGo) {
        console.log('📱 RevenueCat: Mode Expo Go - Restauration simulée');
        Alert.alert(
          'Mode Développement',
          'Restauration simulée en mode Expo Go. En production, la restauration se ferait via RevenueCat.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Simuler la restauration réussie
                console.log('📱 RevenueCat: Restauration simulée réussie');
              }
            }
          ]
        );
        return;
      }

      const customerInfo = await Purchases.restorePurchases();
      console.log('📱 RevenueCat: Restauration réussie - Entitlements:', Object.keys(customerInfo.entitlements.active));
      
      await refreshCustomer();
      Alert.alert('Succès', 'Achats restaurés avec succès !');
    } catch (e) {
      console.warn('📱 RevenueCat: Erreur de restauration', e);
      Alert.alert('Erreur', 'Impossible de restaurer les achats.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Passez en Premium</Text>
          <Text style={styles.subtitle}>• Plus de pubs • Online illimité</Text>

          {busy && <ActivityIndicator color="#fff" style={styles.loader} />}

          <View style={styles.buttons}>
            {packages?.map((pkg) => (
              <Pressable
                key={pkg.identifier}
                onPress={() => buy(pkg.identifier)}
                style={styles.buyButton}
                disabled={busy}
              >
                <Text style={styles.buyButtonText}>
                  {pkg.product.title} - {pkg.product.priceString}
                </Text>
              </Pressable>
            ))}

            <Pressable onPress={restorePurchases} style={styles.restoreButton} disabled={busy}>
              <Text style={styles.restoreButtonText}>Restaurer les achats</Text>
            </Pressable>

            <Pressable onPress={onClose} style={styles.cancelButton} disabled={busy}>
              <Text style={styles.cancelButtonText}>Plus tard</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#111827',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9CA3AF',
    marginBottom: 16,
  },
  loader: {
    marginVertical: 10,
  },
  buttons: {
    gap: 10,
  },
  buyButton: {
    backgroundColor: '#22C55E',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#062e0f',
    fontWeight: '800',
  },
  restoreButton: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
  },
});
