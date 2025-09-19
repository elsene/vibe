import { Stack } from 'expo-router';
import React from 'react';
import { AudioProvider } from '../context/AudioContext';
import { GameCenterProvider } from '../context/GameCenterManager';
import { LanguageProvider } from '../context/LanguageContext';
import { SettingsProvider } from '../context/SettingsContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AdProvider } from '../src/monetization/AdProvider';
import { PremiumProvider } from '../src/monetization/PremiumProvider';

export default function RootLayout() {

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
          <PremiumProvider>
            <GameCenterProvider>
              <AdProvider>
                <AudioProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      gestureEnabled: false,
                    }}
                  >
            <Stack.Screen name="index" />
            <Stack.Screen name="consent" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="menu" />
            <Stack.Screen name="game" />
            <Stack.Screen name="rules" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="shop" />
            <Stack.Screen name="online" />
            <Stack.Screen name="dev-monetization" />
            <Stack.Screen 
              name="difficulty-picker" 
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
                  </Stack>
                </AudioProvider>
              </AdProvider>
            </GameCenterProvider>
          </PremiumProvider>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
