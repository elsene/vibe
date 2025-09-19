const { withInfoPlist } = require('@expo/config-plugins');

const withFirebase = (config) => {
  return withInfoPlist(config, (config) => {
    // Ajouter les configurations Firebase nécessaires
    config.modResults.FirebaseAppDelegateProxyEnabled = false;
    
    // S'assurer que le bundle identifier correspond
    if (!config.modResults.CFBundleIdentifier) {
      config.modResults.CFBundleIdentifier = 'com.elsene.wheelcheckers';
    }
    
    console.log('🔥 Firebase plugin: Configuration ajoutée');
    return config;
  });
};

module.exports = withFirebase;
