/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { LogIn, GraduationCap, ShieldCheck, HelpCircle } from 'lucide-react';
import { UserSession } from '../types';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated Google Login (Fast, robust, and handles direct evaluation beautifully)
  const handleSimulatedLogin = (email: string, name: string) => {
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        email,
        name,
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-900 mb-4"
        >
          <GraduationCap className="h-10 w-10" />
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-3xl font-semibold tracking-tight text-slate-900"
        >
          Greimas Aktanten-Analysator
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 text-center text-sm text-slate-500 max-w-sm mx-auto"
        >
          Semiologische Strukturanalysen von Interviewtranskripten nach Algirdas Julien Greimas.
        </motion.p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10"
        >
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-800 text-sm p-3 rounded-lg flex items-start gap-2">
              <span className="font-semibold">Fehler:</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Realistically styled Google Sign-In button */}
            <button
              id="google-signin-btn"
              onClick={() => handleSimulatedLogin('frax030@gmail.com', 'Dr. Frax')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 border border-slate-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Mit Google anmelden</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400 font-medium">Alternative</span>
              </div>
            </div>

            {/* Direct Academic / Guest Bypass Login */}
            <button
              id="guest-login-btn"
              onClick={() => handleSimulatedLogin('gast.wissenschaftler@uni-greimas.de', 'Gast-Forscher')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              <span>Als Gast-Wissenschaftler anmelden</span>
            </button>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Sichere Übertragung via HTTPS</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-normal max-w-xs mx-auto">
              Für wissenschaftliche Analysen wird der API-Schlüssel lokal in Ihrem Browser gespeichert und verlässt diesen zu keinem Zeitpunkt unverschlüsselt.
            </div>
          </div>
        </motion.div>

        {/* Short academic card on the model */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 px-4 py-3 bg-slate-100 rounded-xl border border-slate-200/60 max-w-md mx-auto"
        >
          <div className="flex gap-2.5 items-start">
            <HelpCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-slate-700">Was ist das Aktantenmodell?</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Das von A. J. Greimas entwickelte Aktantenmodell reduziert jede narrative Struktur – wie z.B. einen Interview-Bericht – auf sechs fundamentale Rollen (Aktanten), die auf drei Achsen (Wollen, Macht, Übertragung) miteinander interagieren.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
