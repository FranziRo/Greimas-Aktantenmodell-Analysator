import React from "react";
import { Download, FileSpreadsheet, FileDown, Image as ImageIcon } from "lucide-react";
import { ActantAnalysis } from "../types";
import * as XLSX from "xlsx";

interface ExportZoneProps {
  data: ActantAnalysis[];
  onExportPng: () => void;
}

export default function ExportZone({ data, onExportPng }: ExportZoneProps) {
  
  const exportAsCsv = () => {
    const headers = ["Aktant", "Schlagwoerter", "Interpretation", "Beleg 1", "Beleg 2", "Beleg 3"];
    const rows = data.map(item => [
      item.role,
      item.keywords.filter(Boolean).join(", "),
      item.interpretation,
      item.evidence[0] || "",
      item.evidence[1] || "",
      item.evidence[2] || ""
    ]);
    
    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "greimas_aktantenmodell_analyse.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsExcel = () => {
    const wsData = [
      ["Aktant", "Schlagwörter", "Interpretation", "Beleg 1", "Beleg 2", "Beleg 3"],
      ...data.map(item => [
        item.role,
        item.keywords.filter(Boolean).join(", "),
        item.interpretation,
        item.evidence[0] || "",
        item.evidence[1] || "",
        item.evidence[2] || ""
      ])
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    ws["!cols"] = [
      { wch: 15 }, // Aktant
      { wch: 25 }, // Keywords
      { wch: 65 }, // Interpretation
      { wch: 35 }, // Beleg 1
      { wch: 35 }, // Beleg 2
      { wch: 35 }  // Beleg 3
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Greimas Analyse");
    XLSX.writeFile(wb, "greimas_aktantenmodell_analyse.xlsx");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-blue-900" />
          Export & Downloads
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Mögliche Formate: CSV, Excel (XLSX), PNG (Vektorbasiert)</p>
      </div>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={exportAsExcel}
          className="px-3 py-1.5 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 rounded text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          EXCEL
        </button>
        <button
          onClick={exportAsCsv}
          className="px-3 py-1.5 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 rounded text-xs font-bold text-slate-700 hover:text-blue-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        >
          <FileDown className="w-3.5 h-3.5 text-blue-900" />
          CSV
        </button>
        <button
          onClick={onExportPng}
          className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-shadow shadow-xs hover:shadow-md cursor-pointer active:scale-95"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          GRAFIK (PNG)
        </button>
      </div>
    </div>
  );
}
