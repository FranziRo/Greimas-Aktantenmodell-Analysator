/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Award, ArrowUpRight } from 'lucide-react';

export default function AcademicIntro() {
  return (
    <div id="academic-intro" className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-900">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Forschungs- & Analysewerkzeug</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Das Aktantenmodell nach Algirdas Julien Greimas
          </h1>
          
          <p className="text-slate-600 text-sm leading-relaxed">
            Das 1966 in der strukturalistischen Semiotik etablierte <strong>Aktantenmodell (Aktantenmodell von Greimas)</strong> erlaubt es, komplexe erzählte oder beschriebene Handlungsstränge auf sechs fundamentale dramaturgische Rollen, sogenannte Aktanten, zu reduzieren. Diese Rollen sind keine konkreten Personen, sondern funktionale Abstraktionen, die auf drei zentralen Achsen des menschlichen Handelns miteinander interagieren.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 self-start p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-500 text-xs shrink-0 font-medium">
          <Award className="h-4 w-4 text-blue-900" />
          <span>Semiotische Analyse v2.1</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-slate-100 pt-6">
        {/* Achse 1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-medium">
            <span className="flex items-center justify-center text-[10px] h-5 w-5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full font-bold">1</span>
            <span className="text-xs uppercase tracking-wider font-semibold">Die Achse des Begehrens (Wollen)</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verbindet das <strong>Subjekt</strong> mit dem <strong>Objekt</strong>. Sie beschreibt die Absicht, das Streben, die Sehnsucht oder die Aufgabe des Akteurs, ein bestimmtes Ziel oder Gut zu erreichen.
          </p>
        </div>

        {/* Achse 2 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-medium">
            <span className="flex items-center justify-center text-[10px] h-5 w-5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full font-bold">2</span>
            <span className="text-xs uppercase tracking-wider font-semibold">Die Achse der Übertragung (Wissen)</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verbindet den <strong>Adressanten</strong> (Geber/Sender) mit dem <strong>Adressaten</strong> (Empfänger/Nutzer). Sie beschreibt, wer die Handlung initiiert und wem das erzielte Gut letztlich zugute kommt.
          </p>
        </div>

        {/* Achse 3 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-medium">
            <span className="flex items-center justify-center text-[10px] h-5 w-5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full font-bold">3</span>
            <span className="text-xs uppercase tracking-wider font-semibold">Die Achse der Macht (Können)</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verbindet den <strong>Adjuvanten</strong> (Unterstützer/Helfer) mit dem <strong>Opponenten</strong> (Gegner/Hemmnis). Sie beschreibt förderliche und hinderliche Umstände, Ereignisse oder Akteure.
          </p>
        </div>
      </div>

      <div className="mt-5 bg-slate-50/60 border border-slate-200/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 leading-relaxed">
          <strong>Anleitung:</strong> Laden Sie Ihr Interviewtranskript (TXT) hoch. Unsere künstliche Intelligenz modelliert die Aussagen präzise in die sechs klassischen Kategorien und filtert repräsentative Zitate als wissenschaftliche Belege heraus.
        </div>
        <a
          href="https://de.wikipedia.org/wiki/Aktantenmodell"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-blue-900 hover:text-blue-950 font-semibold shrink-0 transition-colors"
        >
          <span>Mehr zur Theorie erfahren</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
