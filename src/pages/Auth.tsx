import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Stethoscope, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";

type Mode = "choose" | "login" | "register-patient" | "register-doctor";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = () => { setEmail(""); setPassword(""); setFullName(""); setPhone(""); setError(""); setSuccess(""); setShowPassword(false); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Correo o contraseña incorrectos. Intenta de nuevo."); } else { navigate("/"); }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent, role: "paciente" | "doctor") => {
    e.preventDefault(); setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone, role } } });
    if (error) {
      if (error.message.includes("already registered")) { setError("Este correo ya tiene una cuenta. Inicia sesión en su lugar."); }
      else { setError("Ocurrió un error al crear tu cuenta. Intenta de nuevo."); }
    } else {
      setSuccess(role === "doctor" ? "¡Cuenta creada! Revisa tu correo para confirmar. Luego podrás completar tu perfil médico." : "¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.");
    }
    setLoading(false);
  };

  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white"><Header />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Stethoscope className="w-9 h-9 text-white" /></div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">iMed Guatemala</h1>
              <p className="text-gray-500 text-base">¿Cómo quieres continuar?</p>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-8">
              <button onClick={() => { resetForm(); setMode("register-patient"); }} className="group w-full bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors"><User className="w-8 h-8 text-blue-600" /></div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Soy Paciente</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">Busca doctores, agenda citas y gestiona tu historial médico.</p>
                  </div>
                  <div className="text-blue-400 group-hover:text-blue-600 font-bold text-2xl">→</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Buscar doctores","Agendar citas","Ver mi historial"].map((f) => (<span key={f} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">✓ {f}</span>))}
                </div>
              </button>
              <button onClick={() => { resetForm(); setMode("register-doctor"); }} className="group w-full bg-white border-2 border-gray-200 hover:border-green-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-green-100 group-hover:bg-green-200 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors"><Stethoscope className="w-8 h-8 text-green-600" /></div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Soy Médico</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">Publica tu perfil, recibe pacientes y gestiona tus citas.</p>
                  </div>
                  <div className="text-green-400 group-hover:text-green-600 font-bold text-2xl">→</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Perfil público","Recibir pacientes","Gestionar citas"].map((f) => (<span key={f} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">✓ {f}</span>))}
                </div>
              </button>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">¿Ya tienes cuenta?</p>
              <button onClick={() => { resetForm(); setMode("login"); }} className="text-blue-600 hover:text-blue-800 font-semibold text-base underline underline-offset-2 transition-colors">Iniciar sesión</button>
            </div>
          </div>
        </div>
      <Footer /></div>
    );
  }

  if (mode === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white"><Header />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <button onClick={() => { resetForm(); setMode("choose"); }} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium text-sm"><ArrowLeft className="w-4 h-4" /> Atrás</button>
            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-7 text-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3"><Mail className="w-7 h-7 text-white" /></div>
                <h2 className="text-2xl font-bold text-white">Bienvenido de vuelta</h2>
                <p className="text-blue-100 text-sm mt-1">Ingresa a tu cuenta iMed</p>
              </div>
              <CardContent className="p-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
                    <Input type="email" placeholder="tucorreo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-blue-400 text-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-blue-400 text-base pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                    </div>
                  </div>
                  {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-red-700 text-sm font-medium">{error}</p></div>}
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-md">{loading ? "Ingresando..." : "Iniciar Sesión"}</Button>
                </form>
                <div className="mt-6 text-center border-t border-gray-100 pt-5">
                  <p className="text-gray-500 text-sm mb-2">¿No tienes cuenta?</p>
                  <button onClick={() => { resetForm(); setMode("choose"); }} className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 text-sm">Crear una cuenta nueva</button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      <Footer /></div>
    );
  }

  if (mode === "register-patient") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white"><Header />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <button onClick={() => { resetForm(); setMode("choose"); }} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium text-sm"><ArrowLeft className="w-4 h-4" /> Atrás</button>
            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-7 text-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3"><User className="w-7 h-7 text-white" /></div>
                <h2 className="text-2xl font-bold text-white">Crear cuenta Paciente</h2>
                <p className="text-blue-100 text-sm mt-1">Encuentra médicos y agenda citas fácilmente</p>
              </div>
              <CardContent className="p-8">
                {success ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">{success}</p>
                    <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl">Ir al inicio</Button>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleRegister(e, "paciente")} className="space-y-5">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label><Input type="text" placeholder="Tu nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-blue-400 text-base" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono (opcional)</label><Input type="tel" placeholder="5555-1234" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl border-gray-200 focus:border-blue-400 text-base" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label><Input type="email" placeholder="tucorreo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-blue-400 text-base" /></div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12 rounded-xl border-gray-200 focus:border-blue-400 text-base pr-12" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                      </div>
                    </div>
                    {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-red-700 text-sm font-medium">{error}</p></div>}
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl shadow-md">{loading ? "Creando cuenta..." : "Crear mi cuenta de Paciente"}</Button>
                  </form>
                )}
                {!success && (<div className="mt-5 text-center border-t border-gray-100 pt-5"><p className="text-gray-500 text-sm mb-2">¿Ya tienes cuenta?</p><button onClick={() => { resetForm(); setMode("login"); }} className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 text-sm">Iniciar sesión</button></div>)}
              </CardContent>
            </Card>
          </div>
        </div>
      <Footer /></div>
    );
  }

  if (mode === "register-doctor") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white"><Header />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <button onClick={() => { resetForm(); setMode("choose"); }} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium text-sm"><ArrowLeft className="w-4 h-4" /> Atrás</button>
            <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-700 to-green-500 px-8 py-7 text-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3"><Stethoscope className="w-7 h-7 text-white" /></div>
                <h2 className="text-2xl font-bold text-white">Registro Médico</h2>
                <p className="text-green-100 text-sm mt-1">Publica tu perfil y recibe pacientes</p>
              </div>
              <CardContent className="p-8">
                <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-100">
                  <p className="text-green-800 text-xs font-bold uppercase tracking-wide mb-2">¿Qué obtienes al registrarte?</p>
                  <ul className="space-y-1">
                    {["Perfil público en el buscador iMed","Recibe citas directamente de pacientes","Apareces en el mapa de Guatemala","Reseñas y calificaciones de pacientes"].map((b) => (<li key={b} className="flex items-center gap-2 text-green-700 text-sm"><CheckCircle className="w-4 h-4 flex-shrink-0 text-green-500" />{b}</li>))}
                  </ul>
                </div>
                {success ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¡Registro exitoso!</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">{success}</p>
                    <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl">Ir al inicio</Button>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleRegister(e, "doctor")} className="space-y-5">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label><Input type="text" placeholder="Dr. Juan López" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-green-400 text-base" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono del consultorio</label><Input type="tel" placeholder="2222-3333" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl border-gray-200 focus:border-green-400 text-base" /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label><Input type="email" placeholder="dr.lopez@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-green-400 text-base" /></div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12 rounded-xl border-gray-200 focus:border-green-400 text-base pr-12" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                      </div>
                    </div>
                    {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-red-700 text-sm font-medium">{error}</p></div>}
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-xl shadow-md">{loading ? "Creando cuenta..." : "Crear mi cuenta de Médico"}</Button>
                  </form>
                )}
                {!success && (<div className="mt-5 text-center border-t border-gray-100 pt-5"><p className="text-gray-500 text-sm mb-2">¿Ya tienes cuenta?</p><button onClick={() => { resetForm(); setMode("login"); }} className="text-green-600 hover:text-green-800 font-semibold underline underline-offset-2 text-sm">Iniciar sesión</button></div>)}
              </CardContent>
            </Card>
          </div>
        </div>
      <Footer /></div>
    );
  }

  return null;
};

export default Auth;
