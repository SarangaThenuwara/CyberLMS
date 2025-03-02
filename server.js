require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use the port from .env or default to 3000

// Get Telegram credentials from .env
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[ERROR] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env file.');
    process.exit(1); // Exit the application if credentials are missing
}

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    console.log(`[BODY]`, req.body);
    next();
});

// Root Route (optional, since static files will handle this)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to send user messages to Telegram
app.post('/send-message', async (req, res) => {
    const { name, email, message } = req.body;

    console.log('[INFO] Received message:', { name, email, message });

    if (!name || !email || !message) {
        console.warn('[WARN] Missing fields in request body:', { name, email, message });
        return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    try {
        console.log('[INFO] Sending message to Telegram...');
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: `New Inquiry:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });

        console.log('[SUCCESS] Message sent to Telegram successfully.');
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('[ERROR] Failed to send message to Telegram:', error.message);
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`[INFO] Server running on http://localhost:${PORT}`);
});