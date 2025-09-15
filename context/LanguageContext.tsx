import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';

export type Language = 'FR' | 'EN' | 'ES';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, variables?: Record<string, string>) => string;
  isLoading: boolean;
}

const translations = {
  FR: {
    // Paramètres
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Personnalisez votre expérience de jeu',
    'settings.game.title': 'Paramètres de Jeu',
    'settings.timer.label': 'Durée du timer',
    'settings.timer.description': 'Temps par tour en secondes',
    'settings.appearance.title': 'Apparence',
    'settings.theme.label': 'Thème',
    'settings.theme.light': 'Clair',
    'settings.theme.dark': 'Sombre',
    'settings.theme.system': 'Système',
    'settings.audio.title': 'Audio et Haptique',
    'settings.sounds.label': 'Effets sonores',
    'settings.sounds.description': 'Sons de jeu et interactions',
    'settings.music.label': 'Musique de fond',
    'settings.music.description': 'Ambiance musicale',
    'settings.vibration.label': 'Vibrations',
    'settings.vibration.description': 'Retour haptique',
    'settings.language.title': 'Langue et Région',
    'settings.language.label': 'Langue de l\'interface',
    'settings.language.fr': 'Français',
    'settings.language.en': 'English',
    'settings.language.es': 'Español',
    'settings.app.title': 'Application',
    'settings.reset.label': 'Réinitialiser les paramètres',
    'settings.reset.description': 'Restaurer les valeurs par défaut',
    'settings.tutorials.label': 'Réinitialiser les tutoriels',
    'settings.tutorials.description': 'Revoir les instructions de jeu',
    'settings.about.label': 'À propos',
    'settings.about.description': 'Informations sur l\'application',
    'settings.version.label': 'Version de l\'application',
    'settings.version.description': 'Dernière mise à jour',
    'settings.platform.label': 'Plateforme',
    'settings.platform.description': 'Système d\'exploitation',
    'settings.back': 'Retour au menu',
    'settings.reset.confirm.title': 'Réinitialiser les paramètres',
    'settings.reset.confirm.message': 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?',
    'settings.reset.confirm.cancel': 'Annuler',
    'settings.reset.confirm.confirm': 'Réinitialiser',
    'settings.reset.success': 'Les paramètres ont été réinitialisés',
    'settings.tutorials.success': 'Les tutoriels ont été réinitialisés',
    'settings.about.title': 'À propos de WheelCheckers',
    'settings.about.message': 'Version 1.0.0\n\nUn jeu de dames moderne et accessible.\n\nDéveloppé avec React Native et Expo.',
    'settings.about.ok': 'OK',
    
    // Jeu
    'game.turn': 'Tour',
    'game.timer': 'Temps',
    'game.pause': 'Pause',
    'game.red': 'Rouge',
    'game.blue': 'Bleu',
    'game.ai_thinking': 'L\'IA réfléchit...',
    'game.pause.title': 'Jeu en pause',
    'game.pause.subtitle': 'Que souhaitez-vous faire ?',
    'game.pause.resume': 'Reprendre',
    'game.pause.new': 'Nouveau jeu',
    'game.pause.quit': 'Quitter',
    'game.over.title': 'Fin de Partie !',
    'game.over.winner': 'Le joueur {winner} a gagné !',
    'game.over.new': 'Nouveau jeu',
    'game.over.quit': 'Retour au menu',
    'game.punishment.message': 'Pièce supprimée pour non-respect de la règle de capture !',
    
    // Menu
    'menu.title': 'WheelCheckers',
    'menu.subtitle': 'Jeu de dames moderne',
    'menu.play_local': 'Jouer en local',
    'menu.play_ai': 'Jouer contre l\'IA',
    'menu.online': 'Jouer en ligne',
    'menu.rules': 'Règles du jeu',
    'menu.settings': 'Paramètres',
    'menu.shop': 'Boutique',
  },
  EN: {
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your gaming experience',
    'settings.game.title': 'Game Settings',
    'settings.timer.label': 'Timer Duration',
    'settings.timer.description': 'Time per turn in seconds',
    'settings.appearance.title': 'Appearance',
    'settings.theme.label': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
    'settings.audio.title': 'Audio and Haptic',
    'settings.sounds.label': 'Sound Effects',
    'settings.sounds.description': 'Game sounds and interactions',
    'settings.music.label': 'Background Music',
    'settings.music.description': 'Musical ambiance',
    'settings.vibration.label': 'Vibrations',
    'settings.vibration.description': 'Haptic feedback',
    'settings.language.title': 'Language and Region',
    'settings.language.label': 'Interface Language',
    'settings.language.fr': 'Français',
    'settings.language.en': 'English',
    'settings.language.es': 'Español',
    'settings.app.title': 'Application',
    'settings.reset.label': 'Reset Settings',
    'settings.reset.description': 'Restore default values',
    'settings.tutorials.label': 'Reset Tutorials',
    'settings.tutorials.description': 'Review game instructions',
    'settings.about.label': 'About',
    'settings.about.description': 'Application information',
    'settings.version.label': 'Application Version',
    'settings.version.description': 'Last update',
    'settings.platform.label': 'Platform',
    'settings.platform.description': 'Operating system',
    'settings.back': 'Back to menu',
    'settings.reset.confirm.title': 'Reset Settings',
    'settings.reset.confirm.message': 'Are you sure you want to reset all settings to default values?',
    'settings.reset.confirm.cancel': 'Cancel',
    'settings.reset.confirm.confirm': 'Reset',
    'settings.reset.success': 'Settings have been reset',
    'settings.tutorials.success': 'Tutorials have been reset',
    'settings.about.title': 'About WheelCheckers',
    'settings.about.message': 'Version 1.0.0\n\nA modern and accessible checkers game.\n\nDeveloped with React Native and Expo.',
    'settings.about.ok': 'OK',
    
    // Game
    'game.turn': 'Turn',
    'game.timer': 'Time',
    'game.pause': 'Pause',
    'game.red': 'Red',
    'game.blue': 'Blue',
    'game.ai_thinking': 'AI is thinking...',
    'game.pause.title': 'Game Paused',
    'game.pause.subtitle': 'What would you like to do?',
    'game.pause.resume': 'Resume',
    'game.pause.new': 'New Game',
    'game.pause.quit': 'Quit',
    'game.over.title': 'Game Over!',
    'game.over.winner': 'Player {winner} won!',
    'game.over.new': 'New Game',
    'game.over.quit': 'Back to Menu',
    'game.punishment.message': 'Piece removed for not following capture rule!',
    
    // Menu
    'menu.title': 'WheelCheckers',
    'menu.subtitle': 'Modern checkers game',
    'menu.play_local': 'Play locally',
    'menu.play_ai': 'Play against AI',
    'menu.online': 'Play online',
    'menu.rules': 'Game rules',
    'menu.settings': 'Settings',
    'menu.shop': 'Shop',
  },
  ES: {
    // Configuración
    'settings.title': 'Configuración',
    'settings.subtitle': 'Personaliza tu experiencia de juego',
    'settings.game.title': 'Configuración del Juego',
    'settings.timer.label': 'Duración del temporizador',
    'settings.timer.description': 'Tiempo por turno en segundos',
    'settings.appearance.title': 'Apariencia',
    'settings.theme.label': 'Tema',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Oscuro',
    'settings.theme.system': 'Sistema',
    'settings.audio.title': 'Audio y Háptico',
    'settings.sounds.label': 'Efectos de sonido',
    'settings.sounds.description': 'Sonidos de juego e interacciones',
    'settings.music.label': 'Música de fondo',
    'settings.music.description': 'Ambiente musical',
    'settings.vibration.label': 'Vibraciones',
    'settings.vibration.description': 'Retroalimentación háptica',
    'settings.language.title': 'Idioma y Región',
    'settings.language.label': 'Idioma de la interfaz',
    'settings.language.fr': 'Français',
    'settings.language.en': 'English',
    'settings.language.es': 'Español',
    'settings.app.title': 'Aplicación',
    'settings.reset.label': 'Restablecer configuración',
    'settings.reset.description': 'Restaurar valores predeterminados',
    'settings.tutorials.label': 'Restablecer tutoriales',
    'settings.tutorials.description': 'Revisar instrucciones del juego',
    'settings.about.label': 'Acerca de',
    'settings.about.description': 'Información de la aplicación',
    'settings.version.label': 'Versión de la aplicación',
    'settings.version.description': 'Última actualización',
    'settings.platform.label': 'Plataforma',
    'settings.platform.description': 'Sistema operativo',
    'settings.back': 'Volver al menú',
    'settings.reset.confirm.title': 'Restablecer configuración',
    'settings.reset.confirm.message': '¿Estás seguro de que quieres restablecer toda la configuración a los valores predeterminados?',
    'settings.reset.confirm.cancel': 'Cancelar',
    'settings.reset.confirm.confirm': 'Restablecer',
    'settings.reset.success': 'La configuración ha sido restablecida',
    'settings.tutorials.success': 'Los tutoriales han sido restablecidos',
    'settings.about.title': 'Acerca de WheelCheckers',
    'settings.about.message': 'Versión 1.0.0\n\nUn juego de damas moderno y accesible.\n\nDesarrollado con React Native y Expo.',
    'settings.about.ok': 'OK',
    
    // Juego
    'game.turn': 'Turno',
    'game.timer': 'Tiempo',
    'game.pause': 'Pausa',
    'game.red': 'Rojo',
    'game.blue': 'Azul',
    'game.ai_thinking': 'La IA está pensando...',
    'game.pause.title': 'Juego Pausado',
    'game.pause.subtitle': '¿Qué te gustaría hacer?',
    'game.pause.resume': 'Continuar',
    'game.pause.new': 'Nuevo Juego',
    'game.pause.quit': 'Salir',
    'game.over.title': '¡Fin del Juego!',
    'game.over.winner': '¡El jugador {winner} ganó!',
    'game.over.new': 'Nuevo Juego',
    'game.over.quit': 'Volver al Menú',
    'game.punishment.message': '¡Pieza eliminada por no seguir la regla de captura!',
    
    // Menú
    'menu.title': 'WheelCheckers',
    'menu.subtitle': 'Juego de damas moderno',
    'menu.play_local': 'Jugar localmente',
    'menu.play_ai': 'Jugar contra IA',
    'menu.online': 'Jugar en línea',
    'menu.rules': 'Reglas del juego',
    'menu.settings': 'Configuración',
    'menu.shop': 'Tienda',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const getSystemLanguage = (): Language => {
  let locale = 'FR';
  
  if (Platform.OS === 'ios') {
    locale = NativeModules.SettingsManager?.settings?.AppleLocale || 
             NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 'FR';
  } else {
    locale = NativeModules.I18nManager?.localeIdentifier || 'FR';
  }
  
  // Extraire le code de langue (ex: 'fr-FR' -> 'FR')
  const langCode = locale.split('-')[0].toUpperCase();
  
  // Mapper vers nos langues supportées
  switch (langCode) {
    case 'EN':
      return 'EN';
    case 'ES':
      return 'ES';
    case 'FR':
    default:
      return 'FR';
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('FR');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage && ['FR', 'EN', 'ES'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      } else {
        // Utiliser la langue du système par défaut
        const systemLanguage = getSystemLanguage();
        setLanguageState(systemLanguage);
        await AsyncStorage.setItem('appLanguage', systemLanguage);
      }
    } catch (error) {
      console.log('Erreur lors du chargement de la langue:', error);
      setLanguageState('FR');
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem('appLanguage', newLanguage);
      console.log('Langue changée vers:', newLanguage);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde de la langue:', error);
    }
  };

  const t = (key: string, variables?: Record<string, string>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key;
    
    // Remplacer les variables dans la traduction
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        translation = translation.replace(`{${varKey}}`, varValue);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      isLoading
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
