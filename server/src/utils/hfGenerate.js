const axios = require('axios');
require('dotenv').config();

// Using OpenRouter for multi-model reliability (DeepSeek)
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Generates text using OpenRouter (DeepSeek)
 */
const hfGenerateText = async (prompt) => {
    if (!API_KEY) {
        throw new Error("OpenRouter API Key is missing in environment variables.");
    }

    try {
        console.log("[OpenRouter AI] Generating questions via DeepSeek...");
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: "deepseek/deepseek-chat", // Reliable DeepSeek V3/R1 choice on OpenRouter
                messages: [
                    { role: "system", content: "You are an expert academic examiner. Generate clear, high-quality school exam questions based on user instructions." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 1000,
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter for some models
                    "X-Title": "AI Exam Generator",
                    "Content-Type": "application/json"
                },
                timeout: 60000
            }
        );

        if (response.data?.choices && response.data.choices[0]?.message?.content) {
            console.log("[OpenRouter AI] Success!");
            return response.data.choices[0].message.content;
        }

        throw new Error("Invalid response from OpenRouter: " + JSON.stringify(response.data));
    } catch (error) {
        const errorData = error.response?.data;
        console.error("OpenRouter API Error:", errorData || error.message);

        let msg = "AI Generation failed via OpenRouter.";
        if (errorData?.error?.message) msg = errorData.error.message;
        else if (errorData?.message) msg = errorData.message;

        throw new Error(msg);
    }
};

module.exports = { hfGenerateText };
