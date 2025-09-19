import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useOnlineLimits } from '../src/hooks/useOnlineLimits';
import { PaywallModal } from '../src/monetization/PaywallModal';
import { usePremium } from '../src/monetization/PremiumProvider';
import gameCenterService, { GameCenterAuthResult, GameCenterMatchResult, GameCenterServiceState } from '../src/services/GameCenterService';

const { width: W, height: H } = Dimensions.get('window');

export default function OnlineLobbyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const { canPlayOnlineUnlimited, weeklyOnlineLimit } = useOnlineLimits();
  const [paywallVisible, setPaywallVisible] = useState(false);
  
  // Détecter le mode développement (Expo Go) - plus robuste
  const isDevelopmentMode = __DEV__ || Platform.OS === 'web';
  
  // En mode développement (Expo Go), afficher un message d'information
  if (isDevelopmentMode) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              🎮 Mode En Ligne
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Mode Développement - Game Center Simulé
            </Text>
          </View>
          
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              ℹ️ Information
            </Text>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Le mode multijoueur en ligne nécessite un build EAS avec Game Center activé.{'\n\n'}
              En mode développement (Expo Go), Game Center est simulé.
            </Text>
          </View>
          
          <Pressable
            style={[styles.backButton, { backgroundColor: colors.accent }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.background }]}>
              ← Retour au Menu
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }
  
  // États Game Center
  const [gameCenterState, setGameCenterState] = useState<GameCenterServiceState>(GameCenterServiceState.IDLE);
  const [authResult, setAuthResult] = useState<GameCenterAuthResult | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<GameCenterMatchResult | null>(null);

  useEffect(() => {
    // Configuration des callbacks Game Center
    gameCenterService.setOnStateChange((state) => {
      setGameCenterState(state);
      console.log('🎮 OnlineLobby: État Game Center changé', state);
    });

    gameCenterService.setOnError((error) => {
      console.error('🎮 OnlineLobby: Erreur Game Center', error);
      Alert.alert('Erreur Game Center', error.msg);
      setIsAuthenticating(false);
      setIsFindingMatch(false);
    });

    gameCenterService.setOnMatchEnded(() => {
      console.log('🎮 OnlineLobby: Match terminé');
      setCurrentMatch(null);
      setIsFindingMatch(false);
    });

    // Vérifier l'authentification au chargement
    checkAuthentication();

    return () => {
      gameCenterService.disconnect();
    };
  }, []);

  const checkAuthentication = async () => {
    if (Platform.OS !== 'ios') return;
    
    try {
      setIsAuthenticating(true);
      const result = await gameCenterService.authenticate();
      setAuthResult(result);
      console.log('🎮 OnlineLobby: Authentification vérifiée', result);
    } catch (error) {
      console.error('🎮 OnlineLobby: Erreur authentification', error);
      setAuthResult({ authenticated: false });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFindMatch = async () => {
    // Vérifier Premium/Quota avant matchmaking
    if (!canPlayOnlineUnlimited) {
      // TODO: Implémenter le compteur de parties hebdomadaires
      setPaywallVisible(true);
      return;
    }

    if (!authResult?.authenticated) {
      Alert.alert('Erreur', 'Vous devez être connecté à Game Center pour jouer en ligne');
      return;
    }

    try {
      setIsFindingMatch(true);
      const match = await currentGameCenterService.findMatch({
        minPlayers: 2,
        maxPlayers: 2,
        inviteMessage: 'Voulez-vous jouer à WheelCheckers ?'
      });
      
      setCurrentMatch(match);
      console.log('🎮 OnlineLobby: Match trouvé', match);
      
      // Rediriger vers le jeu
      router.push(`/game?mode=online&matchId=${match.matchId}&isHost=${match.isHost}`);
    } catch (error) {
      console.error('🎮 OnlineLobby: Erreur matchmaking', error);
      Alert.alert('Erreur', 'Impossible de trouver un adversaire. Veuillez réessayer.');
    } finally {
      setIsFindingMatch(false);
    }
  };

  const handleCancelMatchmaking = () => {
    currentGameCenterService.disconnect();
    setIsFindingMatch(false);
    setCurrentMatch(null);
  };

  const handleShowLeaderboards = () => {
    currentGameCenterService.showDashboard();
  };

  // Utiliser Game Center réel sur iOS EAS Build
  const currentGameCenterService = gameCenterService;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            🎮 Mode En Ligne
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isDevelopmentMode ? 'Mode Développement - Game Center Simulé' : 'Jouez contre des joueurs du monde entier'}
          </Text>
        </View>

        {/* État d'authentification */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              🔐 Authentification
            </Text>
            {isAuthenticating && <ActivityIndicator size="small" color={colors.accent} />}
          </View>
          
          {authResult ? (
            <View style={styles.statusContent}>
              <Text style={[styles.statusText, { color: authResult.authenticated ? '#22c55e' : '#ef4444' }]}>
                {authResult.authenticated ? '✅ Connecté' : '❌ Non connecté'}
              </Text>
              {authResult.authenticated && authResult.alias && (
                <Text style={[styles.playerName, { color: colors.textSecondary }]}>
                  Joueur: {authResult.alias}
                </Text>
              )}
            </View>
          ) : (
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              Vérification en cours...
            </Text>
          )}
        </View>

        {/* Quota/Premium */}
        <View style={[styles.quotaCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.quotaTitle, { color: colors.text }]}>
            📊 Parties Disponibles
          </Text>
          <Text style={[styles.quotaText, { color: colors.textSecondary }]}>
            {isPremium ? '✅ Parties illimitées (Premium)' : `${remaining} parties restantes cette semaine`}
          </Text>
          <Text style={[styles.quotaText, { color: colors.textSecondary }]}>
            Parties jouées: {count}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!authResult?.authenticated ? (
            <Pressable 
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
              onPress={checkAuthentication}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Text style={[styles.actionButtonText, { color: colors.surface }]}>
                  🔐 Se connecter à Game Center
                </Text>
              )}
            </Pressable>
          ) : isFindingMatch ? (
            <View style={[styles.searchingCard, { backgroundColor: colors.surface }]}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.searchingText, { color: colors.text }]}>
                🔍 Recherche d'un adversaire...
              </Text>
              <Pressable 
                style={[styles.cancelButton, { backgroundColor: colors.error }]}
                onPress={handleCancelMatchmaking}
              >
                <Text style={[styles.cancelButtonText, { color: colors.surface }]}>
                  Annuler
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Pressable 
                style={[styles.actionButton, { backgroundColor: colors.accent }]}
                onPress={handleFindMatch}
              >
                <Text style={[styles.actionButtonText, { color: colors.surface }]}>
                  🎮 Trouver un adversaire
                </Text>
              </Pressable>

              <Pressable 
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleShowLeaderboards}
              >
                <Text style={[styles.actionButtonText, { color: colors.surface }]}>
                  🏆 Classements
                </Text>
              </Pressable>
            </>
          )}

          <Pressable 
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.surface }]}>
              🏠 Retour au menu
            </Text>
          </Pressable>
        </View>
      </View>

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: Math.max(28, W * 0.07),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Math.max(16, W * 0.04),
    textAlign: 'center',
  },
  statusCard: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F5DEB3',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
  },
  statusContent: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
    marginBottom: 5,
  },
  playerName: {
    fontSize: Math.max(14, W * 0.035),
  },
  quotaCard: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F5DEB3',
    alignItems: 'center',
  },
  quotaTitle: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    marginBottom: 10,
  },
  quotaText: {
    fontSize: Math.max(14, W * 0.035),
    marginBottom: 5,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '700',
  },
  searchingCard: {
    width: '100%',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5DEB3',
    marginBottom: 15,
  },
  searchingText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: Math.max(14, W * 0.035),
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  backButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorCard: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Math.max(16, W * 0.04),
    textAlign: 'center',
    lineHeight: 24,
  },
});
