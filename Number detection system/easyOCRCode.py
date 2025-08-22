import cv2
import numpy as np
import requests
import os
import re
from PIL import Image
import time
import base64
from openai import OpenAI

class DigitOCR:
    def __init__(self, openai_api_key=None):
        # Initialize OpenAI client
        print("Initializing OpenAI client...")
        try:
            if not openai_api_key:
                openai_api_key = input("Enter your OpenAI API key: ").strip()
            
            self.client = OpenAI(api_key=openai_api_key)
            print("OpenAI client initialized successfully!")
        except Exception as e:
            print(f"Error initializing OpenAI client: {e}")
            self.client = None

    def test_esp32_connection(self, esp32_ip):
        """Test connection to ESP32-CAM"""
        print(f"Testing connection to {esp32_ip}...")
        import socket
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            result = sock.connect_ex((esp32_ip, 80))
            sock.close()
            if result == 0:
                print("✅ Port 80 is open")
            else:
                print("❌ Cannot connect to port 80")
                return False
        except Exception as e:
            print(f"❌ Socket connection failed: {e}")
            return False

        endpoints = ["/", "/stream"]
        for endpoint in endpoints:
            try:
                url = f"http://{esp32_ip}{endpoint}"
                response = requests.get(url, timeout=10)
                print(f"✅ {endpoint}: {response.status_code}")
            except Exception as e:
                print(f"❌ {endpoint}: {e}")
        
        # Test /capture endpoint with longer timeout and retries
        print("Testing /capture endpoint...")
        try:
            url = f"http://{esp32_ip}/capture"
            # First, try to "wake up" the camera with a quick request
            try:
                requests.get(url, timeout=5)
            except:
                pass  # Ignore first request failure
            
            time.sleep(2)  # Give camera time to initialize
            
            # Now test properly
            response = requests.get(url, timeout=30)
            print(f"✅ /capture: {response.status_code}")
            return True
        except Exception as e:
            print(f"❌ /capture: {e}")
            print("Note: /capture endpoint might need initialization. Trying enhanced capture method...")
            return True  # Still return True to allow trying enhanced method
            
    def initialize_esp32_camera(self, esp32_ip):
        """Initialize ESP32-CAM camera before capturing"""
        print("Initializing ESP32-CAM camera...")
        try:
            # Try to access the stream first to wake up the camera
            stream_url = f"http://{esp32_ip}/stream"
            response = requests.get(stream_url, timeout=5, stream=True)
            # Read just a small chunk to activate the camera
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    break
            response.close()
            print("Camera stream activated")
            time.sleep(2)  # Give camera time to stabilize
        except Exception as e:
            print(f"Stream initialization failed: {e}")
            
        # Try a simple GET to root to ensure ESP32 is responsive
        try:
            requests.get(f"http://{esp32_ip}/", timeout=5)
        except:
            pass

    def download_image_from_esp32(self, esp32_ip, save_path="captured_image.jpg"):
        """Enhanced download with better ESP32-CAM handling"""
        try:
            if not self.test_esp32_connection(esp32_ip):
                print("Connection test failed. Please check:")
                print("1. ESP32-CAM is powered on")
                print("2. ESP32-CAM is connected to WiFi")
                print("3. IP address is correct")
                print("4. Both devices are on the same network")
                return None

            # Initialize camera first
            self.initialize_esp32_camera(esp32_ip)
            
            url = f"http://{esp32_ip}/capture"
            print(f"Downloading image from {url}...")
            
            # Enhanced retry logic with progressive timeouts
            timeouts = [10, 20, 30, 45, 60]  # Progressive timeouts
            
            for attempt in range(len(timeouts)):
                try:
                    timeout = timeouts[attempt]
                    print(f"Attempt {attempt + 1}/{len(timeouts)} with {timeout}s timeout...")
                    
                    # Try to wake up camera before each attempt (except first)
                    if attempt > 0:
                        self.initialize_esp32_camera(esp32_ip)
                        time.sleep(1)
                    
                    response = requests.get(url, timeout=timeout, stream=True)
                    
                    # Check response status
                    if response.status_code == 500:
                        print(f"Server error (500) - camera might be busy. Waiting...")
                        response.close()
                        time.sleep(5)  # Wait longer for 500 errors
                        continue
                        
                    response.raise_for_status()
                    
                    # Read the content
                    content = response.content
                    response.close()
                    
                    if len(content) < 1000:
                        print(f"Warning: Response too small ({len(content)} bytes)")
                        time.sleep(2)
                        continue
                    
                    # Save and verify the image
                    with open(save_path, 'wb') as f:
                        f.write(content)
                    
                    # Verify it's a valid image
                    img = cv2.imread(save_path)
                    if img is None:
                        print(f"Error: Downloaded file {save_path} is not a valid image")
                        if os.path.exists(save_path):
                            os.remove(save_path)
                        time.sleep(2)
                        continue
                    
                    print(f"✅ Image downloaded successfully: {save_path}")
                    print(f"Image size: {len(content)} bytes, Dimensions: {img.shape}")
                    return save_path
                    
                except requests.exceptions.Timeout:
                    print(f"Attempt {attempt + 1} timed out after {timeout}s")
                    if attempt < len(timeouts) - 1:
                        print("Retrying with longer timeout...")
                        time.sleep(3)
                    else:
                        raise
                except requests.exceptions.RequestException as e:
                    if "500" in str(e):
                        print(f"Server error on attempt {attempt + 1}: {e}")
                        if attempt < len(timeouts) - 1:
                            print("Waiting before retry...")
                            time.sleep(5)
                            continue
                    raise
                    
        except requests.exceptions.ConnectionError as e:
            print(f"❌ Connection Error: Cannot reach ESP32-CAM at {esp32_ip}")
            print("Troubleshooting steps:")
            print("1. Check ESP32-CAM power and status LED")
            print("2. Verify WiFi connection on ESP32-CAM")
            print("3. Confirm IP address is correct")
            print("4. Try pinging the IP: ping " + esp32_ip)
            return None
        except requests.exceptions.Timeout as e:
            print(f"❌ Timeout Error: ESP32-CAM is not responding after multiple attempts")
            print("The camera might be stuck. Try:")
            print("1. Reset the ESP32-CAM")
            print("2. Check if camera module is properly connected")
            print("3. Verify ESP32-CAM firmware is working")
            return None
        except requests.exceptions.RequestException as e:
            print(f"❌ Request Error: {e}")
            return None
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
            return None

    def rotate_image(self, image, angle):
        """Rotate image by specified angle"""
        if angle == 0:
            return image
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        
        # Calculate new dimensions to prevent cropping
        cos_angle = abs(matrix[0, 0])
        sin_angle = abs(matrix[0, 1])
        new_w = int((h * sin_angle) + (w * cos_angle))
        new_h = int((h * cos_angle) + (w * sin_angle))
        
        # Adjust translation
        matrix[0, 2] += (new_w - w) / 2
        matrix[1, 2] += (new_h - h) / 2
        
        rotated = cv2.warpAffine(image, matrix, (new_w, new_h), 
                                flags=cv2.INTER_CUBIC,
                                borderMode=cv2.BORDER_REPLICATE)
        return rotated

    def preprocess_image_for_digit(self, image: np.ndarray) -> list:
        """Enhanced preprocessing - normal orientation and 90-degree rotation only"""
        # Resize if too small
        h, w = image.shape[:2]
        if h < 50 or w < 50:
            scale_factor = max(3.0, 100 / w, 100 / h)
            new_w = int(w * scale_factor)
            new_h = int(h * scale_factor)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
        
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        processed_images = []
        
        # Only 90° rotation
        rotation_angles = [0, 90]  # Include normal orientation too
        
        for angle in rotation_angles:
            rotated = self.rotate_image(gray, angle)
            
            # Apply different preprocessing methods to each rotation
            # Method 1: CLAHE + Adaptive threshold
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(rotated)
            filtered = cv2.bilateralFilter(enhanced, 9, 75, 75)
            thresh1 = cv2.adaptiveThreshold(filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                          cv2.THRESH_BINARY, 21, 5)
            processed_images.append((thresh1, angle, "adaptive"))
            
            # Method 2: OTSU thresholding
            _, thresh2 = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            processed_images.append((thresh2, angle, "otsu"))
            
            # Method 3: Morphological processing
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            morph = cv2.morphologyEx(thresh1, cv2.MORPH_CLOSE, kernel)
            processed_images.append((morph, angle, "morph"))
        
        return processed_images

    def image_to_base64(self, image_array):
        """Convert numpy image array to base64 string"""
        try:
            # Convert to PIL Image
            if len(image_array.shape) == 2:  # Grayscale
                pil_image = Image.fromarray(image_array, mode='L')
            else:  # Color
                pil_image = Image.fromarray(cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB))
            
            # Convert to bytes
            import io
            buffer = io.BytesIO()
            pil_image.save(buffer, format='PNG')
            
            # Encode to base64
            img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            return img_base64
        except Exception as e:
            print(f"Error converting image to base64: {e}")
            return None

    def openai_digit_ocr(self, image_array, rotation_angle=0, method_name=""):
        """Use OpenAI Vision API to recognize single digit"""
        if self.client is None:
            print("OpenAI client not initialized")
            return None
        
        try:
            # Convert image to base64
            base64_image = self.image_to_base64(image_array)
            if not base64_image:
                return None
            
            print(f"Sending image to OpenAI Vision API ({method_name} at {rotation_angle}°)...")
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using the more cost-effective vision model
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Look at this image carefully. There should be exactly ONE single digit (0-9) in this image. Please identify ONLY the digit and respond with just that single digit number. If you see multiple digits, choose the most prominent one. If you cannot clearly see any digit, respond with 'NONE'. Do not include any other text or explanation in your response."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=10,
                temperature=0.1
            )
            
            result = response.choices[0].message.content.strip()
            print(f"OpenAI response ({method_name} {rotation_angle}°): '{result}'")
            
            # Extract only single digit
            digit_match = re.search(r'[0-9]', result)
            if digit_match:
                digit = digit_match.group()
                confidence = 0.9  # High confidence for OpenAI
                
                # Boost confidence for normal orientation
                if rotation_angle == 0:
                    confidence = 0.95
                
                return {
                    'digit': digit,
                    'confidence': confidence,
                    'rotation': rotation_angle,
                    'method': method_name,
                    'raw_response': result
                }
            
            return None
            
        except Exception as e:
            print(f"OpenAI API error ({method_name} {rotation_angle}°): {e}")
            return None

    def advanced_digit_ocr(self, image: np.ndarray) -> str:
        """Enhanced OCR with OpenAI Vision API and 90-degree rotation support"""
        if image.size == 0 or self.client is None:
            return ""
        
        processed_images = self.preprocess_image_for_digit(image)
        all_results = []
        
        print("=== STARTING DIGIT OCR WITH OPENAI (Normal + 90° Rotation) ===")
        
        for i, (processed_img, rotation_angle, method_name) in enumerate(processed_images):
            debug_path = f"debug_digit_{method_name}{rotation_angle}deg{int(time.time())}_{i}.png"
            cv2.imwrite(debug_path, processed_img)
            print(f"Processing {method_name} at {rotation_angle}°, saved: {debug_path}")
            
            # Use OpenAI Vision API
            result = self.openai_digit_ocr(processed_img, rotation_angle, method_name)
            
            if result:
                all_results.append(result)
                print(f"✅ Found digit: '{result['digit']}' (confidence: {result['confidence']:.3f})")
            else:
                print(f"❌ No digit found")
        
        if all_results:
            # Sort by confidence, then prefer normal rotation (0°)
            all_results.sort(key=lambda x: (x['confidence'], x['rotation'] == 0), reverse=True)
            
            best_result = all_results[0]
            print(f"=== BEST DIGIT SELECTED ===")
            print(f"Digit: '{best_result['digit']}'")
            print(f"Confidence: {best_result['confidence']:.3f}")
            print(f"Rotation: {best_result['rotation']}°")
            print(f"Method: {best_result['method']}")
            print(f"Raw OpenAI response: '{best_result['raw_response']}'")
            
            # If digit was rotated, mention it
            if best_result['rotation'] == 90:
                print(f"Note: Digit was detected at 90° rotation (sideways)")
            
            return best_result['digit']
        
        print("No valid digit results obtained")
        return ""

    def recognize_digit(self, image_path, show_results=True):
        """Main function to recognize digits from image"""
        print(f"\n--- Processing image: {image_path} ---")
        if not os.path.exists(image_path):
            print(f"Error: Image file {image_path} not found!")
            return None
        
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: Could not load image {image_path}")
            return None
        
        print(f"Image loaded: {image.shape}")
        
        digit = self.advanced_digit_ocr(image)
        
        if digit:
            print(f"\n🎯 FINAL RESULT: The digit is '{digit}'")
            if show_results:
                self.display_results(image_path, [{'digit': digit, 'confidence': 1.0, 'bbox': None}])
            return digit
        
        print("❌ No digits found in the image!")
        print("Suggestions:")
        print("1. Check if the image contains clear, visible digits")
        print("2. Adjust ESP32-CAM position or lighting")
        print("3. Ensure digit is large enough and well-contrasted")
        print("4. Try manual rotation if digit appears upside down or at other angles")
        return None

    def display_results(self, image_path, digits):
        """Save image with detected digits highlighted"""
        try:
            image = cv2.imread(image_path)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            for digit_info in digits:
                digit = digit_info['digit']
                confidence = digit_info['confidence']
                
                # Add text overlay since we don't have bbox from OpenAI
                h, w = image_rgb.shape[:2]
                label = f"Digit: {digit} ({confidence:.2f})"
                cv2.putText(image_rgb, label, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                           1, (255, 0, 0), 2)
            
            annotated_path = f"annotated_{os.path.basename(image_path)}"
            cv2.imwrite(annotated_path, cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR))
            print(f"Annotated image saved: {annotated_path}")
            
        except Exception as e:
            print(f"Error saving annotated image: {e}")

    def continuous_monitoring(self, esp32_ip, interval=5):
        """Continuously monitor ESP32-CAM for new images"""
        print(f"Starting continuous monitoring of ESP32-CAM at {esp32_ip}")
        print(f"Checking every {interval} seconds...")
        print("Press Ctrl+C to stop")
        
        try:
            while True:
                timestamp = int(time.time())
                image_path = self.download_image_from_esp32(esp32_ip, f"monitor_{timestamp}.jpg")
                
                if image_path:
                    digit = self.recognize_digit(image_path, show_results=False)
                    if digit:
                        print(f"🎯 DETECTED DIGIT: {digit} (at {time.strftime('%H:%M:%S')})")
                    else:
                        print(f"No digit detected (at {time.strftime('%H:%M:%S')})")
                    
                    # Clean up old images
                    try:
                        if os.path.exists(image_path):
                            os.remove(image_path)
                    except:
                        pass
                else:
                    print(f"Failed to capture image (at {time.strftime('%H:%M:%S')})")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n✅ Monitoring stopped by user")

