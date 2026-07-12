/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, MouseEvent } from 'react';
import { ActantRoleAnalysis, GreimasRole } from '../types';
import { Network, FileText, ArrowRight, BookOpen, Quote } from 'lucide-react';

interface ActantialDiagramProps {
  data: ActantRoleAnalysis[];
}

interface NodeConfig {
  role: GreimasRole;
  label: string;
  colorClass: {
    bg: string;
    border: string;
    text: string;
    fill: string;
    accent: string;
  };
  cx: number;
  cy: number;
}

export default function ActantialDiagram({ data }: ActantialDiagramProps) {
  const [hoveredRole, setHoveredRole] = useState<GreimasRole | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Configuration of the 6 nodes in the 3-axis classic grid (SVG viewBox 0 0 1000 500)
  const nodes: NodeConfig[] = [
    {
      role: 'Adressant',
      label: 'Adressant (Sender)',
      colorClass: {
        bg: 'bg-blue-50/90',
        border: 'border-blue-200',
        text: 'text-blue-900',
        fill: '#f0f6ff',
        accent: '#2563eb'
      },
      cx: 160,
      cy: 110
    },
    {
      role: 'Objekt',
      label: 'Objekt (Ziel/Gut)',
      colorClass: {
        bg: 'bg-amber-50/90',
        border: 'border-amber-200',
        text: 'text-amber-900',
        fill: '#fffbeb',
        accent: '#d97706'
      },
      cx: 500,
      cy: 110
    },
    {
      role: 'Adressat',
      label: 'Adressat (Empfänger)',
      colorClass: {
        bg: 'bg-emerald-50/90',
        border: 'border-emerald-200',
        text: 'text-emerald-900',
        fill: '#f0fdf4',
        accent: '#16a34a'
      },
      cx: 840,
      cy: 110
    },
    {
      role: 'Adjuvant',
      label: 'Adjuvant (Helfer)',
      colorClass: {
        bg: 'bg-teal-50/90',
        border: 'border-teal-200',
        text: 'text-teal-900',
        fill: '#f0fdfa',
        accent: '#0d9488'
      },
      cx: 160,
      cy: 390
    },
    {
      role: 'Subjekt',
      label: 'Subjekt (Akteur)',
      colorClass: {
        bg: 'bg-cyan-50/90',
        border: 'border-cyan-200',
        text: 'text-cyan-900',
        fill: '#ecfeff',
        accent: '#0891b2'
      },
      cx: 500,
      cy: 390
    },
    {
      role: 'Opponent',
      label: 'Opponent (Gegner)',
      colorClass: {
        bg: 'bg-rose-50/90',
        border: 'border-rose-200',
        text: 'text-rose-900',
        fill: '#fff1f2',
        accent: '#e11d48'
      },
      cx: 840,
      cy: 390
    }
  ];

  const handleMouseMove = (e: MouseEvent) => {
    if (containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      // Position tooltip relative to container, slightly offset
      setTooltipPos({
        x: e.clientX - bounds.left + 15,
        y: e.clientY - bounds.top + 15
      });
    }
  };

  const getAnalysisForRole = (role: GreimasRole) => {
    return data.find((item) => item.role === role);
  };

  const hoveredData = hoveredRole ? getAnalysisForRole(hoveredRole) : null;
  const hoveredConfig = hoveredRole ? nodes.find((n) => n.role === hoveredRole) : null;

  return (
    <div id="actantial-diagram-card" className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-blue-900" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Aktantenmodell-Diagramm (A. J. Greimas)</h2>
            <p className="text-xs text-slate-400">Interaktive 3-Achsen-Übersicht. Bewegen Sie die Maus über einen Aktanten für Belege.</p>
          </div>
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div
        id="diagram-interactive-area"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full border border-slate-200 bg-slate-50/40 rounded-xl overflow-hidden cursor-crosshair min-h-[300px]"
      >
        <svg
          id="greimas-svg-canvas"
          viewBox="0 0 1000 500"
          className="w-full h-auto select-none"
        >
          {/* Definitions of markers for clean arrowhead rendering */}
          <defs>
            <marker
              id="arrowhead-right"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1e3a8a" />
            </marker>
            <marker
              id="arrowhead-left"
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 10 1.5 L 2 5 L 10 8.5 z" fill="#1e3a8a" />
            </marker>
            <marker
              id="arrowhead-up"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d97706" />
            </marker>
          </defs>

          {/* 3 AXES SHADOW / PATH DETAILS */}
          {/* 1. Horizontal Axis Top: Adressant -> Objekt -> Adressat */}
          <path
            d="M 270 110 L 390 110"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            markerEnd="url(#arrowhead-right)"
          />
          <path
            d="M 610 110 L 730 110"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            markerEnd="url(#arrowhead-right)"
          />

          {/* 2. Horizontal Axis Bottom: Adjuvant -> Subjekt <- Opponent */}
          <path
            d="M 270 390 L 390 390"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            markerEnd="url(#arrowhead-right)"
          />
          <path
            d="M 730 390 L 610 390"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            markerEnd="url(#arrowhead-left)"
          />

          {/* 3. Vertical Axis: Subjekt -> Objekt */}
          <path
            d="M 500 340 L 500 160"
            stroke="#d97706"
            strokeWidth="3.5"
            markerEnd="url(#arrowhead-up)"
          />

          {/* AXIS LABELS / BADGES */}
          {/* Label: initiiert */}
          <g>
            <rect x="290" y="96" width="80" height="20" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <text x="330" y="110" textAnchor="middle" fill="#1e3a8a" fontSize="10.5" fontWeight="600">initiiert</text>
          </g>

          {/* Label: kommt zugute */}
          <g>
            <rect x="625" y="96" width="90" height="20" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <text x="670" y="110" textAnchor="middle" fill="#1e3a8a" fontSize="10.5" fontWeight="600">kommt zugute</text>
          </g>

          {/* Label: unterstützt */}
          <g>
            <rect x="285" y="376" width="90" height="20" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <text x="330" y="390" textAnchor="middle" fill="#1e3a8a" fontSize="10.5" fontWeight="600">unterstützt</text>
          </g>

          {/* Label: behindert */}
          <g>
            <rect x="625" y="376" width="90" height="20" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <text x="670" y="390" textAnchor="middle" fill="#1e3a8a" fontSize="10.5" fontWeight="600">behindert</text>
          </g>

          {/* Label: strebt nach */}
          <g>
            <rect x="445" y="240" width="110" height="22" rx="4" fill="white" stroke="#fed7aa" strokeWidth="1" />
            <text x="500" y="255" textAnchor="middle" fill="#c2410c" fontSize="11" fontWeight="700">strebt nach</text>
          </g>

          {/* RENDERING THE 6 INTERACTIVE NODE CARDS */}
          {nodes.map((node) => {
            const rData = getAnalysisForRole(node.role);
            const isHovered = hoveredRole === node.role;
            const keywords = rData ? rData.keywords : [];

            return (
              <g
                key={node.role}
                onMouseEnter={() => setHoveredRole(node.role)}
                onMouseLeave={() => setHoveredRole(null)}
                className="cursor-pointer"
              >
                {/* Outer Card Rect */}
                <rect
                  x={node.cx - 110}
                  y={node.cy - 50}
                  width="220"
                  height="100"
                  rx="12"
                  fill={node.colorClass.fill}
                  stroke={isHovered ? node.colorClass.accent : '#cbd5e1'}
                  strokeWidth={isHovered ? '2.5' : '1.5'}
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Left Accent indicator line */}
                <rect
                  x={node.cx - 110}
                  y={node.cy - 40}
                  width="4"
                  height="80"
                  rx="2"
                  fill={node.colorClass.accent}
                />

                {/* Role Title Text */}
                <text
                  x={node.cx - 95}
                  y={node.cy - 20}
                  fill="#0f172a"
                  fontSize="12.5"
                  fontWeight="700"
                >
                  {node.label}
                </text>

                {/* Role Keywords Row 1 */}
                <text
                  x={node.cx - 95}
                  y={node.cy + 12}
                  fill="#475569"
                  fontSize="11"
                  fontWeight="500"
                >
                  {keywords.length > 0 ? keywords.slice(0, 2).join(', ') : 'Keine Keywords'}
                </text>

                {/* Role Keywords Row 2 */}
                {keywords.length > 2 && (
                  <text
                    x={node.cx - 95}
                    y={node.cy + 30}
                    fill="#64748b"
                    fontSize="10"
                    fontStyle="italic"
                  >
                    + {keywords[2]}
                  </text>
                )}

                {/* Small indicator "Hover for evidence" */}
                <text
                  x={node.cx + 95}
                  y={node.cy + 38}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="500"
                >
                  Details • info
                </text>
              </g>
            );
          })}
        </svg>

        {/* FLOATING HOVER TOOLTIP */}
        {hoveredRole && hoveredData && hoveredConfig && (
          <div
            id="diagram-floating-tooltip"
            style={{
              position: 'absolute',
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`
            }}
            className="z-30 max-w-sm w-80 bg-white border border-slate-200/90 shadow-lg rounded-xl p-4.5 space-y-3 pointer-events-none transform transition-all duration-100 ease-out text-xs"
          >
            {/* Tooltip Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800 text-[13px]">{hoveredConfig.label}</span>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[9.5px] font-mono">
                Aktant
              </span>
            </div>

            {/* Tooltip Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Semiotische Deutung
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
                {hoveredData.interpretation}
              </p>
            </div>

            {/* Tooltip Quotes */}
            {hoveredData.evidence && hoveredData.evidence.length > 0 && (
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Textbelege (Qualitativ)
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {hoveredData.evidence.map((quote, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-150 rounded-lg p-2 flex gap-1.5 text-[10px] text-slate-500 leading-normal">
                      <Quote className="h-3 w-3 text-slate-300 shrink-0 mt-0.5" />
                      <span className="italic">„{quote}“</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
