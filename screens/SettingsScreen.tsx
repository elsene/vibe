import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, theme, setTheme } = useTheme();
  
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [language, setLanguage] = useState('FR');
  const [adsDisabled, setAdsDisabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const sounds = await AsyncStorage.getItem('soundsEnabled');
      const vibration = await AsyncStorage.getItem('vibrationEnabled');
      const lang = await AsyncStorage.getItem('language');
      const ads = await AsyncStorage.getItem('adsDisabled');
      
      if (sounds !== null) setSoundsEnabled(sounds === 'true');
      if (vibration !== null) setVibrationEnabled(vibration === 'true');
      if (lang !== null) setLanguage(lang);
      if (ads !== null) setAdsDisabled(ads === 'true');
    } catch (error) {
      console.log('Erreur lors du chargement des paramètres:', error);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    await setTheme(newTheme);
  };

  const handleSoundsToggle = async (value: boolean) => {
    setSoundsEnabled(value);
    try {
      await AsyncStorage.setItem('soundsEnabled', value.toString());
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des sons:', error);
    }
  };

  const handleVibrationToggle = async (value: boolean) => {
    setVibrationEnabled(value);
    try {
      await AsyncStorage.setItem('vibrationEnabled', value.toString());
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des vibrations:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem('language', newLanguage);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde de la langue:', error);
    }
  };

  const handleResetTutorials = async () => {
    try {
      await AsyncStorage.removeItem('onboardingDone');
      // TODO: Afficher un toast de confirmation
    } catch (error) {
      console.log('Erreur lors de la réinitialisation des tutoriels:', error);
    }
  };

  const handleRevokeConsent = async () => {
    try {
      await AsyncStorage.removeItem('consentGiven');
      await AsyncStorage.removeItem('analyticsEnabled');
      await AsyncStorage.removeItem('adsEnabled');
      // TODO: Afficher un toast de confirmation
    } catch (error) {
      console.log('Erreur lors de la révocation du consentement:', error);
    }
  };

  const handleAbout = () => {
    console.log('À propos');
    // TODO: Implémenter la modal "À propos"
  };

  const settingsSections = [
    {
      title: '🎨 Apparence',
      items: [
        {
          type: 'radio',
          label: 'Thème',
          options: [
            { label: 'Clair', value: 'light' },
            { label: 'Sombre', value: 'dark' },
            { label: 'Système', value: 'system' }
          ],
          value: theme,
          onChange: handleThemeChange
        }
      ]
    },
    {
      title: '🔊 Audio et Haptique',
      items: [
        {
          type: 'switch',
          label: 'Sons',
          value: soundsEnabled,
          onChange: handleSoundsToggle
        },
        {
          type: 'switch',
          label: 'Vibrations',
          value: vibrationEnabled,
          onChange: handleVibrationToggle
        }
      ]
    },
    {
      title: '🌍 Langue',
      items: [
        {
          type: 'radio',
          label: 'Langue de l\'interface',
          options: [
            { label: 'Français', value: 'FR' },
            { label: 'English', value: 'EN' },
            { label: 'Español', value: 'ES' }
          ],
          value: language,
          onChange: handleLanguageChange
        }
      ]
    },
    {
      title: '📱 Application',
      items: [
        {
          type: 'button',
          label: 'Réinitialiser les tutoriels',
          action: handleResetTutorials,
          color: '#FF6B6B'
        },
        {
          type: 'button',
          label: 'Révocation du consentement',
          action: handleRevokeConsent,
          color: '#FF6B6B'
        },
        {
          type: 'info',
          label: 'Version',
          value: '1.0.0'
        }
      ]
    }
  ];

  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={item.label} style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {item.label}
            </Text>
            <Switch
              value={item.value}
              onValueChange={item.onChange}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={item.value ? colors.surface : colors.textSecondary}
            />
          </View>
        );

      case 'radio':
        return (
          <View key={item.label} style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {item.label}
            </Text>
            <View style={styles.radioGroup}>
              {item.options.map((option: any) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.radioOption,
                    item.value === option.value && { backgroundColor: colors.accent }
                  ]}
                  onPress={() => item.onChange(option.value)}
                >
                  <Text style={[
                    styles.radioText,
                    { color: item.value === option.value ? colors.surface : colors.text }
                  ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 'button':
        return (
          <Pressable
            key={item.label}
            style={[styles.settingButton, { borderColor: item.color }]}
            onPress={item.action}
          >
            <Text style={[styles.settingButtonText, { color: item.color }]}>
              {item.label}
            </Text>
          </Pressable>
        );

      case 'info':
        return (
          <View key={item.label} style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {item.label}
            </Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {item.value}
            </Text>
          </View>
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
            ⚙️ Paramètres
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Personnalisez votre expérience de jeu
          </Text>
        </View>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Pressable 
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.surface }]}>
              🏠 Retour au menu
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
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F5DEB3',
  },
  sectionTitle: {
    fontSize: Math.max(20, W * 0.05),
    fontWeight: '800',
    marginBottom: 15,
  },
  sectionContent: {
    gap: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
  },
  settingValue: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  radioOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F5DEB3',
  },
  radioText: {
    fontSize: Math.max(14, W * 0.035),
    fontWeight: '600',
  },
  settingButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  settingButtonText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '700',
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
