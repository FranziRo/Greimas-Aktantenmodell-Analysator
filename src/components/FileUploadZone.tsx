/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, AlertTriangle, FileUp, CheckCircle2, Trash2 } from 'lucide-react';

interface FileUploadZoneProps {
  onTranscriptLoaded: (text: string, fileName: string) => void;
  onClearTranscript: () => void;
  currentFileName: string | null;
  currentWordCount: number;
}

export default function FileUploadZone({
  onTranscriptLoaded,
  onClearTranscript,
  currentFileName,
  currentWordCount
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [isPasting, setIsPasting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_WORDS = 2500;

  const countWords = (str: string): number => {
    return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
  };

  const processText = (text: string, name: string) => {
    setError(null);
    const cleanedText = text.trim();
    if (cleanedText.length === 0) {
      setError('Die hochgeladene Datei ist leer. Bitte laden Sie ein ausgefülltes Transkript hoch.');
      return;
    }

    const wordCount = countWords(cleanedText);
    if (wordCount > MAX_WORDS) {
      setError(`Das Transkript überschreitet das Limit von ${MAX_WORDS} Wörtern (aktuell: ${wordCount} Wörter). Bitte kürzen Sie den Text.`);
      return;
    }

    onTranscriptLoaded(cleanedText, name);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        setError('Nur reine Textdateien (.txt) werden unterstützt.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processText(text, file.name);
      };
      reader.onerror = () => {
        setError('Fehler beim Lesen der Datei.');
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handlePasteSubmit = () => {
    if (pasteText.trim() === '') {
      setError('Bitte geben Sie zuerst Text ein.');
      return;
    }
    processText(pasteText, 'Manuell eingefügter_Text.txt');
    setPasteText('');
    setIsPasting(false);
  };

  return (
    <div id="file-upload-section" className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Transkript hochladen</h2>
          <p className="text-xs text-slate-400">Dateiformat: TXT (reiner Text, max. {MAX_WORDS} Wörter)</p>
        </div>
        {!currentFileName && (
          <button
            id="toggle-paste-mode-btn"
            onClick={() => setIsPasting(!isPasting)}
            className="text-xs text-blue-900 hover:text-blue-950 font-semibold underline"
          >
            {isPasting ? 'Zurück zum Datei-Upload' : 'Oder Text manuell einfügen'}
          </button>
        )}
      </div>

      {error && (
        <div id="upload-error-msg" className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block">Validierungsfehler</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {currentFileName ? (
        /* Display uploaded file status */
        <div id="uploaded-file-card" className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 text-sm truncate max-w-xs sm:max-w-md">{currentFileName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-medium bg-emerald-100/70 text-emerald-800 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Geladen
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-500 text-xs font-mono">{currentWordCount} Wörter</span>
              </div>
            </div>
          </div>
          
          <button
            id="clear-uploaded-file-btn"
            onClick={() => {
              onClearTranscript();
              setError(null);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 rounded-xl text-xs font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Datei entfernen</span>
          </button>
        </div>
      ) : isPasting ? (
        /* Manual paste text-area */
        <div id="manual-paste-area" className="space-y-3">
          <textarea
            id="manual-transcript-textarea"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Kopieren Sie Ihr Transkript hier hinein..."
            className="w-full h-40 text-sm p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">
              Wortanzahl: {countWords(pasteText)} / {MAX_WORDS}
            </span>
            <div className="flex gap-2">
              <button
                id="cancel-paste-btn"
                onClick={() => {
                  setIsPasting(false);
                  setPasteText('');
                  setError(null);
                }}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                id="submit-paste-btn"
                onClick={handlePasteSubmit}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-medium transition-colors shadow-xs"
              >
                Text übernehmen
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          id="dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
          }`}
        >
          <input
            id="file-input-field"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt"
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2.5">
            <div className="p-3 bg-white shadow-xs rounded-xl border border-slate-200 text-slate-400">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Transkript-Datei auswählen oder hierher ziehen
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Unterstützt reinen Text (.txt) bis maximal {MAX_WORDS} Wörter
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
