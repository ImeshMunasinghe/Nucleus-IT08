import { BluetoothDevice, ConnectionStatus } from '../types/types';

class BluetoothService {
  private isConnected: boolean = false;
  private onStatusChange: ((status: ConnectionStatus) => void) | null = null;

  // Initialize Bluetooth (mock implementation)
  async initialize(): Promise<boolean> {
    try {
      console.log('Mock Bluetooth: Initializing...');
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Mock Bluetooth: Initialized successfully');
      return true;
    } catch (error) {
      console.error('Mock Bluetooth: Error initializing:', error);
      return false;
    }
  }

  // Scan for devices (mock implementation)
  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('Mock Bluetooth: Scanning for devices...');
      
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return mock devices
      const mockDevices: BluetoothDevice[] = [
        {
          id: 'mock-esp32-1',
          name: 'ESP32_SPEAKER',
          isConnected: false
        },
        {
          id: 'mock-esp32-2',
          name: 'ESP32_Robot',
          isConnected: false
        }
      ];
      
      console.log('Mock Bluetooth: Found devices:', mockDevices);
      return mockDevices;
    } catch (error) {
      console.error('Mock Bluetooth: Error scanning for devices:', error);
      return [];
    }
  }

  // Connect to device (mock implementation)
  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      console.log('Mock Bluetooth: Connecting to device:', deviceId);
      this.updateStatus(ConnectionStatus.CONNECTING);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.isConnected = true;
      this.updateStatus(ConnectionStatus.CONNECTED);
      console.log('Mock Bluetooth: Connected successfully');
      
      return true;
    } catch (error) {
      console.error('Mock Bluetooth: Error connecting to device:', error);
      this.updateStatus(ConnectionStatus.ERROR);
      return false;
    }
  }

  // Disconnect from device (mock implementation)
  async disconnect(): Promise<void> {
    try {
      console.log('Mock Bluetooth: Disconnecting...');
      
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isConnected = false;
      this.updateStatus(ConnectionStatus.DISCONNECTED);
      console.log('Mock Bluetooth: Disconnected successfully');
    } catch (error) {
      console.error('Mock Bluetooth: Error disconnecting:', error);
    }
  }

  // Send command to robot (mock implementation)
  async sendCommand(command: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        console.error('Mock Bluetooth: No device connected');
        return false;
      }

      console.log('Mock Bluetooth: Sending command:', command);
      
      // Simulate command sending delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Mock Bluetooth: Command sent successfully:', command);
      return true;
    } catch (error) {
      console.error('Mock Bluetooth: Error sending command:', error);
      return false;
    }
  }

  // Get connection status
  getConnectionStatus(): ConnectionStatus {
    if (this.isConnected) return ConnectionStatus.CONNECTED;
    return ConnectionStatus.DISCONNECTED;
  }

  // Set status change callback
  setStatusChangeCallback(callback: ((status: ConnectionStatus) => void) | null): void {
    this.onStatusChange = callback;
  }

  // Update status and notify callback
  private updateStatus(status: ConnectionStatus): void {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  // Cleanup
  destroy(): void {
    console.log('Mock Bluetooth: Destroying service...');
    this.isConnected = false;
  }
}

export default new BluetoothService();
