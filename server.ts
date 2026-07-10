import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to safely handle large transcript texts
app.use(express.json({ limit: "5mb" }));

// Initialize the official Google Gen AI SDK
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Word count utility
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Resilient content generation helper with exponential backoff and model fallbacks
async function generateContentWithRetryAndFallback(
  aiClient: GoogleGenAI,
  configParams: {
    contents: string;
    config: any;
  }
) {
  // Ordered list of models to try in case of server overloaded (503) or other errors.
  // We prioritize different model architectures/tiers to bypass targeted high-demand/congestion issues.
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    const maxRetries = 2; // Keep retries low to prevent gateway timeouts
    let delay = 600; // Delay in ms before retry

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini API] Trying model "${modelName}" (Attempt ${attempt}/${maxRetries})...`);
        const response = await aiClient.models.generateContent({
          model: modelName,
          ...configParams,
        });
        console.log(`[Gemini API] Success using model "${modelName}" on attempt ${attempt}.`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || JSON.stringify(err);
        console.error(
          `[Gemini API] Error with model "${modelName}" on attempt ${attempt}:`,
          errMsg
        );

        // If this is a transient error (e.g., 503 or UNAVAILABLE), retry or fall back
        if (attempt < maxRetries) {
          console.log(`[Gemini API] Waiting ${delay}ms before retrying "${modelName}"...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5; // gentle backoff
        }
      }
    }
    console.log(`[Gemini API] All ${maxRetries} attempts failed for model "${modelName}". Trying fallback model if available...`);
  }

  throw lastError || new Error("All model generation attempts failed.");
}

// API endpoint for analysis
app.post("/api/analyze", async (req, res): Promise<any> => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Kein Text übermittelt oder ungültiges Format." });
  }

  const wordCount = countWords(text);

  if (wordCount === 0) {
    return res.status(400).json({ error: "Die hochgeladene Datei ist leer." });
  }

  if (wordCount > 2500) {
    return res.status(400).json({ 
      error: `Der Text ist mit ${wordCount} Wörtern zu lang. Das Maximum liegt bei 2500 Wörtern.` 
    });
  }

  if (!ai) {
    return res.status(500).json({ 
      error: "Der Gemini-API-Schlüssel ist nicht konfiguriert. Bitte überprüfen Sie die Einstellungen." 
    });
  }

  try {
    const prompt = `Analysiere das folgende Interviewtranskript wissenschaftlich anhand des Aktantenmodells von Algirdas J. Greimas.
Ordne genau die folgenden 6 Rollen zu:
1. "Adressant" (Instanz, die die Handlung initiiert oder einen Auftrag vermittelt)
2. "Objekt" (Ziel oder Gegenstand des Begehrens)
3. "Adressat" (Instanz, die von der Zielerreichung profitiert)
4. "Subjekt" (Instanz, die auf das Objekt ausgerichtet handelt)
5. "Adjuvant" (Unterstützende Kraft / Helfer)
6. "Opponent" (Behindernde Gegenkraft / Widersacher)

Regeln:
- Erzeuge für jede der 6 Aktantenrollen genau ein Objekt im analysis-Array.
- Jedes Objekt muss genau das Feld "role" mit einem der Werte: "Adressant", "Objekt", "Adressat", "Subjekt", "Adjuvant", "Opponent" enthalten.
- Für jede Rolle maximal 3 Keywords. Jedes Keyword darf nur aus einem kurzen Begriff oder einer Wortgruppe (maximal drei Wörter) bestehen.
- Die Interpretation darf maximal 120 Wörter umfassen und muss fundiert und differenziert formuliert sein.
- Maximal 3 Belege (evidence). Die Belege MÜSSEN wörtliche, exakte Zitate aus dem bereitgestellten Transkript sein. Erfinde niemals Zitate! Wenn es keinen Beleg gibt, lasse das Feld leer oder gib ein leeres Array an.
- Falls eine Rolle im Transkript nicht eindeutig bestimmbar oder vorhanden ist, gib bei interpretation "Nicht eindeutig bestimmbar" an, halte keywords leer und lasse evidence leer.

Hier ist das zu analysierende Transkript:
---
${text}
---`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "Du bist ein hochqualifizierter wissenschaftlicher Analyst für qualitative Sozialforschung. Du analysierst Texte präzise nach literaturwissenschaftlichen und sozialwissenschaftlichen Modellen, insbesondere nach dem Aktantenmodell von Algirdas J. Greimas. Deine Antworten sind exakt, fehlerfrei formuliert und halten sich streng an das vorgegebene JSON-Schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: {
                    type: Type.STRING,
                    description: "Die Rolle im Aktantenmodell: Adressant, Objekt, Adressat, Subjekt, Adjuvant oder Opponent.",
                  },
                  keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Maximal 3 kurze Schlagwörter oder kurze Wortgruppen (jeweils max. 3 Wörter).",
                  },
                  interpretation: {
                    type: Type.STRING,
                    description: "Wissenschaftliche Interpretation dieser Rolle (max. 120 Wörter). Falls nicht bestimmbar, 'Nicht eindeutig bestimmbar' eintragen.",
                  },
                  evidence: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Maximal 3 exakte, wörtliche Zitate aus dem Transkript als Belege. Keine erfundenen Zitate!",
                  }
                },
                required: ["role", "keywords", "interpretation", "evidence"]
              },
            }
          },
          required: ["analysis"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Keine Antwort von der KI erhalten.");
    }

    // Try to parse JSON to guarantee it is valid
    const parsedData = JSON.parse(responseText.trim());
    
    // Validate required fields
    if (!parsedData.analysis || !Array.isArray(parsedData.analysis)) {
      throw new Error("Ungültiges JSON-Format erhalten: 'analysis' Feld fehlt oder ist kein Array.");
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Fehler bei der Transkriptanalyse:", error);
    res.status(500).json({ 
      error: "Die Analyse konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.",
      details: error.message || error 
    });
  }
});

// Setup Vite or static serving
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite-Middleware im Entwicklungsmodus aktiv.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Statisches Fileserving im Produktionsmodus aktiv.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
}

setupApp();
