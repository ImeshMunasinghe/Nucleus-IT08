import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  BLUETOOTH_DEVICES: 'bluetooth_devices',
  VIDEO_URL: 'video_url',
  LAST_CONNECTED_DEVICE: 'last_connected_device',
} as const;

// Settings interface
export interface UserSettings {
  bluetoothEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoConnect: boolean;
  defaultVideoUrl: string;
  gameMode: 'AUTO' | 'MANUAL';
  motorSpeed: number;
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  bluetoothEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  autoConnect: false,
  defaultVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
  gameMode: 'AUTO',
  motorSpeed: 75,
};

export class StorageService {
  // Save user settings
  static async saveSettings(settings: Partial<UserSettings>): Promise<boolean> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(updatedSettings)
      );
      
      console.log('StorageService: Settings saved successfully');
      return true;
    } catch (error) {
      console.error('StorageService: Error saving settings:', error);
      return false;
    }
  }

  // Get user settings
  static async getSettings(): Promise<UserSettings> {
    try {
      const settingsString = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      
      if (settingsString) {
        const settings = JSON.parse(settingsString);
        // Merge with defaults to ensure all properties exist
        return { ...DEFAULT_SETTINGS, ...settings };
      }
      
      console.log('StorageService: No saved settings found, using defaults');
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('StorageService: Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Reset settings to defaults
  static async resetSettings(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS)
      );
      
      console.log('StorageService: Settings reset to defaults');
      return true;
    } catch (error) {
      console.error('StorageService: Error resetting settings:', error);
      return false;
    }
  }

  // Save video URL
  static async saveVideoUrl(url: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VIDEO_URL, url);
      console.log('StorageService: Video URL saved successfully');
      return true;
    } catch (error) {
      console.error('StorageService: Error saving video URL:', error);
      return false;
    }
  }

  // Get video URL
  static async getVideoUrl(): Promise<string> {
    try {
      const url = await AsyncStorage.getItem(STORAGE_KEYS.VIDEO_URL);
      return url || DEFAULT_SETTINGS.defaultVideoUrl;
    } catch (error) {
      console.error('StorageService: Error loading video URL:', error);
      return DEFAULT_SETTINGS.defaultVideoUrl;
    }
  }

  // Save Bluetooth device info
  static async saveBluetoothDevice(deviceId: string, deviceName: string): Promise<boolean> {
    try {
      const deviceInfo = {
        id: deviceId,
        name: deviceName,
        lastConnected: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_CONNECTED_DEVICE,
        JSON.stringify(deviceInfo)
      );
      
      console.log('StorageService: Bluetooth device info saved');
      return true;
    } catch (error) {
      console.error('StorageService: Error saving Bluetooth device:', error);
      return false;
    }
  }

  // Get last connected Bluetooth device
  static async getLastConnectedDevice(): Promise<{ id: string; name: string; lastConnected: string } | null> {
    try {
      const deviceString = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CONNECTED_DEVICE);
      
      if (deviceString) {
        return JSON.parse(deviceString);
      }
      
      return null;
    } catch (error) {
      console.error('StorageService: Error loading last connected device:', error);
      return null;
    }
  }

  // Save multiple Bluetooth devices (history)
  static async saveBluetoothDevices(devices: Array<{ id: string; name: string }>): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.BLUETOOTH_DEVICES,
        JSON.stringify(devices)
      );
      
      console.log('StorageService: Bluetooth devices list saved');
      return true;
    } catch (error) {
      console.error('StorageService: Error saving Bluetooth devices:', error);
      return false;
    }
  }

  // Get saved Bluetooth devices
  static async getBluetoothDevices(): Promise<Array<{ id: string; name: string }>> {
    try {
      const devicesString = await AsyncStorage.getItem(STORAGE_KEYS.BLUETOOTH_DEVICES);
      
      if (devicesString) {
        return JSON.parse(devicesString);
      }
      
      return [];
    } catch (error) {
      console.error('StorageService: Error loading Bluetooth devices:', error);
      return [];
    }
  }

  // Clear all stored data
  static async clearAllData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_SETTINGS,
        STORAGE_KEYS.BLUETOOTH_DEVICES,
        STORAGE_KEYS.VIDEO_URL,
        STORAGE_KEYS.LAST_CONNECTED_DEVICE,
      ]);
      
      console.log('StorageService: All data cleared');
      return true;
    } catch (error) {
      console.error('StorageService: Error clearing data:', error);
      return false;
    }
  }

  // Get storage info (for debugging)
  static async getStorageInfo(): Promise<{ keys: string[]; totalSize: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      
      // Calculate approximate total size
      let totalSize = 0;
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        keys: keys.filter(key => Object.values(STORAGE_KEYS).includes(key as any)),
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      };
    } catch (error) {
      console.error('StorageService: Error getting storage info:', error);
      return { keys: [], totalSize: '0 KB' };
    }
  }
}

export default StorageService;
