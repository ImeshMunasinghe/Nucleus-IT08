// Bluetooth Device Interface
export interface BluetoothDevice {
    id: string;
    name: string;
    isConnected: boolean;
    rssi?: number;
    services?: string[];
  }
  
  // Connection Status Enum
  export enum ConnectionStatus {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    ERROR = 'ERROR',
    SCANNING = 'SCANNING'
  }
  
  // Voice Command Interface
  export interface VoiceCommand {
    phrase: string;
    command: string;
    description: string;
  }
  
  // Speech Recognition Status
  export interface SpeechRecognitionStatus {
    isInitialized: boolean;
    isListening: boolean;
    isUsingMockService: boolean;
    lastError?: string;
  }
  
  // Robot Control Command Types
  export type RobotCommand = 
    | 'FORWARD'
    | 'BACKWARD' 
    | 'LEFT'
    | 'RIGHT'
    | 'STOP'
    | 'MODE_GAME'
    | 'MODE_PLAY'
    | 'MODE_ENTERTAINMENT'
    | 'DANCE'
    | 'SPIN'
    | 'SPEED_UP'
    | 'SPEED_DOWN';
  
  // Robot Mode Enum
  export enum RobotMode {
    GAME = 'G',
    PLAY = 'M',
    ENTERTAINMENT = 'E'
  }
  
  // Navigation Props (for React Navigation)
  export type RootStackParamList = {
    MainMenu: undefined;
    GameMode: undefined;
    PlayMode: undefined;
    Settings: undefined;
    Connection: undefined;
    Control: undefined;
    VoiceControl: undefined;
  };
  
  // Component Props Types
  export interface MinionButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'accent';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    style?: any;
  }
  
  export interface ConnectionStatusIndicatorProps {
    status: ConnectionStatus;
    style?: any;
  }
  
  // Service Response Types
  export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  // Azure Speech Configuration
  export interface AzureSpeechConfig {
    subscriptionKey1: string;
    subscriptionKey2?: string;
    region: string;
    endpoint: string;
  }
  
  // App State Types
  export interface AppState {
    bluetoothStatus: ConnectionStatus;
    speechStatus: SpeechRecognitionStatus;
    connectedDevice?: BluetoothDevice;
    lastCommand?: string;
    isVoiceControlActive: boolean;
  }