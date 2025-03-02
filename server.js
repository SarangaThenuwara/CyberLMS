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
    console.log(`[HEADERS]`, req.headers); // Log headers for debugging
    console.log(`[QUERY]`, req.query); // Log query parameters
    console.log(`[BODY]`, req.body); // Log request body
    next();
});

// Root Route (optional, since static files will handle this)
app.get('/', (req, res) => {
    console.log('[INFO] Serving root route (/)');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to send user messages to Telegram
app.post('/send-message', async (req, res) => {
    const { name, email, phone, issue } = req.body;

    console.log('[INFO] Received POST request at /send-message');
    console.log('[INFO] Request Body:', { name, email, phone, issue });

    // Validate required fields
    if (!name || !email || !phone || !issue) {
        console.warn('[WARN] Missing fields in request body:', { name, email, phone, issue });
        return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.warn('[WARN] Invalid email format:', email);
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+[1-9]\d{1,14}$/; // E.164 format (e.g., +94771234567)
    if (!phoneRegex.test(phone)) {
        console.warn('[WARN] Invalid phone number format:', phone);
        return res.status(400).json({ success: false, message: 'Invalid phone number format. Please include the country code (e.g., +94).' });
    }

    try {
        console.log('[INFO] Sending message to Telegram...');
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: `New Inquiry:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nIssue: ${issue}`,
        });

        console.log('[SUCCESS] Message sent to Telegram successfully.');
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('[ERROR] Failed to send message to Telegram:', error.message);
        console.error('[ERROR] Full error details:', error); // Log full error object for debugging
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`[INFO] Server running on http://localhost:${PORT}`);
});
