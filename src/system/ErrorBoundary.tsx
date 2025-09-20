import React from 'react';
import { Alert } from 'react-native';
import { setSafeMode } from '../config/FeatureFlags';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  async componentDidCatch(error: any, info: any) {
    console.log('FATAL ERROR:', error, info);
    // Active SafeMode pour le prochain lancement
    await setSafeMode(true);
    Alert.alert('Problème détecté', "On va relancer l'app en mode sécurisé (sans pubs/achats/GC).");
  }

  render() {
    return this.props.children;
  }
}
