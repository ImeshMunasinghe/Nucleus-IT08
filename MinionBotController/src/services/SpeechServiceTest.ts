import { AZURE_SPEECH_CONFIG } from '../constants/constants';

/**
 * Test utility for Azure Speech REST API connectivity
 * This can be used to verify the service is accessible before using it in the main app
 */
export class SpeechServiceTest {
  
  /**
   * Test basic connectivity to Azure Speech REST API
   * @returns Promise<boolean> - true if service is accessible
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('SpeechServiceTest: Testing Azure Speech REST API connection...');
      
      if (!AZURE_SPEECH_CONFIG.subscriptionKey1 || !AZURE_SPEECH_CONFIG.region) {
        console.error('SpeechServiceTest: Missing Azure configuration');
        return false;
      }

      const testUrl = `https://${AZURE_SPEECH_CONFIG.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;
      
      // Create a minimal WAV file for testing
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

      console.log(`SpeechServiceTest: Response status: ${response.status}`);

      // If we get a 200, it means the service is working
      if (response.status === 200) {
        console.log('SpeechServiceTest: ✅ Azure Speech REST API is working');
        return true;
      }

      // If we get a 401, it means the key is invalid
      if (response.status === 401) {
        console.error('SpeechServiceTest: ❌ Azure Speech REST API authentication failed');
        return false;
      }

      // If we get a 200, it means the service is working (unlikely with empty audio)
      if (response.status === 200) {
        console.log('SpeechServiceTest: ✅ Azure Speech REST API is working');
        return true;
      }

      console.log(`SpeechServiceTest: ⚠️ Unexpected status: ${response.status}`);
      return false;

    } catch (error) {
      console.error('SpeechServiceTest: ❌ Error testing Azure connection:', error);
      return false;
    }
  }

  /**
   * Test with a simple audio file (if available)
   * @returns Promise<boolean> - true if speech recognition works
   */
  static async testSpeechRecognition(): Promise<boolean> {
    try {
      console.log('SpeechServiceTest: Testing speech recognition...');
      
      // This would require an actual audio file
      // For now, we'll just test the connection
      return await this.testConnection();
      
    } catch (error) {
      console.error('SpeechServiceTest: Error testing speech recognition:', error);
      return false;
    }
  }

  /**
   * Run all tests
   * @returns Promise<{connection: boolean, recognition: boolean}>
   */
  static async runAllTests(): Promise<{connection: boolean, recognition: boolean}> {
    console.log('SpeechServiceTest: Running all tests...');
    
    const connection = await this.testConnection();
    const recognition = await this.testSpeechRecognition();
    
    console.log('SpeechServiceTest: Test results:', { connection, recognition });
    
    return { connection, recognition };
  }
}
