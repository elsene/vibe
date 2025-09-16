# 🎮 Game Center Setup - WheelCheckers

## Vue d'ensemble

Ce document décrit l'implémentation complète de Game Center pour WheelCheckers, permettant le multijoueur en ligne sur iOS uniquement.

## Architecture

### 1. Config Plugin (`plugins/withGameCenter.js`)
- Active Game Center capability dans `Info.plist`
- Configure l'Access Point Game Center
- Ajoute les permissions nécessaires

### 2. Bridge Natif iOS (`ios/GameCenterModule.swift`)
- Module Swift exposant GameKit à React Native
- Gestion de l'authentification, matchmaking, leaderboards
- Envoi/réception de données réseau
- Gestion des déconnexions et timeouts

### 3. Service JavaScript (`src/services/GameCenterService.ts`)
- Interface TypeScript pour Game Center
- Gestion des états et callbacks
- Système de ping/pong pour la latence
- File d'attente des messages

### 4. UI Integration (`screens/OnlineLobbyScreen.tsx`)
- Interface utilisateur pour le matchmaking
- Affichage du statut d'authentification
- Intégration avec le système Premium/Quota

### 5. Analytics (`src/analytics/gameCenterEvents.ts`)
- Tracking des événements Game Center
- Métriques de performance et erreurs

## Configuration App Store Connect

### Prérequis
1. **Compte développeur Apple** avec accès à App Store Connect
2. **App ID** configuré avec Game Center capability
3. **Certificats de développement** pour iOS

### Étapes App Store Connect

#### 1. Activer Game Center
```
App Store Connect > Votre App > Services > Game Center
- Activer Game Center
- Configurer les métadonnées
```

#### 2. Créer les Leaderboards
```
Game Center > Leaderboards > Créer
- ID: wheel.weekly_wins
  Nom: Victoires Hebdomadaires
  Type: Score (plus élevé = mieux)
  
- ID: wheel.elo  
  Nom: Classement ELO
  Type: Score (plus élevé = mieux)
```

#### 3. Créer les Achievements
```
Game Center > Achievements > Créer
- ID: first_win
  Nom: Première Victoire
  Description: Gagnez votre première partie en ligne
  
- ID: combo_3
  Nom: Combo Triple
  Description: Gagnez 3 parties consécutives
  
- ID: flawless
  Nom: Sans Faute
  Description: Gagnez une partie sans perdre de pion
```

#### 4. Configurer les Localisations
```
Pour chaque leaderboard/achievement:
- Français: Titre et description
- Anglais: Title and description
- Espagnol: Título y descripción
```

#### 5. Testeurs Sandbox
```
Game Center > Testers
- Ajouter des comptes de test
- Configurer les profils de test
```

## Configuration du Projet

### 1. Variables d'Environnement
```env
# .env
EXPO_PUBLIC_ADS_ENABLED=true
EXPO_PUBLIC_PAYWALL_ENABLED=true
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_revenuecat_ios_key_here
EXPO_PUBLIC_ADMOB_APP_ID=your_admob_app_id_here
```

### 2. Configuration Expo
```json
// app.json
{
  "expo": {
    "plugins": [
      "./plugins/withGameCenter"
    ]
  }
}
```

### 3. Build iOS
```bash
# Prérequis: EAS CLI installé
npm install -g @expo/eas-cli

# Configuration EAS
eas build:configure

# Build pour iOS
eas build --platform ios
```

## Flux Utilisateur

### 1. Authentification
```
Home > Online > Game Center
- Vérification automatique de l'authentification
- Si non connecté: bouton "Se connecter à Game Center"
- Affichage du nom du joueur si connecté
```

### 2. Matchmaking
```
Authentifié > "Trouver un adversaire"
- Vérification du quota Premium/Free
- Recherche de match via Game Center
- Affichage du statut de recherche
- Redirection vers le jeu si match trouvé
```

### 3. Pendant la Partie
```
Game Screen > Mode Online
- Envoi des mouvements via Game Center
- Réception des mouvements adversaire
- Gestion des déconnexions
- Synchronisation d'état si nécessaire
```

### 4. Fin de Partie
```
Game Over > Online
- Soumission des scores aux leaderboards
- Rapport des achievements
- Retour au lobby ou menu
```

## Messages Réseau

