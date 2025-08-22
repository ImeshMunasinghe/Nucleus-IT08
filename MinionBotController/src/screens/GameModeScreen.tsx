import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type GameModeNavigationProp = StackNavigationProp<RootStackParamList, 'GameMode'>;
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { HTTPService } from '../services/HTTPService';

const { width, height } = Dimensions.get('window');

const GameModeScreen = () => {
  const navigation = useNavigation<GameModeNavigationProp>();
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [gameMode, setGameMode] = useState('AUTO'); // AUTO or MANUAL
  const [lastCommand, setLastCommand] = useState('');
  const [digitGameEnabled, setDigitGameEnabled] = useState(false);
  const [digitStatus, setDigitStatus] = useState<{
    firstDigit: string;
    secondDigit: string;
    digitCount: number;
  }>({ firstDigit: '', secondDigit: '', digitCount: 0 });
  
  // Animation values
  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Simulate Bluetooth connection
    setTimeout(() => setIsConnected(true), 1000);
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    rotateAnim.stopAnimation();
    pulseAnim.setValue(1);
    rotateAnim.setValue(0);
  };

  const handleVoiceCommand = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to MinionBot first');
      return;
    }

    setIsListening(true);
    Vibration.vibrate(100);
    startPulseAnimation();
    startRotateAnimation();

    // Simulate voice recognition
    setTimeout(() => {
      const commands = ['F', 'B', 'L', 'R', 'S'];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setLastCommand(randomCommand);
      
      setIsListening(false);
      stopAnimations();
      Vibration.vibrate(50);
      
      Alert.alert('Command Recognized', `Sending: ${randomCommand}`);
    }, 3000);
  };

  const sendCommand = (command: string) => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to MinionBot first');
      return;
    }
    
    setLastCommand(command);
    Vibration.vibrate(50);
    Alert.alert('Command Sent', `Sending: ${command}`);
  };

  const toggleGameMode = () => {
    const newMode = gameMode === 'AUTO' ? 'MANUAL' : 'AUTO';
    setGameMode(newMode);
    Alert.alert('Mode Changed', `Switched to ${newMode} mode`);
  };

  const toggleDigitGame = async () => {
    const newState = !digitGameEnabled;
    setDigitGameEnabled(newState);
    
    if (newState) {
      // Enable digit game
      const command = 'DIGIT_ON';
      sendCommand(command);
      Alert.alert('Digit Game', 'Digit game mode enabled! Tap "Capture Digit" when ready.');
    } else {
      // Disable digit game
      const command = 'DIGIT_OFF';
      sendCommand(command);
      setDigitStatus({ firstDigit: '', secondDigit: '', digitCount: 0 });
      Alert.alert('Digit Game', 'Digit game mode disabled');
    }
  };

  const captureDigit = async () => {
    if (!digitGameEnabled) {
      Alert.alert('Digit Game', 'Please enable digit game mode first');
      return;
    }

    try {
      const response = await HTTPService.sendDigitCaptureRequest();
      
      if (response.status === 'capture_requested') {
        Alert.alert('Digit Capture', 'Digit capture request sent! Check the robot for results.');
        
        // Update status after a delay
        setTimeout(updateDigitStatus, 3000);
      } else {
        Alert.alert('Error', `Failed to capture digit: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send capture request. Check network connection.');
    }
  };

  const updateDigitStatus = async () => {
    try {
      const status = await HTTPService.getDigitStatus();
      if (status) {
        setDigitStatus({
          firstDigit: status.first_digit,
          secondDigit: status.second_digit,
          digitCount: status.digit_count,
        });
      }
    } catch (error) {
      console.error('Failed to update digit status:', error);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
          style={styles.homeButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="home" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      {/* Main Voice Button */}
      <View style={styles.voiceSection}>
        <TouchableOpacity
          style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
          onPress={handleVoiceCommand}
          disabled={isListening}
        >
          <Animated.View
            style={[
              styles.voiceButtonInner,
              {
                transform: [
                  { scale: pulseAnim },
                  { rotate: spin }
                ]
              }
            ]}
          >
            <Ionicons 
              name={isListening ? "mic" : "mic-outline"} 
              size={60} 
              color={isListening ? "#FFFFFF" : "#1E3A8A"} 
            />
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={styles.voiceLabel}>
          {isListening ? 'Listening...' : 'Tap to Speak'}
        </Text>
        
        {lastCommand && (
          <Text style={styles.lastCommand}>
            Last: {lastCommand}
          </Text>
        )}
      </View>

      {/* Game Mode Toggle */}
      <View style={styles.modeSection}>
        <Text style={styles.modeLabel}>Game Mode:</Text>
        <TouchableOpacity 
          style={[styles.modeButton, gameMode === 'AUTO' && styles.modeButtonActive]} 
          onPress={toggleGameMode}
        >
          <Text style={[styles.modeButtonText, gameMode === 'AUTO' && styles.modeButtonTextActive]}>
            AUTO
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeButton, gameMode === 'MANUAL' && styles.modeButtonActive]} 
          onPress={toggleGameMode}
        >
          <Text style={[styles.modeButtonText, gameMode === 'MANUAL' && styles.modeButtonTextActive]}>
            MANUAL
          </Text>
        </TouchableOpacity>
      </View>

             {/* Digit Game Toggle */}
       <View style={styles.modeSection}>
         <Text style={styles.modeLabel}>Digit Game:</Text>
         <TouchableOpacity 
           style={[styles.digitGameButton, digitGameEnabled && styles.digitGameButtonActive]} 
           onPress={toggleDigitGame}
         >
           <Ionicons 
             name={digitGameEnabled ? "game-controller" : "game-controller-outline"} 
             size={20} 
             color={digitGameEnabled ? "#FFFFFF" : "#1E3A8A"} 
           />
           <Text style={[styles.digitGameButtonText, digitGameEnabled && styles.digitGameButtonTextActive]}>
             {digitGameEnabled ? 'ON' : 'OFF'}
           </Text>
         </TouchableOpacity>
       </View>

       {/* Digit Game Controls */}
       {digitGameEnabled && (
         <View style={styles.digitGameSection}>
           <TouchableOpacity 
             style={styles.captureButton} 
             onPress={captureDigit}
           >
             <Ionicons name="camera" size={24} color="#FFFFFF" />
             <Text style={styles.captureButtonText}>Capture Digit</Text>
           </TouchableOpacity>
           
           {/* Digit Status Display */}
           {(digitStatus.firstDigit || digitStatus.secondDigit) && (
             <View style={styles.digitStatusContainer}>
               <Text style={styles.digitStatusTitle}>Digit Status:</Text>
               {digitStatus.firstDigit && (
                 <Text style={styles.digitStatusText}>First: {digitStatus.firstDigit}</Text>
               )}
               {digitStatus.secondDigit && (
                 <Text style={styles.digitStatusText}>Second: {digitStatus.secondDigit}</Text>
               )}
               <Text style={styles.digitStatusText}>Count: {digitStatus.digitCount}/2</Text>
             </View>
           )}
         </View>
       )}

      {/* Quick Command Buttons */}
      <View style={styles.commandSection}>
        <Text style={styles.commandLabel}>Quick Commands:</Text>
        <View style={styles.commandGrid}>
          <TouchableOpacity 
            style={styles.commandButton} 
            onPress={() => sendCommand('F')}
          >
            <Ionicons name="arrow-up" size={24} color="#1E3A8A" />
            <Text style={styles.commandText}>Forward</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.commandButton} 
            onPress={() => sendCommand('B')}
          >
            <Ionicons name="arrow-down" size={24} color="#1E3A8A" />
            <Text style={styles.commandText}>Backward</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.commandButton} 
            onPress={() => sendCommand('L')}
          >
            <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
            <Text style={styles.commandText}>Left</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.commandButton} 
            onPress={() => sendCommand('R')}
          >
            <Ionicons name="arrow-forward" size={24} color="#1E3A8A" />
            <Text style={styles.commandText}>Right</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.commandButton} 
            onPress={() => sendCommand('S')}
          >
            <Ionicons name="stop" size={24} color="#1E3A8A" />
            <Text style={styles.commandText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 10,
  },
  homeButton: {
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  voiceButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  voiceButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  voiceButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  lastCommand: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  modeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginRight: 15,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  digitGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  digitGameButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  digitGameButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginLeft: 8,
  },
  digitGameButtonTextActive: {
    color: '#FFFFFF',
  },
  digitGameSection: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  captureButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  digitStatusContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 200,
  },
  digitStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  digitStatusText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  commandSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  commandLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 15,
    textAlign: 'center',
  },
  commandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  commandButton: {
    width: (width - 60) / 3,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commandText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    marginTop: 5,
  },
});

export default GameModeScreen;
