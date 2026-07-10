import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface AnalysisProgressProps {
  isLoading: boolean;
}

export default function AnalysisProgress({ isLoading }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Datei wird gelesen ...");

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setStatusMessage("Datei wird gelesen ...");
      return;
    }

    setProgress(5);

    const steps = [
      { threshold: 15, msg: "Datei wird gelesen ..." },
      { threshold: 40, msg: "Text wird analysiert und semantisch kodiert ..." },
      { threshold: 65, msg: "Aktantenrollen werden im Kontext bestimmt ..." },
      { threshold: 85, msg: "Narrative Achsen werden berechnet ..." },
      { threshold: 95, msg: "Ergebnisse werden strukturiert und Visualisierung erstellt ..." },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 95; // Hold at 95% until complete
        }
        
        const next = prev + Math.floor(Math.random() * 4) + 1;
        
        // Find corresponding message
        const currentStep = steps.find(s => next <= s.threshold) || steps[steps.length - 1];
        setStatusMessage(currentStep.msg);

        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 text-center">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-3">
          <Loader2 className="w-6 h-6 text-blue-900 animate-spin" />
        </div>
        
        <h3 className="text-sm font-bold text-slate-800 mb-1 uppercase tracking-wider">
          Qualitative Analyse aktiv
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Bitte warten Sie, während die KI das Transkript hermeneutisch decodiert.
        </p>

        {/* Progress Bar Container */}
        <div className="w-full h-2 bg-slate-100 rounded overflow-hidden mb-2.5">
          <motion.div
            className="h-full bg-blue-900 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut", duration: 0.2 }}
          />
        </div>

        {/* Progress Stats */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span className="text-blue-950 font-bold transition-all duration-300">
            {statusMessage}
          </span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
