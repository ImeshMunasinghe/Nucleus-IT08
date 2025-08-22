import 'react-native-get-random-values';
import { AZURE_SPEECH_CONFIG } from '../constants/constants';
import { VoiceCommand } from '../types/types';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';

class SpeechService {
  private isListening: boolean = false;
  private onCommandRecognized: ((command: string) => void) | null = null;
  private useMockService: boolean = false;
  private recording: Audio.Recording | null = null;
  private isInitialized: boolean = false;
  private processingTimeout: NodeJS.Timeout | null = null;
  private recordingDuration: number = 0;
  private maxRecordingDuration: number = 5000; // 5 seconds max per recording

  // Request microphone permissions
  private async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for voice commands.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS permissions are handled automatically by the system
        return true;
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }

  // Initialize speech service
  async initialize(): Promise<boolean> {
    try {
      console.log('SpeechService: Starting initialization...');
      
      // Request microphone permission first
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        console.log('SpeechService: Microphone permission denied');
        Alert.alert(
          'Microphone Permission Required',
          'Please grant microphone access to use voice commands.',
          [{ text: 'OK' }]
        );
        this.useMockService = true;
        return true; // Still return true to allow mock service
      }

      console.log('SpeechService: Microphone permission granted');

      // Check if we have valid Azure configuration
      if (!AZURE_SPEECH_CONFIG.subscriptionKey1 || !AZURE_SPEECH_CONFIG.region) {
        console.error('SpeechService: Invalid Azure configuration - missing subscription key or region');
        this.useMockService = true;
        Alert.alert(
          'Voice Recognition Notice',
          'Azure Speech configuration is missing. Using mock service for testing.',
          [{ text: 'OK' }]
        );
        return true;
      }

      // Test Azure Speech REST API connection
      console.log('SpeechService: Testing connection to Azure Speech REST API...');
      const connectionTest = await this.testAzureConnection();
      
      if (!connectionTest) {
        console.log('SpeechService: Azure connection test failed, using mock service');
        this.useMockService = true;
        Alert.alert(
          'Voice Recognition Notice',
          'Could not connect to Azure Speech Services. Using mock service for testing.',
          [{ text: 'OK' }]
        );
        return true;
      }

      console.log('SpeechService: Initialization completed successfully');
      this.isInitialized = true;
      return true;
      
    } catch (error) {
      console.error('SpeechService: Error initializing speech service:', error);
      console.log('SpeechService: Falling back to mock service for testing');
      
      this.useMockService = true;
      Alert.alert(
        'Voice Recognition Notice',
        'Could not initialize speech service. Using mock service for testing.',
        [{ text: 'OK' }]
      );
      
      return true; // Return true to allow testing with mock service
    }
  }

  // Test connection to Azure Speech REST API
  private async testAzureConnection(): Promise<boolean> {
    try {
      const testUrl = `https://${AZURE_SPEECH_CONFIG.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;
      
      // Create a minimal WAV header for testing
      const sampleRate = 16000;
      const numChannels = 1;
      const bitsPerSample = 16;
      const duration = 0.1; // 0.1 seconds
      const numSamples = Math.floor(sampleRate * duration);
      const dataSize = numSamples * numChannels * (bitsPerSample / 8);
      const fileSize = 36 + dataSize;
      
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, fileSize, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
      view.setUint16(32, numChannels * (bitsPerSample / 8), true);
      view.setUint16(34, bitsPerSample, true);
      writeString(36, 'data');
      view.setUint32(40, dataSize, true);
      
      // Silent audio data
      for (let i = 44; i < buffer.byteLength; i++) {
        view.setUint8(i, 0);
      }

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_CONFIG.subscriptionKey1.trim(),
          'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
          'Accept': 'application/json',
        },
        body: buffer,
      });

      console.log(`SpeechService: Azure test response status: ${response.status}`);
      return response.status === 200 || (response.status >= 400 && response.status < 500);

    } catch (error) {
      console.error('SpeechService: Error testing Azure connection:', error);
      return false;
    }
  }

  // Start listening for voice commands
  async startListening(): Promise<boolean> {
    try {
      console.log('SpeechService: Starting listening...');
      
      if (this.useMockService) {
        console.log('SpeechService: Using mock service - simulating listening');
        this.isListening = true;
        
        // Simulate voice recognition after a delay
        setTimeout(() => {
          if (this.isListening && this.onCommandRecognized) {
            const mockCommands = ['forward', 'backward', 'left', 'right', 'stop', 'game mode', 'play mode'];
            const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
            console.log(`SpeechService: Mock service - simulating "${randomCommand}" command`);
            this.onCommandRecognized(randomCommand);
          }
        }, 3000);
        
        return true;
      }
      
      if (!this.isInitialized) {
        console.error('SpeechService: Speech service not initialized');
        return false;
      }

      if (this.isListening) {
        console.log('SpeechService: Already listening');
        return true;
      }

      // Configure audio mode
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });

      this.isListening = true;
      this.recordingDuration = 0;

      // Start continuous recording cycles
      this.startRecordingCycle();

      console.log('SpeechService: Started listening for voice commands');
      return true;
      
    } catch (error) {
      console.error('SpeechService: Error starting speech recognition:', error);
      return false;
    }
  }

  // Start a recording cycle
  private async startRecordingCycle(): Promise<void> {
    if (!this.isListening) return;

    try {
      console.log('SpeechService: Starting new recording cycle...');
      
      // Create and start new recording using high quality preset
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;

      // Record for a fixed duration
      this.processingTimeout = setTimeout(async () => {
        if (this.recording && this.isListening) {
          await this.processAndRestartRecording();
        }
      }, this.maxRecordingDuration);

    } catch (error) {
      console.error('SpeechService: Error starting recording cycle:', error);
      // Try to restart the cycle after a delay
      if (this.isListening) {
        setTimeout(() => this.startRecordingCycle(), 1000);
      }
    }
  }

  // Process current recording and start a new cycle
  private async processAndRestartRecording(): Promise<void> {
    if (!this.recording || !this.isListening) return;

    try {
      console.log('SpeechService: Processing recording...');

      // Stop current recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      // Clear current recording reference
      const currentRecording = this.recording;
      this.recording = null;

      // Process the audio
      if (uri) {
        // Don't await this - process in background
        this.sendAudioToAzure(uri).catch(error => {
          console.error('SpeechService: Error processing audio:', error);
        });
      }

      // Start next recording cycle
      if (this.isListening) {
        setTimeout(() => this.startRecordingCycle(), 100); // Small delay before next cycle
      }

    } catch (error) {
      console.error('SpeechService: Error in processAndRestartRecording:', error);
      
      // Try to restart recording after error
      if (this.isListening) {
        setTimeout(() => this.startRecordingCycle(), 1000);
      }
    }
  }

  // Send audio to Azure Speech REST API
  private async sendAudioToAzure(audioUri: string): Promise<void> {
    try {
      console.log('SpeechService: Sending audio to Azure...');
      
      // Read the audio file
      const response = await fetch(audioUri);
      const audioBuffer = await response.arrayBuffer();

      // Check if we have valid audio data
      if (!audioBuffer || audioBuffer.byteLength < 1000) { // Less than 1KB indicates mostly silence
        console.log('SpeechService: Audio too short, skipping...');
        return;
      }

      const url = `https://${AZURE_SPEECH_CONFIG.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;
      
      console.log(`SpeechService: Sending ${audioBuffer.byteLength} bytes to Azure`);

      const azureResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_CONFIG.subscriptionKey1.trim(),
          'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
          'Accept': 'application/json',
        },
        body: audioBuffer,
      });

      console.log(`SpeechService: Azure response status: ${azureResponse.status}`);

      if (azureResponse.ok) {
        const result = await azureResponse.json();
        console.log('SpeechService: Azure response:', JSON.stringify(result));
        
        let recognizedText = '';
        
        // Try to get text from different response formats
        if (result.DisplayText && result.DisplayText.trim()) {
          recognizedText = result.DisplayText.trim();
        } else if (result.NBest && result.NBest.length > 0 && result.NBest[0].Display && result.NBest[0].Display.trim()) {
          recognizedText = result.NBest[0].Display.trim();
        }
        
        if (recognizedText) {
          console.log('SpeechService: Recognized speech:', recognizedText);
          
          if (this.onCommandRecognized) {
            this.onCommandRecognized(recognizedText.toLowerCase());
          }
        } else {
          console.log('SpeechService: No speech recognized (silent audio)');
        }
      } else {
        const errorText = await azureResponse.text();
        console.error(`SpeechService: Azure API error ${azureResponse.status}:`, errorText);
        
        // If we get authentication errors, switch to mock service
        if (azureResponse.status === 401 || azureResponse.status === 403) {
          console.log('SpeechService: Authentication failed, switching to mock service');
          this.useMockService = true;
          Alert.alert(
            'Azure Authentication Failed',
            'Switching to mock service for testing. Please check your subscription keys.',
            [{ text: 'OK' }]
          );
        }
      }

    } catch (error) {
      console.error('SpeechService: Error sending audio to Azure:', error);
    }
  }

  // Stop listening for voice commands
  async stopListening(): Promise<boolean> {
    try {
      console.log('SpeechService: Stopping listening...');

      this.isListening = false;

      // Clear timeout
      if (this.processingTimeout) {
        clearTimeout(this.processingTimeout);
        this.processingTimeout = null;
      }

      if (this.useMockService) {
        console.log('SpeechService: Mock service - stopping listening');
        return true;
      }
      
      // Stop recording
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (error) {
          console.error('SpeechService: Error stopping recording:', error);
        }
        this.recording = null;
      }

      console.log('SpeechService: Stopped listening for voice commands');
      return true;
      
    } catch (error) {
      console.error('SpeechService: Error stopping speech recognition:', error);
      this.isListening = false;
      return false;
    }
  }

  // Set command recognition callback
  setCommandCallback(callback: (command: string) => void): void {
    this.onCommandRecognized = callback;
  }

  // Check if currently listening
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  // Get service status
  getServiceStatus(): { isUsingMock: boolean; isListening: boolean } {
    return {
      isUsingMock: this.useMockService,
      isListening: this.isListening
    };
  }

  // Cleanup
  destroy(): void {
    console.log('SpeechService: Destroying service...');

    this.isListening = false;

    // Clear timeout
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = null;
    }

    // Stop recording
    if (this.recording) {
      try {
        this.recording.stopAndUnloadAsync();
      } catch (error) {
        console.log('SpeechService: Error stopping recording during cleanup:', error);
      }
      this.recording = null;
    }
    
    this.onCommandRecognized = null;
    this.isInitialized = false;
  }
}

export default new SpeechService();