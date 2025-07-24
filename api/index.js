// Ultra-minimal Vercel function
const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
    res.json({ success: true, message: 'API working' });
});

app.post('/api/zapier/incoming-webhook', (req, res) => {
    res.json({ success: true, received: true });
});

app.get('/api/zapier/incoming-webhook', (req, res) => {
    res.json({ success: true, active: true });
});

app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>FlashFusion - Working</title></head>
        <body>
            <h1>FlashFusion is Online! 🚀</h1>
            <p>Basic server deployed successfully.</p>
            <ul>
                <li><a href="/health">Health Check</a></li>
                <li><a href="/api/status">API Status</a></li>
                <li><a href="/api/zapier/incoming-webhook">Zapier Endpoint</a></li>
            </ul>
        </body>
        </html>
    `);
});

app.all('*', (req, res) => {
    res.json({ 
        message: 'FlashFusion API', 
        path: req.path, 
        method: req.method,
        working: true 
    });
});

module.exports = app;