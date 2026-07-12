/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GreimasRole = 'Adressant' | 'Objekt' | 'Adressat' | 'Subjekt' | 'Adjuvant' | 'Opponent';

export interface ActantRoleAnalysis {
  role: GreimasRole;
  keywords: string[];
  interpretation: string;
  evidence: string[];
}

export interface GreimasAnalysisResponse {
  analysis: ActantRoleAnalysis[];
}

export interface UserSession {
  email: string;
  name: string;
  imageUrl?: string;
  idToken?: string;
}
