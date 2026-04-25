import express from "express";
import { createClient } from "../utils/groqClient.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, transcript, chatPrompt } = req.body;
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) return res.status(401).json({ error: "Missing API Key" });

    const client = createClient(apiKey);

    const systemPrompt = chatPrompt || `
You are a highly capable AI meeting assistant. 
Use the transcript context to provide detailed, accurate, and helpful answers.
`;

    const userPrompt = `
${chatPrompt}

User Input/Suggestion: "${message}"

Full Conversation Context:
${transcript}
`;

    const MODELS = ["gpt-oss-120b", "llama-3.3-70b-versatile"];
    let response = null;

    for (const model of MODELS) {
      try {
        response = await client.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
        });
        console.log(`[chat] using model: ${model}`);
        break;
      } catch (err) {
        if (err.status === 404) {
          console.warn(`[chat] model ${model} not found, trying next...`);
          continue;
        }
        throw err;
      }
    }

    if (!response) throw new Error("No available model could process the request.");


    res.json({
      reply: response.choices[0].message.content,
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

