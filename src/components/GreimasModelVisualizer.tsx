import React, { useState, useRef, useId, useEffect } from "react";
import { Download, Info, Image as ImageIcon } from "lucide-react";
import { ActantAnalysis, ActantRole } from "../types";

interface GreimasModelVisualizerProps {
  data: ActantAnalysis[];
  exportTrigger?: number;
}

const BOX_STYLES: Record<ActantRole, { bg: string; stroke: string; text: string; headerBg: string; headerText: string }> = {
  "Adressant": {
    bg: "#eff6ff",     // light blue
    stroke: "#2563eb", // blue-600
    text: "#1e3a8a",   // blue-900
    headerBg: "#dbeafe",
    headerText: "#1e40af"
  },
  "Objekt": {
    bg: "#fff7ed",     // light orange
    stroke: "#ea580c", // orange-600
    text: "#7c2d12",   // orange-900
    headerBg: "#ffedd5",
    headerText: "#c2410c"
  },
  "Adressat": {
    bg: "#f0fdf4",     // light green
    stroke: "#16a34a", // green-600
    text: "#14532d",   // green-900
    headerBg: "#dcfce7",
    headerText: "#15803d"
  },
  "Subjekt": {
    bg: "#f0fdfa",     // light teal
    stroke: "#0d9488", // teal-600
    text: "#115e59",   // teal-900
    headerBg: "#ccfbf1",
    headerText: "#0f766e"
  },
  "Adjuvant": {
    bg: "#f7fee7",     // light lime
    stroke: "#84cc16", // lime-600
    text: "#3f6212",   // lime-900
    headerBg: "#ecfccb",
    headerText: "#4d7c0f"
  },
  "Opponent": {
    bg: "#fef2f2",     // light red
    stroke: "#dc2626", // red-600
    text: "#7f1d1d",   // red-900
    headerBg: "#fee2e2",
    headerText: "#b91c1c"
  }
};

const COORDS: Record<ActantRole, { x: number; y: number; w: number; h: number }> = {
  "Adressant": { x: 50, y: 50, w: 220, h: 130 },
  "Objekt":    { x: 350, y: 50, w: 220, h: 130 },
  "Adressat":  { x: 650, y: 50, w: 220, h: 130 },
  "Adjuvant":  { x: 50, y: 340, w: 220, h: 130 },
  "Subjekt":   { x: 350, y: 340, w: 220, h: 130 },
  "Opponent":  { x: 650, y: 340, w: 220, h: 130 }
};

