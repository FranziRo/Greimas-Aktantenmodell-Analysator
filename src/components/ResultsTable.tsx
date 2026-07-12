/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, ArrowUpDown, Copy, Check, FileSpreadsheet, Quote } from 'lucide-react';
import { ActantRoleAnalysis } from '../types';

interface ResultsTableProps {
  data: ActantRoleAnalysis[];
}

type SortField = 'role' | 'interpretation';
type SortOrder = 'asc' | 'desc';

export default function ResultsTable({ data }: ResultsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort the table content
  const filteredAndSortedData = [...data]
    .filter((row) => {
      const searchLower = searchQuery.toLowerCase();
      const roleMatch = row.role.toLowerCase().includes(searchLower);
      const interpretationMatch = row.interpretation.toLowerCase().includes(searchLower);
      const keywordsMatch = row.keywords.some((k) => k.toLowerCase().includes(searchLower));
      const quotesMatch = row.evidence.some((q) => q.toLowerCase().includes(searchLower));
      return roleMatch || interpretationMatch || keywordsMatch || quotesMatch;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const valA = a[sortField].toLowerCase();
      const valB = b[sortField].toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div id="results-table-card" className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-900" />
          <h2 className="text-lg font-semibold text-slate-900">Auswertungstabelle (Aktanten-Übersicht)</h2>
        </div>
        
        {/* Search input field */}
        <div className="relative w-full sm:w-64 shadow-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="table-search-input"
            type="text"
            placeholder="Ergebnisse durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[500px]">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs border-collapse">
          {/* Sticky Header */}
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-xs">
            <tr>
              <th
                onClick={() => handleSort('role')}
                className="px-4 py-3.5 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Aktant</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="px-4 py-3.5 font-semibold text-slate-700 select-none">Schlüsselwörter</th>
              <th
                onClick={() => handleSort('interpretation')}
                className="px-4 py-3.5 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors select-none min-w-[200px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Interpretation (wissenschaftlich)</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="px-4 py-3.5 font-semibold text-slate-700 select-none min-w-[160px]">Beleg 1</th>
              <th className="px-4 py-3.5 font-semibold text-slate-700 select-none min-w-[160px]">Beleg 2</th>
              <th className="px-4 py-3.5 font-semibold text-slate-700 select-none min-w-[160px]">Beleg 3</th>
            </tr>
          </thead>

          {/* Table Body with zebra striping */}
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((row, idx) => (
                <tr
                  key={row.role}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'
                  }`}
                >
                  {/* Role name */}
                  <td className="px-4 py-3 font-semibold text-slate-900 align-top">
                    {row.role}
                  </td>

                  {/* Keywords tags */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {row.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-medium rounded border border-blue-100"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Interpretation */}
                  <td className="px-4 py-3 text-slate-600 align-top leading-relaxed text-[11px] max-w-xs whitespace-normal">
                    {row.interpretation}
                  </td>

                  {/* Evidence Quotes 1, 2, 3 */}
                  {[0, 1, 2].map((quoteIndex) => {
                    const quote = row.evidence[quoteIndex];
                    return (
                      <td key={quoteIndex} className="px-4 py-3 align-top text-slate-500 leading-normal max-w-[180px] whitespace-normal">
                        {quote ? (
                          <div className="group relative flex flex-col justify-between h-full min-h-[40px] bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 rounded-lg p-2 transition-all">
                            <span className="italic block pl-3 relative text-[10.5px]">
                              <Quote className="h-2 w-2 text-slate-300 absolute left-0 top-1" />
                              „{quote}“
                            </span>
                            <div className="flex justify-end mt-1.5">
                              <button
                                id={`copy-btn-${row.role}-${quoteIndex}`}
                                onClick={() => handleCopy(quote)}
                                className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all cursor-pointer"
                                title="Zitat kopieren"
                              >
                                {copiedText === quote ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-[10px]">Kein Beleg</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                  Keine Ergebnisse gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
