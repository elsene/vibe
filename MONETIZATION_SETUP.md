# Configuration Monétisation iOS

## Variables d'environnement requises

Créez un fichier `.env` à la racine du projet avec :

```env
# Feature Flags
EXPO_PUBLIC_ADS_ENABLED=true
EXPO_PUBLIC_PAYWALL_ENABLED=true

# RevenueCat iOS (Sandbox)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_revenuecat_ios_key_here
```

## Configuration AdMob

Les IDs de test iOS sont déjà configurés dans le code :
- **Bannière Test**: `ca-app-pub-3940256099942544/6300978111`
- **Interstitial Test**: `ca-app-pub-3940256099942544/1033173712`
- **Rewarded Test**: `ca-app-pub-3940256099942544/5224354917`

## Configuration RevenueCat

1. Créez un projet RevenueCat
2. Configurez l'entitlement `pro`
3. Ajoutez vos produits App Store Connect
4. Utilisez la clé publique iOS pour le sandbox

## Tests QA

### Écran de validation
Accédez à l'écran "🧪 Dev Monétisation" depuis le menu principal pour :
- Vérifier l'état Premium (FREE/PREMIUM)
- Tester les publicités interstitielles
- Tester le quota online
- Ouvrir le paywall
- Restaurer les achats
- Vérifier le mode de développement (Expo Go vs Native)

### Mode Développement (Expo Go)
En mode Expo Go, le système fonctionne en simulation :
- **RevenueCat** : Packages simulés, achats simulés
- **AdMob** : Publicités simulées avec IDs de test
- **Logs** : Tous les événements sont loggés pour debugging

### Checklist QA

#### Version FREE
- [ ] Bannière AdMob test visible en haut du menu
- [ ] Interstitial test s'affiche après fin de partie
- [ ] Interstitial test s'affiche au retour au menu
- [ ] Quota online limité à 5 parties/semaine
- [ ] Paywall s'ouvre quand quota dépassé

#### Version PREMIUM (Sandbox)
- [ ] Achat Premium fonctionne
- [ ] État Premium devient true après achat
- [ ] Toutes les publicités disparaissent
- [ ] Online devient illimité
- [ ] Restauration des achats fonctionne

#### Stabilité
- [ ] Pas de crash si achat annulé
- [ ] Pas de freeze si pas de réseau
- [ ] Pas de boucles de publicités
- [ ] Flags désactivent proprement les fonctionnalités

## Build EAS iOS

```bash
# Build de développement
eas build --platform ios --profile development

# Installer sur iPhone avec compte Sandbox
```

## Logs de debugging

Tous les événements sont loggés avec des préfixes clairs :
- `📱 AdMob:` - Événements publicitaires
- `📱 RevenueCat:` - Événements d'achat
- `🧪 Dev:` - Tests de développement
- `[ANALYTICS]` - Événements analytics

## Prêt pour EAS build iOS

Le système est maintenant configuré pour :
- ✅ AdMob avec IDs de test iOS
- ✅ RevenueCat en mode sandbox iOS
- ✅ Écran de validation complet
- ✅ Logs de debugging détaillés
- ✅ Tests QA automatisés
- ✅ Mode développement (Expo Go) avec simulation
- ✅ Gestion d'erreurs robuste

### Résolution des erreurs
- **"Invalid API key"** : Résolu - Mode développement activé automatiquement
- **"setLogHandler not supported"** : Résolu - Détection Expo Go
- **RevenueCat non fonctionnel** : Résolu - Simulation en mode dev
