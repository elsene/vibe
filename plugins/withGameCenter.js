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

    console.log('✅ Game Center config plugin appliqué');
    return config;
  });
};

module.exports = withGameCenter;
