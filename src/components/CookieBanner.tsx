import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X, Settings } from "lucide-react";

type CookiePrefs = { essential: true; analytics: boolean; marketing: boolean };

const COOKIE_KEY = "imed_cookie_prefs";

export function getCookiePrefs(): CookiePrefs | null {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!getCookiePrefs()) {
      // Small delay so it doesn't flash on first render
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (prefs: CookiePrefs) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
    setVisible(false);
  };

  const acceptAll = () => save({ essential: true, analytics: true, marketing: true });
  const acceptEssential = () => save({ essential: true, analytics: false, marketing: false });
  const saveConfig = () => save({ essential: true, analytics, marketing });

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {!configuring ? (
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm mb-1">Usamos cookies en iMed</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Utilizamos cookies esenciales para que la plataforma funcione, y cookies opcionales para mejorar
                  tu experiencia. Consulta nuestra{" "}
                  <Link to="/privacidad" className="text-blue-600 hover:underline" onClick={() => setVisible(false)}>
                    Política de Privacidad
                  </Link>{" "}
                  para más información.
                </p>
              </div>
              <button
                onClick={acceptEssential}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
                aria-label="Solo esenciales y cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={acceptAll}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Aceptar todas
              </button>
              <button
                onClick={acceptEssential}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Solo esenciales
              </button>
              <button
                onClick={() => setConfiguring(true)}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Configurar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Configurar cookies</h3>
              <button onClick={() => setConfiguring(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {/* Esenciales — siempre activas */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Cookies esenciales</p>
                  <p className="text-xs text-gray-500">Necesarias para que la plataforma funcione (sesión, autenticación).</p>
                </div>
                <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ml-3">
                  Siempre activas
                </div>
              </div>
              {/* Analytics */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Analytics anónimos</p>
                  <p className="text-xs text-gray-500">Métricas de uso anonimizadas para mejorar la plataforma.</p>
                </div>
                <button
                  onClick={() => setAnalytics(!analytics)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${analytics ? "bg-blue-600" : "bg-gray-300"}`}
                  aria-label="Toggle analytics"
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${analytics ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              {/* Marketing */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Marketing</p>
                  <p className="text-xs text-gray-500">Personalización y comunicaciones opcionales de iMed.</p>
                </div>
                <button
                  onClick={() => setMarketing(!marketing)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${marketing ? "bg-blue-600" : "bg-gray-300"}`}
                  aria-label="Toggle marketing"
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${marketing ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={saveConfig}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Guardar preferencias
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;
