import { useState } from "react";
import { 
  Package, ShoppingCart, TrendingUp, AlertTriangle, 
  Plus, Minus, Search, Filter, MoreVertical,
  CheckCircle, Clock, Truck, ArrowUpRight, ArrowDownRight,
  Pill, Box, RefreshCw, FileText, Eye
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import PrescriptionViewDialog from "@/components/dashboard/PrescriptionViewDialog";

interface Order {
  id: string;
  patient: string;
  medicines: string[];
  total: string;
  status: string;
  time: string;
  prescription: boolean;
}

// Mock orders data
const mockOrders = [
  { id: "ORD-001", patient: "María García", medicines: ["Paracetamol 500mg x 20", "Omeprazol 20mg x 14"], total: "Q 125.00", status: "pending", time: "Hace 5 min", prescription: true },
  { id: "ORD-002", patient: "Carlos López", medicines: ["Losartán 50mg x 30"], total: "Q 89.00", status: "preparing", time: "Hace 15 min", prescription: true },
  { id: "ORD-003", patient: "Ana Rodríguez", medicines: ["Vitamina C 1000mg x 60", "Zinc 50mg x 30"], total: "Q 156.00", status: "ready", time: "Hace 30 min", prescription: false },
  { id: "ORD-004", patient: "José Martínez", medicines: ["Metformina 850mg x 60", "Glibenclamida 5mg x 30"], total: "Q 234.00", status: "delivered", time: "Hace 1 hora", prescription: true },
  { id: "ORD-005", patient: "Laura Hernández", medicines: ["Ibuprofeno 400mg x 20"], total: "Q 45.00", status: "delivered", time: "Hace 2 horas", prescription: false },
];

// Mock inventory data
const mockInventory = [
  { id: 1, name: "Paracetamol 500mg", stock: 245, minStock: 100, maxStock: 500, price: "Q 35.00", category: "Analgésicos", lastRestock: "2024-01-10" },
  { id: 2, name: "Ibuprofeno 400mg", stock: 12, minStock: 50, maxStock: 300, price: "Q 45.00", category: "Antiinflamatorios", lastRestock: "2024-01-05" },
  { id: 3, name: "Omeprazol 20mg", stock: 89, minStock: 80, maxStock: 400, price: "Q 65.00", category: "Gastrointestinal", lastRestock: "2024-01-08" },
  { id: 4, name: "Losartán 50mg", stock: 156, minStock: 60, maxStock: 300, price: "Q 89.00", category: "Cardiovascular", lastRestock: "2024-01-12" },
  { id: 5, name: "Metformina 850mg", stock: 234, minStock: 100, maxStock: 500, price: "Q 78.00", category: "Diabetes", lastRestock: "2024-01-11" },
  { id: 6, name: "Amoxicilina 500mg", stock: 45, minStock: 80, maxStock: 400, price: "Q 120.00", category: "Antibióticos", lastRestock: "2024-01-03" },
  { id: 7, name: "Vitamina C 1000mg", stock: 320, minStock: 100, maxStock: 600, price: "Q 56.00", category: "Vitaminas", lastRestock: "2024-01-14" },
  { id: 8, name: "Loratadina 10mg", stock: 0, minStock: 50, maxStock: 250, price: "Q 42.00", category: "Antialérgicos", lastRestock: "2023-12-20" },
];

const PharmacyDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<typeof mockInventory[0] | null>(null);
  const [restockAmount, setRestockAmount] = useState(0);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  
  // Prescription dialog state
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleViewPrescription = (order: Order) => {
    setSelectedOrder(order);
    setPrescriptionDialogOpen(true);
  };

  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const preparingOrders = mockOrders.filter(o => o.status === 'preparing').length;
  const readyOrders = mockOrders.filter(o => o.status === 'ready').length;
  const lowStockItems = mockInventory.filter(i => i.stock <= i.minStock).length;
  const outOfStockItems = mockInventory.filter(i => i.stock === 0).length;

  const filteredInventory = mockInventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { color: 'text-red-600 bg-red-50', label: 'Sin Stock', icon: AlertTriangle };
    if (stock <= minStock) return { color: 'text-yellow-600 bg-yellow-50', label: 'Stock Bajo', icon: AlertTriangle };
    return { color: 'text-green-600 bg-green-50', label: 'En Stock', icon: CheckCircle };
  };

  const handleRestock = () => {
    // In a real app, this would make an API call
    console.log(`Restocking ${selectedProduct?.name} with ${restockAmount} units`);
    setIsRestockDialogOpen(false);
    setRestockAmount(0);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Farmacia Central 💊
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pedidos Pendientes</p>
                  <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Preparando</p>
                  <p className="text-2xl font-bold text-foreground">{preparingOrders}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Listos</p>
                  <p className="text-2xl font-bold text-foreground">{readyOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Stock Bajo</p>
                  <p className="text-2xl font-bold text-foreground">{lowStockItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Sin Stock</p>
                  <p className="text-2xl font-bold text-foreground">{outOfStockItems}</p>
                </div>
                <Box className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Orders Section */}
          <Card className="lg:row-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Pedidos de Recetas
                  </CardTitle>
                  <CardDescription>Pedidos recibidos de pacientes</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{order.id}</span>
                          {order.prescription && (
                            <Badge variant="outline" className="text-xs">
                              Con Receta
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{order.patient}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(order.status)} border`}>
                          {getStatusText(order.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border shadow-lg">
                            {order.prescription && (
                              <DropdownMenuItem onClick={() => handleViewPrescription(order)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver Receta Médica
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                            <DropdownMenuItem>Marcar como Preparando</DropdownMenuItem>
                            <DropdownMenuItem>Marcar como Listo</DropdownMenuItem>
                            <DropdownMenuItem>Marcar como Entregado</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="space-y-1 mb-2">
                      {order.medicines.map((med, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground flex items-center gap-1">
                          <Pill className="h-3 w-3" />
                          {med}
                        </p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{order.time}</span>
                      <span className="font-semibold text-primary">{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Inventario
                  </CardTitle>
                  <CardDescription>{mockInventory.length} productos en catálogo</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar medicamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.stock, item.minStock);
                  const stockPercentage = (item.stock / item.maxStock) * 100;
                  
                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${stockStatus.color}`}>
                          <stockStatus.icon className="h-3 w-3" />
                          {stockStatus.label}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Stock: {item.stock}</span>
                            <span className="text-muted-foreground">Max: {item.maxStock}</span>
                          </div>
                          <Progress 
                            value={stockPercentage} 
                            className={`h-1.5 ${item.stock <= item.minStock ? '[&>div]:bg-yellow-500' : ''} ${item.stock === 0 ? '[&>div]:bg-red-500' : ''}`}
                          />
                        </div>
                        <Dialog open={isRestockDialogOpen && selectedProduct?.id === item.id} onOpenChange={(open) => {
                          setIsRestockDialogOpen(open);
                          if (!open) setSelectedProduct(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(item);
                                setIsRestockDialogOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Reabastecer
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-background">
                            <DialogHeader>
                              <DialogTitle>Reabastecer {item.name}</DialogTitle>
                              <DialogDescription>
                                Stock actual: {item.stock} unidades | Máximo: {item.maxStock}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Label htmlFor="amount">Cantidad a agregar</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => setRestockAmount(Math.max(0, restockAmount - 10))}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  id="amount"
                                  type="number"
                                  value={restockAmount}
                                  onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                                  className="text-center"
                                />
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => setRestockAmount(restockAmount + 10)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Nuevo stock total: {item.stock + restockAmount} unidades
                              </p>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleRestock} disabled={restockAmount <= 0}>
                                <Truck className="h-4 w-4 mr-2" />
                                Confirmar Pedido
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sales Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Estadísticas de Ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">+12.5%</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">Q 12,450</p>
                  <p className="text-xs text-green-600">Ventas Hoy</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">+8.3%</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">Q 78,920</p>
                  <p className="text-xs text-blue-600">Ventas Semana</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-500 font-medium">-2.1%</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">Q 324,500</p>
                  <p className="text-xs text-purple-600">Ventas Mes</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">847</p>
                  <p className="text-xs text-muted-foreground">Pedidos Completados</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Productos Más Vendidos</h4>
                <div className="space-y-2">
                  {[
                    { name: "Paracetamol 500mg", sales: 156, trend: "+15%" },
                    { name: "Ibuprofeno 400mg", sales: 132, trend: "+8%" },
                    { name: "Omeprazol 20mg", sales: 98, trend: "+12%" },
                  ].map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{idx + 1}. {product.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.sales}</span>
                        <span className="text-xs text-green-600">{product.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Prescription View Dialog */}
      <PrescriptionViewDialog
        open={prescriptionDialogOpen}
        onOpenChange={setPrescriptionDialogOpen}
        orderId={selectedOrder?.id || ""}
        patientName={selectedOrder?.patient || ""}
      />
    </div>
  );
};

export default PharmacyDashboard;
