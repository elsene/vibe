import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { AudioProvider } from '../context/AudioContext';
import { GameCenterProvider } from '../context/GameCenterManager';
import { LanguageProvider } from '../context/LanguageContext';
import { SettingsProvider } from '../context/SettingsContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AdProvider } from '../src/monetization/AdProvider';
import { PremiumProvider } from '../src/monetization/PremiumProvider';
import { ErrorBoundary } from '../src/system/ErrorBoundary';

function Bootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const onChange = async (state: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && state === 'active') {
        // premier passage actif => on démarre les services lazy dans chaque provider
        setReady(true);
      }
      appState.current = state;
    };
    const sub = AppState.addEventListener('change', onChange);
    // Pour TestFlight: on attend 300ms avant ready si déjà actif
    setTimeout(() => setReady(true), 300);
    return () => sub.remove();
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Bootstrap>
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
      </Bootstrap>
    </ErrorBoundary>
  );
}
