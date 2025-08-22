import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Vibration,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { StorageService } from '../services/StorageService';

type PlayModeNavigationProp = StackNavigationProp<RootStackParamList, 'PlayMode'>;
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const PlayModeScreen = () => {
  const navigation = useNavigation<PlayModeNavigationProp>();
  const [isConnected, setIsConnected] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [isDancing, setIsDancing] = useState(false);

  useEffect(() => {
    // Simulate Bluetooth connection
    setTimeout(() => setIsConnected(true), 1000);
    
    // Load saved video URL
    loadVideoUrl();
  }, []);

  // Handle orientation changes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const setLandscapeOrientation = async () => {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          console.log('Play Mode: Set to landscape orientation');
        } catch (error) {
          console.log('Orientation lock not supported on this device');
        }
      };

      setLandscapeOrientation();

      // Cleanup: restore portrait orientation when leaving screen
      return () => {
        const restoreOrientation = async () => {
          try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            console.log('Play Mode: Restored to portrait orientation');
          } catch (error) {
            console.log('Orientation unlock not supported on this device');
          }
        };
        restoreOrientation();
      };
    }, [])
  );

  const loadVideoUrl = async () => {
    try {
      const savedUrl = await StorageService.getVideoUrl();
      setVideoUrl(savedUrl);
    } catch (error) {
      console.error('Error loading video URL:', error);
    }
  };

  const sendCommand = (command: string) => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to MinionBot first');
      return;
    }
    
    Vibration.vibrate(50);
    Alert.alert('Command Sent', `Sending: ${command}`);
  };

  const handleScreenCapture = () => {
    Vibration.vibrate(100);
    Alert.alert('Screen Capture', 'Screenshot saved!');
  };

  const handleDanceMode = () => {
    setIsDancing(!isDancing);
    const command = isDancing ? 's' : 'E';
    sendCommand(command);
  };

  const updateVideoUrl = async () => {
    if (tempUrl.trim()) {
      try {
        await StorageService.saveVideoUrl(tempUrl);
        setVideoUrl(tempUrl);
        setShowUrlModal(false);
        setTempUrl('');
        Alert.alert('Success', 'Video URL updated successfully!');
      } catch (error) {
        console.error('Error saving video URL:', error);
        Alert.alert('Error', 'Failed to save video URL');
      }
    }
  };

  const getEmbedUrl = (url: string) => {
    // Convert YouTube URL to embed format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
          <Ionicons name="home" size={20} color="#1E3A8A" />
        </TouchableOpacity>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        <View style={styles.orientationIndicator}>
          <Ionicons name="phone-landscape" size={16} color="#1E3A8A" />
          <Text style={styles.orientationText}>Landscape</Text>
        </View>

        <TouchableOpacity 
          style={styles.urlButton} 
          onPress={() => setShowUrlModal(true)}
        >
          <Ionicons name="settings" size={20} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

             {/* Main Content */}
       <View style={styles.content}>
         {/* Left Side - Movement Controls */}
         <View style={styles.leftPanel}>
           <View style={styles.controlSection}>
             <Text style={styles.sectionTitle}>Movement</Text>
             
             {/* Forward */}
             <TouchableOpacity 
               style={styles.arrowButton} 
               onPress={() => sendCommand('f')}
             >
               <Ionicons name="arrow-up" size={20} color="#1E3A8A" />
             </TouchableOpacity>
             
             {/* Left/Right/Backward Row */}
             <View style={styles.middleRow}>
               <TouchableOpacity 
                 style={styles.arrowButton} 
                 onPress={() => sendCommand('l')}
               >
                 <Ionicons name="arrow-back" size={20} color="#1E3A8A" />
               </TouchableOpacity>
               
               <TouchableOpacity 
                 style={styles.stopButton} 
                 onPress={() => sendCommand('s')}
               >
                 <Ionicons name="stop" size={20} color="#FFFFFF" />
               </TouchableOpacity>
               
               <TouchableOpacity 
                 style={styles.arrowButton} 
                 onPress={() => sendCommand('r')}
               >
                 <Ionicons name="arrow-forward" size={20} color="#1E3A8A" />
               </TouchableOpacity>
             </View>
             
             {/* Backward */}
             <TouchableOpacity 
               style={styles.arrowButton} 
               onPress={() => sendCommand('b')}
             >
               <Ionicons name="arrow-down" size={20} color="#1E3A8A" />
             </TouchableOpacity>
           </View>

           {/* Sideways Movement */}
           <View style={styles.sidewaysSection}>
             <Text style={styles.sectionTitle}>Sideways</Text>
             <View style={styles.sidewaysRow}>
               <TouchableOpacity 
                 style={styles.sidewaysButton} 
                 onPress={() => sendCommand('sl')}
               >
                 <Ionicons name="arrow-back" size={16} color="#1E3A8A" />
                 <Text style={styles.sidewaysText}>L</Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                 style={styles.sidewaysButton} 
                 onPress={() => sendCommand('sr')}
               >
                 <Ionicons name="arrow-forward" size={16} color="#1E3A8A" />
                 <Text style={styles.sidewaysText}>R</Text>
               </TouchableOpacity>
             </View>
           </View>

           {/* Screen Capture */}
           <TouchableOpacity 
             style={styles.captureButton} 
             onPress={handleScreenCapture}
           >
             <Ionicons name="camera" size={16} color="#FFFFFF" />
             <Text style={styles.captureText}>Capture</Text>
           </TouchableOpacity>
         </View>

         {/* Center - Video Player */}
         <View style={styles.videoSection}>
           <Text style={styles.videoTitle}>Live Stream</Text>
           <View style={styles.videoContainer}>
             <WebView
               source={{ uri: getEmbedUrl(videoUrl) }}
               style={styles.videoPlayer}
               allowsFullscreenVideo={true}
               mediaPlaybackRequiresUserAction={false}
               javaScriptEnabled={true}
               domStorageEnabled={true}
             />
           </View>
         </View>

         {/* Right Side - Dance Mode */}
         <View style={styles.rightPanel}>
           <TouchableOpacity 
             style={[styles.danceButton, isDancing && styles.danceButtonActive]} 
             onPress={handleDanceMode}
           >
             <Ionicons 
               name={isDancing ? "musical-notes" : "musical-note"} 
               size={40} 
               color={isDancing ? "#FFFFFF" : "#1E3A8A"} 
             />
             <Text style={[styles.danceText, isDancing && styles.danceTextActive]}>
               {isDancing ? 'Dancing!' : 'Dance'}
             </Text>
           </TouchableOpacity>

           <View style={styles.infoSection}>
             <Text style={styles.infoTitle}>Play Mode</Text>
             <Text style={styles.infoText}>
               • Arrow buttons for movement{'\n'}
               • Sideways buttons for lateral{'\n'}
               • Dance mode for fun{'\n'}
               • Capture to save moments{'\n'}
               • Rotate for better view
             </Text>
           </View>
         </View>
       </View>

             {/* URL Modal */}
       <Modal
         visible={showUrlModal}
         transparent={true}
         animationType="slide"
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Update Video URL</Text>
             <TextInput
               style={styles.urlInput}
               placeholder="Enter YouTube URL"
               value={tempUrl}
               onChangeText={setTempUrl}
               autoCapitalize="none"
               autoCorrect={false}
             />
             <View style={styles.modalButtons}>
               <TouchableOpacity 
                 style={[styles.modalButton, styles.cancelButton]} 
                 onPress={() => setShowUrlModal(false)}
               >
                 <Text style={styles.cancelButtonText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 style={[styles.modalButton, styles.updateButton]} 
                 onPress={updateVideoUrl}
               >
                 <Text style={styles.updateButtonText}>Update</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>
     </ScrollView>
   );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  scrollContent: {
    minHeight: height,
    paddingBottom: 20,
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
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 2,
    minHeight: 35,
  },
  homeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  orientationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orientationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E3A8A',
    marginLeft: 3,
  },
  urlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftPanel: {
    width: width * 0.12,
    paddingVertical: 2,
    alignItems: 'center',
    paddingRight: -100,
  },
  controlSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 10,
    textAlign: 'center',
  },
  arrowButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 150,
  },
  stopButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sidewaysSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sidewaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  sidewaysButton: {
    width: 50,
    height: 35,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sidewaysText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1E3A8A',
    marginTop: 1,
  },
  captureButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  captureText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  videoSection: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: width * 0.7,
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 0,
  },
  videoContainer: {
    marginTop : -30,
    width: width * 0.54, // Reduced by 40% from 0.9 (0.9 * 0.6 = 0.54)
    height: (width * 0.54) * (9/16) * 0.9, // Increased height from 0.5 to 0.7
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  rightPanel: {
    width: width * 0.12,
    paddingVertical: 2,
    alignItems: 'center',
    paddingLeft: 10,
  },
  danceButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginRight: 50,
  },
  danceButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  danceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    marginTop: 5,
    textAlign: 'center',
  },
  danceTextActive: {
    color: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 20,
    textAlign: 'center',
  },
  urlInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 200,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  updateButton: {
    backgroundColor: '#1E3A8A',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PlayModeScreen;
