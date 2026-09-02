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
                    model: "llama-3.3-70b-versatile",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are the AI Mentor for Code With Harshit. Explain coding in simple Hinglish with clean beginner-friendly examples. Help with HTML, CSS, JavaScript, Python, Java and AI. If the user asks to build an app, website or component, provide complete ready-to-run code when appropriate."
                        },

                        {
                            role: "user",
                            content: message
                        }
                    ],

                    max_tokens: 700,
                    temperature: 0.6
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            console.error(
                "❌ Groq Error:",
                errorText
            );

            return res.status(500).json({
                error: "AI request failed"
            });
        }

        const data = await response.json();

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "No response generated"
            });
        }

        res.json({
            reply: reply
        });

    } catch (error) {

        console.error(
            "❌ Server Error:",
            error
        );

        res.status(500).json({
            error: "Server error"
        });
    }
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