### Format des Messages
```typescript
interface NetworkMove {
  type: 'MOVE';
  move: {
    kind: 'step' | 'jump';
    from: string;    // Position source (ex: "a3")
    to: string;      // Position destination (ex: "b4")
    over?: string;   // Position capturée (pour les sauts)
    meta?: any;      // Métadonnées supplémentaires
  };
}

interface NetworkSync {
  type: 'SYNC';
  state: any;        // État complet du jeu
}

interface NetworkPing {
  type: 'PING' | 'PONG';
}
```

### Gestion des Déconnexions
- **Ping/Pong**: Toutes les 5 secondes
- **Timeout**: 10 secondes sans réponse
- **Reconnexion**: Non automatique (retour au lobby)

## Analytics

### Événements Trackés
```typescript
// Authentification
gc_auth_success, gc_auth_fail

// Matchmaking  
gc_match_found, gc_match_error, gc_match_cancel

// Réseau
gc_move_sent, gc_move_received, gc_sync_requested

// Déconnexions
gc_disconnect, gc_timeout, gc_quit

// Leaderboards/Achievements
gc_leaderboard_submit_ok, gc_achievement_ok

// Parties
gc_game_start, gc_game_end, gc_game_abandon

// Performance
gc_latency, gc_message_queue

// Erreurs
gc_error
```

## Tests QA

### Checklist iOS
- [ ] **Authentification Game Center**
  - [ ] Connexion réussie avec compte Apple ID
  - [ ] Affichage du nom du joueur
  - [ ] Gestion des erreurs d'authentification

- [ ] **Matchmaking**
  - [ ] Recherche de match fonctionnelle
  - [ ] Annulation de recherche
  - [ ] Gestion des erreurs de matchmaking

- [ ] **Partie en Ligne**
  - [ ] Envoi/réception des mouvements
  - [ ] Synchronisation d'état
  - [ ] Gestion des déconnexions
  - [ ] Timeout et reconnexion

- [ ] **Leaderboards**
  - [ ] Soumission des scores
  - [ ] Affichage des classements
  - [ ] Gestion des erreurs

- [ ] **Achievements**
  - [ ] Rapport des achievements
  - [ ] Déverrouillage automatique
  - [ ] Affichage des progrès

- [ ] **Premium/Quota**
  - [ ] Vérification du quota Free
  - [ ] Parties illimitées Premium
  - [ ] Affichage du paywall si quota dépassé

- [ ] **Performance**
  - [ ] Latence acceptable (< 200ms)
  - [ ] Pas de freeze de l'UI
  - [ ] Gestion mémoire correcte

### Tests sur Simulateur iOS
```bash
# Lancer le simulateur
npx expo run:ios

# Tester avec 2 simulateurs
# Simulateur 1: iPhone 15 Pro
# Simulateur 2: iPhone 15 Pro Max
```

### Tests sur Appareil Physique
```bash
# Build et installation
eas build --platform ios --profile development
# Installer via TestFlight ou développement
```

## Dépannage

### Erreurs Communes

#### 1. "Game Center non supporté"
```
Cause: Plateforme non-iOS
Solution: Vérifier Platform.OS === 'ios'
```

#### 2. "Authentification échouée"
```
Cause: Compte Apple ID non configuré
Solution: Configurer Game Center dans Réglages iOS
```

#### 3. "Aucun match trouvé"
```
Cause: Pas d'autres joueurs en ligne
Solution: Tester avec 2 appareils/simulateurs
```

#### 4. "Timeout de connexion"
```
Cause: Latence réseau élevée
Solution: Vérifier la connexion internet
```

#### 5. "Erreur native module"
```
Cause: Module natif non compilé
Solution: Rebuild avec EAS Build
```

### Logs de Debug
```bash
# Activer les logs détaillés
npx expo start --dev-client

# Vérifier les logs Game Center
# Console: Rechercher "🎮 GameCenter"
```

## Roadmap Future

### Phase 2: Améliorations
- [ ] **Chat en jeu** (messages texte)
- [ ] **Spectateurs** (parties observables)
- [ ] **Tournois** (brackets automatiques)
- [ ] **Amis** (invitations directes)

### Phase 3: Avancé
- [ ] **Replay système** (enregistrement des parties)
- [ ] **Statistiques avancées** (graphiques de performance)
- [ ] **Saisons** (classements temporaires)
- [ ] **Récompenses** (récompenses saisonnières)

## Support

Pour toute question ou problème:
1. Vérifier les logs de debug
2. Consulter la documentation Apple Game Center
3. Tester sur appareil physique si possible
4. Vérifier la configuration App Store Connect

---

**Note**: Cette implémentation est spécifique à iOS et Game Center. Pour Android, une solution alternative (Firebase, Play Games) serait nécessaire.
