import * as Sentry from '@sentry/react-native';
import { Slot } from 'expo-router';
import React from 'react';
import { PremiumProvider } from './src/state/PremiumContext';

Sentry.init({
  dsn: 'https://20d6f815e5f85f8037207e6ddcf5aa93@o4510036272021504.ingest.de.sentry.io/4510036275822672',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
 // sendDefaultPii: true,

  // Configure Session Replay
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1,
  // integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function App() {
  return (
    <PremiumProvider>
      <Slot />
    </PremiumProvider>
      );
});