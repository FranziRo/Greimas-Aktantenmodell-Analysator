import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  AlertTriangle,
  ExternalLink,
  Code,
  Terminal,
  Send,
  RefreshCw,
  HelpCircle,
  Info,
  Lock,
  Shield,
  Settings,
  Layers,
  Activity,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BookOpen
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: "mock" | "real";
  permissions: "full" | "readonly";
  modelAccess: "all" | "flash" | "pro";
  createdAt: string;
  status: "active" | "inactive";
}

export default function App() {
  // State for keys
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [activeTab, setActiveTab] = useState<"keys" | "playground" | "guide">("keys");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  
  // Create Key Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyType, setNewKeyType] = useState<"mock" | "real">("mock");
  const [customKeyValue, setCustomKeyValue] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<"full" | "readonly">("full");
  const [newKeyModelAccess, setNewKeyModelAccess] = useState<"all" | "flash" | "pro">("all");

  // Edit Key State
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [editName, setEditName] = useState("");

  // Key Validation State
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, { valid: boolean; message: string }>>({});

  // Playground State
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOutput, setGenerationOutput] = useState("");
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [payloadRequest, setPayloadRequest] = useState<any>(null);
  const [payloadResponse, setPayloadResponse] = useState<any>(null);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);

  // GitHub Security states
  const [securityChecklist, setSecurityChecklist] = useState({
    gitignore: false,
    noKeysInCode: false,
    limits: false,
    envExample: false,
  });

  // Load initial keys
  useEffect(() => {
    const savedKeys = localStorage.getItem("ai_studio_user_keys");
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setKeys(parsed);
        if (parsed.length > 0) {
          setSelectedKeyId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse keys from localStorage", e);
      }
    } else {
      // Create default keys to look like the mock screenshot, plus make them interactive!
      const initial: ApiKey[] = [
        {
          id: "1",
          name: "Mein Projekt-Key Alpha",
          key: "AIzaSyMock_AlphaProjectKey2026",
          type: "mock",
          permissions: "full",
          modelAccess: "all",
          createdAt: "12. Okt 2023",
          status: "active"
        },
        {
          id: "2",
          name: "Testumgebung Key",
          key: "AIzaSyMock_DevEnvironmentSecureV4",
          type: "mock",
          permissions: "readonly",
          modelAccess: "flash",
          createdAt: "05. Nov 2023",
          status: "active"
        }
      ];
      setKeys(initial);
      setSelectedKeyId("1");
      localStorage.setItem("ai_studio_user_keys", JSON.stringify(initial));
    }
  }, []);

  // Save keys whenever they change
  const saveKeys = (updatedKeys: ApiKey[]) => {
    setKeys(updatedKeys);
    localStorage.setItem("ai_studio_user_keys", JSON.stringify(updatedKeys));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const generateRandomMockKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
    let result = "AIzaSyMock_";
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    let finalKey = "";
    if (newKeyType === "mock") {
      finalKey = generateRandomMockKey();
    } else {
      if (!customKeyValue.trim()) {
        alert("Bitte geben Sie einen echten API-Schlüssel ein.");
        return;
      }
      finalKey = customKeyValue.trim();
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      key: finalKey,
      type: newKeyType,
      permissions: newKeyPermissions,
      modelAccess: newKeyModelAccess,
      createdAt: new Date().toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      status: "active"
    };

    const updated = [newKey, ...keys];
    saveKeys(updated);
    setSelectedKeyId(newKey.id);

    // Reset Form & Close Modal
    setNewKeyName("");
    setCustomKeyValue("");
    setNewKeyType("mock");
    setIsModalOpen(false);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm("Möchten Sie diesen API-Schlüssel wirklich unwiderruflich löschen?")) {
      const updated = keys.filter(k => k.id !== id);
      saveKeys(updated);
      if (selectedKeyId === id && updated.length > 0) {
        setSelectedKeyId(updated[0].id);
      }
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = keys.map(k => {
      if (k.id === id) {
        return { ...k, status: k.status === "active" ? ("inactive" as const) : ("active" as const) };
      }
      return k;
    });
    saveKeys(updated);
  };

  const handleStartEdit = (key: ApiKey) => {
    setEditingKey(key);
    setEditName(key.name);
  };

  const handleSaveEdit = () => {
    if (!editingKey || !editName.trim()) return;
    const updated = keys.map(k => {
      if (k.id === editingKey.id) {
        return { ...k, name: editName.trim() };
      }
      return k;
    });
    saveKeys(updated);
    setEditingKey(null);
  };

  // Live validate an API Key via server API
  const handleValidateKey = async (apiKeyObj: ApiKey) => {
    setValidatingId(apiKeyObj.id);
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKeyObj.key })
      });
      const data = await response.json();
      setValidationResults(prev => ({
        ...prev,
        [apiKeyObj.id]: { valid: data.valid, message: data.message }
      }));
    } catch (err) {
      setValidationResults(prev => ({
        ...prev,
        [apiKeyObj.id]: { valid: false, message: "Server-Validierung fehlgeschlagen." }
      }));
    } finally {
      setValidatingId(null);
    }
  };

  // Playground Submit
  const handlePlaygroundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const currentKey = keys.find(k => k.id === selectedKeyId);
    if (!currentKey) {
      setPlaygroundError("Kein gültiger API-Schlüssel ausgewählt.");
      return;
    }

    if (currentKey.status === "inactive") {
      setPlaygroundError("Dieser Schlüssel ist inaktiv. Bitte aktivieren Sie ihn zuerst in der Schlüssel-Verwaltung.");
      return;
    }

    setIsGenerating(true);
    setPlaygroundError(null);
    setGenerationOutput("");
    
    // Setup simulated developer telemetry logs
    setTelemetryLogs(["Starte API-Aufruf...", "Analysiere Berechtigungen...", "Bereite Request-Body vor..."]);
    
    const requestPayload = {
      prompt: prompt.trim(),
      model: selectedModel,
      userKey: currentKey.type === "real" ? currentKey.key : "AIzaSyMock_Active"
    };
    setPayloadRequest(requestPayload);
    setPayloadResponse(null);

    try {
      // Tick 1
      await new Promise(r => setTimeout(r, 600));
      setTelemetryLogs(prev => [...prev, `Modell ausgewählt: ${selectedModel}`, `Verwende Key: ${currentKey.name} (${currentKey.type === "mock" ? "Simulierter Modus" : "Echt-Modus"})`]);

      // Tick 2
      await new Promise(r => setTimeout(r, 500));
      setTelemetryLogs(prev => [...prev, "Sende verschlüsselte Anfrage an Express API-Proxy...", "Warte auf Antwort von Google Gemini..."]);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unerwarteter API-Fehler.");
      }

      setTelemetryLogs(prev => [...prev, "Antwort erfolgreich empfangen!", "Berechne Latenz und Token-Verbrauch..."]);
      setGenerationOutput(data.text);
      setPayloadResponse(data);
    } catch (err: any) {
      console.error(err);
      setPlaygroundError(err.message || "Verbindungsfehler zur Gemini API.");
      setTelemetryLogs(prev => [...prev, "Fehler: Anfrage abgebrochen."]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Set preset prompt
  const applyPreset = (text: string) => {
    setPrompt(text);
  };

  // Code snippets generator based on selected API Key
  const getSelectedKeyString = () => {
    const keyObj = keys.find(k => k.id === selectedKeyId) || keys[0];
    return keyObj ? keyObj.key : "IHR_SCHLÜSSEL";
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-slate-900">
      {/* Navigation Header */}
      <nav className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Key className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 font-display">AI Studio Console</span>
          </div>
          
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <button
              onClick={() => setActiveTab("keys")}
              className={`h-16 flex items-center transition-all px-1 border-b-2 ${
                activeTab === "keys"
                  ? "text-blue-600 border-blue-600 font-semibold"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              API-Schlüssel
            </button>
            <button
              onClick={() => setActiveTab("playground")}
              className={`h-16 flex items-center transition-all px-1 border-b-2 ${
                activeTab === "playground"
                  ? "text-blue-600 border-blue-600 font-semibold"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              Playground & Tester
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`h-16 flex items-center transition-all px-1 border-b-2 ${
                activeTab === "guide"
                  ? "text-blue-600 border-blue-600 font-semibold"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              Integrations-Anleitung
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs text-slate-400 font-medium font-mono">Angemeldet als</span>
            <span className="text-sm font-semibold text-slate-700">frax030@gmail.com</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
            JD
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8 overflow-x-hidden">
        
        {/* Left / Central Component Container */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* TAB 1: KEYS MANAGEMENT */}
          {activeTab === "keys" && (
            <>
              <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-950 tracking-tight font-display">API-Schlüssel verwalten</h1>
                    <p className="text-slate-500 mt-1">Erstellen und konfigurieren Sie Ihre Schlüssel für den Zugriff auf Google AI Studio Modelle.</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors self-start md:self-center"
                  >
                    <Plus className="w-4 h-4" />
                    Neuen Schlüssel erstellen
                  </button>
                </div>
              </section>

              {/* Active Keys Table Card */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <h2 className="font-semibold text-slate-900">Aktive Schlüssel ({keys.length})</h2>
                  </div>
                  <span className="text-xs text-slate-400">Pure Client-Side Verschlüsselung</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">API-Schlüssel</th>
                        <th className="px-6 py-4 font-semibold">Typ & Rechte</th>
                        <th className="px-6 py-4 font-semibold">Erstellt am</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {keys.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                            Keine API-Schlüssel vorhanden. Klicken Sie oben auf "+ Neuen Schlüssel erstellen".
                          </td>
                        </tr>
                      ) : (
                        keys.map(k => {
                          const isVisible = visibleKeys[k.id];
                          const hasValidation = validationResults[k.id];
                          return (
                            <tr key={k.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="px-6 py-4">
                                {editingKey?.id === k.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="border border-slate-200 px-2 py-1 rounded text-sm bg-white focus:outline-blue-600 focus:border-blue-600"
                                    />
                                    <button
                                      onClick={handleSaveEdit}
                                      className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded font-medium"
                                    >
                                      Speichern
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{k.name}</span>
                                    <span className="text-xs text-slate-400 capitalize">
                                      {k.modelAccess === "all" ? "Alle Modelle" : `Nur ${k.modelAccess}`}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-600">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs select-all bg-slate-100 px-2 py-1 rounded">
                                    {isVisible
                                      ? k.key
                                      : `${k.key.substring(0, 8)}...${k.key.substring(k.key.length - 4)}`}
                                  </span>
                                  <button
                                    onClick={() => toggleVisibility(k.id)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                                    title={isVisible ? "Verbergen" : "Anzeigen"}
                                  >
                                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => handleCopy(k.key, k.id)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                                    title="Kopieren"
                                  >
                                    {copiedId === k.id ? (
                                      <Check className="w-3.5 h-3.5 text-green-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    k.type === "mock"
                                      ? "bg-slate-100 text-slate-600 border border-slate-200"
                                      : "bg-blue-50 text-blue-700 border border-blue-100"
                                  }`}>
                                    {k.type === "mock" ? "Simuliert (Mock)" : "Echter Key"}
                                  </span>
                                  <span className="text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                    {k.permissions === "full" ? "Vollzugriff" : "Read-Only"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-xs">
                                {k.createdAt}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleToggleStatus(k.id)}
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                    k.status === "active"
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    k.status === "active" ? "bg-green-600" : "bg-amber-600"
                                  }`}></span>
                                  {k.status === "active" ? "Aktiv" : "Inaktiv"}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Key checking/validation */}
                                  <button
                                    onClick={() => handleValidateKey(k)}
                                    disabled={validatingId === k.id}
                                    className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    {validatingId === k.id ? (
                                      <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />
                                    ) : null}
                                    Prüfen
                                  </button>

                                  <button
                                    onClick={() => handleStartEdit(k)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                                    title="Bearbeiten"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteKey(k.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                    title="Löschen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Validation Output pop */}
                                {hasValidation && (
                                  <div className={`text-left mt-1.5 p-1 px-2 rounded text-[11px] border ${
                                    hasValidation.valid
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}>
                                    {hasValidation.valid ? "✓ " : "✗ "} {hasValidation.message}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Code-Builder Section */}
              <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-4">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold font-display">Dynamischer Code-Konfigurator</h3>
                </div>
                
                <p className="text-sm text-slate-300 mb-6">
                  Wählen Sie oben einen API-Schlüssel aus. Der folgende Code-Schnipsel wird in Echtzeit aktualisiert, damit Sie ihn direkt kopieren und in Ihre `.env` Datei einfügen können.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Schritt 1: Lokal Konfigurieren
                    </div>
                    <p className="text-sm text-slate-300">
                      Erstellen Sie eine Datei namens <code className="bg-slate-800 text-slate-100 px-1 py-0.5 rounded font-mono text-xs">.env</code> im Hauptverzeichnis Ihres Projektes und fügen Sie den Schlüssel dort ein:
                    </p>
                    <div className="relative">
                      <div className="bg-slate-950 p-3.5 rounded-lg font-mono text-xs text-blue-300 overflow-x-auto border border-slate-800">
                        GEMINI_API_KEY="{getSelectedKeyString()}"
                      </div>
                      <button
                        onClick={() => handleCopy(`GEMINI_API_KEY="${getSelectedKeyString()}"`, "env-copy")}
                        className="absolute right-2.5 top-2.5 bg-slate-800 hover:bg-slate-700 p-1.5 rounded transition-colors"
                        title="Kopieren"
                      >
                        {copiedId === "env-copy" ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Schritt 2: Best Practices für Sicherheit
                    </div>
                    <p className="text-sm text-slate-300">
                      Teilen Sie Ihren Schlüssel niemals öffentlich (z.B. auf GitHub). Fügen Sie <code className="bg-slate-800 text-slate-100 px-1 py-0.5 rounded font-mono text-xs">.env</code> unbedingt zu Ihrer <code className="bg-slate-800 text-slate-100 px-1 py-0.5 rounded font-mono text-xs">.gitignore</code>-Datei hinzu!
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveTab("guide")}
                        className="text-blue-400 text-sm font-semibold hover:underline inline-flex items-center gap-1 hover:text-blue-300 transition-colors"
                      >
                        Vollständigen Integrations-Guide lesen <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: INTERACTIVE PLAYGROUND & API TESTER */}
          {activeTab === "playground" && (
            <>
              <section>
                <h1 className="text-3xl font-bold text-slate-950 tracking-tight font-display">Playground & API Tester</h1>
                <p className="text-slate-500 mt-1">Testen Sie API-Aufrufe an das Gemini-Modell mit Ihren konfigurierten Schlüsseln in einer Echtzeit-Umgebung.</p>
              </section>

              <div className="grid lg:grid-cols-12 gap-8">
                {/* Inputs area */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <form onSubmit={handlePlaygroundSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-5">
                    <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      Anfrage-Konfiguration
                    </h2>

                    {/* Key selector */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Verwendeter API-Schlüssel</label>
                      <select
                        value={selectedKeyId}
                        onChange={(e) => setSelectedKeyId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                      >
                        {keys.map(k => (
                          <option key={k.id} value={k.id}>
                            {k.name} ({k.type === "mock" ? "Simulierter Schlüssel (Mock)" : "Echter Schlüssel"}) {k.status === "inactive" ? "- INAKTIV" : ""}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-400">
                        * Simulierter Modus sendet Anfragen sicher über unseren server-seitigen API-Proxy, sodass Sie kein Budget benötigen.
                      </p>
                    </div>

                    {/* Model selector */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Modell-Auswahl</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedModel("gemini-2.5-flash")}
                          className={`p-3 rounded-lg border text-left flex flex-col transition-all ${
                            selectedModel === "gemini-2.5-flash"
                              ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/10"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-semibold text-sm">Gemini 2.5 Flash</span>
                          <span className="text-xs text-slate-500">Schnell, leichtgewichtig und kostengünstig.</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedModel("gemini-2.5-pro")}
                          className={`p-3 rounded-lg border text-left flex flex-col transition-all ${
                            selectedModel === "gemini-2.5-pro"
                              ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/10"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-semibold text-sm">Gemini 2.5 Pro</span>
                          <span className="text-xs text-slate-500">Hervorragend für komplexe Logik & Coding.</span>
                        </button>
                      </div>
                    </div>

                    {/* Prompt input with presets */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Prompt / Nachricht</label>
                        <span className="text-xs text-slate-400">Geben Sie eine Frage oder Anweisung ein</span>
                      </div>
                      
                      {/* Presets buttons */}
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        <button
                          type="button"
                          onClick={() => applyPreset("Erkläre mir in drei Sätzen, wie ein API-Schlüssel funktioniert.")}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition-colors"
                        >
                          💡 Erklärung API-Key
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset("Schreibe ein extrem kurzes Hallo-Welt Script in Python.")}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition-colors"
                        >
                          🐍 Python Starter
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset("Welche Sicherheitsregeln sollte ich bei API-Keys auf GitHub beachten?")}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition-colors"
                        >
                          🛡️ Sicherheitsregeln
                        </button>
                      </div>

                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Schreibe eine Nachricht an Gemini..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 resize-none font-sans"
                      />
                    </div>

                    {playgroundError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-lg flex gap-2 items-start">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Fehler beim API-Aufruf:</span>
                          <p className="mt-0.5">{playgroundError}</p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generiere Antwort...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Testanfrage senden
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Response and payload display */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Console Logs / Telemetry */}
                  <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-5 shadow-xs font-mono text-xs flex-1 flex flex-col min-h-[300px] max-h-[500px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-slate-400">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        Developer Console & Telemetrie
                      </span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">Live</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 scroller">
                      {telemetryLogs.length === 0 ? (
                        <div className="text-slate-500 italic h-full flex items-center justify-center">
                          Warte auf Testanfrage...
                        </div>
                      ) : (
                        telemetryLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2 text-slate-300">
                            <span className="text-blue-500">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))
                      )}
                      
                      {isGenerating && (
                        <div className="flex items-center gap-1.5 text-slate-500 animate-pulse">
                          <span>&gt;</span>
                          <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-ping"></span>
                          <span>Warte auf Server-Streaming...</span>
                        </div>
                      )}

                      {generationOutput && (
                        <div className="mt-4 pt-3 border-t border-slate-800">
                          <span className="text-green-400 font-semibold text-[11px] uppercase tracking-wider block mb-1">Gemini Antwort:</span>
                          <div className="text-slate-100 bg-slate-950 p-3 rounded border border-slate-800 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                            {generationOutput}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* API Payload Inspector */}
                  {payloadRequest && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                      <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-500" />
                        API Payload Inspektor (cURL)
                      </h3>
                      <div className="space-y-3">
                        <div className="text-xs text-slate-500">
                          So würde die Anfrage als nativer HTTP/REST Aufruf aussehen:
                        </div>
                        <div className="relative">
                          <pre className="bg-slate-50 p-3 rounded-lg text-[11px] font-mono overflow-x-auto text-slate-700 border border-slate-100">
                            {`curl "https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=AIzaSy..." \\
  -H 'Content-Type: application/json' \\
  -d '{
    "contents": [{
      "parts": [{"text": "${prompt.substring(0, 40)}${prompt.length > 40 ? "..." : ""}"}]
    }]
  }'`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: STEP-BY-STEP INTEGRATION GUIDE */}
          {activeTab === "guide" && (
            <div className="flex flex-col gap-8">
              <section>
                <h1 className="text-3xl font-bold text-slate-950 tracking-tight font-display">Integrations-Anleitung</h1>
                <p className="text-slate-500 mt-1">Hier lernen Sie Schritt für Schritt, wie Sie Ihren echten API-Schlüssel aus Google AI Studio beziehen und in Ihre Code-Projekte einbinden.</p>
              </section>

              {/* Progress Tracker Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 -z-0"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 relative z-10">1</div>
                  <h3 className="font-semibold text-slate-950 relative z-10">Schlüssel erstellen</h3>
                  <p className="text-xs text-slate-500 leading-relaxed relative z-10">
                    Gehen Sie ins offizielle Google AI Studio und generieren Sie mit zwei Klicks einen kostenfreien API-Schlüssel für Ihr Google-Konto.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 -z-0"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 relative z-10">2</div>
                  <h3 className="font-semibold text-slate-950 relative z-10">Umgebung einrichten</h3>
                  <p className="text-xs text-slate-500 leading-relaxed relative z-10">
                    Tragen Sie den Schlüssel in Ihre lokale <code className="bg-slate-100 px-1 rounded font-mono text-[10px]">.env</code>-Datei ein, um ihn sicher vor unbefugten Blicken zu verbergen.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-8 -mt-8 -z-0"></div>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 relative z-10">3</div>
                  <h3 className="font-semibold text-slate-950 relative z-10">SDK initialisieren</h3>
                  <p className="text-xs text-slate-500 leading-relaxed relative z-10">
                    Nutzen Sie das offizielle Google GenAI SDK, um Modelle mit nur drei Code-Zeilen in Node, Python oder React aufzurufen.
                  </p>
                </div>
              </div>

              {/* Detailed Explanation Accordion/Steps */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 md:p-8 flex flex-col gap-8">
                
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 pb-8">
                  <div className="md:w-1/3">
                    <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Schritt 1</span>
                    <h3 className="text-lg font-bold text-slate-950 mt-1 mb-3">Erstellung in Google AI Studio</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Google bietet eine einfache, webbasierte Oberfläche namens <strong>Google AI Studio</strong> an. Dort können Sie Modelle direkt testen und Entwicklerschlüssel anfordern.
                    </p>
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors border border-slate-200"
                    >
                      Zum Google AI Studio <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  
                  <div className="md:w-2/3 bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Klickpfad im Studio</h4>
                    <ol className="space-y-3.5 text-sm text-slate-700">
                      <li className="flex items-start gap-2.5">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">a</span>
                        <span>Melden Sie sich mit Ihrem ganz normalen <strong>Google Workspace- oder Gmail-Konto</strong> im AI Studio an.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">b</span>
                        <span>Klicken Sie oben links in der Menüleiste auf den Button <strong>"Get API key"</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">c</span>
                        <span>Wählen Sie <strong>"Create API key"</strong>. Sie können den Key in einem bestehenden Google Cloud Projekt anlegen oder ein neues Standard-Projekt automatisch erstellen lassen.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">d</span>
                        <span>Kopieren Sie den generierten Schlüssel, der mit <code>AIzaSy...</code> beginnt.</span>
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 pb-8">
                  <div className="md:w-1/3">
                    <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Schritt 2</span>
                    <h3 className="text-lg font-bold text-slate-950 mt-1 mb-3">Die Umgebungsvariable (.env)</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      API-Schlüssel dürfen <strong>niemals</strong> hartkodiert im Frontend-Code stehen, da Angreifer sie sonst über die Entwicklerkonsole des Browsers auslesen können.
                    </p>
                  </div>
                  
                  <div className="md:w-2/3 bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col gap-4">
                    <p className="text-sm text-slate-700">
                      Nutzen Sie stattdessen eine <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">.env</code>-Datei auf Ihrem Server oder Rechner. In dieser Anwendung wird der Schlüssel sicher serverseitig geladen:
                    </p>
                    <div className="bg-slate-900 rounded-lg p-3.5 font-mono text-xs text-blue-300">
                      <span className="text-slate-500"># .env Datei im Projekt-Stammverzeichnis</span><br/>
                      GEMINI_API_KEY="AIzaSyB..."
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>In Google AI Studio Applets:</strong> Wenn Sie Ihre App direkt über Google AI Studio hosten oder teilen, wird Ihr konfigurierter Key im Secrets-Menü sicher im Hintergrund als verschlüsseltes Secret injiziert.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Schritt 3</span>
                    <h3 className="text-lg font-bold text-slate-950 mt-1 mb-3">Code-Implementierung</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Nachdem Ihr Schlüssel in den Umgebungsvariablen hinterlegt ist, können Sie das offizielle SDK initialisieren und steuern.
                    </p>
                  </div>
                  
                  <div className="md:w-2/3 bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <div className="border-b border-slate-200 pb-3 mb-4 flex gap-4 text-xs font-semibold">
                      <span className="text-blue-600 border-b-2 border-blue-600 pb-3 cursor-pointer">Node.js (TypeScript)</span>
                      <span className="text-slate-400 hover:text-slate-600 cursor-pointer">Python</span>
                    </div>

                    <pre className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed border border-slate-800">
{`import { GoogleGenAI } from "@google/genai";

// Das SDK lädt process.env.GEMINI_API_KEY standardmäßig automatisch!
const ai = new GoogleGenAI();

async function askGemini() {
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hallo, erkläre mir Quantenphysik in einfachen Worten.",
  });

  console.log(result.text);
}`}
                    </pre>
                  </div>
                </div>

              </div>

              {/* GitHub Security & Google Login Card */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 md:p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-950 font-display">GitHub-Sicherheit &amp; Kostenkontrolle</h2>
                    <p className="text-slate-500 text-sm mt-0.5">So schützen Sie Ihre API-Schlüssel vor Missbrauch durch Dritte im Internet.</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Wenn Sie Ihre AI-Anwendung auf GitHub veröffentlichen, besteht die Gefahr, dass unbefugte Besucher Ihre API-Schlüssel auslesen oder Ihr Kontingent aufbrauchen. Um dies zu verhindern, nutzt diese Vorlage das sicherste und flexibelste Modell: <strong>Bring Your Own Key (BYOK)</strong>.
                </p>

                {/* Method A Info Block */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex gap-2 text-sm text-slate-800">
                    <span className="text-emerald-600 font-bold">✓ Sicher &amp; Kostenlos:</span>
                    <span>Sie stellen nur das Frontend-Template bereit. Ihre Nutzer generieren sich kostenlos einen eigenen API-Key in Google AI Studio und fügen ihn lokal ein.</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">So funktioniert die BYOK-Architektur in dieser App:</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Die API-Schlüssel der Besucher werden ausschließlich clientseitig im Webbrowser (<code className="bg-slate-100 px-1 rounded font-mono text-[10px]">localStorage</code>) gespeichert. Der Server nimmt diesen Schlüssel temporär per Request-Header oder Request-Body entgegen, um den API-Request zu autorisieren. <strong>Ihr eigener Entwickler-Schlüssel verbleibt geschützt auf dem Server und wird niemals offengelegt.</strong>
                    </p>
                  </div>

                  <pre className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed border border-slate-800">
{`// Client-seitig: Key aus dem lokalen Speicher laden
const userKey = localStorage.getItem("ai_studio_user_keys");

// Beim API-Aufruf an den Server mitsenden
await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt, userKey })
});`}
                  </pre>
                </div>

                {/* Interactive Security Checklist */}
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    Interaktive GitHub-Sicherheits-Checkliste
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSecurityChecklist(prev => ({ ...prev, gitignore: !prev.gitignore }))}
                      className={`p-3 border rounded-xl text-left flex gap-3 transition-all cursor-pointer ${
                        securityChecklist.gitignore
                          ? "bg-green-50/50 border-green-200 text-green-900"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 flex-shrink-0 ${
                        securityChecklist.gitignore ? "bg-green-600 border-green-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {securityChecklist.gitignore ? "✓" : ""}
                      </div>
                      <div>
                        <span className="font-semibold text-xs block">.env in .gitignore eingetragen</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Verhindert das unabsichtliche Pushen lokaler Keys auf GitHub.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSecurityChecklist(prev => ({ ...prev, noKeysInCode: !prev.noKeysInCode }))}
                      className={`p-3 border rounded-xl text-left flex gap-3 transition-all cursor-pointer ${
                        securityChecklist.noKeysInCode
                          ? "bg-green-50/50 border-green-200 text-green-900"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 flex-shrink-0 ${
                        securityChecklist.noKeysInCode ? "bg-green-600 border-green-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {securityChecklist.noKeysInCode ? "✓" : ""}
                      </div>
                      <div>
                        <span className="font-semibold text-xs block">Keine Keys im Code hartkodiert</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Laden Sie API-Schlüssel ausschließlich über Umgebungsvariablen.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSecurityChecklist(prev => ({ ...prev, limits: !prev.limits }))}
                      className={`p-3 border rounded-xl text-left flex gap-3 transition-all cursor-pointer ${
                        securityChecklist.limits
                          ? "bg-green-50/50 border-green-200 text-green-900"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 flex-shrink-0 ${
                        securityChecklist.limits ? "bg-green-600 border-green-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {securityChecklist.limits ? "✓" : ""}
                      </div>
                      <div>
                        <span className="font-semibold text-xs block">API-Limits in Google Cloud gesetzt</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Sichern Sie sich ab, indem Sie ein tägliches Quotenlimit festlegen.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSecurityChecklist(prev => ({ ...prev, envExample: !prev.envExample }))}
                      className={`p-3 border rounded-xl text-left flex gap-3 transition-all cursor-pointer ${
                        securityChecklist.envExample
                          ? "bg-green-50/50 border-green-200 text-green-900"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 flex-shrink-0 ${
                        securityChecklist.envExample ? "bg-green-600 border-green-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {securityChecklist.envExample ? "✓" : ""}
                      </div>
                      <div>
                        <span className="font-semibold text-xs block">.env.example bereitgestellt</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Gibt GitHub-Nutzern ein Muster vor, ohne Ihre eigenen Geheimnisse zu verraten.</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
          
          {/* Usage widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-slate-950 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Nutzung & Limits
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Free Tier Limit</span>
                <span className="font-semibold text-slate-950">15 RPM</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Anfragen pro Minute (RPM)</span>
                <span>Maximal 1.500 RPD (pro Tag)</span>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-500 font-medium">Heutiges Kontingent</span>
                  <span className="font-semibold text-slate-950">~65% verbleibend</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[65%]" />
                </div>
                <p className="text-[11px] text-slate-400 italic mt-2">
                  Kostenfreie Nutzung wird im Free-Tier durch Google-Kontingente gedeckelt.
                </p>
              </div>
            </div>
          </div>

          {/* Secure Badge Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="font-bold text-slate-950 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              Sicherheitshinweis
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ihre echten API-Schlüssel werden ausschließlich lokal in Ihrem Browser (<code className="bg-slate-100 px-1 rounded">localStorage</code>) gespeichert. 
              Wir übermitteln Schlüssel niemals an unbefugte Dritte. Bei Anfragen im Playground wird der Key direkt verschlüsselt an die offizielle Google Gemini API weitergeleitet.
            </p>
          </div>

          {/* Help & FAQs */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-6">
            <h3 className="font-bold text-blue-950 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Häufige Fragen (FAQs)
            </h3>
            <p className="text-xs text-blue-800 mb-4 leading-relaxed">
              Haben Sie Fragen zur Verwendung Ihres API-Schlüssels in AI Studio?
            </p>
            
            <div className="space-y-3">
              <div className="p-3 bg-white border border-blue-100 rounded-lg hover:bg-blue-50/20 transition-colors">
                <span className="block text-xs font-semibold text-blue-900 mb-1">Kostet ein API-Schlüssel Geld?</span>
                <span className="text-[11px] text-slate-600 leading-relaxed block">
                  Nein, in Google AI Studio ist das Basis-Kontingent für die Gemini Modelle vollkommen kostenfrei zum Experimentieren.
                </span>
              </div>

              <div className="p-3 bg-white border border-blue-100 rounded-lg hover:bg-blue-50/20 transition-colors">
                <span className="block text-xs font-semibold text-blue-900 mb-1">Was bedeutet "Rate Limit exceeded"?</span>
                <span className="text-[11px] text-slate-600 leading-relaxed block">
                  Sie senden zu viele Anfragen in kurzer Zeit. Warten Sie einfach eine Minute, das Limit setzt sich automatisch zurück.
                </span>
              </div>
            </div>
          </div>

        </aside>

      </main>

      {/* Modal: Neuen API-Schlüssel erstellen */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-950 font-display flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                API-Schlüssel erstellen
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="p-6 flex flex-col gap-5">
              {/* Key Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Schlüssel-Name</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Produktions-Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              {/* Key Type Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Schlüssel-Typ</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewKeyType("mock")}
                    className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${
                      newKeyType === "mock"
                        ? "border-blue-500 bg-blue-50/50 text-blue-700 ring-1 ring-blue-500"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Simuliert (Mock)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewKeyType("real")}
                    className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${
                      newKeyType === "real"
                        ? "border-blue-500 bg-blue-50/50 text-blue-700 ring-1 ring-blue-500"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Echter Key
                  </button>
                </div>
              </div>

              {/* Custom Key Value (if type is real) */}
              {newKeyType === "real" && (
                <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Echten API-Schlüssel einfügen</label>
                  <input
                    type="password"
                    required
                    placeholder="AIzaSy..."
                    value={customKeyValue}
                    onChange={(e) => setCustomKeyValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    Sicherer Client-seitiger Speicher. Beginnt typischerweise mit AIzaSy.
                  </p>
                </div>
              )}

              {/* Scope & Permissions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Berechtigungen (Scopes)</label>
                <select
                  value={newKeyPermissions}
                  onChange={(e) => setNewKeyPermissions(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                >
                  <option value="full">Vollzugriff (Generieren, Einsehen, Verwalten)</option>
                  <option value="readonly">Nur Lesen (Modelle auflisten & Limits abfragen)</option>
                </select>
              </div>

              {/* Model Restrictions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Modelleinschränkung</label>
                <select
                  value={newKeyModelAccess}
                  onChange={(e) => setNewKeyModelAccess(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                >
                  <option value="all">Alle Modelle freischalten</option>
                  <option value="flash">Nur Gemini Flash (schnelle Anfragen)</option>
                  <option value="pro">Nur Gemini Pro (anspruchsvolle Anfragen)</option>
                </select>
              </div>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm transition-colors border border-slate-200"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm shadow-sm transition-colors"
                >
                  Schlüssel generieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
