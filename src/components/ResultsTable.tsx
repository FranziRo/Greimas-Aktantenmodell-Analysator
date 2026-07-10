import { useState, useMemo } from "react";
import { Search, Copy, Check, ArrowUpDown, HelpCircle, FileText } from "lucide-react";
import { ActantAnalysis } from "../types";

interface ResultsTableProps {
  data: ActantAnalysis[];
}

const ROLE_ORDER: Record<string, number> = {
  "Adressant": 1,
  "Objekt": 2,
  "Adressat": 3,
  "Subjekt": 4,
  "Adjuvant": 5,
  "Opponent": 6
};

const ROLE_COLORS: Record<string, string> = {
  "Adressant": "text-blue-800 bg-blue-50/60 border-blue-100",
  "Objekt": "text-orange-800 bg-orange-50/60 border-orange-100",
  "Adressat": "text-green-800 bg-green-50/60 border-green-100",
  "Subjekt": "text-teal-800 bg-teal-50/60 border-teal-100",
  "Adjuvant": "text-lime-800 bg-lime-50/60 border-lime-100",
  "Opponent": "text-red-800 bg-red-50/60 border-red-100"
};

const ROLE_ROW_HOVERS: Record<string, string> = {
  "Adressant": "hover:bg-blue-50/30",
  "Objekt": "hover:bg-orange-50/30",
  "Adressat": "hover:bg-green-50/30",
  "Subjekt": "hover:bg-teal-50/30",
  "Adjuvant": "hover:bg-lime-50/30",
  "Opponent": "hover:bg-red-50/30"
};

export default function ResultsTable({ data }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"logical" | "alphabetical">("logical");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const sortedAndFilteredData = useMemo(() => {
    let result = [...data];

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.role.toLowerCase().includes(term) ||
          item.interpretation.toLowerCase().includes(term) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(term)) ||
          item.evidence.some((ev) => ev.toLowerCase().includes(term))
      );
    }

    // Sort
    if (sortBy === "alphabetical") {
      result.sort((a, b) => a.role.localeCompare(b.role));
    } else {
      result.sort((a, b) => (ROLE_ORDER[a.role] || 99) - (ROLE_ORDER[b.role] || 99));
    }

    return result;
  }, [data, searchTerm, sortBy]);

  return (
    <section id="results-table-section" className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      {/* Dynamic Sub-header */}
      <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-2">
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-900" />
            Analyse-Ergebnisse
          </h2>
          <p className="text-[10px] text-slate-400">Hermeneutische Zuordnung mit Zitatbelegen</p>
        </div>

        {/* Filters/Actions in same line */}
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-2.5 py-1 w-full sm:w-40 text-[11px] bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => setSortBy(prev => prev === "logical" ? "alphabetical" : "logical")}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:text-slate-800 transition-colors shrink-0"
            title="Sortierung ändern"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortBy === "logical" ? "Modell" : "A-Z"}
          </button>
        </div>
      </div>

      {/* Main Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead className="sticky top-0 bg-white z-10 border-b border-slate-200">
            <tr>
              <th className="p-2.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider w-[18%]">Aktant</th>
              <th className="p-2.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider w-[22%]">Schlagwörter</th>
              <th className="p-2.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider w-[60%]">Interpretation & Belege</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {sortedAndFilteredData.length > 0 ? (
              sortedAndFilteredData.map((row) => (
                <tr 
                  key={row.role} 
                  className={`transition-all duration-150 group ${ROLE_ROW_HOVERS[row.role] || "hover:bg-slate-50/40"}`}
                >
                  {/* Aktant Column */}
                  <td className="p-2.5 align-top">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${ROLE_COLORS[row.role] || "bg-slate-100"}`}>
                      {row.role}
                    </span>
                  </td>

                  {/* Keywords Column */}
                  <td className="p-2.5 align-top">
                    <div className="flex flex-wrap gap-1">
                      {row.keywords && row.keywords.length > 0 && row.keywords[0] !== "" ? (
                        row.keywords.map((kw, kwIdx) => (
                          <span 
                            key={kwIdx} 
                            className="inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-50 text-slate-600 border border-slate-100 rounded"
                          >
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Nicht bestimmt</span>
                      )}
                    </div>
                  </td>

                  {/* Interpretation & Belege Column merged for high density */}
                  <td className="p-2.5 align-top text-slate-700 text-xs leading-relaxed space-y-2">
                    <p className="italic text-slate-600 leading-normal">{row.interpretation}</p>
                    
                    {/* Compact Quotes Inside */}
                    {row.evidence && row.evidence.length > 0 && row.evidence.some(ev => ev.trim() !== "") && (
                      <div className="pt-1.5 border-t border-slate-100/60 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Textbeleg:</span>
                        {row.evidence.map((quote, qIdx) => {
                          if (!quote.trim()) return null;
                          const quoteId = `${row.role}-quote-${qIdx}`;
                          return (
                            <div 
                              key={qIdx} 
                              className="relative bg-slate-50/50 hover:bg-slate-50 border-l border-slate-300 pl-2 pr-6 py-1 rounded text-[10px] text-slate-500 italic break-words transition-all group/quote"
                            >
                              „{quote}“
                              <button
                                onClick={() => handleCopy(quote, quoteId)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-slate-300 hover:text-slate-600 rounded bg-white border border-slate-200/50 opacity-0 group-hover/quote:opacity-100 transition-all shadow-xs"
                                title="Zitat kopieren"
                              >
                                {copiedId === quoteId ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-6 text-center text-slate-400 text-xs italic">
                  Keine Ergebnisse gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
