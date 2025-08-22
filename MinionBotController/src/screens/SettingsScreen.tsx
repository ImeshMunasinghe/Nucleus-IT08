import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { StorageService, UserSettings } from '../services/StorageService';

type SettingsNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const [settings, setSettings] = useState<UserSettings>({
    bluetoothEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    autoConnect: false,
    defaultVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    gameMode: 'AUTO',
    motorSpeed: 75,
  });
  const [loading, setLoading] = useState(true);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await StorageService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const success = await StorageService.saveSettings(settings);
      if (success) {
        Alert.alert('Settings Saved', 'Your settings have been updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

    const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await StorageService.resetSettings();
              if (success) {
                await loadSettings(); // Reload settings from storage
                Alert.alert('Settings Reset', 'All settings have been reset to default.');
              } else {
                Alert.alert('Error', 'Failed to reset settings');
              }
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          }
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About MinionBot Controller',
      'Version 1.0.0\n\nA fun and interactive mobile app for controlling your MinionBot robot car.\n\nMade with ❤️ for kids!',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background}>
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Settings</Text>
        
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="videocam" size={24} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Video Settings</Text>
          </View>
          
                            <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Default Video URL</Text>
                    <TextInput
                      style={styles.urlInput}
                      value={settings.defaultVideoUrl}
                      onChangeText={(value) => setSettings(prev => ({ ...prev, defaultVideoUrl: value }))}
                      placeholder="Enter YouTube URL"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
        </View>

        {/* Connection Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bluetooth" size={24} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Connection Settings</Text>
          </View>
          
                            <View style={styles.settingItem}>
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Bluetooth Enabled</Text>
                      <Switch
                        value={settings.bluetoothEnabled}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, bluetoothEnabled: value }))}
                        trackColor={{ false: '#E5E7EB', true: '#1E3A8A' }}
                        thumbColor={settings.bluetoothEnabled ? '#FFFFFF' : '#F3F4F6'}
                        disabled={loading}
                      />
                    </View>
                  </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto-Connect</Text>
              <Switch
                value={settings.autoConnect}
                onValueChange={(value) => setSettings(prev => ({ ...prev, autoConnect: value }))}
                trackColor={{ false: '#E5E7EB', true: '#1E3A8A' }}
                thumbColor={settings.autoConnect ? '#FFFFFF' : '#F3F4F6'}
                disabled={loading}
              />
            </View>
          </View>
        </View>

        {/* Game Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="game-controller" size={24} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Game Settings</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Default Game Mode</Text>
              <View style={styles.gameModePicker}>
                <TouchableOpacity 
                  style={[styles.gameModeButton, settings.gameMode === 'AUTO' && styles.gameModeButtonActive]}
                  onPress={() => setSettings(prev => ({ ...prev, gameMode: 'AUTO' }))}
                  disabled={loading}
                >
                  <Text style={[styles.gameModeButtonText, settings.gameMode === 'AUTO' && styles.gameModeButtonTextActive]}>
                    AUTO
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.gameModeButton, settings.gameMode === 'MANUAL' && styles.gameModeButtonActive]}
                  onPress={() => setSettings(prev => ({ ...prev, gameMode: 'MANUAL' }))}
                  disabled={loading}
                >
                  <Text style={[styles.gameModeButtonText, settings.gameMode === 'MANUAL' && styles.gameModeButtonTextActive]}>
                    MANUAL
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Motor Speed: {settings.motorSpeed}%</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Slow</Text>
              <View style={styles.slider}>
                <TouchableOpacity 
                  style={[styles.sliderButton, settings.motorSpeed <= 25 && styles.sliderButtonActive]}
                  onPress={() => setSettings(prev => ({ ...prev, motorSpeed: 25 }))}
                  disabled={loading}
                >
                  <Text style={styles.sliderButtonText}>25%</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sliderButton, settings.motorSpeed === 50 && styles.sliderButtonActive]}
                  onPress={() => setSettings(prev => ({ ...prev, motorSpeed: 50 }))}
                  disabled={loading}
                >
                  <Text style={styles.sliderButtonText}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sliderButton, settings.motorSpeed === 75 && styles.sliderButtonActive]}
                  onPress={() => setSettings(prev => ({ ...prev, motorSpeed: 75 }))}
                  disabled={loading}
                >
                  <Text style={styles.sliderButtonText}>75%</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sliderButton, settings.motorSpeed >= 100 && styles.sliderButtonActive]}
                  onPress={() => setSettings(prev => ({ ...prev, motorSpeed: 100 }))}
                  disabled={loading}
                >
                  <Text style={styles.sliderButtonText}>100%</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sliderLabel}>Fast</Text>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>App Settings</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => setSettings(prev => ({ ...prev, soundEnabled: value }))}
                trackColor={{ false: '#E5E7EB', true: '#1E3A8A' }}
                thumbColor={settings.soundEnabled ? '#FFFFFF' : '#F3F4F6'}
                disabled={loading}
              />
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) => setSettings(prev => ({ ...prev, vibrationEnabled: value }))}
                trackColor={{ false: '#E5E7EB', true: '#1E3A8A' }}
                thumbColor={settings.vibrationEnabled ? '#FFFFFF' : '#F3F4F6'}
                disabled={loading}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleResetSettings}
          >
            <Ionicons name="refresh" size={20} color="#DC2626" />
            <Text style={styles.resetButtonText}>Reset Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleAbout}
          >
            <Ionicons name="information-circle" size={20} color="#1E3A8A" />
            <Text style={styles.aboutButtonText}>About</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>MinionBot Controller v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for Kids</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -75,
    left: -75,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginLeft: 10,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urlInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  aboutButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  gameModePicker: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  gameModeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gameModeButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  gameModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  gameModeButtonTextActive: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
    minWidth: 30,
  },
  slider: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  sliderButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 45,
  },
  sliderButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  sliderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SettingsScreen;
