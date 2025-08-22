import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MINION_COLORS, VOICE_COMMANDS } from '../constants/constants';
import { VoiceCommand, ConnectionStatus } from '../types/types';
import BluetoothService from '../services/BluetoothService';
import SpeechService from '../services/SpeechService';
import { SpeechServiceTest } from '../services/SpeechServiceTest';
import MinionButton from '../components/MinionButton';
import ConnectionStatusIndicator from '../components/ConnectionStatus';

interface VoiceControlScreenProps {
  navigation: any;
}

const VoiceControlScreen: React.FC<VoiceControlScreenProps> = ({ navigation }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isInitializing, setIsInitializing] = useState(true);
  const [speechServiceStatus, setSpeechServiceStatus] = useState<{
    isUsingMock: boolean;
    isListening: boolean;
  }>({ isUsingMock: false, isListening: false });

  useEffect(() => {
    let isMounted = true;
    
    const initializeServices = async () => {
      try {
        await initializeSpeechService();
        
        if (isMounted) {
          BluetoothService.setStatusChangeCallback((status: ConnectionStatus) => setConnectionStatus(status));
          setConnectionStatus(BluetoothService.getConnectionStatus());
        }
      } catch (error) {
        console.error('Error initializing services:', error);
        if (isMounted) {
          Alert.alert(
            'Initialization Error', 
            'Failed to initialize services. Some features may not work properly.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    initializeServices();

    return () => {
      isMounted = false;
      cleanupServices();
    };
  }, []);

  const cleanupServices = useCallback(() => {
    try {
      SpeechService.destroy();
      BluetoothService.setStatusChangeCallback(null);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, []);

  const initializeSpeechService = async () => {
    try {
      setIsInitializing(true);
      console.log('VoiceControlScreen: Starting speech service initialization...');
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout')), 15000); // 15 seconds
      });
      
      const initPromise = SpeechService.initialize();
      const success = await Promise.race([initPromise, timeoutPromise]) as boolean;
      
      if (success) {
        SpeechService.setCommandCallback(handleVoiceCommand);
        console.log('VoiceControlScreen: Speech service initialized successfully');
        
        // Update service status
        const status = SpeechService.getServiceStatus();
        setSpeechServiceStatus(status);
        
        if (status.isUsingMock) {
          Alert.alert(
            'Voice Recognition Mode',
            'Using mock voice recognition for testing. The "Test Voice Command" button will simulate voice commands.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Voice Recognition Ready',
            'Azure Speech Services is ready. You can now use voice commands to control your robot.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('VoiceControlScreen: Speech service initialization failed');
        setSpeechServiceStatus({ isUsingMock: true, isListening: false });
        Alert.alert(
          'Speech Recognition Error',
          'Failed to initialize speech recognition. Using mock service for testing.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('VoiceControlScreen: Error initializing speech service:', error);
      setSpeechServiceStatus({ isUsingMock: true, isListening: false });
      
      let errorMessage = 'Failed to initialize speech recognition.';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Speech service initialization timed out. Please check your internet connection.';
        } else if (error.message.includes('401') || error.message.includes('authentication')) {
          errorMessage = 'Authentication failed. Please check your Azure Speech Service subscription keys.';
        }
      }
      
      Alert.alert(
        'Speech Recognition Error',
        `${errorMessage} Using mock service for testing.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const handleVoiceCommand = async (text: string) => {
    setRecognizedText(text);
    
    // Find matching command - check for partial matches too
    const command = VOICE_COMMANDS.find(cmd => {
      const phraseWords = cmd.phrase.toLowerCase().split(' ');
      const textWords = text.toLowerCase().split(' ');
      
      // Check if all phrase words are in the recognized text
      return phraseWords.every(word => 
        textWords.some(textWord => textWord.includes(word) || word.includes(textWord))
      );
    });

    if (command) {
      setLastCommand(command.command);
      const success = await sendCommand(command.command);
      
      Alert.alert(
        'Command Recognized',
        `"${text}" → ${command.description}${success ? ' ✓' : ' ✗ (Send failed)'}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Command Not Recognized',
        `"${text}" is not a recognized command.\n\nTry saying: forward, backward, left, right, stop, game mode, play mode, or entertainment mode.`,
        [{ text: 'OK' }]
      );
    }
  };

  const sendCommand = async (command: string): Promise<boolean> => {
    try {
      console.log('Sending command:', command);
      const success = await BluetoothService.sendCommand(command);
      if (!success) {
        console.error('Failed to send command to robot');
        // Don't show alert here as it's handled in the calling function
      }
      return success;
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  };

  const toggleListening = async () => {
    try {
      if (isListening) {
        const success = await SpeechService.stopListening();
        if (success) {
          setIsListening(false);
          console.log('Stopped listening for voice commands');
        } else {
          Alert.alert('Error', 'Failed to stop voice recognition');
        }
      } else {
        // Check if Bluetooth is connected for real commands
        if (connectionStatus !== ConnectionStatus.CONNECTED && !speechServiceStatus.isUsingMock) {
          Alert.alert(
            'Bluetooth Not Connected',
            'Please connect to your robot first to send real commands.',
            [{ text: 'OK' }]
          );
          return;
        }

        const success = await SpeechService.startListening();
        if (success) {
          setIsListening(true);
          console.log('Started listening for voice commands');
        } else {
          Alert.alert('Error', 'Failed to start voice recognition');
        }
      }
    } catch (error) {
      console.error('Error toggling listening:', error);
      Alert.alert('Error', 'Failed to toggle voice recognition');
    }
  };

  const renderVoiceCommand = ({ item }: { item: VoiceCommand }) => (
    <View style={styles.commandItem}>
      <View style={styles.commandInfo}>
        <Text style={styles.commandPhrase}>"{item.phrase}"</Text>
        <Text style={styles.commandDescription}>{item.description}</Text>
      </View>
      <MinionButton
        title={item.command}
        onPress={async () => {
          const success = await sendCommand(item.command);
          Alert.alert(
            'Command Sent',
            `${item.description}${success ? ' ✓' : ' ✗ (Send failed)'}`,
            [{ text: 'OK' }]
          );
        }}
        variant="accent"
        size="small"
        style={styles.commandButton}
      />
    </View>
  );

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MINION_COLORS.primary} />
          <Text style={styles.loadingText}>Initializing Voice Recognition...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Control</Text>
        <Text style={styles.subtitle}>Speak to control your robot</Text>
      </View>

      <ConnectionStatusIndicator status={connectionStatus} />

      {/* Voice Control Button */}
      <View style={styles.voiceButtonContainer}>
        <MinionButton
          title={isListening ? 'Stop Listening' : 'Start Listening'}
          onPress={toggleListening}
          variant={isListening ? 'accent' : 'primary'}
          size="large"
        />
        
        {/* Test Button for Voice Commands */}
        <MinionButton
          title="Test Voice Command"
          onPress={() => {
            const testCommands = ['forward', 'backward', 'left', 'right', 'stop', 'game mode', 'play mode'];
            const randomCommand = testCommands[Math.floor(Math.random() * testCommands.length)];
            handleVoiceCommand(randomCommand);
          }}
          variant="secondary"
          size="medium"
          style={{ marginTop: 12 }}
        />
        
        {/* Test Azure Connection Button */}
        <MinionButton
          title="Test Azure Connection"
          onPress={async () => {
            try {
              const result = await SpeechServiceTest.testConnection();
              Alert.alert(
                'Azure Connection Test',
                result 
                  ? '✅ Azure Speech REST API is accessible!' 
                  : '❌ Azure Speech REST API connection failed. Check your subscription key and region.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Azure Connection Test',
                `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                [{ text: 'OK' }]
              );
            }
          }}
          variant="secondary"
          size="medium"
          style={{ marginTop: 8 }}
        />
      </View>

      {/* Status Indicators */}
      <View style={styles.statusContainer}>
        {isListening && (
          <View style={styles.listeningIndicator}>
            <ActivityIndicator size="small" color={MINION_COLORS.accent} />
            <Text style={styles.listeningText}>Listening for commands...</Text>
          </View>
        )}

        {recognizedText && (
          <View style={styles.recognizedContainer}>
            <Text style={styles.recognizedLabel}>Recognized:</Text>
            <Text style={styles.recognizedText}>"{recognizedText}"</Text>
          </View>
        )}

        {lastCommand && (
          <View style={styles.lastCommandContainer}>
            <Text style={styles.lastCommandLabel}>Last Command:</Text>
            <Text style={styles.lastCommandText}>{lastCommand}</Text>
          </View>
        )}
      </View>

      {/* Available Commands */}
      <View style={styles.commandsContainer}>
        <Text style={styles.sectionTitle}>Quick Command Buttons</Text>
        <Text style={styles.sectionSubtitle}>Tap any button to send the command directly to your robot</Text>
        <FlatList
          data={VOICE_COMMANDS}
          renderItem={renderVoiceCommand}
          keyExtractor={(item) => item.phrase}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <MinionButton
          title="Back to Control"
          onPress={() => navigation.navigate('Control')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: MINION_COLORS.text,
    opacity: 0.7,
  },
  voiceButtonContainer: {
    padding: 20,
  },
  statusContainer: {
    paddingHorizontal: 20,
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MINION_COLORS.accent,
    padding: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  listeningText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recognizedContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recognizedLabel: {
    fontSize: 14,
    color: MINION_COLORS.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  recognizedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MINION_COLORS.accent,
  },
  lastCommandContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  lastCommandLabel: {
    fontSize: 14,
    color: MINION_COLORS.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  lastCommandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MINION_COLORS.success,
  },
  commandsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MINION_COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: MINION_COLORS.text,
    opacity: 0.7,
    marginBottom: 16,
  },
  commandItem: {
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
  commandInfo: {
    flex: 1,
  },
  commandPhrase: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MINION_COLORS.text,
    marginBottom: 4,
  },
  commandDescription: {
    fontSize: 14,
    color: MINION_COLORS.text,
    opacity: 0.7,
  },
  commandAction: {
    backgroundColor: MINION_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  commandButton: {
    minWidth: 80,
  },
  navigationContainer: {
    padding: 20,
  },
});

export default VoiceControlScreen;
