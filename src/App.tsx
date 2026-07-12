/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { ActantRoleAnalysis } from './types';
import { mockAnalysisData } from './mockData';
import { analyzeTranscript } from './lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ArrowDown } from 'lucide-react';

// Modular UI imports
import Header from './components/Header';
import AcademicIntro from './components/AcademicIntro';
import FileUploadZone from './components/FileUploadZone';
import AnalysisTrigger from './components/AnalysisTrigger';
import ResultsTable from './components/ResultsTable';
import ActantialDiagram from './components/ActantialDiagram';
import ExportToolbar from './components/ExportToolbar';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [transcript, setTranscript] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ActantRoleAnalysis[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize and load API key on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('google_aistudio_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Sync API Key to localStorage on change
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('google_aistudio_api_key', newKey);
    } else {
      localStorage.removeItem('google_aistudio_api_key');
    }
  };

  // Load qualitative mock data (Demo Mode)
  const handleLoadDemo = () => {
    setErrorMessage(null);

    // Load example transcript metadata
    setFileName('beispiel_interview_digitale_schule.txt');
    setTranscript('Dieser Beispiel-Text wurde automatisch durch die Demo-Analyse geladen.');
    
    // Set mock analysis results instantly
    setAnalysisResult(mockAnalysisData.analysis);

    // Smoothly scroll down to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Perform live structural analysis using Google Gemini
  const handleStartAnalysis = async () => {
    if (!transcript || !apiKey) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    try {
      const response = await analyzeTranscript(transcript, apiKey);
      setAnalysisResult(response.analysis);
      
      // Smoothly scroll down to results upon completion
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ein unerwarteter Analysefehler ist aufgetreten.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTranscriptLoaded = (text: string, name: string) => {
    setTranscript(text);
    setFileName(name);
    setErrorMessage(null);
  };

  const handleClearTranscript = () => {
    setTranscript('');
    setFileName(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  // Helper count of words in the loaded transcript
  const getWordCount = () => {
    return transcript.trim() === '' ? 0 : transcript.trim().split(/\s+/).length;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col">
      <Header
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Card 1: Academic Intro */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AcademicIntro />
        </motion.div>

        {/* Card 2: Transcript File Zone */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FileUploadZone
            onTranscriptLoaded={handleTranscriptLoaded}
            onClearTranscript={handleClearTranscript}
            currentFileName={fileName}
            currentWordCount={getWordCount()}
          />
        </motion.div>

        {/* Card 3: Action Trigger, Key check & Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-4"
        >
          {/* Global live analysis error display */}
          {errorMessage && (
            <div id="global-error-banner" className="bg-rose-50 border border-rose-100 text-rose-800 text-sm p-4 rounded-xl flex items-start gap-3 shadow-xs">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Fehler bei der Live-Analyse</span>
                <span className="mt-1 block text-xs leading-relaxed text-rose-700">{errorMessage}</span>
              </div>
            </div>
          )}

          <AnalysisTrigger
            onStartAnalysis={handleStartAnalysis}
            onLoadDemo={handleLoadDemo}
            isAnalyzing={isAnalyzing}
            hasTranscript={transcript.length > 0}
            hasApiKey={apiKey.length > 0}
          />
        </motion.div>

        {/* Collapsible / Animated Results & Diagram Section */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              ref={resultsRef}
              id="analysis-results-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="space-y-6 pt-4"
            >
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[11px] font-semibold text-emerald-800">
                  <ArrowDown className="h-3.5 w-3.5 text-emerald-600 animate-bounce" />
                  <span>Analyse abgeschlossen – Nachfolgend visualisiert</span>
                </div>
              </div>

              {/* Card 4: Actantial Graphical Diagram */}
              <ActantialDiagram data={analysisResult} />

              {/* Card 5: Qualitative Evidence Results Table */}
              <ResultsTable data={analysisResult} />

              {/* Card 6: Export Toolbar */}
              <ExportToolbar data={analysisResult} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Semiotisches Forschungszentrum. Alle Rechte vorbehalten.</p>
          <p className="font-mono text-[10px]">Modellierung nach A. J. Greimas (Sémantique structurale, 1966)</p>
        </div>
      </footer>
    </div>
  );
}
