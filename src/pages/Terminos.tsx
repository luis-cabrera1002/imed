import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Shield, FileText, Clock } from "lucide-react";

const Terminos = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Última actualización: 10 de abril de 2026 — Versión 1.0
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">1. Identificación del Titular</h2>
            <p>
              iMed Guatemala (en adelante "iMed", "nosotros" o "la Plataforma") es operada por iMed Technologies S.A.,
              sociedad anónima constituida bajo las leyes de la República de Guatemala, con domicilio en Zona 10,
              Ciudad de Guatemala, Guatemala. Correo de contacto: <strong>legal@imedgt.app</strong>.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">2. Objeto y Ámbito de Aplicación</h2>
            <p>
              iMed es una plataforma digital de salud que conecta a pacientes con médicos y farmacias en Guatemala.
              Estos Términos y Condiciones regulan el acceso y uso de la plataforma disponible en <strong>https://imedgt.app</strong>,
              incluyendo todas sus funcionalidades: búsqueda de médicos, agendamiento de citas, expediente médico digital,
              herramientas de apoyo diagnóstico con inteligencia artificial, farmacia digital, y demás servicios disponibles.
            </p>
            <p className="mt-3">
              Al registrarse o utilizar la Plataforma, el usuario acepta expresamente estos Términos en su totalidad.
              Si no está de acuerdo con alguna disposición, debe abstenerse de usar la Plataforma.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">3. Naturaleza del Servicio — Aviso Médico Importante</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="font-bold text-amber-800 mb-2">iMed NO es un servicio médico ni una plataforma de telemedicina certificada.</p>
              <ul className="space-y-2 text-amber-700 text-sm">
                <li>• Las herramientas de IA (verificador de síntomas, diagnóstico por imagen, análisis de documentos) son de carácter <strong>orientativo e informativo</strong> únicamente.</li>
                <li>• Ningún resultado generado por IA constituye diagnóstico médico, prescripción o tratamiento.</li>
                <li>• El usuario debe consultar siempre con un profesional de salud habilitado para diagnóstico y tratamiento.</li>
                <li>• En caso de emergencia médica, contactar de inmediato al número de emergencias (1500 — Bomberos Voluntarios) o acudir al centro de salud más cercano.</li>
              </ul>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">4. Registro y Cuentas de Usuario</h2>
            <p>Para acceder a los servicios personalizados de iMed, el usuario debe registrarse indicando su rol (Paciente, Médico o Farmacia) y proporcionar información veraz, completa y actualizada.</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.</li>
              <li>Cada usuario puede tener una sola cuenta activa por correo electrónico.</li>
              <li>iMed se reserva el derecho de suspender o cancelar cuentas que violen estos Términos.</li>
              <li>Los médicos deben completar su perfil con información profesional verídica (especialidad, cédula profesional, etc.).</li>
              <li>Las farmacias deben estar legalmente constituidas en Guatemala para operar en la Plataforma.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">5. Uso Aceptable</h2>
            <p>El usuario se compromete a NO:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Proporcionar información falsa o engañosa en su perfil o al usar las herramientas de IA.</li>
              <li>Usar la Plataforma para actividades ilícitas o que dañen a terceros.</li>
              <li>Intentar acceder a datos de otros usuarios sin autorización.</li>
              <li>Realizar ingeniería inversa, descompilar o copiar el código fuente de la Plataforma.</li>
              <li>Usar bots, scrapers u herramientas automatizadas para extraer datos.</li>
              <li>Publicar contenido ofensivo, engañoso o que incumpla las leyes guatemaltecas.</li>
              <li>Hacerse pasar por otro usuario, médico o entidad.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">6. Citas Médicas</h2>
            <p>
              iMed facilita la comunicación entre pacientes y médicos para agendar citas. La relación médico-paciente
              es exclusiva entre las partes. iMed no es parte de dicha relación ni asume responsabilidad por la
              calidad de la atención médica brindada. Las citas agendadas están sujetas a la disponibilidad confirmada
              por el médico.
            </p>
            <p className="mt-3">
              Las cancelaciones deben realizarse con al menos 24 horas de anticipación. iMed se reserva el derecho
              de suspender el acceso a usuarios que realicen cancelaciones repetidas sin previo aviso.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">7. Recetas Digitales y Farmacia</h2>
            <p>
              Las recetas digitales emitidas en iMed son generadas por médicos registrados en la Plataforma.
              iMed no verifica la validez legal de las recetas fuera de la Plataforma. Las farmacias son responsables
              de cumplir con la normativa guatemalteca (Código de Salud, Decreto 90-97) al dispensar medicamentos.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">8. Propiedad Intelectual</h2>
            <p>
              Todo el contenido de iMed (diseño, código, marca, logotipos, textos) es propiedad de iMed Technologies S.A.
              y está protegido por las leyes de propiedad intelectual de Guatemala y tratados internacionales.
              El usuario puede usar la Plataforma para los fines previstos, pero no puede reproducir ni distribuir
              el contenido sin autorización escrita.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">9. Limitación de Responsabilidad</h2>
            <p>
              iMed proporciona la Plataforma "tal cual" y no garantiza que esté libre de errores o interrupciones.
              En la máxima medida permitida por la ley guatemalteca, iMed no será responsable por:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Daños derivados del uso de herramientas de IA médica.</li>
              <li>Actos u omisiones de médicos o farmacias registradas en la Plataforma.</li>
              <li>Pérdida de datos por causas fuera del control razonable de iMed.</li>
              <li>Interrupciones del servicio por mantenimiento o fuerza mayor.</li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">10. Legislación Aplicable y Jurisdicción</h2>
            <p>
              Estos Términos se rigen por las leyes de la República de Guatemala. Cualquier controversia derivada
              del uso de iMed se someterá a los tribunales competentes de la ciudad de Guatemala, renunciando el
              usuario a cualquier otro fuero que pudiera corresponderle.
            </p>
            <p className="mt-3">
              Base legal aplicable: Código Civil y Mercantil de Guatemala, Código de Salud (Decreto 90-97),
              Ley de Acceso a la Información Pública (Decreto 57-2008), Ley de Firmas Electrónicas (Decreto 47-2008).
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">11. Modificaciones</h2>
            <p>
              iMed puede modificar estos Términos en cualquier momento. Los cambios materiales serán notificados
              al usuario por correo electrónico con al menos 15 días de antelación. El uso continuado de la Plataforma
              tras la notificación implica la aceptación de los nuevos Términos.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">12. Contacto</h2>
            <p>Para cualquier consulta sobre estos Términos:</p>
            <div className="bg-gray-50 rounded-xl p-4 mt-3">
              <p><strong>iMed Technologies S.A.</strong></p>
              <p>Zona 10, Ciudad de Guatemala, Guatemala</p>
              <p>Correo: <a href="mailto:legal@imedgt.app" className="text-blue-600 hover:underline">legal@imedgt.app</a></p>
              <p>Sitio web: <a href="https://imedgt.app" className="text-blue-600 hover:underline">https://imedgt.app</a></p>
            </div>
          </section>

          {/* Links */}
          <div className="border-t border-gray-100 pt-6 flex gap-4 text-sm">
            <Link to="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link>
            <Link to="/seguridad" className="text-blue-600 hover:underline">Seguridad</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terminos;
