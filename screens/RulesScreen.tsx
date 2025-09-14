import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

const ruleSections = [
  {
    title: '🎯 Objectif du Jeu',
    description: 'Capturer tous les pions de votre adversaire ou l\'empêcher de faire un mouvement valide.',
    illustration: 'objective'
  },
  {
    title: '🎮 Mouvement des Pions',
    description: 'Les pions se déplacent d\'une position à la fois, en diagonale vers l\'avant uniquement.',
    illustration: 'movement'
  },
  {
    title: '⚡ Prise Obligatoire',
    description: 'Si une prise est possible, elle est obligatoire. Vous pouvez capturer en sautant par-dessus un pion adverse.',
    illustration: 'capture'
  },
  {
    title: '👑 Promotion en Dame',
    description: 'Quand un pion atteint le centre du plateau, il devient une dame avec des pouvoirs étendus.',
    illustration: 'promotion'
  },
  {
    title: '👸 Mouvement des Dames',
    description: 'Les dames peuvent se déplacer de plusieurs cases en diagonale et capturer à distance.',
    illustration: 'queen'
  },
  {
    title: '⏰ Limite de Temps',
    description: 'Chaque joueur dispose de 11 secondes par tour. Si le temps expire, le tour passe à l\'adversaire.',
    illustration: 'timer'
  }
];

export default function RulesScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const renderIllustration = (type: string) => {
    const size = Math.max(120, W * 0.3);
    
    switch (type) {
      case 'objective':
        return (
          <Svg width={size} height={size} style={styles.illustration}>
            <Circle cx={size/2} cy={size/2} r={size/3} fill="#FF6B6B" opacity={0.3} />
            <Circle cx={size/2} cy={size/2} r={size/6} fill="#4ECDC4" opacity={0.3} />
            <Text style={[styles.illustrationText, { color: colors.text }]}>🎯</Text>
          </Svg>
        );
      
      case 'movement':
        return (
          <Svg width={size} height={size} style={styles.illustration}>
            <Circle cx={size/3} cy={size/2} r={15} fill="#FF6B6B" />
            <Line x1={size/3} y1={size/2} x2={2*size/3} y2={size/2} stroke="#666" strokeWidth={2} />
            <Circle cx={2*size/3} cy={size/2} r={15} fill="#4ECDC4" opacity={0.3} />
            <Text style={[styles.illustrationText, { color: colors.text }]}>➡️</Text>
          </Svg>
        );
      
      case 'capture':
        return (
          <Svg width={size} height={size} style={styles.illustration}>
            <Circle cx={size/4} cy={size/2} r={15} fill="#FF6B6B" />
            <Circle cx={size/2} cy={size/2} r={15} fill="#FFD93D" />
            <Circle cx={3*size/4} cy={size/2} r={15} fill="#4ECDC4" opacity={0.3} />
            <Line x1={size/4} y1={size/2} x2={3*size/4} y2={size/2} stroke="#666" strokeWidth={2} />
            <Text style={[styles.illustrationText, { color: colors.text }]}>⚡</Text>
          </Svg>
        );
      
      case 'promotion':
        return (
          <Svg width={size} height={size} style={styles.illustration}>
            <Circle cx={size/2} cy={size/2} r={size/4} fill="#FF6B6B" />
            <Circle cx={size/2} cy={size/2} r={size/6} fill="#FFD93D" />
            <Text style={[styles.illustrationText, { color: colors.text }]}>👑</Text>
          </Svg>
        );
      
      case 'queen':
        return (
          <Svg width={size} height={size} style={styles.illustration}>
            <Circle cx={size/2} cy={size/2} r={size/3} fill="#FF6B6B" />
            <Circle cx={size/2} cy={size/2} r={size/6} fill="#FFD93D" />
            <Line x1={size/6} y1={size/6} x2={5*size/6} y2={5*size/6} stroke="#666" strokeWidth={2} />
            <Text style={[styles.illustrationText, { color: colors.text }]}>👸</Text>
          </Svg>
        );
      
      case 'timer':
        return (
          <Svg width={size} height={size} style={styles.illustration}>
            <Circle cx={size/2} cy={size/2} r={size/3} fill="none" stroke="#666" strokeWidth={3} />
            <Line x1={size/2} y1={size/2} x2={size/2} y2={size/4} stroke="#666" strokeWidth={2} />
            <Line x1={size/2} y1={size/2} x2={3*size/4} y2={size/2} stroke="#666" strokeWidth={2} />
            <Text style={[styles.illustrationText, { color: colors.text }]}>⏰</Text>
          </Svg>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            📖 Règles du Jeu
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Apprenez à jouer à Wheel Checkers
          </Text>
        </View>

        {ruleSections.map((section, index) => (
          <View key={index} style={[styles.ruleCard, { backgroundColor: colors.surface }]}>
            <View style={styles.ruleHeader}>
              <Text style={[styles.ruleTitle, { color: colors.text }]}>
                {section.title}
              </Text>
            </View>
            
            <View style={styles.ruleContent}>
              <View style={styles.illustrationContainer}>
                {renderIllustration(section.illustration)}
              </View>
              
              <Text style={[styles.ruleDescription, { color: colors.textSecondary }]}>
                {section.description}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Pressable 
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.surface }]}>
              🏠 Revenir au menu
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: Math.max(32, W * 0.08),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Math.max(18, W * 0.045),
    textAlign: 'center',
  },
  ruleCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F5DEB3',
  },
  ruleHeader: {
    marginBottom: 15,
  },
  ruleTitle: {
    fontSize: Math.max(20, W * 0.05),
    fontWeight: '800',
    textAlign: 'center',
  },
  ruleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  illustrationContainer: {
    marginRight: 15,
  },
  illustration: {
    alignSelf: 'center',
  },
  illustrationText: {
    fontSize: 24,
    textAlign: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  ruleDescription: {
    flex: 1,
    fontSize: Math.max(16, W * 0.04),
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  backButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
});
