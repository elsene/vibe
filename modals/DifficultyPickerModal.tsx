import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

const difficulties = [
  {
    id: 'easy',
    title: 'Facile',
    description: 'Parfait pour débuter',
    icon: '😊',
    color: '#4CAF50'
  },
  {
    id: 'mid',
    title: 'Moyen',
    description: 'Défi équilibré',
    icon: '🤔',
    color: '#FF9800'
  },
  {
    id: 'hard',
    title: 'Difficile',
    description: 'Pour les experts',
    icon: '😈',
    color: '#F44336'
  }
];

export default function DifficultyPickerModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'mid' | 'hard'>('mid');

  const handleConfirm = () => {
    router.push(`/game?mode=ai&difficulty=${selectedDifficulty}&adsDisabled=false`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Choisissez la difficulté
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sélectionnez le niveau de l'intelligence artificielle
          </Text>
        </View>

        <View style={styles.options}>
          {difficulties.map((difficulty) => (
            <Pressable
              key={difficulty.id}
              style={[
                styles.option,
                { backgroundColor: colors.background },
                selectedDifficulty === difficulty.id && { 
                  borderColor: difficulty.color,
                  borderWidth: 3
                }
              ]}
              onPress={() => setSelectedDifficulty(difficulty.id as 'easy' | 'mid' | 'hard')}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionIcon}>{difficulty.icon}</Text>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {difficulty.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {difficulty.description}
                  </Text>
                </View>
              </View>
              
              {selectedDifficulty === difficulty.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: difficulty.color }]}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
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
              Valider
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
    marginBottom: 30,
  },
  title: {
    fontSize: Math.max(24, W * 0.06),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Math.max(16, W * 0.04),
    textAlign: 'center',
  },
  options: {
    gap: 15,
    marginBottom: 30,
  },
  option: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#F5DEB3',
    position: 'relative',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: Math.max(14, W * 0.035),
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
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
