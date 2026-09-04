const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

// ==========================================
// BASIC CONFIG
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// FRONTEND
// ==========================================

// index.html, app.js, style.css etc. root folder mein hain
app.use(express.static(__dirname));

// ==========================================
// AI CHAT API
// ==========================================

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        // API key Render Environment Variable se aayegi
        if (!process.env.GROQ_API_KEY) {
            console.error("❌ GROQ_API_KEY missing");

            return res.status(500).json({
                error: "GROQ API key is not configured"
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.GROQ_API_KEY}`
                },

                body: JSON.stringify({
                    const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const GROQ_SECRET = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith("gsk_")
    ? process.env.GROQ_API_KEY.trim()
    : "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";

app.post('/api/chat', async (req, res) => {
    const { prompt, studentName } = req.body;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_SECRET}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant", // 100% stable Groq free model
                messages: [
                    {
                        role: "system",
                        content: `You are Harshit AI, coding mentor for 'Code With Harshit'. Student: ${studentName || 'Student'}. Reply directly in friendly Hinglish with clean code examples.`
                    },
                    { role: "user", content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.6
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Groq API Error:", data);
            return res.status(response.status).json({ error: data.error?.message || "Groq API error" });
        }

        res.json({ reply: data.choices[0].message.content });
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
                    
});

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `🚀 Code With Harshit server running on port ${PORT}`
    );

    console.log(
        `🌐 Port: ${PORT}`
    );

});
