/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Download, FileDown, FileJson, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { ActantRoleAnalysis } from '../types';
import * as XLSX from 'xlsx';

interface ExportToolbarProps {
  data: ActantRoleAnalysis[];
}

export default function ExportToolbar({ data }: ExportToolbarProps) {
  const [exportState, setExportState] = useState<'idle' | 'success' | 'error'>('idle');
  const [successMsg, setSuccessMsg] = useState('');

  const triggerState = (msg: string, isError = false) => {
    setSuccessMsg(msg);
    setExportState(isError ? 'error' : 'success');
    setTimeout(() => {
      setExportState('idle');
      setSuccessMsg('');
    }, 2000);
  };

  // 1. Export results to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Aktant', 'Keywords', 'Interpretation', 'Beleg_1', 'Beleg_2', 'Beleg_3'];
      const rows = data.map((item) => [
        item.role,
        item.keywords.join('; '),
        item.interpretation.replace(/"/g, '""'),
        (item.evidence[0] || '').replace(/"/g, '""'),
        (item.evidence[1] || '').replace(/"/g, '""'),
        (item.evidence[2] || '').replace(/"/g, '""')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((r) => r.map((val) => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Greimas_Aktantenmodell_Analyse.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerState('CSV erfolgreich exportiert!');
    } catch {
      triggerState('Fehler beim CSV-Export', true);
    }
  };

  // 2. Export results to Excel using SheetJS (XLSX)
  const handleExportExcel = () => {
    try {
      const excelRows = data.map((item) => ({
        Aktant: item.role,
        Schlüsselwörter: item.keywords.join(', '),
        Interpretation: item.interpretation,
        'Beleg 1 (Zitat)': item.evidence[0] || '',
        'Beleg 2 (Zitat)': item.evidence[1] || '',
        'Beleg 3 (Zitat)': item.evidence[2] || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      
      // Auto-fit column widths for better Excel formatting
      const maxLens = excelRows.reduce((acc, row) => {
        Object.keys(row).forEach((key) => {
          const valStr = String(row[key as keyof typeof row] || '');
          acc[key] = Math.max(acc[key] || 10, valStr.length);
        });
        return acc;
      }, {} as Record<string, number>);

      worksheet['!cols'] = Object.keys(maxLens).map((key) => ({
        wch: Math.min(accLimit(maxLens[key]), 50) // clamp column size max
      }));

      function accLimit(val: number) {
        return val < 10 ? 12 : val + 3;
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Aktanten-Analyse');
      XLSX.writeFile(workbook, 'Greimas_Aktantenmodell_Analyse.xlsx');
      triggerState('Excel erfolgreich exportiert!');
    } catch (err) {
      console.error(err);
      triggerState('Fehler beim Excel-Export', true);
    }
  };

  // 3. Export SVG Diagram to High-Res PNG (2000x1000)
  const handleExportPNG = () => {
    try {
      const svgElement = document.getElementById('greimas-svg-canvas') as unknown as SVGSVGElement | null;
      if (!svgElement) {
        triggerState('Diagramm-Element nicht gefunden', true);
        return;
      }

      // Serialize the SVG XML tree
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        // Standard SVG viewBox aspect ratio is 1000x500. Export at double scale (2000x1000) for sharp print.
        canvas.width = 2000;
        canvas.height = 1000;
        const context = canvas.getContext('2d');
        if (context) {
          // Draw crisp white background
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, 2000, 1000);

          const pngURL = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngURL;
          downloadLink.download = 'Greimas_Aktantenmodell_Diagramm.png';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          triggerState('Diagramm als PNG exportiert!');
        } else {
          triggerState('Canvas-Kontext fehlgeschlagen', true);
        }
        URL.revokeObjectURL(blobURL);
      };
      image.onerror = () => {
        triggerState('Rasterisierungs-Fehler', true);
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch {
      triggerState('Fehler beim PNG-Export', true);
    }
  };

  return (
    <div id="export-toolbar-card" className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-center sm:text-left">
        <h3 className="font-semibold text-slate-900 text-sm">Forschungsergebnisse exportieren</h3>
        <p className="text-xs text-slate-400 mt-0.5">Sichern Sie die analysierten qualitative Daten für Seminararbeiten oder Präsentationen.</p>
      </div>

      {/* Export Button Actions */}
      <div className="flex flex-wrap items-center gap-2.5 justify-center w-full sm:w-auto">
        {/* CSV Export */}
        <button
          id="export-csv-btn"
          onClick={handleExportCSV}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <FileDown className="h-4 w-4 text-slate-500" />
          <span>CSV herunterladen</span>
        </button>

        {/* Excel Export */}
        <button
          id="export-excel-btn"
          onClick={handleExportExcel}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <FileJson className="h-4 w-4 text-slate-500" />
          <span>Excel (SheetJS)</span>
        </button>

        {/* PNG Export */}
        <button
          id="export-png-btn"
          onClick={handleExportPNG}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Diagramm als PNG</span>
        </button>
      </div>

      {/* Pop-up notifications for export results */}
      {exportState !== 'idle' && (
        <div
          id="export-feedback-toast"
          className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-xl border shadow-lg flex items-center gap-2 text-xs font-semibold transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            exportState === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {exportState === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
