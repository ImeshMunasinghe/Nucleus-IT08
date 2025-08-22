import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type MainMenuNavigationProp = StackNavigationProp<RootStackParamList, 'MainMenu'>;
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MainMenuScreen = () => {
  const navigation = useNavigation<MainMenuNavigationProp>();

  const handleGameMode = () => {
    navigation.navigate('GameMode');
  };

  const handlePlayMode = () => {
    navigation.navigate('PlayMode');
  };

  const handleExit = () => {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient}>
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.minionEye}>
            <View style={styles.eyeball} />
          </View>
        </View>
        <Text style={styles.title}>MinionBot</Text>
        <Text style={styles.subtitle}>Controller</Text>
      </View>

      {/* Main Menu Buttons */}
      <View style={styles.menuContainer}>
        {/* Game Mode Button */}
        <TouchableOpacity style={styles.menuButton} onPress={handleGameMode}>
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="game-controller" size={40} color="#1E3A8A" />
            </View>
            <Text style={styles.buttonTitle}>Game Mode</Text>
            <Text style={styles.buttonSubtitle}>Voice Commands & Fun</Text>
          </View>
          <View style={styles.buttonArrow}>
            <Ionicons name="chevron-forward" size={24} color="#1E3A8A" />
          </View>
        </TouchableOpacity>

        {/* Play Mode Button */}
        <TouchableOpacity style={styles.menuButton} onPress={handlePlayMode}>
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="play-circle" size={40} color="#1E3A8A" />
            </View>
            <Text style={styles.buttonTitle}>Play Mode</Text>
            <Text style={styles.buttonSubtitle}>Manual Control & Video</Text>
          </View>
          <View style={styles.buttonArrow}>
            <Ionicons name="chevron-forward" size={24} color="#1E3A8A" />
          </View>
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity 
          style={[styles.menuButton, styles.settingsButton]} 
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="settings" size={30} color="#1E3A8A" />
            </View>
            <Text style={styles.buttonTitle}>Settings</Text>
            <Text style={styles.buttonSubtitle}>Configure App</Text>
          </View>
          <View style={styles.buttonArrow}>
            <Ionicons name="chevron-forward" size={24} color="#1E3A8A" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Exit Button */}
      <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
        <Ionicons name="exit-outline" size={24} color="#DC2626" />
        <Text style={styles.exitText}>Exit</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for Kids</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topCircle: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: height * 0.05,
  },
  logoContainer: {
    marginBottom: 20,
  },
  minionEye: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  eyeball: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E3A8A',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#1E3A8A',
    opacity: 0.8,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  menuButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonArrow: {
    marginLeft: 10,
  },
  settingsButton: {
    backgroundColor: '#FEF3C7',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginHorizontal: 30,
    marginBottom: 20,
  },
  exitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#1E3A8A',
    opacity: 0.7,
  },
});

export default MainMenuScreen;
