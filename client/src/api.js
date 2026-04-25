import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🎤 send audio → transcription
export const transcribeAudio = async (audioBlob, apiKey) => {
  const formData = new FormData();
  formData.append("audio", audioBlob);

  const res = await axios.post(`${BASE_URL}/transcribe`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-api-key": apiKey,
    },
  });

  return res.data;
};

// 💡 get suggestions
export const getSuggestions = async (transcript, apiKey, suggestionPrompt) => {
  const res = await axios.post(
    `${BASE_URL}/suggestions`,
    { transcript, suggestionPrompt },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    }
  );

  return res.data;
};

// 💬 chat response
export const sendChat = async (message, transcript, apiKey, chatPrompt) => {
  const res = await axios.post(
    `${BASE_URL}/chat`,
    { message, transcript, chatPrompt },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    }
  );

  return res.data;
};