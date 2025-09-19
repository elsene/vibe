import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';

class FirebaseService {
  private isInitialized = false;

  async initialize() {
    try {
      // Vérifier si nous sommes en mode développement (Expo Go)
      const isExpoGo = __DEV__ || Platform.OS === 'web';
      
      if (isExpoGo) {
        console.log('🔥 Firebase: Mode Expo Go détecté - Firebase désactivé');
        return;
      }

      if (Platform.OS === 'ios') {
        // Initialiser Firebase pour iOS (EAS Build uniquement)
        console.log('🔥 Firebase: Initialisation...');
        
        // Vérifier que les modules sont disponibles
        if (!crashlytics || !analytics) {
          console.log('🔥 Firebase: Modules non disponibles - mode développement');
          return;
        }
        
        // Configurer Crashlytics
        await crashlytics().setCrashlyticsCollectionEnabled(true);
        console.log('🔥 Firebase: Crashlytics activé');
        
        // Configurer Analytics
        await analytics().setAnalyticsCollectionEnabled(true);
        console.log('🔥 Firebase: Analytics activé');
        
        this.isInitialized = true;
        console.log('✅ Firebase: Initialisé avec succès');
      } else {
        console.log('🔥 Firebase: Non supporté sur cette plateforme');
      }
    } catch (error) {
      console.error('❌ Firebase: Erreur d\'initialisation:', error);
      // En cas d'erreur, continuer sans Firebase
      this.isInitialized = false;
    }
  }

  // MARK: - Crashlytics

  logError(error: Error, context?: string) {
    if (!this.isInitialized) return;
    
    try {
      console.error('🔥 Firebase: Logging error:', error.message);
      
      if (context) {
        crashlytics().setAttribute('context', context);
      }
      
      crashlytics().recordError(error);
    } catch (e) {
      console.error('❌ Firebase: Erreur lors du logging:', e);
    }
  }

  setUserProperty(key: string, value: string) {
    if (!this.isInitialized) return;
    
    try {
      crashlytics().setAttribute(key, value);
    } catch (e) {
      console.error('❌ Firebase: Erreur setUserProperty:', e);
    }
  }

  setUserId(userId: string) {
    if (!this.isInitialized) return;
    
    try {
      crashlytics().setUserId(userId);
    } catch (e) {
      console.error('❌ Firebase: Erreur setUserId:', e);
    }
  }

  // MARK: - Analytics

  logEvent(eventName: string, parameters?: { [key: string]: any }) {
    if (!this.isInitialized) return;
    
    try {
      console.log('📊 Firebase Analytics:', eventName, parameters);
      analytics().logEvent(eventName, parameters);
    } catch (e) {
      console.error('❌ Firebase: Erreur logEvent:', e);
    }
  }

  setUserPropertyAnalytics(key: string, value: string) {
    if (!this.isInitialized) return;
    
    try {
      analytics().setUserProperty(key, value);
    } catch (e) {
      console.error('❌ Firebase: Erreur setUserPropertyAnalytics:', e);
    }
  }

  // MARK: - Logs personnalisés

  logGameEvent(event: string, data?: any) {
    this.logEvent('game_event', {
      event_type: event,
      ...data,
      platform: Platform.OS,
      timestamp: new Date().toISOString()
    });
  }

  logMonetizationEvent(event: string, data?: any) {
    this.logEvent('monetization_event', {
      event_type: event,
      ...data,
      platform: Platform.OS,
      timestamp: new Date().toISOString()
    });
  }

  logGameCenterEvent(event: string, data?: any) {
    this.logEvent('gamecenter_event', {
      event_type: event,
      ...data,
      platform: Platform.OS,
      timestamp: new Date().toISOString()
    });
  }
}

export default new FirebaseService();