def main():
    """Main function with menu interface"""
    # Initialize with OpenAI API key
    api_key = None
    if os.getenv('OPENAI_API_KEY'):
        api_key = os.getenv('OPENAI_API_KEY')
        print("Using OpenAI API key from environment variable")
    
    ocr = DigitOCR(openai_api_key=api_key)
    DEFAULT_ESP32_IP = "192.168.103.194"  # <-- Updated default IP
    
    while True:
        print("\n" + "="*50)
        print("ESP32-CAM DIGIT OCR SYSTEM v3.0")
        print("Powered by OpenAI Vision API!")
        print("="*50)
        print("1. Process local image file")
        print("2. Capture and process from ESP32-CAM")
        print("3. Start continuous monitoring")
        print("4. Test ESP32-CAM connection")
        print("5. Network diagnostics")
        print("6. Test with sample images")
        print("7. Exit")
        print("-"*50)
        
        choice = input("Enter your choice (1-7): ").strip()
        
        if choice == '1':
            image_path = input("Enter image path: ").strip()
            if image_path:
                result = ocr.recognize_digit(image_path)
                if result:
                    print(f"\n🎯 FINAL RESULT: The digit is '{result}'")
                    
        elif choice == '2':
            esp32_ip = input(f"Enter ESP32-CAM IP address (default {DEFAULT_ESP32_IP}): ").strip()
            if not esp32_ip:
                esp32_ip = DEFAULT_ESP32_IP
                
            print("📷 Capturing image from ESP32-CAM...")
            image_path = ocr.download_image_from_esp32(esp32_ip)
            
            if image_path:
                result = ocr.recognize_digit(image_path)
                if result:
                    print(f"\n🎯 FINAL RESULT: The digit is '{result}'")
                    
        elif choice == '3':
            esp32_ip = input(f"Enter ESP32-CAM IP address (default {DEFAULT_ESP32_IP}): ").strip()
            interval = input("Enter check interval in seconds (default 5): ").strip()
            interval = int(interval) if interval.isdigit() else 5
            if not esp32_ip:
                esp32_ip = DEFAULT_ESP32_IP
            ocr.continuous_monitoring(esp32_ip, interval)
            
        elif choice == '4':
            esp32_ip = input(f"Enter ESP32-CAM IP address (default {DEFAULT_ESP32_IP}): ").strip()
            if not esp32_ip:
                esp32_ip = DEFAULT_ESP32_IP
            ocr.test_esp32_connection(esp32_ip)
            
        elif choice == '5':
            run_network_diagnostics()
            
        elif choice == '6':
            print("Testing with sample digit images...")
            test_images = ["test_digit_1.jpg", "test_digit_2.jpg", "sample.jpg"]
            for test_img in test_images:
                if os.path.exists(test_img):
                    print(f"\nTesting with {test_img}:")
                    result = ocr.recognize_digit(test_img)
                    if result:
                        print(f"✅ Result: {result}")
            if not any(os.path.exists(img) for img in test_images):
                print("No test images found. Place some digit images in the current directory.")
                
        elif choice == '7':
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please try again.")