export default function GreimasModelVisualizer({ data, exportTrigger }: GreimasModelVisualizerProps) {
  const [hoveredRole, setHoveredRole] = useState<ActantRole | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [exporting, setExporting] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerId = useId();

  useEffect(() => {
    if (exportTrigger && exportTrigger > 0) {
      exportAsPng();
    }
  }, [exportTrigger]);

  // Map incoming analysis data for easy retrieval
  const actantMap = useMemoMap(data);

  function useMemoMap(items: ActantAnalysis[]) {
    const map: Record<string, ActantAnalysis> = {};
    for (const item of items) {
      map[item.role] = item;
    }
    return map;
  }

  const hoveredData = hoveredRole ? actantMap[hoveredRole] : null;

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement | SVGTextElement>, role: ActantRole) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    // Position tooltip relative to the SVG container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Shift slightly to avoid placing directly under the cursor
    setTooltipPos({ x: x + 15, y: y + 15 });
  };

  const exportAsPng = () => {
    if (!svgRef.current) return;
    setExporting(true);

    try {
      const svgElement = svgRef.current;
      // Extract XML representation
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);

      // Ensure style attributes are explicitly set for standalone SVG rendering
      // Inline standard font family info so the exported image has clean Inter/sans-serif text
      svgString = svgString.replace(
        "<svg",
        `<svg style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"`
      );

      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobUrl = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        // Use a high scale factor (e.g. 2x) for pristine high-res text rendering
        const scale = 2;
        canvas.width = 920 * scale;
        canvas.height = 540 * scale;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Fill background with white for standard PNG formatting
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the SVG image scaled
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Create standard download stream
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = "greimas_aktantenmodell_analyse.png";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(blobUrl);
        setExporting(false);
      };

      image.onerror = (err) => {
        console.error("Export-Fehler:", err);
        setExporting(false);
        alert("Fehler beim Erstellen der Grafik. Bitte versuchen Sie es erneut.");
      };

      image.src = blobUrl;
    } catch (e) {
      console.error(e);
      setExporting(false);
    }
  };

  return (
    <section id="visualizer-section" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-900" />
            Grafisches Aktantenmodell
          </h2>
          <p className="text-[10px] text-slate-400">Das strukturale Handlungsmodell nach Algirdas J. Greimas</p>
        </div>

        <button
          onClick={exportAsPng}
          disabled={exporting}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 rounded shadow-xs transition-colors self-start sm:self-auto shrink-0 cursor-pointer active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          {exporting ? "WIRD EXPORTIERT..." : "PNG EXPORTIEREN"}
        </button>
      </div>

      <div className="relative p-4 flex justify-center items-center overflow-x-auto">
        <div className="min-w-[920px] relative">
          <svg
            ref={svgRef}
            width="920"
            height="520"
            viewBox="0 0 920 520"
            className="select-none overflow-visible"
          >
            <defs>
              {/* Arrow markers */}
              <marker
                id="arrow-marker"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
              </marker>
              
              {/* Shadow effect for cards */}
              <filter id="box-shadow" x="-5%" y="-5%" width="115%" height="115%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.06" />
              </filter>
            </defs>

            {/* Begehrensachse - Central vertical axis dashed box enclosing Objekt and Subjekt */}
            <rect
              x="330"
              y="30"
              width="260"
              height="460"
              rx="16"
              ry="16"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="6,6"
            />
            
            <text
              x="460"
              y="22"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#94a3b8"
              letterSpacing="1"
              className="uppercase font-sans"
            >
              Objekt-Subjekt-Begehrensachse
            </text>

            {/* Arrow: Adressant -> Objekt */}
            <path
              d="M 270 115 L 340 115"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              markerEnd="url(#arrow-marker)"
            />
            <text
              x="310"
              y="100"
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#64748b"
              className="font-sans"
            >
              initiiert
            </text>

            {/* Arrow: Objekt -> Adressat */}
            <path
              d="M 570 115 L 640 115"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              markerEnd="url(#arrow-marker)"
            />
            <text
              x="610"
              y="100"
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#64748b"
              className="font-sans"
            >
              kommt zugute
            </text>

            {/* Arrow: Adjuvant -> Subjekt */}
            <path
              d="M 270 405 L 340 405"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              markerEnd="url(#arrow-marker)"
            />
            <text
              x="310"
              y="390"
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#64748b"
              className="font-sans"
            >
              unterstützt
            </text>

            {/* Arrow: Opponent -> Subjekt */}
            <path
              d="M 650 405 L 580 405"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              markerEnd="url(#arrow-marker)"
            />
            <text
              x="610"
              y="390"
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#64748b"
              className="font-sans"
            >
              behindert
            </text>

            {/* Arrow: Subjekt -> Objekt (Axis of Desire) */}
            <path
              d="M 460 340 L 460 190"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              markerEnd="url(#arrow-marker)"
            />
            <text
              x="470"
              y="265"
              textAnchor="start"
              fontSize="11"
              fontWeight="600"
              fill="#64748b"
              className="font-sans"
            >
              strebt nach
            </text>

            {/* Render 6 Actant Boxes */}
            {Object.entries(COORDS).map(([roleKey, box]) => {
              const role = roleKey as ActantRole;
              const style = BOX_STYLES[role];
              const analysisObj = actantMap[role];
              const isHovered = hoveredRole === role;

              return (
                <g key={role} className="cursor-help">
                  {/* Outer rect (interactive shadow and bg) */}
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.w}
                    height={box.h}
                    rx="12"
                    ry="12"
                    fill={style.bg}
                    stroke={style.stroke}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    filter="url(#box-shadow)"
                    onMouseEnter={() => setHoveredRole(role)}
                    onMouseMove={(e) => handleMouseMove(e, role)}
                    onMouseLeave={() => setHoveredRole(null)}
                    className="transition-all duration-150"
                  />

                  {/* Header bar background inside rect */}
                  <path
                    d={`M ${box.x + 1} ${box.y + 11} 
                        A 11 11 0 0 1 ${box.x + 11} ${box.y + 1} 
                        L ${box.x + box.w - 11} ${box.y + 1} 
                        A 11 11 0 0 1 ${box.x + box.w - 1} ${box.y + 11} 
                        L ${box.x + box.w - 1} ${box.y + 36} 
                        L ${box.x + 1} ${box.y + 36} Z`}
                    fill={style.headerBg}
                  />

                  {/* Divider line under header */}
                  <line
                    x1={box.x}
                    y1={box.y + 36}
                    x2={box.x + box.w}
                    y2={box.y + 36}
                    stroke={style.stroke}
                    strokeWidth="1"
                  />

                  {/* Role Title text */}
                  <text
                    x={box.x + box.w / 2}
                    y={box.y + 24}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill={style.headerText}
                    className="font-sans uppercase tracking-wider pointer-events-none"
                  >
                    {role}
                  </text>

                  {/* Render 3 Keywords */}
                  {analysisObj && analysisObj.keywords && analysisObj.keywords.length > 0 && analysisObj.keywords[0] !== "" ? (
                    analysisObj.keywords.slice(0, 3).map((kw, idx) => {
                      // Distribute keywords vertically
                      const verticalOffset = 64 + idx * 24;
                      return (
                        <text
                          key={idx}
                          x={box.x + box.w / 2}
                          y={box.y + verticalOffset}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="600"
                          fill={style.text}
                          className="font-sans pointer-events-none"
                        >
                          • {kw.length > 22 ? `${kw.substring(0, 20)}...` : kw}
                        </text>
                      );
                    })
                  ) : (
                    <text
                      x={box.x + box.w / 2}
                      y={box.y + 75}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="500"
                      fill="#94a3b8"
                      fontStyle="italic"
                      className="font-sans pointer-events-none"
                    >
                      Nicht bestimmt
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Elegant HTML Floating Tooltip overlay */}
          {hoveredRole && hoveredData && (
            <div
              style={{
                position: "absolute",
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
              }}
              className="z-30 w-80 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700/80 p-4 pointer-events-none text-left animate-fade-in"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  style={{
                    backgroundColor: BOX_STYLES[hoveredRole].headerBg,
                    color: BOX_STYLES[hoveredRole].headerText,
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                >
                  {hoveredRole}
                </span>
                <span className="text-xs text-slate-400">Interpretation & Belege</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed mb-3">
                {hoveredData.interpretation || "Keine Interpretation verfügbar."}
              </p>

              {hoveredData.evidence && hoveredData.evidence.length > 0 && hoveredData.evidence.some(ev => ev.trim() !== "") && (
                <div className="border-t border-slate-800 pt-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                    Textbelege (Zitate):
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {hoveredData.evidence.slice(0, 3).map((quote, qIdx) => {
                      if (!quote.trim()) return null;
                      return (
                        <div
                          key={qIdx}
                          className="text-[11px] text-slate-300 italic pl-2 border-l-2 border-slate-500 leading-relaxed"
                        >
                          „{quote}“
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px]">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            <span className="font-bold text-slate-500 uppercase tracking-wider">Relation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-blue-700 bg-blue-100/40"></div>
            <span className="font-bold text-slate-500 uppercase tracking-wider">Aktantenrolle</span>
          </div>
        </div>
        <div className="text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-900 shrink-0" />
          <span>Fahren Sie mit dem Mauszeiger über Boxen für Interpretation & Belege</span>
        </div>
      </div>
    </section>
  );
}
