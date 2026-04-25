import express from "express";
import { createClient } from "../utils/groqClient.js";

const router = express.Router();

// --- helpers ---
const getLastSentence = (text = "") => {
  const parts = text.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
  return parts.pop() || text;
};

const normalize = (s = "") =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

// --- route ---
router.post("/", async (req, res) => {
  try {
    const { transcript, suggestionPrompt } = req.body;
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ error: "Missing API Key" });
    }

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const client = createClient(apiKey);

    // ✅ Extract last sentence for the suggestion prompt context
    const lastSentence = getLastSentence(transcript);

    // 🔥 Use the prompt from frontend settings, or fallback to the hardcoded default
    const systemPrompt = suggestionPrompt || `
You are an expert real-time meeting assistant.
You will be given ONE latest sentence from a conversation.
Generate EXACTLY 3 high-quality suggestions:
1. A precise follow-up question
2. A useful insight or next step
3. A clarification to remove ambiguity

Rules:
- Use ONLY the given sentence
- Each suggestion must be DIFFERENT in intent
- Avoid vague phrases
- Keep suggestions concise (8–15 words)

Return ONLY JSON:
[
  { "preview": "..." },
  { "preview": "..." },
  { "preview": "..." }
]
`;

    const userPrompt = `
User just said:
"${lastSentence}"
`;

    // ✅ Try preferred model first, fall back if unavailable
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
          temperature: 0.7
        });
        console.log(`[suggestions] using model: ${model}`);
        break; // success — stop trying
      } catch (err) {
        if (err.status === 404) {
          console.warn(`[suggestions] model ${model} not found, trying next...`);
          continue;
        }
        throw err; // non-404 error — rethrow
      }
    }

    if (!response) throw new Error("No available model could process the request.");

    let content = response.choices?.[0]?.message?.content || "";

    // ✅ Extract JSON safely
    const match = content.match(/\[.*\]/s);
    if (match) content = match[0];

    let suggestions = [];

    try {
      const parsed = JSON.parse(content);
      suggestions = Array.isArray(parsed)
        ? parsed
        : parsed.suggestions || Object.values(parsed)[0];
    } catch {
      suggestions = [];
    }

    // ✅ Remove duplicates
    const seen = new Set();
    const unique = [];

    for (let s of suggestions) {
      if (!s?.preview) continue;

      const key = normalize(s.preview);

      if (!seen.has(key)) {
        seen.add(key);
        unique.push({ preview: s.preview });
      }

      if (unique.length === 3) break;
    }

    // 🔥 Improved fallback (context-aware)
    const fallbackPool = [
      `Ask what specific aspect of "${lastSentence}" they want explained`,
      `Suggest breaking down "${lastSentence}" into simple steps`,
      `Clarify what level of detail they are expecting`,
      `Ask if they want an example related to "${lastSentence}"`,
      `Suggest starting with a simple explanation before going deeper`
    ];

    for (let f of fallbackPool) {
      if (unique.length === 3) break;

      const key = normalize(f);
      if (!seen.has(key)) {
        unique.push({ preview: f });
        seen.add(key);
      }
    }

    return res.json(unique.slice(0, 3));

  } catch (error) {
    console.error("Suggestions Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;