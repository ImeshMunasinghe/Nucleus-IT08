import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MINION_COLORS } from '../constants/constants';
import { BluetoothDevice, ConnectionStatus } from '../types/types';
import BluetoothService from '../services/BluetoothService';
import MinionButton from '../components/MinionButton';
import ConnectionStatusIndicator from '../components/ConnectionStatus';

interface ConnectionScreenProps {
  navigation: any;
}

const ConnectionScreen: React.FC<ConnectionScreenProps> = ({ navigation }) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeBluetooth();
    return () => {
      BluetoothService.destroy();
    };
  }, []);

  const initializeBluetooth = async () => {
    try {
      const isInitialized = await BluetoothService.initialize();
      if (!isInitialized) {
        Alert.alert(
          'Bluetooth Error',
          'Please enable Bluetooth to use this app. If the error persists, try restarting the app.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      Alert.alert(
        'Bluetooth Error', 
        'Failed to initialize Bluetooth. Please ensure Bluetooth is enabled and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const scanForDevices = async () => {
    if (isScanning) return;

    setIsScanning(true);
    setDevices([]);

    try {
      const foundDevices = await BluetoothService.scanForDevices();
      setDevices(foundDevices);
    } catch (error) {
      console.error('Error scanning for devices:', error);
      Alert.alert(
        'Scan Error', 
        'Failed to scan for devices. Please ensure Bluetooth is enabled and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      setConnectionStatus(ConnectionStatus.CONNECTING);
      const success = await BluetoothService.connectToDevice(device.id);
      
      if (success) {
        setConnectedDevice(device);
        setConnectionStatus(ConnectionStatus.CONNECTED);
        Alert.alert(
          'Connected!',
          `Successfully connected to ${device.name}`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('Control')
            }
          ]
        );
      } else {
        setConnectionStatus(ConnectionStatus.ERROR);
        Alert.alert('Connection Failed', 'Failed to connect to device');
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      setConnectionStatus(ConnectionStatus.ERROR);
      Alert.alert('Error', 'Failed to connect to device');
    }
  };

  const disconnect = async () => {
    try {
      await BluetoothService.disconnect();
      setConnectedDevice(null);
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await scanForDevices();
    setRefreshing(false);
  };

  const renderDevice = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item)}
      disabled={connectionStatus === ConnectionStatus.CONNECTING}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
      </View>
      <View style={styles.deviceStatus}>
        {item.isConnected ? (
          <Text style={[styles.statusText, { color: MINION_COLORS.success }]}>
            Connected
          </Text>
        ) : (
          <Text style={styles.statusText}>Tap to connect</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MinionBot Controller</Text>
        <Text style={styles.subtitle}>Connect to your robot</Text>
      </View>

      <ConnectionStatusIndicator
        status={connectionStatus}
        deviceName={connectedDevice?.name}
      />

      <View style={styles.buttonContainer}>
        <MinionButton
          title={isScanning ? 'Scanning...' : 'Scan for Devices'}
          onPress={scanForDevices}
          disabled={isScanning}
          variant="primary"
          size="large"
        />

        {connectedDevice && (
          <MinionButton
            title="Disconnect"
            onPress={disconnect}
            variant="secondary"
            size="medium"
            style={{ marginTop: 16 }}
          />
        )}

        {connectedDevice && (
          <MinionButton
            title="Continue to Control"
            onPress={() => navigation.navigate('Control')}
            variant="accent"
            size="large"
            style={{ marginTop: 16 }}
          />
        )}
      </View>

      <View style={styles.deviceListContainer}>
        <Text style={styles.sectionTitle}>Available Devices</Text>
        {isScanning && (
          <View style={styles.scanningContainer}>
            <ActivityIndicator size="large" color={MINION_COLORS.primary} />
            <Text style={styles.scanningText}>Scanning for devices...</Text>
          </View>
        )}
        
        <FlatList
          data={devices}
          renderItem={renderDevice}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[MINION_COLORS.primary]}
            />
          }
                     ListEmptyComponent={
             !isScanning ? (
               <View style={styles.emptyContainer}>
                 <Text style={styles.emptyText}>
                   No devices found. Tap "Scan for Devices" to search.
                 </Text>
               </View>
             ) : null
           }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MINION_COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: MINION_COLORS.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: MINION_COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MINION_COLORS.text,
    opacity: 0.8,
  },
  buttonContainer: {
    padding: 20,
  },
  deviceListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MINION_COLORS.text,
    marginBottom: 16,
  },
  deviceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MINION_COLORS.text,
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: MINION_COLORS.text,
    opacity: 0.6,
  },
  deviceStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    color: MINION_COLORS.text,
    opacity: 0.7,
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  scanningText: {
    marginTop: 16,
    fontSize: 16,
    color: MINION_COLORS.text,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: MINION_COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default ConnectionScreen;
