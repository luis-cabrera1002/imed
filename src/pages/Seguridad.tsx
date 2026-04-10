import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Server, AlertTriangle, CheckCircle } from "lucide-react";

const Seguridad = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguridad en iMed</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            La protección de tus datos médicos es nuestra máxima prioridad. Aquí explicamos cómo lo logramos.
          </p>
        </div>

        {/* Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Lock, label: "TLS 1.3", sub: "Cifrado en tránsito" },
            { icon: Server, label: "AES-256", sub: "Cifrado en reposo" },
            { icon: Eye, label: "RLS activo", sub: "Acceso controlado por fila" },
            { icon: Shield, label: "GDPR-ready", sub: "Privacidad por diseño" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
              <Icon className="w-7 h-7 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900 text-sm">{label}</p>
              <p className="text-gray-500 text-xs">{sub}</p>
            </div>
          ))}
        </div>

        <div className="space-y-10 text-gray-700">

          {/* Infraestructura */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-5">Infraestructura Segura</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Base de datos cifrada (Supabase + PostgreSQL)",
                  desc: "Todos los datos se almacenan en Supabase con cifrado AES-256 en reposo. Las copias de seguridad se realizan diariamente y se retienen 7 días.",
                },
                {
                  title: "Comunicaciones cifradas (TLS 1.3)",
                  desc: "Toda comunicación entre tu dispositivo e iMed usa TLS 1.3, el estándar más moderno de cifrado en tránsito.",
                },
                {
                  title: "Autenticación segura",
                  desc: "Las contraseñas se almacenan con bcrypt (factor de coste 12). Nunca almacenamos contraseñas en texto plano. Supabase Auth maneja sesiones con tokens JWT de corta duración.",
                },
                {
                  title: "Hosting en Vercel (CDN global)",
                  desc: "El frontend se distribuye desde servidores edge con headers de seguridad estrictos (X-Frame-Options, X-Content-Type-Options, Content Security Policy).",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Control de acceso */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-5">Control de Acceso a Datos Médicos</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Row Level Security (RLS) en todas las tablas",
                  desc: "Cada tabla de la base de datos tiene políticas RLS que garantizan que cada usuario solo puede leer y escribir sus propios datos. Ni siquiera en el backend es posible saltarse estas reglas.",
                },
                {
                  title: "Separación de roles",
                  desc: "Pacientes, médicos y farmacias tienen accesos diferenciados. Un médico solo puede acceder al expediente de un paciente dentro del contexto de una cita activa.",
                },
                {
                  title: "Edge Functions sin JWT innecesarios",
                  desc: "Las funciones de IA procesan datos sin exponer tokens internos. Se aplica rate limiting para prevenir abuso.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* IA y datos médicos */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-5">IA y Datos Médicos</h2>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-4">
              <p className="font-semibold text-amber-800 mb-2">Cómo usamos Groq (proveedor de IA)</p>
              <ul className="space-y-2 text-amber-700 text-sm">
                <li>• Las consultas a IA se realizan en tiempo real y no se almacenan en servidores de Groq.</li>
                <li>• Groq no retiene datos para entrenamiento de modelos bajo nuestro acuerdo comercial.</li>
                <li>• Las imágenes médicas se envían para inferencia puntual y se descartan inmediatamente.</li>
                <li>• Los resultados de IA se guardan en tu expediente solo si tú los guardas explícitamente.</li>
              </ul>
            </div>
          </section>

          {/* Buenas prácticas */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-5">Recomendaciones para el Usuario</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Usa una contraseña única para iMed (no la reutilices en otros sitios)",
                "No compartas tu contraseña ni tus credenciales de sesión",
                "Cierra sesión en dispositivos compartidos o públicos",
                "Verifica que la URL siempre sea https://imedgt.app",
                "Mantén tu correo electrónico actualizado para recuperación de cuenta",
                "Reporta cualquier actividad sospechosa a seguridad@imedgt.app",
              ].map((tip) => (
                <div key={tip} className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Reportar vulnerabilidades */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-5">Programa de Divulgación Responsable</h2>
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 mb-2">¿Encontraste una vulnerabilidad?</p>
                  <p className="text-red-700 text-sm mb-3">
                    Si descubriste una vulnerabilidad de seguridad en iMed, te pedimos que la reportes
                    de forma responsable antes de divulgarla públicamente. Valoramos la colaboración
                    de la comunidad de seguridad.
                  </p>
                  <p className="text-red-700 text-sm font-medium">
                    Envía tu reporte a:{" "}
                    <a href="mailto:seguridad@imedgt.app" className="underline hover:text-red-900">
                      seguridad@imedgt.app
                    </a>
                  </p>
                  <ul className="space-y-1 mt-3 text-red-600 text-xs">
                    <li>• Descripción detallada de la vulnerabilidad</li>
                    <li>• Pasos para reproducirla</li>
                    <li>• Impacto potencial</li>
                    <li>• Tu información de contacto (opcional)</li>
                  </ul>
                  <p className="text-red-500 text-xs mt-3">
                    Nos comprometemos a responder en 72 horas hábiles y a no emprender acciones legales
                    contra investigadores que actúen de buena fe.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Certificaciones */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-5">Estándares y Cumplimiento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Decreto 57-2008", desc: "Ley de Acceso a la Información Pública de Guatemala — transparencia y acceso a datos personales" },
                { title: "GDPR (UE)", desc: "Cumplimiento con el Reglamento General de Protección de Datos europeo para usuarios internacionales" },
                { title: "HIPAA Básico", desc: "Prácticas de manejo de datos de salud alineadas con los principios HIPAA de EE.UU." },
              ].map((c) => (
                <div key={c.title} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="font-bold text-blue-900 text-sm mb-1">{c.title}</p>
                  <p className="text-blue-700 text-xs leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Links */}
          <div className="border-t border-gray-100 pt-6 flex gap-4 text-sm">
            <Link to="/terminos" className="text-blue-600 hover:underline">Términos y Condiciones</Link>
            <Link to="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Seguridad;
