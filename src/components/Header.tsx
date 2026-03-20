import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, Menu, User, LogOut, ChevronDown, 
  Building2, Stethoscope, Calendar, Pill, FileText, 
  Heart, Home, Clock, LayoutDashboard, Store, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useView } from "@/contexts/ViewContext";
import ViewSwitcher from "@/components/ViewSwitcher";
import imedLogo from "@/assets/imed-logo-new.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const { viewMode } = useView();
  const navigate = useNavigate();

  const patientNavItems = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/clinicas", label: "Clínicas", icon: Building2 },
    { to: "/doctores", label: "Médicos", icon: Stethoscope },
    { to: "/especialidades", label: "Especialidades", icon: Heart },
  ];

  const doctorNavItems = [
    { to: "/doctor-dashboard", label: "Mi Dashboard", icon: LayoutDashboard },
    { to: "/clinicas", label: "Clínicas", icon: Building2 },
    { to: "/doctores", label: "Colegas", icon: Stethoscope },
  ];

  const pharmacyNavItems = [
    { to: "/pharmacy-dashboard", label: "Mi Dashboard", icon: LayoutDashboard },
    { to: "/medicinas", label: "Catálogo", icon: Pill },
  ];

  const navItems = viewMode === 'doctor' 
    ? doctorNavItems 
    : viewMode === 'pharmacy' 
      ? pharmacyNavItems 
      : patientNavItems;

  const servicesItems = [
    { to: "/citas", label: "Agendar Cita", icon: Calendar },
    { to: "/medicos-bam", label: "Red BAM", icon: Shield },
    { to: "/mis-citas", label: "Mis Citas", icon: Clock },
    { to: "/medicinas", label: "Medicinas", icon: Pill },
    { to: "/mis-recetas", label: "Mis Recetas", icon: FileText },
    { to: "/mi-seguro", label: "Mi Seguro", icon: Shield },
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src={imedLogo}
            alt="iMed Logo" 
            className="h-11 w-auto transform group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
          
          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg">
                Servicios
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 bg-popover/95 backdrop-blur-lg border border-border/50 shadow-xl rounded-xl">
              <DropdownMenuGroup>
                {servicesItems.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to} className="flex items-center gap-2 cursor-pointer">
                      <item.icon className="h-4 w-4 text-secondary" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/guia-adultos"
            className="px-3 py-2 text-sm font-medium text-secondary hover:text-secondary/80 hover:bg-secondary/10 rounded-lg transition-all duration-200"
          >
            Guía para Adultos Mayores
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ViewSwitcher />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg"
          >
            <Search className="w-5 h-5" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-2 hidden sm:flex border-border/50 hover:border-primary/30 rounded-lg"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="max-w-[100px] truncate text-foreground">{user.email?.split('@')[0]}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-popover/95 backdrop-blur-lg border border-border/50 shadow-xl rounded-xl">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Mi Cuenta</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary w-fit">
                        {role === 'doctor' ? '👨‍⚕️ Doctor' : '🏥 Paciente'}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/mis-citas" className="flex items-center gap-2 cursor-pointer">
                      <Calendar className="h-4 w-4" />
                      Mis Citas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/mis-recetas" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      Mis Recetas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/mi-seguro" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      Mi Seguro
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-navy-light hover:from-primary/90 hover:to-navy-light/90 rounded-lg shadow-md">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Button>
            </Link>
          )}

          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden text-muted-foreground"
              onClick={signOut}
            >
              <User className="w-5 h-5" />
            </Button>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-muted-foreground hover:text-primary"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  <img src={imedLogo} alt="iMed" className="h-8 w-auto" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                <div className="mb-4">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cambiar Vista
                  </p>
                  <div className="px-3">
                    <ViewSwitcher />
                  </div>
                </div>

                <div className="h-px bg-border/50 my-2" />

                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-primary/5 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    {item.label}
                  </Link>
                ))}
                
                {viewMode === 'patient' && (
                  <>
                    <div className="h-px bg-border/50 my-2" />
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Servicios
                    </p>
                    
                    {servicesItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-primary/5 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 text-secondary" />
                        {item.label}
                      </Link>
                    ))}
                    
                    <div className="h-px bg-border/50 my-2" />
                    
                    <Link
                      to="/guia-adultos"
                      className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/15 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="h-5 w-5" />
                      Guía para Adultos Mayores
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
