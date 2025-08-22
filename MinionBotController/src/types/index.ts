export interface BluetoothDevice {
  id: string;
  name: string;
  isConnected: boolean;
}

export interface RobotCommand {
  command: string;
  description: string;
  icon: string;
}

export interface VoiceCommand {
  phrase: string;
  command: string;
  description: string;
}

export enum RobotMode {
  GAME = 'G',
  PLAY = 'M',
  ENTERTAINMENT = 'E'
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export interface AppSettings {
  voiceEnabled: boolean;
  soundEnabled: boolean;
  autoConnect: boolean;
  selectedDeviceId?: string;
}
