import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

const onboardingData = [
  {
    title: '🎮 Bienvenue dans Wheel Checkers',
    description: 'Découvrez une version moderne et innovante du jeu de dames classique, adaptée aux écrans tactiles.',
    illustration: 'welcome'
  },
  {
    title: '🎯 Comment jouer',
    description: 'Déplacez vos pions en diagonale, capturez les pions adverses en sautant par-dessus, et atteignez le centre pour devenir une dame !',
    illustration: 'gameplay'
  },
  {
    title: '🌟 Modes de jeu',
    description: 'Jouez contre l\'ordinateur avec différents niveaux de difficulté, ou affrontez vos amis en mode 2 joueurs.',
    illustration: 'modes'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('onboardingDone', 'true');
      router.replace('/menu');
    } catch (error) {
      console.log('Erreur lors de la sauvegarde de l\'onboarding:', error);
      router.replace('/menu');
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('onboardingDone', 'true');
      router.replace('/menu');
    } catch (error) {
      console.log('Erreur lors de la sauvegarde de l\'onboarding:', error);
      router.replace('/menu');
    }
  };

  const renderIllustration = (type: string) => {
    const size = Math.max(200, W * 0.5);
    
    switch (type) {
      case 'welcome':
        return (
          <Svg width={size} height={size} style={styles.illustration}>
            <Circle cx={size/2} cy={size/2} r={size/3} fill={colors.accent} opacity={0.1} />
            <Circle cx={size/2} cy={size/2} r={size/4} fill={colors.accent} opacity={0.2} />
            <Circle cx={size/2} cy={size/2} r={size/6} fill={colors.accent} opacity={0.3} />
            <Text style={[styles.illustrationText, { color: colors.accent }]}>🎮</Text>
          </Svg>
        );
      
      case 'gameplay':
        return (
          <Svg width={size} height={size} style={styles.illustration}>
            <Circle cx={size/2} cy={size/2} r={size/3} fill={colors.accent} opacity={0.1} />
            <Circle cx={size/3} cy={size/3} r={15} fill="#FF6B6B" />
            <Circle cx={2*size/3} cy={2*size/3} r={15} fill="#4ECDC4" />
            <Line x1={size/3} y1={size/3} x2={2*size/3} y2={2*size/3} stroke={colors.accent} strokeWidth={3} strokeDasharray="5,5" />
            <Text style={[styles.illustrationText, { color: colors.accent }]}>🎯</Text>
          </Svg>
        );
      
      case 'modes':
        return (
          <Svg width={size} height={size} style={styles.illustration}>
            <Circle cx={size/3} cy={size/2} r={size/6} fill="#FF6B6B" opacity={0.3} />
            <Circle cx={2*size/3} cy={size/2} r={size/6} fill="#4ECDC4" opacity={0.3} />
            <Text style={[styles.illustrationText, { color: colors.accent }]}>🌟</Text>
          </Svg>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const page = Math.round(event.nativeEvent.contentOffset.x / W);
          setCurrentPage(page);
        }}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => (
          <View key={index} style={styles.page}>
            <View style={styles.pageContent}>
              <View style={styles.illustrationContainer}>
                {renderIllustration(item.illustration)}
              </View>
              
              <View style={styles.textContainer}>
                <Text style={[styles.pageTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.pageDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.indicators}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { backgroundColor: index === currentPage ? colors.accent : colors.border }
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.skipButton, { borderColor: colors.accent }]}
            onPress={handleSkip}
          >
            <Text style={[styles.skipButtonText, { color: colors.accent }]}>
              Passer
            </Text>
          </Pressable>

          {currentPage === onboardingData.length - 1 && (
            <Pressable
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={handleComplete}
            >
              <Text style={[styles.startButtonText, { color: colors.surface }]}>
                Commencer
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: W,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
  },
  illustrationContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  illustration: {
    alignSelf: 'center',
  },
  illustrationText: {
    fontSize: 80,
    textAlign: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
  },
  textContainer: {
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: Math.max(28, W * 0.07),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
  },
  pageDescription: {
    fontSize: Math.max(18, W * 0.045),
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 10,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  skipButtonText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
  },
  startButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  startButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
});
