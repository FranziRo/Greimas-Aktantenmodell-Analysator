import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCcw, AlertTriangle, FileSpreadsheet, ArrowDown } from "lucide-react";
import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import AnalysisProgress from "./components/AnalysisProgress";
import ResultsTable from "./components/ResultsTable";
import GreimasModelVisualizer from "./components/GreimasModelVisualizer";
import ExportZone from "./components/ExportZone";
import { ActantAnalysis } from "./types";
import { SAMPLE_TRANSCRIPT } from "./data/sampleTranscript";

export default function App() {
  const [text, setText] = useState<string>("");
  const [filename, setFilename] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ActantAnalysis[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pngExportTrigger, setPngExportTrigger] = useState<number>(0);

  const handleFileLoaded = (loadedText: string, name: string) => {
    setText(loadedText);
    setFilename(name);
    setResults(null);
    setError(null);
  };

  const handleClear = () => {
    setText("");
    setFilename(null);
    setIsLoading(false);
    setResults(null);
    setError(null);
  };

  const loadSample = () => {
    handleFileLoaded(SAMPLE_TRANSCRIPT, "Beispiel_Transkript_Digitalisierung.txt");
  };

  const startAnalysis = async () => {
    if (!text) return;
    
    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        const errText = await response.text();
        let errMsg = "Die Analyse konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.";
        try {
          const errJson = JSON.parse(errText);
          if (errJson.error) {
            errMsg = errJson.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      if (!data.analysis || !Array.isArray(data.analysis)) {
        throw new Error("Die empfangene Analyse entspricht nicht dem erforderlichen Format.");
      }

      setResults(data.analysis);
      
      // Smooth scroll to the results section once rendering is complete
      setTimeout(() => {
        document.getElementById("results-table-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Die Analyse konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-blue-900/10 selection:text-blue-900">
      
      {/* Upper accent line */}
      <div className="h-1 bg-blue-900 w-full" />

      <main className="max-w-[1240px] mx-auto px-4 py-6 sm:px-6">
        
        {/* Academic Header section */}
        <Header 
          status={isLoading ? "loading" : results ? "analyzed" : "ready"} 
          wordCount={wordCount}
          onNewAnalysis={handleClear}
        />

        {/* Dynamic Dual-Column Dashboard Layout depending on state */}
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key="preparation-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Upload unit */}
                <div className="md:col-span-5">
                  <UploadZone
                    onFileLoaded={handleFileLoaded}
                    onClear={handleClear}
                    selectedFilename={filename}
                    selectedWordCount={wordCount}
                  />
                </div>

                {/* Pre-analysis panel / Ready trigger box */}
                <div className="md:col-span-7 space-y-4">
                  {/* Sample prompt info if nothing uploaded yet */}
                  {!filename && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Noch kein Transkript zur Hand?</h3>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                        Testen Sie das Tool direkt mit unserem vorbereiteten wissenschaftlichen Beispieltranskript zur Digitalisierung im Schulunterricht.
                      </p>
                      <button
                        onClick={loadSample}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-900 hover:text-white border border-blue-900 hover:bg-blue-900 rounded transition-all cursor-pointer shadow-xs uppercase tracking-wider"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Beispieltranskript laden
                      </button>
                    </div>
                  )}

                  {/* Ready to Analyze Action Card */}
                  {filename && !isLoading && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Transkript bereit zur Kodierung</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Die hermeneutische Zuordnung nach dem Greimas-Aktantenmodell wird nun mithilfe künstlicher Intelligenz generiert. Dieser Schritt ordnet die erzählerischen Spannungen und Aktionsfelder.
                        </p>
                      </div>
                      
                      <div className="flex gap-2 justify-end mt-6">
                        <button
                          onClick={handleClear}
                          className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded transition-all cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          ZURÜCKSETZEN
                        </button>
                        <button
                          onClick={startAnalysis}
                          className="px-5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Analyse starten
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Loader progress bar card */}
                  <AnalysisProgress isLoading={isLoading} />

                  {/* Error Notification inside side-panel */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <div>
                          <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider">Analyse fehlgeschlagen</h3>
                          <p className="text-xs text-red-700 mt-1 leading-relaxed">
                            {error}
                          </p>
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={startAnalysis}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded transition-colors cursor-pointer"
                            >
                              ERNEUT VERSUCHEN
                            </button>
                            <button
                              onClick={handleClear}
                              className="px-3 py-1 text-slate-600 hover:text-slate-800 border border-slate-200 bg-white text-[10px] font-semibold rounded transition-colors cursor-pointer"
                            >
                              NEUES DOKUMENT
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
            >
              {/* LEFT SIDE: CONTROLS & TABLE */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <UploadZone
                  onFileLoaded={handleFileLoaded}
                  onClear={handleClear}
                  selectedFilename={filename}
                  selectedWordCount={wordCount}
                />
                
                <ResultsTable data={results} />
              </div>

              {/* RIGHT SIDE: GRAPH & EXPORT */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <GreimasModelVisualizer data={results} exportTrigger={pngExportTrigger} />
                
                <ExportZone data={results} onExportPng={() => setPngExportTrigger(prev => prev + 1)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Scientific Footer */}
      <footer className="border-t border-slate-200 mt-12 py-6 bg-white text-center text-[10px] text-slate-400">
        <div className="max-w-[1240px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} • Greimas Aktantenmodell-Analysator v1.2.0</p>
          <p>Entwickelt für qualitative Inhaltsanalyse und hermeneutische Textkodierung in Wissenschaft und Forschung.</p>
        </div>
      </footer>
    </div>
  );
}
