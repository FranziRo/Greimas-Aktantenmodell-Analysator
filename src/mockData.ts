/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GreimasAnalysisResponse } from './types';

export const mockAnalysisData: GreimasAnalysisResponse = {
  "analysis": [
    {
      "role": "Subjekt",
      "keywords": ["Lehrkraft", "Innovation", "Unterricht"],
      "interpretation": "Die interviewte Lehrkraft agiert als Subjekt, da sie aktiv versucht, digitale Lehr-Lernformen im eigenen Unterricht zu etablieren und Barrieren abzubauen.",
      "evidence": [
        "Ich wollte unbedingt neue Medien ausprobieren.",
        "Mein Ziel war digitaler Unterricht."
      ]
    },
    {
      "role": "Objekt",
      "keywords": ["Digitale Transformation", "Kompetenz"],
      "interpretation": "Das Objekt des Begehrens ist die erfolgreiche Implementierung digitaler Tools zur Steigerung der Schülerkompetenzen.",
      "evidence": [
        "Die Schüler müssen fit für die Zukunft werden."
      ]
    },
    {
      "role": "Adressant",
      "keywords": ["Kultusministerium", "Lehrplan"],
      "interpretation": "Das Ministerium fungiert als Adressant, indem es durch neue Richtlinien den äußeren Druck und den Auftrag zur Digitalisierung erteilt.",
      "evidence": [
        "Der neue Bildungsplan schreibt das jetzt verpflichtend vor."
      ]
    },
    {
      "role": "Adressat",
      "keywords": ["Schülerschaft", "Zukunft"],
      "interpretation": "Die Schülerinnen und Schüler sind die Adressaten, da sie primär von den modernisierten Unterrichtsformen profitieren.",
      "evidence": [
        "Am Ende haben die Jugendlichen die besten Chancen."
      ]
    },
    {
      "role": "Adjuvant",
      "keywords": ["IT-Beauftragter", "Kollegium"],
      "interpretation": "Unterstützend wirken der schuleigene IT-Support sowie motivierte Kollegen, die technische Hürden minimieren.",
      "evidence": [
        "Unser IT-Admin hat mir sofort geholfen.",
        "Wir haben uns im Team abgesprochen."
      ]
    },
    {
      "role": "Opponent",
      "keywords": ["Veraltete Hardware", "Zeitmangel"],
      "interpretation": "Als Opponenten zeigen sich eine lückenhafte WLAN-Infrastruktur und die fehlende Vorbereitungszeit im Alltag.",
      "evidence": [
        "Das Netz bricht hier ständig zusammen.",
        "Mir fehlt einfach die Zeit dafür."
      ]
    }
  ]
};
