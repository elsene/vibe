import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
      const offeringPkg = packages?.find(p => p.identifier === pkgId) || packages?.[0];
      if (!offeringPkg) return;
      
      await Purchases.purchasePackage(offeringPkg);
      await refreshCustomer();
      trackPurchaseSuccess(pkgId);
      onClose();
    } catch (e: any) {
      if (!e?.userCancelled) {
        console.warn('purchase error', e);
      }
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
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
  },
});
