import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

export default function ConsentScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem('consentGiven', 'true');
      await AsyncStorage.setItem('analyticsEnabled', 'true');
      await AsyncStorage.setItem('adsEnabled', 'true');
      router.replace('/onboarding');
    } catch (error) {
      console.log('Erreur lors de la sauvegarde du consentement:', error);
      router.replace('/onboarding');
    }
  };

  const handleCustomize = async () => {
    try {
      await AsyncStorage.setItem('consentGiven', 'true');
      await AsyncStorage.setItem('analyticsEnabled', 'false');
      await AsyncStorage.setItem('adsEnabled', 'false');
      router.replace('/onboarding');
    } catch (error) {
      console.log('Erreur lors de la sauvegarde du consentement:', error);
      router.replace('/onboarding');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              🔒 Respect de votre vie privée
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Wheel Checkers respecte votre vie privée
            </Text>
          </View>

          <View style={[styles.privacyCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.privacyTitle, { color: colors.text }]}>
              Notre engagement
            </Text>
            
            <Text style={[styles.privacyDescription, { color: colors.textSecondary }]}>
              Wheel Checkers s'engage à protéger votre vie privée. Nous collectons uniquement les données nécessaires au bon fonctionnement de l'application.
            </Text>

            <View style={styles.dataSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📊 Données collectées
              </Text>
              
              <View style={styles.dataItem}>
                <Text style={[styles.dataIcon, { color: colors.accent }]}>📈</Text>
                <View style={styles.dataContent}>
                  <Text style={[styles.dataTitle, { color: colors.text }]}>
                    Statistiques de jeu
                  </Text>
                  <Text style={[styles.dataDescription, { color: colors.textSecondary }]}>
                    Pour améliorer l'expérience de jeu et corriger les bugs
                  </Text>
                </View>
              </View>

              <View style={styles.dataItem}>
                <Text style={[styles.dataIcon, { color: colors.accent }]}>🎯</Text>
                <View style={styles.dataContent}>
                  <Text style={[styles.dataTitle, { color: colors.text }]}>
                    Préférences
                  </Text>
                  <Text style={[styles.dataDescription, { color: colors.textSecondary }]}>
                    Thème, langue, paramètres audio (stockées localement)
                  </Text>
                </View>
              </View>

              <View style={styles.dataItem}>
                <Text style={[styles.dataIcon, { color: colors.accent }]}>📱</Text>
                <View style={styles.dataContent}>
                  <Text style={[styles.dataTitle, { color: colors.text }]}>
                    Informations techniques
                  </Text>
                  <Text style={[styles.dataDescription, { color: colors.textSecondary }]}>
                    Version de l'app, système d'exploitation, résolution d'écran
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.adsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📺 Publicités
              </Text>
              
              <Text style={[styles.adsDescription, { color: colors.textSecondary }]}>
                Nous affichons des publicités pour maintenir l'application gratuite. 
                Vous pouvez les désactiver en achetant la version "Sans publicité" dans la boutique.
              </Text>
            </View>

            <View style={styles.rightsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🛡️ Vos droits
              </Text>
              
              <View style={styles.rightsList}>
                <Text style={[styles.rightItem, { color: colors.textSecondary }]}>
                  • Accéder à vos données personnelles
                </Text>
                <Text style={[styles.rightItem, { color: colors.textSecondary }]}>
                  • Rectifier ou supprimer vos données
                </Text>
                <Text style={[styles.rightItem, { color: colors.textSecondary }]}>
                  • Retirer votre consentement à tout moment
                </Text>
                <Text style={[styles.rightItem, { color: colors.textSecondary }]}>
                  • Porter plainte auprès de la CNIL
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.acceptButton, { backgroundColor: colors.primary }]}
              onPress={handleAccept}
            >
              <Text style={[styles.acceptButtonText, { color: colors.surface }]}>
                ✅ Accepter tout
              </Text>
            </Pressable>

            <Pressable
              style={[styles.customizeButton, { borderColor: colors.accent }]}
              onPress={handleCustomize}
            >
              <Text style={[styles.customizeButtonText, { color: colors.accent }]}>
                ⚙️ Personnaliser
              </Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              En continuant, vous acceptez notre{' '}
              <Text style={[styles.linkText, { color: colors.accent }]}>
                Politique de confidentialité
              </Text>
              {' '}et nos{' '}
              <Text style={[styles.linkText, { color: colors.accent }]}>
                Conditions d'utilisation
              </Text>
            </Text>
          </View>
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
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: Math.max(28, W * 0.07),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Math.max(18, W * 0.045),
    textAlign: 'center',
  },
  privacyCard: {
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: '#F5DEB3',
    marginBottom: 30,
  },
  privacyTitle: {
    fontSize: Math.max(22, W * 0.055),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 15,
  },
  privacyDescription: {
    fontSize: Math.max(16, W * 0.04),
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  dataSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    marginBottom: 15,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  dataIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  dataContent: {
    flex: 1,
  },
  dataTitle: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
    marginBottom: 5,
  },
  dataDescription: {
    fontSize: Math.max(14, W * 0.035),
    lineHeight: 20,
  },
  adsSection: {
    marginBottom: 25,
  },
  adsDescription: {
    fontSize: Math.max(14, W * 0.035),
    lineHeight: 20,
  },
  rightsSection: {
    marginBottom: 20,
  },
  rightsList: {
    gap: 8,
  },
  rightItem: {
    fontSize: Math.max(14, W * 0.035),
    lineHeight: 20,
  },
  actions: {
    gap: 15,
    marginBottom: 20,
  },
  acceptButton: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  acceptButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
  customizeButton: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
  },
  customizeButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: Math.max(12, W * 0.03),
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
