// src/services/groqService.js
import Groq from "groq-sdk";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error("Groq API Key is not defined. Please set it in your .env file (e.g., VITE_GROQ_API_KEY).");
}

const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

export async function callGroqAI(messages) {
    try {
        console.log("groqService.js - Messages received by callGroqAI:", JSON.stringify(messages, null, 2));

        const response = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024,
        });

        const aiResponseContent = response.choices[0]?.message?.content;

        if (aiResponseContent) {
            return { success: true, aiResponse: aiResponseContent };
        } else {
            console.warn("Groq API returned no content for the response.");
            return { success: false, error: "AI returned no content or an empty response." };
        }

    } catch (error) {
        console.error("Error calling Groq AI:", error);

        let errorMessage = "An unknown error occurred while communicating with the AI.";
        if (error.response && error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return { success: false, error: { message: errorMessage, originalError: error } };
    }
}