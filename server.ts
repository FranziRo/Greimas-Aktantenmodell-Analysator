import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Route: Generate Content
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, model, userKey } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt ist erforderlich." });
      }

      // Determine which API key to use
      let apiKey = userKey || process.env.GEMINI_API_KEY;

      // If it's a mock key, fall back to the system's key
      if (apiKey && apiKey.startsWith("AIzaSyMock_")) {
        apiKey = process.env.GEMINI_API_KEY;
      }

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(401).json({
          error: "Kein API-Schlüssel gefunden. Bitte tragen Sie entweder einen echten Schlüssel im Playground ein, oder konfigurieren Sie GEMINI_API_KEY in Ihren Umgebungsvariablen.",
          isMissingKey: true
        });
      }

      // Initialize Google GenAI
      const ai = new GoogleGenAI({ apiKey });

      const modelName = model || "gemini-2.5-flash";

      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      return res.json({
        success: true,
        text: result.text,
        modelUsed: modelName,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({
        error: error.message || "Fehler bei der Kommunikation mit der Gemini API.",
        details: error
      });
    }
  });

  // API Route: Validate API Key
  app.post("/api/validate", async (req, res) => {
    try {
      const { key } = req.body;

      if (!key) {
        return res.status(400).json({ error: "Schlüssel ist erforderlich." });
      }

      // If it's mock, we validate it immediately as successful
      if (key.startsWith("AIzaSyMock_")) {
        return res.json({
          valid: true,
          message: "Simulierter Schlüssel ist gültig (Mock-Modus)."
        });
      }

      // Attempt to authenticate a small request
      const ai = new GoogleGenAI({ apiKey: key });
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Ping",
      });

      return res.json({
        valid: true,
        message: "Der API-Schlüssel ist gültig und funktionsfähig!"
      });
    } catch (error: any) {
      console.error("Validation failed:", error);
      return res.json({
        valid: false,
        message: "Ungültiger API-Schlüssel. Bitte überprüfen Sie den Schlüssel auf Tippfehler oder stellen Sie sicher, dass er in Google AI Studio freigeschaltet ist.",
        errorDetails: error.message || String(error)
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
