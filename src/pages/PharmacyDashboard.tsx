import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle, BarChart2, Activity, Users,
  CheckCircle, Clock, Truck, Search, RefreshCw,
  Pill, Box, MoreVertical, Eye, ArrowUpRight
} from "lucide-react";

const ESTADO_PEDIDO = {
  pendiente:   { label: "Pendiente",   bg: "bg-yellow-100 text-yellow-800", icon: Clock },
  preparando:  { label: "Preparando",  bg: "bg-blue-100 text-blue-800",    icon: Package },
  listo:       { label: "Listo",       bg: "bg-green-100 text-green-800",  icon: CheckCircle },
  entregado:   { label: "Entregado",   bg: "bg-gray-100 text-gray-600",    icon: Truck },
};

const INVENTARIO_DEMO = [
  { id: 1, nombre: "Paracetamol 500mg", categoria: "Analgésicos", stock: 245, max: 500, precio: 15 },
  { id: 2, nombre: "Ibuprofeno 400mg",  categoria: "Antiinflamatorios", stock: 12, max: 300, precio: 18 },
  { id: 3, nombre: "Omeprazol 20mg",    categoria: "Gastrointestinal", stock: 89, max: 400, precio: 25 },
  { id: 4, nombre: "Amoxicilina 500mg", categoria: "Antibióticos", stock: 8, max: 200, precio: 45 },
  { id: 5, nombre: "Metformina 850mg",  categoria: "Diabetes", stock: 156, max: 300, precio: 20 },
  { id: 6, nombre: "Loratadina 10mg",   categoria: "Antialérgicos", stock: 3, max: 150, precio: 12 },
  { id: 7, nombre: "Atorvastatina 20mg",categoria: "Cardiovascular", stock: 67, max: 200, precio: 55 },
  { id: 8, nombre: "Losartán 50mg",     categoria: "Cardiovascular", stock: 44, max: 200, precio: 38 },
];

