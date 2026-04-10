import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Lock, Clock } from "lucide-react";

const Privacidad = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Última actualización: 10 de abril de 2026 — Versión 1.0
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {["Decreto 57-2008 (GT)", "GDPR (UE)", "HIPAA Básico"].map((b) => (
              <span key={b} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium border border-green-100">{b}</span>
            ))}
          </div>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">1. Responsable del Tratamiento</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <p><strong>iMed Technologies S.A.</strong></p>
              <p>Zona 10, Ciudad de Guatemala, Guatemala</p>
              <p>Correo DPO (Delegado de Protección de Datos): <a href="mailto:privacidad@imedgt.app" className="text-blue-600 hover:underline">privacidad@imedgt.app</a></p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">2. Datos que Recolectamos</h2>

            <h3 className="font-semibold text-gray-900 mt-4 mb-2">2.1 Datos que el usuario nos proporciona directamente</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Nombre completo, correo electrónico, teléfono</li>
              <li>Contraseña (almacenada con hash bcrypt — nunca en texto plano)</li>
              <li>Rol en la plataforma (paciente, médico, farmacia)</li>
              <li>Información del expediente médico (condiciones, alergias, medicamentos activos, grupo sanguíneo, peso, altura)</li>
              <li>Imágenes médicas cargadas para análisis de IA</li>
              <li>Consultas realizadas al verificador de síntomas</li>
              <li>Recetas y notas clínicas (solo para médicos con cuenta verificada)</li>
              <li>Ubicación geográfica (solo cuando el usuario activa esta función)</li>
            </ul>

            <h3 className="font-semibold text-gray-900 mt-4 mb-2">2.2 Datos recolectados automáticamente</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Dirección IP (para geolocalización aproximada y seguridad)</li>
              <li>Tipo de dispositivo y navegador</li>
              <li>Páginas visitadas y tiempo de uso (analytics anónimos)</li>
              <li>Preferencias de cookies almacenadas localmente</li>
            </ul>

            <h3 className="font-semibold text-gray-900 mt-4 mb-2">2.3 Datos de terceros</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Proveedores de seguros médicos (BAM) — solo con consentimiento explícito del usuario</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">3. Finalidad y Base Legal del Tratamiento</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border border-gray-200 font-semibold">Finalidad</th>
                    <th className="text-left p-3 border border-gray-200 font-semibold">Base Legal</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Proveer los servicios de la plataforma (citas, expediente, recetas)", "Ejecución del contrato (Art. 6.1.b GDPR)"],
                    ["Análisis de síntomas e imágenes con IA", "Consentimiento explícito del usuario (Art. 6.1.a / Art. 9.2.a GDPR)"],
                    ["Comunicaciones transaccionales (confirmación de citas, recordatorios)", "Interés legítimo / ejecución del contrato"],
                    ["Comunicaciones de marketing (si el usuario optó)", "Consentimiento explícito y revocable"],
                    ["Cumplimiento de obligaciones legales en Guatemala", "Obligación legal (Art. 6.1.c GDPR / Decreto 57-2008)"],
                    ["Mejora de la plataforma (analytics anonimizados)", "Interés legítimo"],
                  ].map(([fin, base]) => (
                    <tr key={fin} className="border-b border-gray-100">
                      <td className="p-3 border border-gray-200">{fin}</td>
                      <td className="p-3 border border-gray-200 text-gray-500">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">4. Datos de Salud — Categoría Especial</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="font-semibold text-blue-900 mb-2">Protección reforzada para datos médicos</p>
              <p className="text-blue-800 text-sm">
                Los datos de salud (expediente médico, diagnósticos, recetas, imágenes médicas) son categorizados
                como datos sensibles bajo el GDPR (Art. 9) y son tratados con las siguientes salvaguardas adicionales:
              </p>
              <ul className="space-y-1 mt-3 text-blue-700 text-sm">
                <li>• Cifrado en tránsito (TLS 1.3) y en reposo (AES-256 via Supabase)</li>
                <li>• Acceso restringido mediante Row Level Security (RLS) — cada usuario solo puede ver sus propios datos</li>
                <li>• Los médicos solo acceden al expediente de sus propios pacientes</li>
                <li>• Las imágenes médicas se procesan mediante IA pero no se usan para entrenar modelos sin consentimiento adicional</li>
                <li>• Período de retención: mientras la cuenta esté activa + 5 años (obligación legal médica en Guatemala)</li>
              </ul>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">5. Compartición de Datos</h2>
            <p>iMed comparte datos únicamente con:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong>Supabase Inc.</strong> (EE.UU.) — proveedor de base de datos e infraestructura, bajo acuerdo DPA con cláusulas contractuales estándar UE</li>
              <li><strong>Groq Inc.</strong> (EE.UU.) — procesamiento de IA (síntomas, imágenes, transcripción), datos son enviados para inferencia y NO retenidos para entrenamiento</li>
              <li><strong>Vercel Inc.</strong> (EE.UU.) — hosting del frontend, no accede a datos de usuarios</li>
              <li><strong>Médicos y Farmacias en iMed</strong> — solo los datos mínimos necesarios para la relación médico-paciente explícitamente iniciada por el usuario</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">
              iMed NO vende datos personales a terceros bajo ninguna circunstancia.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">6. Cookies y Tecnologías de Seguimiento</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border border-gray-200 font-semibold">Tipo</th>
                    <th className="text-left p-3 border border-gray-200 font-semibold">Finalidad</th>
                    <th className="text-left p-3 border border-gray-200 font-semibold">¿Requiere consentimiento?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Esenciales (sesión)", "Autenticación, preferencias de idioma", "No (necesarias para el servicio)"],
                    ["Analíticas (anónimas)", "Métricas de uso anonimizadas", "Sí"],
                    ["Marketing", "Personalización y comunicaciones opcionales", "Sí"],
                  ].map(([tipo, fin, req]) => (
                    <tr key={tipo} className="border-b border-gray-100">
                      <td className="p-3 border border-gray-200 font-medium">{tipo}</td>
                      <td className="p-3 border border-gray-200">{fin}</td>
                      <td className="p-3 border border-gray-200 text-gray-500">{req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">7. Derechos del Usuario</h2>
            <p>De conformidad con el GDPR, la Ley de Acceso a la Información Pública (Decreto 57-2008) y la normativa guatemalteca aplicable, el usuario tiene derecho a:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                { title: "Acceso", desc: "Obtener confirmación de qué datos tratamos y una copia de los mismos" },
                { title: "Rectificación", desc: "Corregir datos inexactos o incompletos" },
                { title: "Supresión ('derecho al olvido')", desc: "Solicitar la eliminación de sus datos cuando no sean necesarios" },
                { title: "Portabilidad", desc: "Recibir sus datos en formato estructurado y legible por máquina" },
                { title: "Limitación", desc: "Solicitar la restricción del tratamiento en ciertos casos" },
                { title: "Oposición", desc: "Oponerse al tratamiento con fines de marketing en cualquier momento" },
              ].map((d) => (
                <div key={d.title} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{d.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{d.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm">
              Para ejercer cualquiera de estos derechos, contáctanos en{" "}
              <a href="mailto:privacidad@imedgt.app" className="text-blue-600 hover:underline">privacidad@imedgt.app</a>{" "}
              con asunto "Ejercicio de Derechos GDPR/Privacidad". Responderemos en máximo 30 días hábiles.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">8. Transferencias Internacionales</h2>
            <p>
              iMed utiliza servicios de proveedores con sede en Estados Unidos (Supabase, Groq, Vercel). Estas
              transferencias se realizan bajo las garantías establecidas en las Cláusulas Contractuales Estándar
              aprobadas por la Comisión Europea (Art. 46 GDPR), asegurando un nivel de protección adecuado.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">9. Retención de Datos</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Datos de cuenta:</strong> Mientras la cuenta esté activa. Tras cierre de cuenta, 90 días antes de eliminación definitiva.</li>
              <li><strong>Expediente médico:</strong> Mínimo 5 años desde la última consulta (obligación legal médica en Guatemala).</li>
              <li><strong>Logs de seguridad:</strong> 12 meses.</li>
              <li><strong>Datos de analytics anonimizados:</strong> Indefinidamente (no contienen datos personales).</li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">10. Menores de Edad</h2>
            <p>
              iMed no está dirigida a menores de 18 años. No recolectamos conscientemente datos de menores.
              Si un padre o tutor detecta que un menor se ha registrado, debe contactarnos a{" "}
              <a href="mailto:privacidad@imedgt.app" className="text-blue-600 hover:underline">privacidad@imedgt.app</a>{" "}
              para la eliminación inmediata de los datos.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">11. Contacto y Reclamaciones</h2>
            <div className="bg-gray-50 rounded-xl p-5 space-y-2">
              <p><strong>Delegado de Protección de Datos (DPO):</strong></p>
              <p>Email: <a href="mailto:privacidad@imedgt.app" className="text-blue-600 hover:underline">privacidad@imedgt.app</a></p>
              <p>Dirección: Zona 10, Ciudad de Guatemala, Guatemala</p>
              <p className="text-sm text-gray-500 mt-3">
                Si considera que el tratamiento de sus datos no es conforme a la normativa, tiene derecho a presentar
                una reclamación ante la autoridad de supervisión competente en Guatemala (Procuraduría de los Derechos Humanos).
              </p>
            </div>
          </section>

          {/* Links */}
          <div className="border-t border-gray-100 pt-6 flex gap-4 text-sm">
            <Link to="/terminos" className="text-blue-600 hover:underline">Términos y Condiciones</Link>
            <Link to="/seguridad" className="text-blue-600 hover:underline">Seguridad</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacidad;
