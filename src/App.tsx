
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmailConfirmado from "@/pages/EmailConfirmado";
import ModoViajero from "@/pages/ModoViajero";
import Onboarding from "@/pages/Onboarding";
import RecordatorioMedicamentos from "@/pages/RecordatorioMedicamentos";
import { AuthProvider } from "@/contexts/AuthContext";
import { ViewProvider } from "@/contexts/ViewContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Clinics from "./pages/Clinics";
import ClinicDetail from "./pages/ClinicDetail";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import Specialties from "./pages/Specialties";
import Appointments from "./pages/Appointments";
import MyAppointments from "./pages/MyAppointments";
import Medicines from "./pages/Medicines";
import MedicineDetail from "./pages/MedicineDetail";
import MyPrescriptions from "./pages/MyPrescriptions";
import MyInsurance from "./pages/MyInsurance";
import SeniorGuide from "./pages/SeniorGuide";
import DoctorDashboard from "./pages/DoctorDashboard";
import BamDoctorProfile from '@/pages/BamDoctorProfile';
import AgendaInteligente from '@/pages/AgendaInteligente';
import BamDoctors from '@/pages/BamDoctors';
import DoctorMap from "./pages/DoctorMap";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import MedicineScanner from "./pages/MedicineScanner";
import InvestorsDashboard from "./pages/InvestorsDashboard";
import MapaFarmacias from "./pages/MapaFarmacias";
import Chat from "./pages/Chat";
import Feed from "./pages/Feed";
import Expediente from "./pages/Expediente";
import RecetaVerificacion from "./pages/RecetaVerificacion";
import SintomaChecker from "./pages/SintomaChecker";
import NotasClinicas from "./pages/NotasClinicas";
import DiagnosticoImagen from "./pages/DiagnosticoImagen";
import NotFound from "./pages/NotFound";
import Terminos from "./pages/Terminos";
import Privacidad from "./pages/Privacidad";
import Seguridad from "./pages/Seguridad";
import Epidemiologia from "./pages/Epidemiologia";
import MisEstadisticas from "./pages/MisEstadisticas";
import Empresas from "./pages/Empresas";
import MiSaludIA from "./pages/MiSaludIA";
import ImedBrain from "./pages/ImedBrain";
import Copilot from "./pages/Copilot";
import CookieBanner from "./components/CookieBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ViewProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/clinicas" element={<Clinics />} />
              <Route path="/clinicas/:id" element={<ClinicDetail />} />
              <Route path="/doctores" element={<Doctors />} />
              <Route path="/doctores/:id" element={<DoctorDetail />} />
              <Route path="/medicos-bam" element={<BamDoctors />} />
              <Route path="/medicos-bam/:id" element={<BamDoctorProfile />} />
              <Route path="/agenda-inteligente" element={<AgendaInteligente />} />
              <Route path="/mapa-doctores" element={<DoctorMap />} />
              <Route path="/especialidades" element={<Specialties />} />
              <Route path="/citas" element={<Appointments />} />
              <Route path="/mis-citas" element={<MyAppointments />} />
              <Route path="/medicinas" element={<Medicines />} />
              <Route path="/medicinas/:id" element={<MedicineDetail />} />
              <Route path="/mis-recetas" element={<MyPrescriptions />} />
              <Route path="/mi-seguro" element={<MyInsurance />} />
              <Route path="/guia-adultos" element={<SeniorGuide />} />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
              <Route path="/escaner-medicamentos" element={<MedicineScanner />} />
              <Route path="/patient-dashboard" element={<PatientDashboard />} />
              <Route path="/email-confirmado" element={<EmailConfirmado />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/modo-viajero" element={<ModoViajero />} />
              <Route path="/recordatorio-medicamentos" element={<RecordatorioMedicamentos />} />
              <Route path="/investors" element={<InvestorsDashboard />} />
              <Route path="/mapa-farmacias" element={<MapaFarmacias />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/expediente" element={<Expediente />} />
              <Route path="/receta/:qr_code" element={<RecetaVerificacion />} />
              <Route path="/sintomas" element={<SintomaChecker />} />
              <Route path="/notas-clinicas" element={<NotasClinicas />} />
              <Route path="/diagnostico-imagen" element={<DiagnosticoImagen />} />
              <Route path="/terminos" element={<Terminos />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/seguridad" element={<Seguridad />} />
              <Route path="/epidemiologia" element={<Epidemiologia />} />
              <Route path="/mis-estadisticas" element={<MisEstadisticas />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/mi-salud-ia" element={<MiSaludIA />} />
              <Route path="/imed-brain" element={<ImedBrain />} />
              <Route path="/copilot" element={<Copilot />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieBanner />
          </ViewProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
