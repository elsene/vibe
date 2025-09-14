import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

export default function ConfirmModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const title = params.title as string || 'Confirmation';
  const message = params.message as string || 'Êtes-vous sûr ?';

  const handleConfirm = () => {
    // TODO: Implement confirm functionality
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.cancelButton, { borderColor: colors.accent }]}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelButtonText, { color: colors.accent }]}>
              Annuler
            </Text>
          </Pressable>

          <Pressable
            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
            onPress={handleConfirm}
          >
            <Text style={[styles.confirmButtonText, { color: colors.surface }]}>
              Confirmer
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: Math.max(24, W * 0.06),
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    marginBottom: 30,
  },
  message: {
    fontSize: Math.max(16, W * 0.04),
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#F5DEB3',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '700',
  },
});
