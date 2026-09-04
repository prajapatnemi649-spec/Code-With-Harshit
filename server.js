const express = require("express");
const cors = require("cors");
path = require('path');

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

app.use(express.static(__dirname));

// ==========================================
// AI CHAT API
// ==========================================

app.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message || req.body.prompt;
        const studentName = req.body.studentName || "Student Coder";

        if (!userMessage || !userMessage.trim()) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const apiKey = process.env.GROQ_API_KEY || "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";

        if (!apiKey) {
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
                    "Authorization": `Bearer ${apiKey.trim()}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: `You are Harshit AI, the intelligent coding mentor for 'Code With Harshit'. The student's name is ${studentName}. Always answer directly in clear, friendly Hinglish with practical, clean code examples and formatting.`
                        },
                        { role: "user", content: userMessage }
                    ],
                    max_tokens: 600,
                    temperature: 0.6
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq API Error:", data);
            return res.status(response.status).json({ error: data.error?.message || "Groq API error" });
        }

        res.json({ reply: data.choices[0].message.content });
    } catch (err) {
        console.error("Server Fetch Error:", err);
        res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
});

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Code With Harshit server running on port ${PORT}`);
    console.log(`🌐 Port: ${PORT}`);
});
