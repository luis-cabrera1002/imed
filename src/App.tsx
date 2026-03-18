
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import PharmacyDashboard from "./pages/PharmacyDashboard";
import NotFound from "./pages/NotFound";

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ViewProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
