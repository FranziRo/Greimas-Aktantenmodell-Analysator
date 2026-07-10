import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Info } from "lucide-react";

interface UploadZoneProps {
  onFileLoaded: (text: string, filename: string) => void;
  onClear: () => void;
  selectedFilename: string | null;
  selectedWordCount: number | null;
}

export default function UploadZone({ onFileLoaded, onClear, selectedFilename, selectedWordCount }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const processFile = (file: File) => {
    setError(null);

    // Validate type (should be .txt)
    const isTxt = file.name.endsWith(".txt") || file.type === "text/plain";
    if (!isTxt) {
      setError("Ungültiges Dateiformat. Bitte laden Sie eine reine Textdatei (.txt) hoch.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        setError("Fehler beim Lesen der Datei. Die Zeichencodierung konnte nicht verarbeitet werden.");
        return;
      }

      const words = countWords(text);
      if (words === 0) {
        setError("Die ausgewählte Datei ist leer.");
        return;
      }

      if (words > 2500) {
        setError(`Die Datei überschreitet das Limit von 2500 Wörtern (Ihre Datei hat ${words} Wörter). Bitte kürzen Sie das Transkript.`);
        return;
      }

      onFileLoaded(text, file.name);
    };

    reader.onerror = () => {
      setError("Die Datei konnte nicht gelesen werden. Möglicherweise ist sie beschädigt oder blockiert.");
    };

    reader.readAsText(file, "UTF-8");
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-950" />
          Transkript-Details
        </h2>
        {selectedFilename && (
          <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded truncate max-w-[200px]" title={selectedFilename}>
            {selectedFilename}
          </span>
        )}
      </div>

      {selectedFilename ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 p-2 rounded border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Wörter</p>
            <p className="text-base font-mono font-bold text-slate-700">{selectedWordCount}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Aktanten</p>
            <p className="text-base font-mono font-bold text-slate-700">6 Rollen</p>
          </div>
          <div className="bg-slate-50 p-2 rounded border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
            <p className="text-xs font-bold text-emerald-600 mt-1 uppercase">Bereit</p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition-all duration-150 ${
            isDragging 
              ? "border-blue-500 bg-blue-50/20" 
              : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,text/plain"
            className="hidden"
          />
          <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
          <p className="text-xs font-medium text-slate-600 text-center">
            TXT-Datei ablegen oder <span className="text-blue-900 underline font-bold">auswählen</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">max. 2500 Wörter</p>
        </div>
      )}

      {selectedFilename && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onClear}
            className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:text-red-700 border border-red-100 hover:border-red-200 rounded hover:bg-red-50/50 transition-colors"
          >
            Datei entfernen
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 p-2.5 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
