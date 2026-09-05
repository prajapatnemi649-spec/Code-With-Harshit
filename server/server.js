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

console.log("-----------------------------------------");
console.log(`✅ ACTIVE GROQ KEY: ${GROQ_SECRET.substring(0, 10)}... (Length: ${GROQ_SECRET.length})`);
console.log("-----------------------------------------");

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
                model: "openai/gpt-oss-120b", // Updated active Groq model
                messages: [
                    {
                        role: "system",
                        content: `You are Harshit AI, the intelligent coding mentor for 'Code With Harshit'. The student's name is ${studentName || 'Student'}. Always answer directly in clear, friendly Hinglish with practical, clean code examples and formatting.`
                    },
                    { role: "user", content: prompt }
                ],
                max_tokens: 600,
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
        console.error("Server Fetch Error:", err);
        res.status(500).json({ error: "Internal Server Error: " + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});