
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-950 flex items-center justify-center px-6">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="text-3xl font-black text-white tracking-tight">iMed</span>
          <span className="text-blue-300 font-light text-3xl">Guatemala</span>
        </div>

        {/* 404 */}
        <div className="relative mb-6">
          <p className="text-[120px] font-black text-white/5 leading-none select-none absolute inset-0 flex items-center justify-center">
            404
          </p>
          <div className="relative">
            <p className="text-7xl font-black bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent leading-tight">
              404
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Página no encontrada</h1>
        <p className="text-blue-200/60 text-sm mb-10 leading-relaxed">
          La página que buscás no existe o fue movida.<br />
          Volvé al inicio y continuá explorando iMed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors w-full sm:w-auto"
          >
            Volver al inicio
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors border border-white/10 w-full sm:w-auto"
          >
            Página anterior
          </button>
        </div>

        <p className="mt-12 text-white/20 text-xs">
          iMed Guatemala © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
