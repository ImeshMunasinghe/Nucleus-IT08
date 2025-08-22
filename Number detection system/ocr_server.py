#!/usr/bin/env python3
"""
Python OCR HTTP Server
Receives images from ESP32-CAM and processes them using the existing OCR code
"""

import os
import sys
import time
import json
import tempfile
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

# Import the existing OCR class
from easyOCRCode import DigitOCR

class OCRHTTPHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, ocr_processor=None, **kwargs):
        self.ocr_processor = ocr_processor
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html = """
            <html>
            <head><title>OCR Server</title></head>
            <body>
                <h1>Python OCR Server</h1>
                <p>Status: Running</p>
                <p>Send POST request to /process_image with JPEG image data</p>
                <p>Server will process the image and return digit if found</p>
                <h2>Available Endpoints:</h2>
                <ul>
                    <li>GET / - This status page</li>
                    <li>GET /status - JSON status</li>
                    <li>POST /process_image - Process image and return digit</li>
                </ul>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
        elif self.path == '/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            status = {
                'status': 'running',
                'ocr_ready': self.ocr_processor is not None and self.ocr_processor.client is not None,
                'timestamp': int(time.time())
            }
            self.wfile.write(json.dumps(status).encode())
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/process_image':
            self.handle_image_processing()
        else:
            self.send_error(404)
    
    def handle_image_processing(self):
        try:
            # Get image data
            content_length = int(self.headers['Content-Length'])
            image_data = self.rfile.read(content_length)
            
            print(f"Received image data: {len(image_data)} bytes")
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                temp_file.write(image_data)
                temp_image_path = temp_file.name
            
            print(f"Image saved to: {temp_image_path}")
            
            # Process with OCR
            print(f"Processing image with OCR...")
            print(f"OCR Processor status: {self.ocr_processor is not None}")
            print(f"OpenAI Client status: {self.ocr_processor.client is not None if self.ocr_processor else 'N/A'}")
            
            try:
                digit = self.ocr_processor.recognize_digit(temp_image_path, show_results=False)
                print(f"OCR processing complete. Result: '{digit}'")
            except Exception as ocr_error:
                print(f"❌ OCR Processing Error: {ocr_error}")
                digit = ""
            
            # Save a copy for debugging (optional - comment out in production)
            debug_path = f"debug_image_{int(time.time())}.jpg"
            try:
                import shutil
                shutil.copy2(temp_image_path, debug_path)
                print(f"Debug: Image saved as {debug_path}")
            except:
                pass
            
            # Clean up temp file
            try:
                os.unlink(temp_image_path)
            except:
                pass
            
            # Prepare response
            response_data = {
                'success': bool(digit),
                'digit': digit if digit else "",
                'timestamp': int(time.time())
            }
            
            if not digit:
                response_data['error'] = 'No digit detected in image'
            
            print(f"OCR Result: {response_data}")
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_json = json.dumps(response_data)
            self.wfile.write(response_json.encode())
            
        except Exception as e:
            print(f"Error processing image: {e}")
            
            error_response = {
                'success': False,
                'error': str(e),
                'timestamp': int(time.time())
            }
            
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            self.wfile.write(json.dumps(error_response).encode())
    
    def log_message(self, format, *args):
        # Custom logging
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

class OCRServer:
    def __init__(self, host='0.0.0.0', port=8081):
        self.host = host
        self.port = port
        self.ocr_processor = None
        self.server = None
        
    def start(self):
        print("Initializing OCR processor...")
        try:
            self.ocr_processor = DigitOCR()
            
            if self.ocr_processor.client is None:
                print("❌ Failed to initialize OCR processor!")
                return False
            
            print("✅ OCR processor initialized successfully!")
            print(f"✅ OpenAI Client initialized: {type(self.ocr_processor.client)}")
            
        except Exception as e:
            print(f"❌ Error initializing OCR processor: {e}")
            return False
        
        # Create handler with OCR processor
        def handler(*args, **kwargs):
            return OCRHTTPHandler(*args, ocr_processor=self.ocr_processor, **kwargs)
        
        # Create and start server
        self.server = HTTPServer((self.host, self.port), handler)
        
        print(f"🚀 OCR Server starting on {self.host}:{self.port}")
        print(f"📡 Waiting for image processing requests...")
        print(f"🔗 Access server at: http://{self.host}:{self.port}")
        print("Press Ctrl+C to stop")
        
        try:
            self.server.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            self.stop()
            
        return True
    
    def stop(self):
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            print("✅ Server stopped")

def get_local_ip():
    """Get the local IP address"""
    import socket
    try:
        # Connect to a remote address (doesn't actually send data)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def main():
    print("="*60)
    print("🤖 PYTHON OCR HTTP SERVER")
    print("="*60)
    
    # Get network information
    local_ip = get_local_ip()
    port = 8081  # Changed from 8080 to avoid permission issues
    
    print(f"📍 Your computer's IP address: {local_ip}")
    print(f"📡 Server will run on: http://{local_ip}:{port}")
    print("\n⚠️  IMPORTANT: Update ESP32-CAM code with this IP address!")
    print(f"   Change 'ocr_server_ip' to: {local_ip}")
    print("="*60)
    
    # Check if OCR dependencies are available
    try:
        import openai
        import cv2
        print("✅ OCR dependencies found")
        
        # Test if our DigitOCR class can be imported
        from easyOCRCode import DigitOCR
        print("✅ DigitOCR class imported successfully")
        
        # Test quick initialization
        test_ocr = DigitOCR()
        if test_ocr.client is not None:
            print("✅ DigitOCR test initialization successful")
        else:
            print("⚠️  DigitOCR initialized but OpenAI client is None")
            
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("Install required packages:")
        print("pip install openai opencv-python pillow")
        return
    except Exception as e:
        print(f"❌ Error testing DigitOCR: {e}")
        return
    
    # Start server
    server = OCRServer(host='0.0.0.0', port=port)
    server.start()

if __name__ == "__main__":
    main()