/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GreimasAnalysisResponse } from '../types';

/**
 * Sends the transcript text to the Google Gemini API using the provided API key.
 * Uses structured JSON output to guarantee adherence to Greimas' Actantial schema.
 */
export async function analyzeTranscript(
  transcript: string,
  apiKey: string
): Promise<GreimasAnalysisResponse> {
  const model = 'gemini-3.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = 
    "Analyze the text using Greimas' Actantial Model (Aktantenmodell). " +
    "Assign exactly 6 roles: Adressant, Objekt, Adressat, Subjekt, Adjuvant, Opponent. " +
    "For each role, provide 1-3 keywords, a scientific interpretation (max 120 words), " +
    "and up to 3 verbatim direct quotes from the text as evidence. " +
    "Respond EXCLUSIVELY in valid JSON following the schema: " +
    "{ 'analysis': [ { 'role': '', 'keywords': [], 'interpretation': '', 'evidence': [] } ] }";

  const prompt = `Hier ist das zu analysierende qualitative Interviewtranskript:\n\n"""\n${transcript}\n"""\n\nFühre eine strukturierte semiotische Analyse durch und ordne die Aktanten exakt gemäß den Vorgaben ein.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: systemInstruction
            }
          ]
        },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // low temperature for structural accuracy
          responseSchema: {
            type: 'OBJECT',
            properties: {
              analysis: {
                type: 'ARRAY',
                description: 'Liste aller sechs Aktantenrollen aus dem Greimas Modell.',
                items: {
                  type: 'OBJECT',
                  properties: {
                    role: {
                      type: 'STRING',
                      enum: ['Subjekt', 'Objekt', 'Adressant', 'Adressat', 'Adjuvant', 'Opponent'],
                      description: 'Der Name des Aktanten.'
                    },
                    keywords: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                      description: '1 bis 3 prägnante Schlüsselwörter für diese Rolle.'
                    },
                    interpretation: {
                      type: 'STRING',
                      description: 'Wissenschaftliche, semiologische Interpretation (maximal 120 Wörter).'
                    },
                    evidence: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                      description: 'Bis zu 3 wortwörtliche qualitative Originalzitate als Textbeleg.'
                    }
                  },
                  required: ['role', 'keywords', 'interpretation', 'evidence']
                }
              }
            },
            required: ['analysis']
          }
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || response.statusText;
      
      if (response.status === 400) {
        throw new Error('Ungültige Anfrage an die Gemini API. Bitte prüfen Sie den Text.');
      } else if (response.status === 403 || response.status === 401) {
        throw new Error('Der angegebene Google AI Studio API-Schlüssel ist ungültig oder nicht berechtigt. Bitte prüfen Sie Ihre Einstellungen.');
      } else if (response.status === 429) {
        throw new Error('Anfragen-Limit überschritten (Rate Limit). Bitte warten Sie eine Minute.');
      } else {
        throw new Error(`API-Fehler (${response.status}): ${errMsg}`);
      }
    }

    const resJson = await response.json();
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error('Die API hat keine Antwort geliefert. Versuchen Sie es erneut.');
    }

    const parsedData = JSON.parse(candidateText.trim()) as GreimasAnalysisResponse;
    
    if (!parsedData || !Array.isArray(parsedData.analysis)) {
      throw new Error('Die erhaltenen Daten entsprechen nicht der geforderten Struktur.');
    }

    // Ensure all 6 roles are present. If some are missing from the model response, backfill them.
    const expectedRoles: ('Subjekt' | 'Objekt' | 'Adressant' | 'Adressat' | 'Adjuvant' | 'Opponent')[] = [
      'Subjekt', 'Objekt', 'Adressant', 'Adressat', 'Adjuvant', 'Opponent'
    ];
    
    const analysisMap = new Map(parsedData.analysis.map(item => [item.role, item]));
    const completeAnalysis = expectedRoles.map(role => {
      if (analysisMap.has(role)) {
        return analysisMap.get(role)!;
      } else {
        return {
          role,
          keywords: ['Nicht identifiziert'],
          interpretation: `Es konnten im vorliegenden Text keine signifikanten Hinweise auf die Rolle des ${role}s gefunden werden.`,
          evidence: []
        };
      }
    });

    return { analysis: completeAnalysis };
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      throw new Error('Fehler beim Analysieren des strukturierten JSON-Formats der KI. Bitte versuchen Sie es erneut.');
    }
    throw err;
  }
}
