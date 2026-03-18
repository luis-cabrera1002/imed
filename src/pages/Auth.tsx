import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, User } from 'lucide-react';
import imedLogo from "@/assets/imed-logo-new.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'doctor' | 'patient'>('patient');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'Error al iniciar sesión', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: '¡Bienvenido!', description: 'Has iniciado sesión exitosamente.' });
          navigate('/');
        }
      } else {
        if (!fullName) {
          toast({ title: 'Error', description: 'Por favor ingresa tu nombre completo', variant: 'destructive' });
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          toast({ title: 'Error al registrarse', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: '¡Registro exitoso!', description: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.' });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy/5 via-background to-secondary/5 p-4 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      
      <Card className="w-full max-w-md shadow-card-hover border-border/50 relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={imedLogo} alt="iMed" className="h-16 w-auto" />
          </div>
          <CardDescription className="text-muted-foreground">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta nueva'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-primary to-navy-light" disabled={loading}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input id="fullName" type="text" placeholder="Juan Pérez" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Correo Electrónico</Label>
                  <Input id="signup-email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label>Tipo de Usuario</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as 'doctor' | 'patient')}>
                    <div className="flex items-center space-x-2 p-3 rounded-xl border border-border/50 hover:bg-primary/5 cursor-pointer transition-colors">
                      <RadioGroupItem value="patient" id="patient" />
                      <Label htmlFor="patient" className="flex items-center gap-2 cursor-pointer flex-1">
                        <User className="w-4 h-4 text-primary" />
                        Soy Paciente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-xl border border-border/50 hover:bg-primary/5 cursor-pointer transition-colors">
                      <RadioGroupItem value="doctor" id="doctor" />
                      <Label htmlFor="doctor" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Stethoscope className="w-4 h-4 text-secondary" />
                        Soy Doctor/Administrador
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-primary to-navy-light" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrarse'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
