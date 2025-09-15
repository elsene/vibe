import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');


export default function SettingsScreen() {
  const router = useRouter();
  const { colors, theme, setTheme } = useTheme();
  const { settings, updateSettings, resetSettings, isLoading } = useSettings();
  const { language, setLanguage, t } = useLanguage();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    await setTheme(newTheme);
    await updateSettings({ theme: newTheme });
  };

  const handleResetSettings = () => {
    Alert.alert(
      t('settings.reset.confirm.title'),
      t('settings.reset.confirm.message'),
      [
        { text: t('settings.reset.confirm.cancel'), style: 'cancel' },
        { 
          text: t('settings.reset.confirm.confirm'), 
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            await setTheme('system');
            Alert.alert('Succès', t('settings.reset.success'));
          }
        }
      ]
    );
  };

  const handleResetTutorials = async () => {
    try {
      await AsyncStorage.removeItem('onboardingDone');
      Alert.alert('Succès', t('settings.tutorials.success'));
    } catch (error) {
      console.log('Erreur lors de la réinitialisation des tutoriels:', error);
      Alert.alert('Erreur', 'Impossible de réinitialiser les tutoriels');
    }
  };


  const handleAbout = () => {
    Alert.alert(
      t('settings.about.title'),
      t('settings.about.message'),
      [{ text: t('settings.about.ok') }]
    );
  };


  const settingsSections = [
    {
      title: `🎮 ${t('settings.game.title')}`,
      icon: '🎯',
      items: [
        {
          type: 'slider',
          label: t('settings.timer.label'),
          description: t('settings.timer.description'),
          value: settings.timerDuration,
          min: 5,
          max: 30,
          step: 1,
          onChange: (value: number) => updateSettings({ timerDuration: value })
        },
      ]
    },
    {
      title: `🎨 ${t('settings.appearance.title')}`,
      icon: '🌈',
      items: [
        {
          type: 'radio',
          label: t('settings.theme.label'),
          description: 'Couleur de l\'interface',
          options: [
            { label: t('settings.theme.light'), value: 'light', description: 'Mode jour' },
            { label: t('settings.theme.dark'), value: 'dark', description: 'Mode nuit' },
            { label: t('settings.theme.system'), value: 'system', description: 'Suivre le système' }
          ],
          value: settings.theme,
          onChange: handleThemeChange
        },
      ]
    },
    {
      title: `🔊 ${t('settings.audio.title')}`,
      icon: '🎵',
      items: [
        {
          type: 'switch',
          label: t('settings.sounds.label'),
          description: t('settings.sounds.description'),
          value: settings.soundEffects,
          onChange: (value: boolean) => updateSettings({ soundEffects: value })
        },
        {
          type: 'switch',
          label: t('settings.music.label'),
          description: t('settings.music.description'),
          value: settings.backgroundMusic,
          onChange: (value: boolean) => updateSettings({ backgroundMusic: value })
        },
        {
          type: 'switch',
          label: t('settings.vibration.label'),
          description: t('settings.vibration.description'),
          value: settings.vibration,
          onChange: (value: boolean) => updateSettings({ vibration: value })
        }
      ]
    },
    {
      title: `🌍 ${t('settings.language.title')}`,
      icon: '🗺️',
      items: [
        {
          type: 'radio',
          label: t('settings.language.label'),
          description: 'Langue d\'affichage de l\'application',
          options: [
            { label: t('settings.language.fr'), value: 'FR', description: 'Langue par défaut' },
            { label: t('settings.language.en'), value: 'EN', description: 'Default language' },
            { label: t('settings.language.es'), value: 'ES', description: 'Idioma por defecto' }
          ],
          value: language,
          onChange: (value: string) => setLanguage(value as any)
        }
      ]
    },
    {
      title: `📱 ${t('settings.app.title')}`,
      icon: '⚙️',
      items: [
        {
          type: 'button',
          label: t('settings.reset.label'),
          description: t('settings.reset.description'),
          action: handleResetSettings,
          color: colors.error,
          icon: '🔄'
        },
        {
          type: 'button',
          label: t('settings.tutorials.label'),
          description: t('settings.tutorials.description'),
          action: handleResetTutorials,
          color: colors.primary,
          icon: '📚'
        },
        {
          type: 'button',
          label: t('settings.about.label'),
          description: t('settings.about.description'),
          action: handleAbout,
          color: colors.primary,
          icon: 'ℹ️'
        },
        {
          type: 'info',
          label: t('settings.version.label'),
          value: '1.0.0',
          description: t('settings.version.description')
        },
        {
          type: 'info',
          label: t('settings.platform.label'),
          value: Platform.OS === 'ios' ? 'iOS' : 'Android',
          description: t('settings.platform.description')
        }
      ]
    }
  ];

  const renderSettingItem = (item: any, index: number) => {
    const itemStyle = [
      styles.settingItem,
      { backgroundColor: colors.surface }
    ];

    switch (item.type) {
      case 'switch':
        return (
          <View key={index} style={itemStyle}>
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              {item.description && (
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              )}
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={item.value}
                onValueChange={item.onChange}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={item.value ? colors.surface : colors.textSecondary}
                style={styles.switch}
              />
            </View>
          </View>
        );

      case 'radio':
        return (
          <View key={index} style={itemStyle}>
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              {item.description && (
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              )}
            </View>
            <View style={styles.radioGroup}>
              {item.options.map((option: any, optionIndex: number) => (
                <Pressable
                  key={optionIndex}
                  style={[
                    styles.radioOption,
                    { 
                      backgroundColor: item.value === option.value ? colors.primary : colors.surface,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => item.onChange(option.value)}
                >
                  <Text style={[
                    styles.radioText,
                    { color: item.value === option.value ? colors.surface : colors.text }
                  ]}>
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text style={[
                      styles.radioDescription,
                      { color: item.value === option.value ? colors.surface : colors.textSecondary }
                    ]}>
                      {option.description}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 'slider':
        return (
          <View key={index} style={itemStyle}>
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}: {item.value}s
              </Text>
              {item.description && (
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              )}
            </View>
            <View style={styles.timerControls}>
              <Pressable
                style={[
                  styles.timerButton,
                  { 
                    backgroundColor: item.value <= item.min ? colors.border : colors.primary,
                    opacity: item.value <= item.min ? 0.5 : 1
                  }
                ]}
                onPress={() => {
                  const newValue = Math.max(item.min, item.value - 1);
                  if (newValue !== item.value) item.onChange(newValue);
                }}
                disabled={item.value <= item.min}
              >
                <Text style={[styles.timerButtonText, { color: colors.surface }]}>-</Text>
              </Pressable>
              
              <View style={[styles.timerValue, { backgroundColor: colors.surface }]}>
                <Text style={[styles.timerValueText, { color: colors.text }]}>{item.value}s</Text>
              </View>
              
              <Pressable
                style={[
                  styles.timerButton,
                  { 
                    backgroundColor: item.value >= item.max ? colors.border : colors.primary,
                    opacity: item.value >= item.max ? 0.5 : 1
                  }
                ]}
                onPress={() => {
                  const newValue = Math.min(item.max, item.value + 1);
                  if (newValue !== item.value) item.onChange(newValue);
                }}
                disabled={item.value >= item.max}
              >
                <Text style={[styles.timerButtonText, { color: colors.surface }]}>+</Text>
              </Pressable>
            </View>
          </View>
        );

      case 'button':
        return (
          <Pressable
            key={index}
            style={[
              styles.settingButton,
              { 
                backgroundColor: item.color,
                borderColor: item.color
              }
            ]}
            onPress={item.action}
          >
            <Text style={styles.settingButtonIcon}>{item.icon}</Text>
            <View style={styles.settingButtonContent}>
              <Text style={[styles.settingButtonText, { color: colors.surface }]}>
                {item.label}
              </Text>
              {item.description && (
                <Text style={[styles.settingButtonDescription, { color: colors.surface }]}>
                  {item.description}
                </Text>
              )}
            </View>
          </Pressable>
        );

      case 'info':
        return (
          <View key={index} style={itemStyle}>
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              {item.description && (
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              )}
            </View>
            <View style={styles.infoValueContainer}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {item.value}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des paramètres...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              ⚙️ {t('settings.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('settings.subtitle')}
            </Text>
          </View>

          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={[styles.section, { backgroundColor: colors.surface }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>{section.icon}</Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {section.title}
                </Text>
              </View>
              
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
                🏠 {t('settings.back')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '600',
  },
  scrollContent: {
    padding: Math.max(16, W * 0.04),
    paddingBottom: Math.max(40, H * 0.05),
  },
  header: {
    alignItems: 'center',
    marginBottom: Math.max(30, H * 0.04),
    paddingTop: Math.max(20, H * 0.025),
  },
  title: {
    fontSize: Math.max(32, W * 0.08),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: Math.max(8, H * 0.01),
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: Math.max(16, W * 0.04),
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    borderRadius: Math.max(16, W * 0.04),
    padding: Math.max(20, W * 0.05),
    marginBottom: Math.max(20, H * 0.025),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Math.max(16, H * 0.02),
  },
  sectionIcon: {
    fontSize: Math.max(24, W * 0.06),
    marginRight: Math.max(12, W * 0.03),
  },
  sectionTitle: {
    fontSize: Math.max(20, W * 0.05),
    fontWeight: '800',
    flex: 1,
  },
  sectionContent: {
    gap: Math.max(12, H * 0.015),
  },
  settingItem: {
    flexDirection: 'column',
    paddingVertical: Math.max(12, H * 0.015),
    paddingHorizontal: Math.max(16, W * 0.04),
    borderRadius: Math.max(12, W * 0.03),
    minHeight: Math.max(60, H * 0.075),
  },
  settingItemContent: {
    flex: 1,
    marginBottom: Math.max(8, H * 0.01),
  },
  settingLabel: {
    fontSize: Math.max(15, W * 0.038),
    fontWeight: '600',
    marginBottom: Math.max(3, H * 0.004),
    flexWrap: 'wrap',
  },
  settingDescription: {
    fontSize: Math.max(13, W * 0.032),
    fontWeight: '400',
    lineHeight: Math.max(16, W * 0.04),
    flexWrap: 'wrap',
  },
  settingValue: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
  },
  switchContainer: {
    alignItems: 'flex-end',
    marginTop: Math.max(4, H * 0.005),
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  infoValueContainer: {
    alignItems: 'flex-end',
    marginTop: Math.max(4, H * 0.005),
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Math.max(6, W * 0.015),
    marginTop: Math.max(8, H * 0.01),
    justifyContent: 'flex-end',
  },
  radioOption: {
    paddingHorizontal: Math.max(10, W * 0.025),
    paddingVertical: Math.max(6, H * 0.008),
    borderRadius: Math.max(6, W * 0.015),
    borderWidth: 1,
    minWidth: Math.max(70, W * 0.18),
    maxWidth: Math.max(120, W * 0.3),
    alignItems: 'center',
    flex: 1,
  },
  radioText: {
    fontSize: Math.max(14, W * 0.035),
    fontWeight: '600',
    textAlign: 'center',
  },
  radioDescription: {
    fontSize: Math.max(12, W * 0.03),
    fontWeight: '400',
    textAlign: 'center',
    marginTop: Math.max(2, H * 0.002),
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Math.max(12, W * 0.03),
    marginTop: Math.max(8, H * 0.01),
  },
  timerButton: {
    width: Math.max(40, W * 0.1),
    height: Math.max(40, W * 0.1),
    borderRadius: Math.max(20, W * 0.05),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerButtonText: {
    fontSize: Math.max(20, W * 0.05),
    fontWeight: 'bold',
  },
  timerValue: {
    paddingHorizontal: Math.max(16, W * 0.04),
    paddingVertical: Math.max(8, H * 0.01),
    borderRadius: Math.max(8, W * 0.02),
    minWidth: Math.max(60, W * 0.15),
    alignItems: 'center',
  },
  timerValueText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Math.max(14, H * 0.018),
    paddingHorizontal: Math.max(16, W * 0.04),
    borderRadius: Math.max(10, W * 0.025),
    borderWidth: 2,
    marginVertical: Math.max(4, H * 0.005),
    minHeight: Math.max(50, H * 0.06),
  },
  settingButtonIcon: {
    fontSize: Math.max(20, W * 0.05),
    marginRight: Math.max(12, W * 0.03),
  },
  settingButtonContent: {
    flex: 1,
  },
  settingButtonText: {
    fontSize: Math.max(15, W * 0.038),
    fontWeight: '700',
    marginBottom: Math.max(2, H * 0.002),
    flexWrap: 'wrap',
  },
  settingButtonDescription: {
    fontSize: Math.max(13, W * 0.032),
    fontWeight: '400',
    flexWrap: 'wrap',
  },
  footer: {
    alignItems: 'center',
    marginTop: Math.max(30, H * 0.04),
    paddingBottom: Math.max(20, H * 0.025),
  },
  backButton: {
    paddingVertical: Math.max(16, H * 0.02),
    paddingHorizontal: Math.max(32, W * 0.08),
    borderRadius: Math.max(16, W * 0.04),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
});