export default function PharmacyDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("pedidos");
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inventario, setInventario] = useState(INVENTARIO_DEMO);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [scans, setScans] = useState<any[]>([]);
  const [scansLoading, setScansLoading] = useState(false);

  useEffect(() => {
    // Auth guard
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/auth"); return; }
      loadPedidos();
      loadScans();
    });
  }, []);

  async function loadScans() {
    setScansLoading(true);
    const { data } = await supabase
      .from("medicine_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setScans(data);
    setScansLoading(false);
  }

  // Suscripción realtime a nuevos escaneos
  useEffect(() => {
    const channel = supabase
      .channel("medicine_scans_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "medicine_scans" },
        (payload) => { setScans(prev => [payload.new, ...prev].slice(0, 100)); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadPedidos() {
    setLoading(true);
    const { data } = await supabase
      .from("pedidos_farmacia")
      .select("*, recetas(diagnostico, doctor_id, receta_medicamentos(nombre, dosis))")
      .order("created_at", { ascending: false });

    if (data) {
      const pacienteIds = [...new Set(data.map(p => p.paciente_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", pacienteIds);
      const pm = {};
      (profiles||[]).forEach(p => { pm[p.user_id] = p.full_name; });
      setPedidos(data.map(p => ({
        ...p,
        paciente_nombre: pm[p.paciente_id] || "Paciente",
        medicamentos: p.recetas?.receta_medicamentos || [],
        diagnostico: p.recetas?.diagnostico || "",
      })));
    }
    setLoading(false);
  }

  async function updateEstado(id, estado) {
    const { error } = await supabase.from("pedidos_farmacia").update({ estado }).eq("id", id);
    if (!error) {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
      if (selectedPedido?.id === id) setSelectedPedido(prev => ({ ...prev, estado }));
      toast({ title: "Estado actualizado", description: `Pedido marcado como ${estado}` });
    }
  }

  const fmtFecha = (f) => f ? new Date(f).toLocaleDateString("es-GT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  const pendientes = pedidos.filter(p => p.estado === "pendiente");
  const preparando = pedidos.filter(p => p.estado === "preparando");
  const listos = pedidos.filter(p => p.estado === "listo");
  const stockBajo = inventario.filter(i => i.stock < i.max * 0.1);

  // Analytics de demanda
  const demandaAgrupada = scans.reduce((acc: any, s: any) => {
    acc[s.medicamento] = (acc[s.medicamento] || 0) + 1;
    return acc;
  }, {});
  const demandaOrdenada = Object.entries(demandaAgrupada)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a: any, b: any) => b.total - a.total);

  const hoy = scans.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;
  const estaSemana = scans.filter(s => {
    const d = new Date(s.created_at);
    const ahora = new Date();
    const diff = (ahora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;
  const sinStock = inventario.filter(i => i.stock === 0);
  const ventasHoy = pedidos.filter(p => p.created_at?.startsWith(new Date().toISOString().slice(0,10))).length;
  const ventasSemana = pedidos.filter(p => {
    const d = new Date(p.created_at); const now = new Date();
    return (now - d) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const pedidosFiltrados = pedidos.filter(p =>
    !search || p.paciente_nombre?.toLowerCase().includes(search.toLowerCase()) ||
    p.farmacia_nombre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farmacia Central 💊</h1>
            <p className="text-gray-500 text-sm">{new Date().toLocaleDateString("es-GT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={loadPedidos}>
            <RefreshCw className="w-4 h-4"/> Actualizar
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Pedidos Pendientes", val: pendientes.length, icon: Clock, color: "text-yellow-600 bg-yellow-100" },
            { label: "Preparando", val: preparando.length, icon: Package, color: "text-blue-600 bg-blue-100" },
            { label: "Listos", val: listos.length, icon: CheckCircle, color: "text-green-600 bg-green-100" },
            { label: "Stock Bajo", val: stockBajo.length, icon: AlertTriangle, color: "text-orange-600 bg-orange-100" },
            { label: "Sin Stock", val: sinStock.length, icon: Box, color: "text-red-600 bg-red-100" },
          ].map(({ label, val, icon: Icon, color }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.split(" ")[1]}`}>
                  <Icon className={`w-5 h-5 ${color.split(" ")[0]}`}/>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{val}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          {[["pedidos","Pedidos de Recetas"],["inventario","Inventario"],["demanda","🔥 Demanda Real"],["estadisticas","Estadísticas"]].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab===key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              {label}
              {key==="pedidos" && pendientes.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendientes.length}</span>}
            </button>
          ))}
        </div>

        {/* PEDIDOS */}
        {tab === "pedidos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <Input placeholder="Buscar por paciente o farmacia..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="pl-9 rounded-xl border-gray-200"/>
              </div>
              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-30"/>
                  <p className="text-sm">Cargando pedidos...</p>
                </div>
              ) : pedidosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                  <p className="font-medium">No hay pedidos</p>
                  <p className="text-sm mt-1">Los pedidos de recetas aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pedidosFiltrados.map(p => {
                    const cfg = ESTADO_PEDIDO[p.estado] || ESTADO_PEDIDO.pendiente;
                    const Icon = cfg.icon;
                    return (
                      <Card key={p.id} className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedPedido?.id===p.id ? "ring-2 ring-blue-400" : ""}`}
                        onClick={() => setSelectedPedido(p)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500">ORD-{p.id.slice(-3).toUpperCase()}</span>
                                {p.recetas && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">Con Receta</span>}
                              </div>
                              <p className="font-semibold text-gray-900 mt-0.5">{p.paciente_nombre}</p>
                            </div>
                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold ${cfg.bg}`}>
                              <Icon className="w-3 h-3"/>{cfg.label}
                            </span>
                          </div>
                          {p.medicamentos.length > 0 && (
                            <div className="space-y-0.5 mb-2">
                              {p.medicamentos.slice(0,2).map((m,i) => (
                                <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                                  <Pill className="w-3 h-3 text-blue-400 flex-shrink-0"/>{m.nombre} {m.dosis}
                                </p>
                              ))}
                              {p.medicamentos.length > 2 && <p className="text-xs text-gray-400">+{p.medicamentos.length-2} más</p>}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">{fmtFecha(p.created_at)}</p>
                            {p.estado === "pendiente" && (
                              <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white h-6 px-2 rounded-lg"
                                onClick={e => { e.stopPropagation(); updateEstado(p.id, "preparando"); }}>
                                Preparar
                              </Button>
                            )}
                            {p.estado === "preparando" && (
                              <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700 text-white h-6 px-2 rounded-lg"
                                onClick={e => { e.stopPropagation(); updateEstado(p.id, "listo"); }}>
                                Marcar Listo
                              </Button>
                            )}
                            {p.estado === "listo" && (
                              <Button size="sm" className="text-xs bg-gray-600 hover:bg-gray-700 text-white h-6 px-2 rounded-lg"
                                onClick={e => { e.stopPropagation(); updateEstado(p.id, "entregado"); }}>
                                Entregar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detalle pedido */}
            <div>
              {selectedPedido ? (
                <Card className="border-0 shadow-sm sticky top-24">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center justify-between">
                      <span>Detalle del Pedido</span>
                      <button onClick={() => setSelectedPedido(null)} className="text-gray-400 hover:text-gray-600 text-xs font-normal">Cerrar</button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Paciente</p>
                      <p className="font-bold text-gray-900">{selectedPedido.paciente_nombre}</p>
                      {selectedPedido.diagnostico && <p className="text-xs text-teal-600 mt-0.5">{selectedPedido.diagnostico}</p>}
                    </div>
                    {selectedPedido.medicamentos.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-2">Medicamentos solicitados</p>
                        <div className="space-y-2">
                          {selectedPedido.medicamentos.map((m,i) => (
                            <div key={i} className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-2.5">
                              <Pill className="w-4 h-4 text-blue-500 flex-shrink-0"/>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{m.nombre}</p>
                                {m.dosis && <p className="text-xs text-gray-500">{m.dosis}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPedido.notas && (
                      <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                        <p className="text-xs font-semibold text-yellow-800 mb-1">Notas del paciente</p>
                        <p className="text-sm text-yellow-700">{selectedPedido.notas}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {selectedPedido.estado === "pendiente" && (
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm"
                          onClick={() => updateEstado(selectedPedido.id, "preparando")}>
                          <Package className="w-4 h-4 mr-1"/> Comenzar a Preparar
                        </Button>
                      )}
                      {selectedPedido.estado === "preparando" && (
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm"
                          onClick={() => updateEstado(selectedPedido.id, "listo")}>
                          <CheckCircle className="w-4 h-4 mr-1"/> Marcar como Listo
                        </Button>
                      )}
                      {selectedPedido.estado === "listo" && (
                        <Button className="flex-1 bg-gray-700 hover:bg-gray-800 text-white rounded-xl text-sm"
                          onClick={() => updateEstado(selectedPedido.id, "entregado")}>
                          <Truck className="w-4 h-4 mr-1"/> Marcar Entregado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="text-center">
                    <Eye className="w-8 h-8 mx-auto mb-2"/>
                    <p className="text-sm">Selecciona un pedido para ver el detalle</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* INVENTARIO */}
        {tab === "inventario" && (
          <div className="space-y-3">
            {stockBajo.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0"/>
                <p className="text-sm text-orange-800 font-medium">{stockBajo.length} productos con stock bajo. Considera reabastecer pronto.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inventario.map(item => {
                const pct = (item.stock / item.max) * 100;
                const status = item.stock === 0 ? { label: "Sin Stock", color: "bg-red-100 text-red-700" }
                  : pct < 10 ? { label: "Stock Bajo", color: "bg-orange-100 text-orange-700" }
                  : { label: "En Stock", color: "bg-green-100 text-green-700" };
                return (
                  <Card key={item.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.nombre}</p>
                          <p className="text-xs text-gray-500">{item.categoria}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Stock: {item.stock}</span>
                          <span>Max: {item.max}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${pct < 10 ? "bg-red-500" : pct < 30 ? "bg-orange-400" : "bg-green-500"}`} style={{width:`${pct}%`}}/>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Q{item.precio}.00</span>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-3 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setInventario(prev => prev.map(i => i.id===item.id ? {...i, stock: Math.min(i.stock+50, i.max)} : i));
                            toast({ title: "Stock actualizado", description: `+50 unidades de ${item.nombre}` });
                          }}>
                          + Reabastecer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        {tab === "demanda" && (
          <div className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
                <p className="text-xs font-semibold text-blue-100 mb-1">Escaneos Hoy</p>
                <p className="text-3xl font-bold">{hoy}</p>
                <p className="text-xs text-blue-200 mt-1">búsquedas activas</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white">
                <p className="text-xs font-semibold text-orange-100 mb-1">Esta Semana</p>
                <p className="text-3xl font-bold">{estaSemana}</p>
                <p className="text-xs text-orange-200 mt-1">medicamentos buscados</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
                <p className="text-xs font-semibold text-green-100 mb-1">Total Escaneos</p>
                <p className="text-3xl font-bold">{scans.length}</p>
                <p className="text-xs text-green-200 mt-1">desde el inicio</p>
              </div>
            </div>

            {/* Ranking de medicamentos más buscados */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Medicamentos Más Buscados
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Actualización en tiempo real</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 font-semibold">EN VIVO</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {scansLoading ? (
                  <div className="text-center py-8 text-gray-400">Cargando datos...</div>
                ) : demandaOrdenada.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">Aún no hay escaneos registrados</p>
                    <p className="text-gray-300 text-xs mt-1">Los datos aparecerán cuando los pacientes usen el escáner</p>
                  </div>
                ) : demandaOrdenada.map((item: any, i: number) => {
                  const max = demandaOrdenada[0]?.total || 1;
                  const pct = Math.round((item.total / max) * 100);
                  const colors = ["from-orange-500 to-red-500", "from-blue-500 to-indigo-500", "from-green-500 to-emerald-500"];
                  const color = colors[i % colors.length];
                  return (
                    <div key={item.nombre} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        #{i+1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">{item.nombre}</p>
                          <span className="text-sm font-bold text-gray-700">{item.total} búsquedas</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                            style={{width: `${pct}%`}} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feed de escaneos recientes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Escaneos Recientes</h3>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {scans.slice(0, 20).map((s: any) => (
                  <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${s.medicamento === "Butosol" ? "bg-red-100" : s.medicamento === "Salbutamol" ? "bg-blue-100" : "bg-gray-100"}`}>
                        {s.medicamento === "Butosol" ? "🔴" : s.medicamento === "Salbutamol" ? "🔵" : "💊"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.medicamento}</p>
                        <p className="text-xs text-gray-400">{s.confianza}% confianza · {s.pais}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleTimeString("es-GT", {hour:"2-digit",minute:"2-digit"})}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "estadisticas" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Ventas Hoy", val: `Q ${ventasHoy * 125}`, sub: `${ventasHoy} pedidos`, color: "text-green-600 bg-green-50", trend: "+12.5%" },
                { label: "Ventas Semana", val: `Q ${ventasSemana * 125}`, sub: `${ventasSemana} pedidos`, color: "text-blue-600 bg-blue-50", trend: "+8.3%" },
                { label: "Ventas Mes", val: `Q ${pedidos.length * 125}`, sub: `${pedidos.length} pedidos`, color: "text-purple-600 bg-purple-50", trend: "-2.1%" },
                { label: "Pedidos Completados", val: pedidos.filter(p=>p.estado==="entregado").length, sub: "Total entregados", color: "text-teal-600 bg-teal-50", trend: "" },
              ].map(({ label, val, sub, color, trend }) => (
                <Card key={label} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    {trend && <p className={`text-xs font-semibold mb-2 ${trend.startsWith("+") ? "text-green-600" : "text-red-500"}`}>{trend.startsWith("+") ? "↗" : "↘"} {trend}</p>}
                    <p className={`text-2xl font-bold ${color.split(" ")[0]}`}>{val}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600"/> Productos Más Vendidos</h3>
                <div className="space-y-3">
                  {inventario.slice(0,5).map((item, i) => {
                    const ventas = [156,132,98,87,64][i];
                    const cambio = ["+15%","+8%","+12%","+5%","-3%"][i];
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span>
                          <p className="text-sm font-medium text-gray-900">{item.nombre}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold text-gray-700">{ventas}</p>
                          <span className={`text-xs font-semibold ${cambio.startsWith("+") ? "text-green-600" : "text-red-500"}`}>{cambio}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
