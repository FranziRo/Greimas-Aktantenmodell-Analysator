/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Play, FileJson, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface AnalysisTriggerProps {
  onStartAnalysis: () => void;
  onLoadDemo: () => void;
  isAnalyzing: boolean;
  hasTranscript: boolean;
  hasApiKey: boolean;
}

export default function AnalysisTrigger({
  onStartAnalysis,
  onLoadDemo,
  isAnalyzing,
  hasTranscript,
  hasApiKey
}: AnalysisTriggerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { label: 'Datei wird gelesen...', progress: 15 },
    { label: 'Text wird analysiert...', progress: 45 },
    { label: 'Aktanten werden bestimmt...', progress: 75 },
    { label: 'Visualisierung wird erstellt...', progress: 95 }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 2500); // Cycle step every 2.5 seconds
    } else {
      setCurrentStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div id="analysis-trigger-card" className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-4">
      {isAnalyzing ? (
        /* Progress Bar and Status indicator during analysis */
        <div id="analysis-progress-container" className="space-y-4 py-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-500 uppercase tracking-wider">Fortschritt</span>
            <span className="font-mono text-blue-900 font-semibold">{steps[currentStepIndex].progress}%</span>
          </div>

          {/* Animated custom progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-900 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${steps[currentStepIndex].progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Loader2 className="h-4.5 w-4.5 text-blue-900 animate-spin shrink-0" />
            <span className="text-sm font-medium text-slate-700 animate-pulse">
              {steps[currentStepIndex].label}
            </span>
          </div>
        </div>
      ) : (
        /* Normal state buttons and guards */
        <div className="space-y-4">
          {/* Warn notice if key is missing and transcript is loaded */}
          {!hasApiKey && (
            <div id="api-missing-notice" className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-900">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">API-Schlüssel erforderlich für Live-Analysen</span>
                <span>
                  Bitte hinterlegen Sie zuerst Ihren Google AI Studio API-Key in den Einstellungen (Zahnrad-Symbol oben rechts).
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Live Analysis button */}
            <button
              id="start-analysis-btn"
              onClick={onStartAnalysis}
              disabled={!hasTranscript || !hasApiKey}
              className={`flex-1 flex items-center justify-center gap-2 font-medium py-3 px-4 rounded-xl shadow-xs transition-all duration-200 ${
                hasTranscript && hasApiKey
                  ? 'bg-blue-900 hover:bg-blue-950 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
              }`}
            >
              <Play className="h-4 w-4" />
              <span>Analyse starten</span>
            </button>

            {/* Prominent load demo / example analysis button */}
            <button
              id="load-demo-btn"
              onClick={onLoadDemo}
              className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-xl shadow-xs transition-all duration-200"
              title="Direkte Demo ohne Registrierung oder API-Key starten"
            >
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Beispiel-Analyse laden (Demo)</span>
            </button>
          </div>

          {/* Helper caption when transcript is empty */}
          {!hasTranscript && (
            <p id="upload-prompt-text" className="text-center text-xs text-slate-400 leading-none">
              Bitte laden Sie zuerst ein Transkript hoch oder fügen Sie Text ein, um die Live-Analyse zu aktivieren.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