def run_network_diagnostics():
    """Run network diagnostics to help troubleshoot connectivity"""
    print("\n🔧 Network Diagnostics")
    print("=" * 30)
    
    try:
        import socket
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print(f"Your computer's IP: {local_ip}")
    except:
        print("Could not determine local IP")
        return
    
    ip_parts = local_ip.split('.')
    network_base = f"{ip_parts[0]}.{ip_parts[1]}.{ip_parts[2]}"
    print(f"Network range: {network_base}.1-254")
    
    esp32_ip = input(f"\nEnter ESP32-CAM IP (or press Enter to scan {network_base}.1-20): ").strip()
    
    if not esp32_ip:
        print(f"🔍 Scanning {network_base}.1-20 for ESP32-CAM...")
        found_devices = scan_network_range(network_base, 1, 21)
        if found_devices:
            print("Found devices:")
            for ip in found_devices:
                print(f"  - {ip}")
        else:
            print("No devices found in range")
    else:
        test_ip_connectivity(esp32_ip)

def scan_network_range(network_base, start, end):
    """Scan network range for devices on port 80"""
    import socket
    from threading import Thread
    found_devices = []
    
    def test_ip(ip):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((ip, 80))
            sock.close()
            if result == 0:
                found_devices.append(ip)
                print(f"Found device: {ip}")
        except:
            pass
    
    threads = [Thread(target=test_ip, args=(f"{network_base}.{i}",)) for i in range(start, end)]
    
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
        
    return found_devices

def test_ip_connectivity(ip):
    """Test connectivity to specific IP"""
    import subprocess
    import socket
    
    print(f"\n🔍 Testing connectivity to {ip}...")
    
    # Ping test
    try:
        result = subprocess.run(['ping', '-c', '1', ip], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ Ping successful")
        else:
            print("❌ Ping failed")
    except:
        print("❌ Ping test failed")
    
    # Port test
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((ip, 80))
        sock.close()
        if result == 0:
            print("✅ Port 80 is open")
        else:
            print("❌ Port 80 is closed or filtered")
    except:
        print("❌ Port test failed")
    
    # HTTP test
    try:
        response = requests.get(f"http://{ip}/", timeout=5)
        print(f"✅ HTTP response: {response.status_code}")
    except:
        print("❌ HTTP request failed")

if __name__ == "__main__":
    main()