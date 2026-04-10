import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Users, Shield, TrendingUp, CheckCircle, ArrowRight,
  Heart, Clock, BarChart3, Stethoscope, Send, Loader2, Star,
} from "lucide-react";

interface FormData {
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  empleados: string;
  plan: "basico" | "profesional" | "enterprise";
  notas: string;
}

const planes = [
  {
    id: "basico",
    nombre: "Básico",
    precio: "Q2,500",
    periodo: "/mes",
    descripcion: "Para empresas de hasta 50 empleados",
    color: "border-blue-200 bg-blue-50",
    headerColor: "bg-blue-600",
    features: [
      "Hasta 50 empleados",
      "Acceso a red de médicos iMed",
      "Teleconsultas ilimitadas",
      "Expediente digital por empleado",
      "Recordatorios de medicamentos",
      "Soporte por email",
    ],
  },
  {
    id: "profesional",
    nombre: "Profesional",
    precio: "Q5,500",
    periodo: "/mes",
    descripcion: "Para empresas de 50–200 empleados",
    color: "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-400",
    headerColor: "bg-emerald-600",
    badge: "MÁS POPULAR",
    features: [
      "Hasta 200 empleados",
      "Todo lo del plan Básico",
      "Dashboard de salud corporativa",
      "Campañas de prevención",
      "Análisis epidemiológico interno",
      "Médico de empresa (½ tiempo)",
      "Soporte prioritario 24/7",
    ],
  },
  {
    id: "enterprise",
    nombre: "Enterprise",
    precio: "A consultar",
    periodo: "",
    descripcion: "Para grandes corporaciones",
    color: "border-purple-200 bg-purple-50",
    headerColor: "bg-purple-700",
    features: [
      "Empleados ilimitados",
      "Todo lo del plan Profesional",
      "Integración con RRHH / nómina",
      "API dedicada iMed",
      "Médico de empresa tiempo completo",
      "SLA garantizado 99.9%",
      "Gerente de cuenta dedicado",
    ],
  },
];

const beneficios = [
  { icon: TrendingUp,   title: "Menos ausentismo",       desc: "Empresas con salud corporativa reducen ausentismo hasta 30%" },
  { icon: Shield,       title: "Seguridad de datos",     desc: "GDPR + Decreto 57-2008 Guatemala. Datos médicos cifrados AES-256" },
  { icon: BarChart3,    title: "Dashboard en tiempo real", desc: "Visualizá el estado de salud de tu organización en un panel centralizado" },
  { icon: Clock,        title: "Respuesta inmediata",    desc: "Teleconsultas en menos de 30 minutos para tus colaboradores" },
  { icon: Heart,        title: "Bienestar laboral",      desc: "Programas de salud preventiva y salud mental para equipos" },
  { icon: Stethoscope,  title: "Red médica premium",     desc: "+100 especialistas en Guatemala disponibles para tus empleados" },
];

const testimonios = [
  { empresa: "Exportadora del Norte S.A.", sector: "Agroindustria",  empleados: 180, texto: "Desde que implementamos iMed Empresas, redujimos el ausentismo en un 28% en solo 6 meses.", rating: 5 },
  { empresa: "TechGT Solutions",           sector: "Tecnología",     empleados: 45,  texto: "El dashboard de salud corporativa nos ayuda a tomar decisiones preventivas antes de que los problemas escalen.", rating: 5 },
];

export default function Empresas() {
  const [form, setForm] = useState<FormData>({
    nombre: "", contacto: "", email: "", telefono: "",
    empleados: "", plan: "profesional", notas: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.contacto || !form.email) {
      setError("Completá nombre, contacto y email.");
      return;
    }
    setEnviando(true);
    setError(null);

    const { error: dbErr } = await supabase.from("empresas_clientes").insert({
      nombre: form.nombre,
      contacto: form.contacto,
      email: form.email,
      telefono: form.telefono || null,
      empleados: form.empleados ? parseInt(form.empleados) : null,
      plan: form.plan,
      notas: form.notas || null,
    });

    if (dbErr) {
      setError("Error al enviar. Intentá de nuevo o escribinos a info@imedgt.app");
    } else {
      setEnviado(true);
    }
    setEnviando(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-800 text-white py-24 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm mb-6">
            <Building2 className="w-4 h-4" />
            <span>iMed Empresas — Salud Corporativa Guatemala</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Cuida la salud de tu equipo.<br />
            <span className="text-emerald-300">Impulsa tu empresa.</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Brindá acceso a salud digital de clase mundial a tus colaboradores. Teleconsultas, expedientes digitales y prevención inteligente para empresas guatemaltecas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#contacto" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg">
              Solicitar demo gratuita <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#planes" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-6 py-3 rounded-xl transition-colors">
              Ver planes y precios
            </a>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">¿Por qué iMed Empresas?</h2>
            <p className="text-gray-500">Resultados medibles para tu organización</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {beneficios.map(b => (
              <div key={b.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <b.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Planes y Precios</h2>
            <p className="text-gray-500">Precios en Quetzales guatemaltecos. IVA no incluido.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planes.map(p => (
              <div key={p.id} className={`relative rounded-2xl border-2 overflow-hidden ${p.color}`}>
                {p.badge && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <div className={`${p.headerColor} text-white px-5 py-5`}>
                  <p className="text-sm font-medium opacity-80">{p.nombre}</p>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-3xl font-bold">{p.precio}</span>
                    <span className="text-sm opacity-70 mb-1">{p.periodo}</span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{p.descripcion}</p>
                </div>
                <div className="p-5 space-y-2.5">
                  {p.features.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{f}</span>
                    </div>
                  ))}
                  <a
                    href="#contacto"
                    className={`block text-center mt-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      p.id === "profesional"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    Empezar ahora
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Empresas que confían en iMed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonios.map(t => (
              <div key={t.empresa} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.texto}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.empresa}</p>
                  <p className="text-xs text-gray-400">{t.sector} · {t.empleados} empleados</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de contacto */}
      <section id="contacto" className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Solicitar información</h2>
            <p className="text-gray-500 text-sm">Un especialista te contactará en menos de 24 horas.</p>
          </div>

          {enviado ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-emerald-800 mb-2">¡Solicitud recibida!</h3>
              <p className="text-emerald-700 text-sm">
                Gracias por tu interés en iMed Empresas. Un especialista se comunicará con vos a <strong>{form.email}</strong> en menos de 24 horas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                  <input
                    name="nombre" value={form.nombre} onChange={handleChange} required
                    placeholder="Nombre de la empresa"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto *</label>
                  <input
                    name="contacto" value={form.contacto} onChange={handleChange} required
                    placeholder="Nombre completo"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange} required
                    placeholder="correo@empresa.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    name="telefono" value={form.telefono} onChange={handleChange}
                    placeholder="+502 xxxx-xxxx"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° de empleados</label>
                  <input
                    type="number" name="empleados" value={form.empleados} onChange={handleChange}
                    placeholder="50"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan de interés</label>
                  <select
                    name="plan" value={form.plan} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  >
                    <option value="basico">Básico — Q2,500/mes</option>
                    <option value="profesional">Profesional — Q5,500/mes</option>
                    <option value="enterprise">Enterprise — A consultar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje adicional</label>
                <textarea
                  name="notas" value={form.notas} onChange={handleChange} rows={3}
                  placeholder="Contanos sobre las necesidades de salud de tu empresa..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
              >
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {enviando ? "Enviando..." : "Solicitar información gratuita"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Al enviar este formulario aceptás nuestra{" "}
                <a href="/privacidad" className="underline hover:text-gray-600">Política de Privacidad</a>.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
