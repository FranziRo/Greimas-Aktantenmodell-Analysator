/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { Settings, GraduationCap, Key, Eye, EyeOff, Check, X, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function Header({ apiKey, onApiKeyChange }: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync internal state with prop if updated elsewhere
  useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onApiKeyChange(tempKey.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSettingsOpen(false);
    }, 1000);
  };

  return (
    <>
      <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-900">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 tracking-tight text-base sm:text-lg">
                  Greimas Aktantenmodell
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 border-l border-slate-200 pl-2">
                  Academic Analysator
                </span>
              </div>
            </div>

            {/* Profile & Settings Button */}
            <div className="flex items-center gap-2">
              {/* API Settings Gear Icon */}
              <button
                id="api-settings-btn"
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-xl border transition-all duration-200 relative ${
                  apiKey
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                    : 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700 animate-pulse'
                }`}
                title={apiKey ? 'API-Schlüssel konfiguriert' : 'API-Schlüssel erforderlich'}
              >
                <Settings className="h-5 w-5" />
                {!apiKey && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* API settings modal */}
      {isSettingsOpen && (
        <div id="settings-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Key className="h-5 w-5 text-blue-900" />
                <h3 className="font-semibold text-slate-900 text-lg">Google AI Studio API-Key</h3>
              </div>
              <button
                id="close-settings-btn"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Um vollkommen private Analysen von Transkripten direkt von Ihrem Browser ausführen zu können, hinterlegen Sie bitte Ihren persönlichen Google AI Studio API-Schlüssel.
              </p>

              <div className="bg-blue-50/60 border border-blue-100/70 p-3 rounded-xl space-y-1.5">
                <h4 className="text-xs font-medium text-blue-950 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-blue-900" />
                  Sicherheitshinweis zur API-Nutzung
                </h4>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Ihr Schlüssel wird ausschließlich im lokalen Speicher (<code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-[10px]">localStorage</code>) Ihres eigenen Browsers abgelegt. Zu keinem Zeitpunkt wird der Key auf externe Server hochgeladen oder für Dritte zugänglich gemacht.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">API-Schlüssel</label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    id="api-key-input"
                    type={showKey ? 'text' : 'password'}
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full text-sm py-2.5 pl-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-all duration-200"
                    required
                  />
                  <button
                    id="toggle-key-visibility-btn"
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400 leading-normal flex flex-col gap-1">
                <span>
                  Noch keinen Schlüssel? Sie können in weniger als 1 Minute kostenlos einen Schlüssel im{' '}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-900 font-medium underline hover:text-blue-950"
                  >
                    Google AI Studio
                  </a>{' '}
                  erstellen.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  id="cancel-settings-btn"
                  type="button"
                  onClick={() => {
                    setTempKey(apiKey);
                    setIsSettingsOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  id="save-settings-btn"
                  type="submit"
                  disabled={saveSuccess}
                  className={`px-5 py-2 text-sm font-medium rounded-xl text-white shadow-xs flex items-center gap-1.5 transition-all duration-200 ${
                    saveSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-900 hover:bg-blue-950'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Gespeichert!</span>
                    </>
                  ) : (
                    <span>Speichern</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
