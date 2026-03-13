from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import uuid
from datetime import datetime

class MockHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/v1/journal':
            # 读取请求体
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            # 模拟创建日记条目
            response_data = {
                "id": str(uuid.uuid4()),
                "timestamp": data.get("timestamp"),
                "title": data.get("title"),
                "content": data.get("content"),
                "tags": data.get("tags", []),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "deleted_at": None
            }
            
            # 发送响应
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_GET(self):
        if self.path.startswith('/api/v1/journal'):
            # 模拟获取日记列表
            response_data = {
                "total": 0,
                "items": []
            }
            
            # 发送响应
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=8001):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockHTTPRequestHandler)
    print(f'Starting mock server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()