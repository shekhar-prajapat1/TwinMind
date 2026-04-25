import Groq from "groq-sdk";

export const createClient = (apiKey) => {
  if (!apiKey) {
    throw new Error("Missing Groq API Key");
  }

  return new Groq({
    apiKey: apiKey,
  });
};