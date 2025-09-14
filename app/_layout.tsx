import { Stack } from 'expo-router';
import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="consent" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="game" />
        <Stack.Screen name="rules" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="online" />
        <Stack.Screen 
          name="difficulty-picker" 
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
