import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface GameSettings {
  difficulty: 'easy' | 'mid' | 'hard';
  timerDuration: number;
  showHints: boolean;
  autoPromote: boolean;
  soundEffects: boolean;
  backgroundMusic: boolean;
  vibration: boolean;
  animations: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'FR' | 'EN' | 'ES';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

const defaultSettings: GameSettings = {
  difficulty: 'mid',
  timerDuration: 14,
  showHints: true,
  autoPromote: true,
  soundEffects: true,
  backgroundMusic: false,
  vibration: true,
  animations: true,
  theme: 'system',
  language: 'FR',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
};

interface SettingsContextType {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('gameSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.log('Erreur lors du chargement des paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<GameSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('gameSettings', JSON.stringify(updatedSettings));
      console.log('Paramètres sauvegardés:', updatedSettings);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem('gameSettings', JSON.stringify(defaultSettings));
      console.log('Paramètres réinitialisés');
    } catch (error) {
      console.log('Erreur lors de la réinitialisation des paramètres:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      resetSettings,
      isLoading
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
