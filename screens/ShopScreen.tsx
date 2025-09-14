import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

const products = [
  {
    id: 'no_ads',
    title: '🚫 Pas de Publicité',
    description: 'Profitez d\'une expérience de jeu sans interruption publicitaire',
    price: '€2.99',
    originalPrice: '€4.99',
    discount: '40%',
    features: [
      '✅ Suppression de toutes les publicités',
      '✅ Expérience de jeu fluide',
      '✅ Support du développement',
      '✅ Achat unique, valable à vie'
    ],
    popular: true
  },
  {
    id: 'premium',
    title: '👑 Version Premium',
    description: 'Débloquez toutes les fonctionnalités avancées',
    price: '€5.99',
    originalPrice: '€9.99',
    discount: '40%',
    features: [
      '✅ Pas de publicité',
      '✅ Thèmes exclusifs',
      '✅ Statistiques détaillées',
      '✅ Mode hors ligne avancé',
      '✅ Support prioritaire'
    ],
    popular: false
  }
];

export default function ShopScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [adsDisabled, setAdsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseInProgress, setPurchaseInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadPurchaseStatus();
  }, []);

  const loadPurchaseStatus = async () => {
    try {
      const ads = await AsyncStorage.getItem('adsDisabled');
      if (ads === 'true') {
        setAdsDisabled(true);
      }
    } catch (error) {
      console.log('Erreur lors du chargement du statut d\'achat:', error);
    }
  };

  const handlePurchase = async (productId: string) => {
    setPurchaseInProgress(productId);
    setIsLoading(true);
    
    try {
      // Simulation d'un achat in-app
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (productId === 'no_ads' || productId === 'premium') {
        await AsyncStorage.setItem('adsDisabled', 'true');
        setAdsDisabled(true);
        // TODO: Afficher un toast de succès
      }
      
      // TODO: Intégrer avec un vrai système d'achat in-app
      console.log(`Achat simulé pour: ${productId}`);
      
    } catch (error) {
      console.log('Erreur lors de l\'achat:', error);
      // TODO: Afficher un toast d'erreur
    } finally {
      setIsLoading(false);
      setPurchaseInProgress(null);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    
    try {
      // Simulation de restauration d'achats
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ads = await AsyncStorage.getItem('adsDisabled');
      if (ads === 'true') {
        setAdsDisabled(true);
        // TODO: Afficher un toast de succès
      } else {
        // TODO: Afficher un toast "Aucun achat à restaurer"
      }
      
    } catch (error) {
      console.log('Erreur lors de la restauration:', error);
      // TODO: Afficher un toast d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const renderProduct = (product: any) => {
    const isPurchased = product.id === 'no_ads' && adsDisabled;
    const isPurchasing = purchaseInProgress === product.id;

    return (
      <View key={product.id} style={[styles.productCard, { backgroundColor: colors.surface }]}>
        {product.popular && (
          <View style={[styles.popularBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.popularText, { color: colors.surface }]}>
              ⭐ Populaire
            </Text>
          </View>
        )}
        
        <View style={styles.productHeader}>
          <Text style={[styles.productTitle, { color: colors.text }]}>
            {product.title}
          </Text>
          <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
            {product.description}
          </Text>
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.accent }]}>
              {product.price}
            </Text>
            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
              {product.originalPrice}
            </Text>
          </View>
          <View style={[styles.discountBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.discountText, { color: colors.surface }]}>
              -{product.discount}
            </Text>
          </View>
        </View>

        <View style={styles.featuresList}>
          {product.features.map((feature: string, index: number) => (
            <Text key={index} style={[styles.featureText, { color: colors.textSecondary }]}>
              {feature}
            </Text>
          ))}
        </View>

        {isPurchased ? (
          <View style={[styles.purchasedBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.purchasedText, { color: colors.surface }]}>
              ✅ Déjà acheté
            </Text>
          </View>
        ) : (
          <Pressable
            style={[
              styles.purchaseButton,
              { backgroundColor: colors.primary },
              isPurchasing && { opacity: 0.7 }
            ]}
            onPress={() => handlePurchase(product.id)}
            disabled={isLoading}
          >
            <Text style={[styles.purchaseButtonText, { color: colors.surface }]}>
              {isPurchasing ? '🔄 Achat en cours...' : '💳 Acheter'}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          🛒 Boutique
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Améliorez votre expérience de jeu
        </Text>
      </View>

      <View style={styles.content}>
        {products.map(renderProduct)}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.restoreButton, { borderColor: colors.accent }]}
          onPress={handleRestore}
          disabled={isLoading}
        >
          <Text style={[styles.restoreButtonText, { color: colors.accent }]}>
            {isLoading ? '🔄 Restauration...' : '🔄 Restaurer achats'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.closeButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.closeButtonText, { color: colors.surface }]}>
            ✕ Fermer
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: Math.max(32, W * 0.08),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: Math.max(18, W * 0.045),
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: 20,
  },
  productCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F5DEB3',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  popularText: {
    fontSize: Math.max(12, W * 0.03),
    fontWeight: '700',
  },
  productHeader: {
    marginBottom: 15,
  },
  productTitle: {
    fontSize: Math.max(24, W * 0.06),
    fontWeight: '800',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: Math.max(16, W * 0.04),
    lineHeight: 22,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  price: {
    fontSize: Math.max(28, W * 0.07),
    fontWeight: '900',
  },
  originalPrice: {
    fontSize: Math.max(18, W * 0.045),
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  discountText: {
    fontSize: Math.max(14, W * 0.035),
    fontWeight: '700',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureText: {
    fontSize: Math.max(14, W * 0.035),
    marginBottom: 8,
    lineHeight: 20,
  },
  purchasedBadge: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  purchasedText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '700',
  },
  purchaseButton: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  purchaseButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    marginTop: 30,
    gap: 15,
  },
  restoreButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  closeButtonText: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    letterSpacing: 1,
  },
});
