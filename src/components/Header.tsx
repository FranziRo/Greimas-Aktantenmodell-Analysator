import { BookOpen, Info, Award } from "lucide-react";

interface HeaderProps {
  status: "ready" | "loading" | "analyzed";
  wordCount?: number;
  onNewAnalysis?: () => void;
}

export default function Header({ status, wordCount = 0, onNewAnalysis }: HeaderProps) {
  return (
    <div className="w-full mb-6">
      {/* Dynamic Upper Accent Bar */}
      <header className="bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between px-5 py-3 shadow-sm z-10 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-blue-900 leading-none">GreimasAnalytics v1.2</h1>
              <span className="text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono font-medium border border-blue-100">Wissenschaftlich</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Aktantenmodell-Analyse für qualitative Transkripte</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0">
          <div className="flex flex-col items-start sm:items-end">
            <span className={`text-[10px] font-bold ${
              status === "analyzed" ? "text-emerald-600" : status === "loading" ? "text-amber-500 animate-pulse" : "text-blue-900"
            } uppercase tracking-wider`}>
              STATUS: {status === "analyzed" ? "ANALYSE ABGESCHLOSSEN" : status === "loading" ? "ANALYSING..." : "BEREIT ZUR ANALYSE"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ID: #TR-Greimas-{wordCount > 0 ? wordCount : "OFFLINE"}</span>
          </div>

          {status === "analyzed" && onNewAnalysis && (
            <button
              onClick={onNewAnalysis}
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer uppercase tracking-wider shrink-0"
            >
              Neue Analyse
            </button>
          )}
        </div>
      </header>

      {/* Embedded scientific details for context, clean and compact */}
      <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 leading-relaxed">
          Dieses System decodiert Erzählungen und Handlungen strukturell nach dem narratologischen Modell von <strong>Algirdas Julien Greimas</strong>. 
          Der Algorithmus weist dem Subtext sechs komplementäre Rollen (Aktanten) zu, um narrative Vektoren, Begehrensstrukturen 
          und teleologische Dynamiken von Aussagen offenzulegen.
        </p>
      </div>
    </div>
  );
}
