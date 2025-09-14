import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors | typeof darkColors;
}

const lightColors = {
  primary: '#228B22',
  secondary: '#DC143C',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  accent: '#FFD700',
  error: '#FF0000',
  success: '#00FF00',
  wood: '#8B4513',
  woodLight: '#F5DEB3',
  woodDark: '#654321',
  redPiece: '#DC143C',
  bluePiece: '#4169E1',
  redQueen: '#FFD700',
  blueQueen: '#00CED1',
};

const darkColors = {
  primary: '#1B4D1B',
  secondary: '#B22222',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: '#333333',
  accent: '#FFD700',
  error: '#FF6B6B',
  success: '#4CAF50',
  wood: '#654321',
  woodLight: '#8B7355',
  woodDark: '#3E2723',
  redPiece: '#B22222',
  bluePiece: '#0000CD',
  redQueen: '#FFA500',
  blueQueen: '#20B2AA',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    const systemTheme = 'dark'; // Pour l'instant, on force le thème sombre
    const shouldBeDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
    setIsDark(shouldBeDark);
  }, [theme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
