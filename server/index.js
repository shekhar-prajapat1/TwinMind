import express from "express";
import cors from "cors";
import fs from "fs";

import transcribeRoute from "./routes/transcribe.js";
import suggestionsRoute from "./routes/suggestions.js";
import chatRoute from "./routes/chat.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/transcribe", transcribeRoute);
app.use("/suggestions", suggestionsRoute);
app.use("/chat", chatRoute);

app.get("/", (req, res) => {
  res.send("Server running...");
});

process.on("uncaughtException", (err) => {
  fs.appendFileSync("error.log", `Uncaught Exception: ${err.stack}\n`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  fs.appendFileSync("error.log", `Unhandled Rejection at: ${promise} reason: ${reason}\n`);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});