const { withDangerousMod } = require('@expo/config-plugins');
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

function withFirebasePods(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const { platformProjectRoot } = config;
      const podfilePath = resolve(platformProjectRoot, 'Podfile');
      
      try {
        let podfileContent = readFileSync(podfilePath, 'utf8');
        
        // Ajouter use_modular_headers! si pas déjà présent
        if (!podfileContent.includes('use_modular_headers!')) {
          // Trouver la ligne avec use_frameworks! et ajouter use_modular_headers! après
          if (podfileContent.includes('use_frameworks!')) {
            podfileContent = podfileContent.replace(
              'use_frameworks!',
              'use_frameworks!\nuse_modular_headers!'
            );
          } else {
            // Ajouter au début du fichier si use_frameworks! n'existe pas
            podfileContent = 'use_modular_headers!\n' + podfileContent;
          }
          
          writeFileSync(podfilePath, podfileContent);
          console.log('✅ Firebase: use_modular_headers! ajouté au Podfile');
        } else {
          console.log('✅ Firebase: use_modular_headers! déjà présent dans le Podfile');
        }
      } catch (error) {
        console.warn('⚠️ Firebase: Impossible de modifier le Podfile:', error.message);
      }
      
      return config;
    },
  ]);
}

module.exports = withFirebasePods;
