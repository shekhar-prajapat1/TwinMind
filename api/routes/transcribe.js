import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { createClient } from "../utils/groqClient.js";

const router = express.Router();

// store uploaded audio temporarily with original extension or .webm
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(os.tmpdir(), "twinmind-uploads");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ error: "Missing API Key" });

    const client = createClient(apiKey);

    // send audio to Groq Whisper
    const response = await client.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-large-v3",
    });

    // delete temp file
    fs.unlinkSync(req.file.path);

    res.json({
      text: response.text,
    });

  } catch (error) {
    console.error("Transcription Error:", error);
    // clean up if file exists
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;