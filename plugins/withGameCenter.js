const { withInfoPlist } = require('@expo/config-plugins');

const withGameCenter = (config) => {
  return withInfoPlist(config, (config) => {
    // Activer Game Center capability
    if (!config.modResults.GameCenter) {
      config.modResults.GameCenter = true;
    }

    // Ajouter les permissions Game Center
    if (!config.modResults.NSGameCenterUsageDescription) {
      config.modResults.NSGameCenterUsageDescription = 'Cette application utilise Game Center pour le multijoueur en ligne et les classements.';
    }

    // Configurer l'Access Point Game Center (position bord écran)
    if (!config.modResults.GKGameCenterAccessPointPosition) {
      config.modResults.GKGameCenterAccessPointPosition = 'topLeading';
    }

    // Ajouter les frameworks Game Center
    if (!config.modResults.UIRequiredDeviceCapabilities) {
      config.modResults.UIRequiredDeviceCapabilities = [];
    }
    
    if (!config.modResults.UIRequiredDeviceCapabilities.includes('gamekit')) {
      config.modResults.UIRequiredDeviceCapabilities.push('gamekit');
    }

    console.log('✅ Game Center config plugin appliqué');
    return config;
  });
};

module.exports = withGameCenter;
