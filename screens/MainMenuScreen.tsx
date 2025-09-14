import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

const menuOptions = [
  {
    id: 'play_2p',
    title: '🎮 Jouer à 2',
    description: 'Affrontez un ami en local',
    icon: '👥',
    action: 'play_2p'
  },
  {
    id: 'play_ai',
    title: '🤖 Jouer vs IA',
    description: 'Défiez l\'ordinateur',
    icon: '🧠',
    action: 'play_ai'
  },
  {
    id: 'play_online',
    title: '🌐 Jouer en ligne',
    description: 'Parties multijoueur (bientôt)',
    icon: '🌍',
    action: 'play_online',
    comingSoon: true
  },
  {
    id: 'rules',
    title: '📖 Règles',
    description: 'Apprenez à jouer',
    icon: '📚',
    action: 'rules'
  },
  {
    id: 'shop',
    title: '🛒 Boutique',
    description: 'Supprimer les publicités',
    icon: '💎',
    action: 'shop'
  }
];

export default function MainMenuScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleMenuAction = async (action: string) => {
    switch (action) {
      case 'play_2p':
        router.push('/game?mode=local&difficulty=mid&adsDisabled=false');
        break;
      case 'play_ai':
        router.push('/difficulty-picker');
        break;
      case 'play_online':
        router.push('/online');
        break;
      case 'rules':
        router.push('/rules');
        break;
      case 'shop':
        router.push('/shop');
        break;
      default:
        console.log('Action non reconnue:', action);
    }
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleAbout = () => {
    console.log('À propos');
    // TODO: Implémenter la modal "À propos"
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                Joueur
              </Text>
              <Text style={[styles.userLevel, { color: colors.accent }]}>
                Niveau 1
              </Text>
            </View>
            
            <Pressable 
              style={styles.settingsButton}
              onPress={handleSettings}
            >
              <Text style={[styles.settingsIcon, { color: colors.text }]}>
                ⚙️
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.gameTitle, { color: colors.accent }]}>
            WHEEL CHECKERS
          </Text>
          <Text style={[styles.gameSubtitle, { color: colors.textSecondary }]}>
            Jeu de Dames Moderne
          </Text>
        </View>

        <View style={styles.menuSection}>
          {menuOptions.map((option) => (
            <Pressable
              key={option.id}
              style={[
                styles.menuOption,
                { backgroundColor: colors.surface },
                option.comingSoon && { opacity: 0.7 }
              ]}
              onPress={() => handleMenuAction(option.action)}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.iconText}>{option.icon}</Text>
              </View>
              
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
              
              {option.comingSoon && (
                <View style={[styles.comingSoonBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.comingSoonText, { color: colors.surface }]}>
                    Bientôt
                  </Text>
                </View>
              )}
              
              <Text style={[styles.arrowIcon, { color: colors.textSecondary }]}>
                ➜
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable onPress={handleAbout}>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              Version 1.0.0
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F5DEB3',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  avatarText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    marginBottom: 2,
  },
  userLevel: {
    fontSize: Math.max(14, W * 0.035),
    fontWeight: '600',
  },
  settingsButton: {
    padding: 10,
  },
  settingsIcon: {
    fontSize: 24,
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  gameTitle: {
    fontSize: Math.max(32, W * 0.08),
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 5,
  },
  gameSubtitle: {
    fontSize: Math.max(16, W * 0.04),
    fontWeight: '500',
  },
  menuSection: {
    padding: 20,
    gap: 15,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F5DEB3',
    position: 'relative',
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5DEB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Math.max(18, W * 0.045),
    fontWeight: '700',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: Math.max(14, W * 0.035),
    lineHeight: 20,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: Math.max(10, W * 0.025),
    fontWeight: '700',
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: Math.max(14, W * 0.035),
    fontWeight: '500',
  },
});
