import { RobotCommand, VoiceCommand } from '../types';

// Azure Speech Services Configuration
export const AZURE_SPEECH_CONFIG = {
  region: 'eastus',
  subscriptionKey1: 'AHTvEPSqER9ahxRD4nOkLDzeaPxwBaP4yVGHKX8UJqpov3GGQTJDJQQJ99BHACYeBjFXJ3w3AAAYACOGVXJi',
  subscriptionKey2: '1KPaW7otmHvGJXgu5e1QdZJOqgBFOR5VUILGy1TNXayogsee0yrsJQQJ99BHACYeBjFXJ3w3AAAYACOGIcU7',
  endpoint: 'https://eastus.api.cognitive.microsoft.com/'
};

// Minion Theme Colors
export const MINION_COLORS = {
  primary: '#FFD700', // Minion Yellow
  secondary: '#0066CC', // Minion Blue
  accent: '#FF6B35', // Orange
  background: '#F0F8FF', // Light Blue Background
  text: '#2C3E50', // Dark Blue Text
  success: '#27AE60', // Green
  error: '#E74C3C', // Red
  warning: '#F39C12' // Orange
};

// Robot Commands
export const ROBOT_COMMANDS: RobotCommand[] = [
  { command: 'F', description: 'Forward', icon: 'arrow-up' },
  { command: 'B', description: 'Backward', icon: 'arrow-down' },
  { command: 'L', description: 'Left', icon: 'arrow-left' },
  { command: 'R', description: 'Right', icon: 'arrow-right' },
  { command: 'S', description: 'Stop', icon: 'stop' }
];

// Voice Commands
export const VOICE_COMMANDS: VoiceCommand[] = [
  { phrase: 'forward', command: 'F', description: 'Move Forward' },
  { phrase: 'backward', command: 'B', description: 'Move Backward' },
  { phrase: 'left', command: 'L', description: 'Turn Left' },
  { phrase: 'right', command: 'R', description: 'Turn Right' },
  { phrase: 'stop', command: 'S', description: 'Stop Moving' },
  { phrase: 'game mode', command: 'G', description: 'Switch to Game Mode' },
  { phrase: 'play mode', command: 'M', description: 'Switch to Play Mode' },
  { phrase: 'entertainment mode', command: 'E', description: 'Switch to Entertainment Mode' }
];

// Bluetooth Configuration
export const BLUETOOTH_CONFIG = {
  serviceUUID: '0000ffe0-0000-1000-8000-00805f9b34fb',
  characteristicUUID: '0000ffe1-0000-1000-8000-00805f9b34fb',
  deviceName: 'ESP32_SPEAKER'
};

// App Settings
export const DEFAULT_SETTINGS = {
  voiceEnabled: true,
  soundEnabled: true,
  autoConnect: false
};
