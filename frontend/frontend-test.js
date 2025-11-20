// Sakan Frontend - نسخة مبسطة للاختبار السريع
// Simple frontend server for quick testing without full React build

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sakan - منصة إدارة المباني</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 500px;
            width: 100%;
        }
        
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .logo p {
            color: #666;
            font-size: 0.9em;
        }
        
        .status {
            background: #f0f4ff;
            border-right: 4px solid #667eea;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .status h2 {
            color: #667eea;
            font-size: 1.2em;
            margin-bottom: 15px;
        }
        
        .status-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            color: #333;
        }
        
        .status-icon {
            font-size: 1.2em;
            margin-left: 10px;
            width: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
            transition: border-color 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
        }
        
        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        button:hover {
            transform: translateY(-2px);
        }
        
        .message {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            display: none;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            display: block;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            display: block;
        }
        
        .endpoints {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #eee;
        }
        
        .endpoints h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 0.9em;
        }
        
        .endpoint-item {
            background: #f9f9f9;
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 3px;
            font-size: 0.85em;
            color: #666;
            direction: ltr;
            text-align: left;
        }
        
        .server-status {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: 20px;
        }
        
        .server-status.online {
            color: #28a745;
        }
        
        .server-status.offline {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🏢 Sakan</h1>
            <p>منصة إدارة المباني الحديثة</p>
        </div>
        
        <div class="status">
            <h2>حالة النظام</h2>
            <div class="status-item">
                <span class="status-icon">✅</span>
                <span>Frontend متاح على البورت 3000</span>
            </div>
            <div class="status-item">
                <span class="status-icon" id="backend-status">⏳</span>
                <span>Backend على البورت 5000</span>
            </div>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" placeholder="admin@sakan.local" value="admin@sakan.local" required>
            </div>
            
            <div class="form-group">
                <label for="password">كلمة المرور</label>
                <input type="password" id="password" placeholder="password" value="password" required>
            </div>
            
            <button type="submit">دخول</button>
            
            <div id="message" class="message"></div>
        </form>
        
        <div class="endpoints">
            <h3>📡 API Endpoints المتاحة</h3>
            <div class="endpoint-item">GET /api/health</div>
            <div class="endpoint-item">POST /api/auth/login</div>
            <div class="endpoint-item">POST /api/auth/register</div>
            <div class="endpoint-item">GET /api/buildings</div>
            <div class="endpoint-item">GET /api/users</div>
        </div>
        
        <div class="server-status" id="serverStatus">
            🔄 جاري فحص حالة الخادم...
        </div>
    </div>
    
    <script>
        const API_URL = 'http://localhost:5000/api';
        
        // فحص حالة الخادم
        async function checkServerStatus() {
            try {
                const response = await fetch(API_URL + '/health', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    document.getElementById('backend-status').textContent = '✅';
                    document.getElementById('serverStatus').textContent = '✅ الخادم يعمل بشكل صحيح';
                    document.getElementById('serverStatus').classList.add('online');
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                document.getElementById('backend-status').textContent = '❌';
                document.getElementById('serverStatus').textContent = '❌ الخادم غير متاح';
                document.getElementById('serverStatus').classList.add('offline');
            }
        }
        
        // التحقق من الخادم عند التحميل
        checkServerStatus();
        
        // معالج النموذج
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            try {
                const response = await fetch(API_URL + '/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok && data.token) {
                    messageDiv.classList.remove('error');
                    messageDiv.classList.add('success');
                    messageDiv.textContent = '✅ تم تسجيل الدخول بنجاح! رمز الدخول محفوظ في console';
                    messageDiv.style.display = 'block';
                    
                    // حفظ التوكن
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    console.log('Token:', data.token);
                    console.log('User:', data.user);
                } else {
                    throw new Error(data.message || 'خطأ في تسجيل الدخول');
                }
            } catch (error) {
                messageDiv.classList.remove('success');
                messageDiv.classList.add('error');
                messageDiv.textContent = '❌ ' + error.message;
                messageDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, 'localhost', () => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ Sakan Frontend is running!');
  console.log('='.repeat(60));
  console.log(`🌐 Open browser: http://localhost:${PORT}`);
  console.log(`🔐 Login with: admin@sakan.local / password`);
  console.log('='.repeat(60) + '\n');
});
