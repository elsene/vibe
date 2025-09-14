import { Slot } from 'expo-router';
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}