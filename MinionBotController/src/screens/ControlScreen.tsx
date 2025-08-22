import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MINION_COLORS, ROBOT_COMMANDS, VOICE_COMMANDS } from '../constants/constants';
import { RobotMode, ConnectionStatus } from '../types/types';
import BluetoothService from '../services/BluetoothService';
import MinionButton from '../components/MinionButton';
import ConnectionStatusIndicator from '../components/ConnectionStatus';

interface ControlScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const ControlScreen: React.FC<ControlScreenProps> = ({ navigation }) => {
  const [currentMode, setCurrentMode] = useState<RobotMode>(RobotMode.PLAY);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [lastCommand, setLastCommand] = useState<string>('');

  useEffect(() => {
    // Set up connection status callback
    BluetoothService.setStatusChangeCallback(setConnectionStatus);
    setConnectionStatus(BluetoothService.getConnectionStatus());

    return () => {
      BluetoothService.setStatusChangeCallback(null);
    };
  }, []);

  const sendCommand = async (command: string) => {
    try {
      const success = await BluetoothService.sendCommand(command);
      if (success) {
        setLastCommand(command);
        console.log('Command sent successfully:', command);
      } else {
        Alert.alert('Error', 'Failed to send command');
      }
    } catch (error) {
      console.error('Error sending command:', error);
      Alert.alert('Error', 'Failed to send command');
    }
  };

  const switchMode = async (mode: RobotMode) => {
    try {
      const success = await BluetoothService.sendCommand(mode);
      if (success) {
        setCurrentMode(mode);
        setLastCommand(mode);
        const modeName = mode === RobotMode.GAME ? 'Game' : 
                        mode === RobotMode.PLAY ? 'Play' : 'Entertainment';
        Alert.alert('Mode Changed', `Switched to ${modeName} Mode`);
      } else {
        Alert.alert('Error', 'Failed to switch mode');
      }
    } catch (error) {
      console.error('Error switching mode:', error);
      Alert.alert('Error', 'Failed to switch mode');
    }
  };

  const getModeName = (mode: RobotMode): string => {
    switch (mode) {
      case RobotMode.GAME: return 'Game Mode';
      case RobotMode.PLAY: return 'Play Mode';
      case RobotMode.ENTERTAINMENT: return 'Entertainment Mode';
      default: return 'Unknown Mode';
    }
  };

  const getModeColor = (mode: RobotMode): string => {
    switch (mode) {
      case RobotMode.GAME: return MINION_COLORS.accent;
      case RobotMode.PLAY: return MINION_COLORS.primary;
      case RobotMode.ENTERTAINMENT: return MINION_COLORS.secondary;
      default: return MINION_COLORS.text;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MinionBot Controller</Text>
        <Text style={styles.subtitle}>Control your robot</Text>
      </View>

      <ConnectionStatusIndicator status={connectionStatus} />

      {/* Mode Selection */}
      <View style={styles.modeContainer}>
        <Text style={styles.sectionTitle}>Robot Mode</Text>
        <View style={styles.modeButtons}>
          {Object.values(RobotMode).map((mode) => (
            <MinionButton
              key={mode}
              title={getModeName(mode)}
              onPress={() => switchMode(mode)}
              variant={currentMode === mode ? 'accent' : 'secondary'}
              size="small"
                             style={[
                 styles.modeButton,
                 currentMode === mode ? { backgroundColor: getModeColor(mode) } : {}
               ] as any}
            />
          ))}
        </View>
        <Text style={styles.currentMode}>
          Current: {getModeName(currentMode)}
        </Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlContainer}>
        <Text style={styles.sectionTitle}>Manual Control</Text>
        
        {/* Forward Button */}
        <View style={styles.buttonRow}>
          <MinionButton
            title="Forward"
            onPress={() => sendCommand('F')}
            variant="primary"
            size="large"
            style={styles.controlButton}
          />
        </View>

        {/* Left, Stop, Right Buttons */}
        <View style={styles.buttonRow}>
          <MinionButton
            title="Left"
            onPress={() => sendCommand('L')}
            variant="secondary"
            size="large"
            style={styles.controlButton}
          />
          <MinionButton
            title="Stop"
            onPress={() => sendCommand('S')}
            variant="accent"
            size="large"
            style={styles.controlButton}
          />
          <MinionButton
            title="Right"
            onPress={() => sendCommand('R')}
            variant="secondary"
            size="large"
            style={styles.controlButton}
          />
        </View>

        {/* Backward Button */}
        <View style={styles.buttonRow}>
          <MinionButton
            title="Backward"
            onPress={() => sendCommand('B')}
            variant="primary"
            size="large"
            style={styles.controlButton}
          />
        </View>
      </View>

      {/* Voice Control Button */}
      <View style={styles.voiceContainer}>
        <MinionButton
          title="Voice Control"
          onPress={() => navigation.navigate('VoiceControl')}
          variant="secondary"
          size="large"
        />
      </View>

      {/* Last Command Display */}
      {lastCommand && (
        <View style={styles.lastCommandContainer}>
          <Text style={styles.lastCommandLabel}>Last Command:</Text>
          <Text style={styles.lastCommandText}>{lastCommand}</Text>
        </View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <MinionButton
          title="Back to Connection"
          onPress={() => navigation.navigate('Connection')}
          variant="secondary"
          size="medium"
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
  modeContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MINION_COLORS.text,
    marginBottom: 16,
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  currentMode: {
    fontSize: 14,
    color: MINION_COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  controlContainer: {
    padding: 20,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  controlButton: {
    marginHorizontal: 8,
    minWidth: (width - 80) / 3,
  },
  voiceContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  lastCommandContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  lastCommandLabel: {
    fontSize: 14,
    color: MINION_COLORS.text,
    opacity: 0.7,
  },
  lastCommandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MINION_COLORS.accent,
    marginTop: 4,
  },
  navigationContainer: {
    padding: 20,
  },
});

export default ControlScreen;
