
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container flex flex-col items-center justify-center px-4 py-16 mx-auto text-center sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold text-guatehealth-primary">404</h1>
          <h2 className="mt-4 text-2xl font-bold">Página no encontrada</h2>
          <p className="max-w-md mt-2 text-gray-600">
            La página que estás buscando no existe o ha sido movida.
          </p>
          <div className="mt-8">
            <Link to="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
