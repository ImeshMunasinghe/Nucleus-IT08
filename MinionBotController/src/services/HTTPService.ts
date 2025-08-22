import { StorageService } from './StorageService';

export interface DigitCaptureResponse {
  status: string;
  error?: string;
}

export interface DigitStatusResponse {
  digit_game_enabled: boolean;
  first_digit: string;
  second_digit: string;
  digit_count: number;
}

export const HTTPService = {
  async sendDigitCaptureRequest(): Promise<DigitCaptureResponse> {
    try {
      const settings = await StorageService.getSettings();
      const mainEsp32IP = '10.136.130.39'; // Main ESP32 IP address
      
      const response = await fetch(`http://${mainEsp32IP}/digit_capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'capture',
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send digit capture request:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getDigitStatus(): Promise<DigitStatusResponse | null> {
    try {
      const settings = await StorageService.getSettings();
      const mainEsp32IP = '10.136.130.39'; // Main ESP32 IP address
      
      const response = await fetch(`http://${mainEsp32IP}/digit_status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to get digit status:', error);
      return null;
    }
  },

  async testConnection(): Promise<boolean> {
    try {
      const settings = await StorageService.getSettings();
      const mainEsp32IP = '10.136.130.39'; // Main ESP32 IP address
      
      const response = await fetch(`http://${mainEsp32IP}/`, {
        method: 'GET',
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },
};
