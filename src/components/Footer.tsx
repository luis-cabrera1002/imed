import { Link } from "react-router-dom";
import { Heart, MapPin, Phone, Mail } from "lucide-react";
import imedLogo from "@/assets/imed-logo-new.png";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full">
          <path fill="hsl(var(--navy))" fillOpacity="0.05" d="M0,30L120,25C240,20,480,10,720,15C960,20,1200,30,1320,35L1440,40L1440,60L0,60Z" />
        </svg>
      </div>
      
      <div className="bg-gradient-to-b from-background to-muted/30 border-t border-border/50 pt-12">
        <div className="container px-4 py-8 mx-auto sm:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center mb-4">
                <img 
                  src={imedLogo}
                  alt="iMed Logo" 
                  className="h-12 w-auto"
                />
              </Link>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                La plataforma líder para encontrar las mejores clínicas privadas y médicos especializados en Guatemala.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase text-primary tracking-wider">
                Enlaces rápidos
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/clinicas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Clínicas y centros
                  </Link>
                </li>
                <li>
                  <Link to="/doctores" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Médicos especialistas
                  </Link>
                </li>
                <li>
                  <Link to="/especialidades" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Especialidades médicas
                  </Link>
                </li>
                <li>
                  <Link to="/citas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Agendar cita
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase text-primary tracking-wider">
                Legal y Seguridad
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/terminos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link to="/privacidad" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/seguridad" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Seguridad
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase text-primary tracking-wider">
                Contacto
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center text-sm text-muted-foreground gap-2">
                  <Mail className="w-4 h-4 text-secondary" />
                  <span>info@imed.gt</span>
                </li>
                <li className="flex items-center text-sm text-muted-foreground gap-2">
                  <Phone className="w-4 h-4 text-secondary" />
                  <span>+502 2222-2222</span>
                </li>
                <li className="flex items-center text-sm text-muted-foreground gap-2">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <span>Zona 10, Ciudad de Guatemala</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} iMed Guatemala. Todos los derechos reservados.
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Hecho con <Heart className="w-3 h-3 text-destructive fill-destructive" /> en Guatemala
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
