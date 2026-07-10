export type ActantRole = "Adressant" | "Objekt" | "Adressat" | "Subjekt" | "Adjuvant" | "Opponent";

export interface ActantAnalysis {
  role: ActantRole;
  keywords: string[];
  interpretation: string;
  evidence: string[];
}

export interface AnalysisResponse {
  analysis: ActantAnalysis[];
}

export interface ProgressState {
  progress: number;
  message: string;
}
