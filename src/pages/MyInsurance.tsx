import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Building2,
  Stethoscope,
  Phone,
  AlertCircle,
  Globe,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Pill,
  FileText,
  DollarSign,
  ChevronRight,
  Star,
  MapPin,
} from "lucide-react";
import { insuranceDetails, getInsuranceById } from "@/data/insuranceDetailsData";
import { clinics, doctors } from "@/data/mockData";
import RatingStars from "@/components/RatingStars";

const MyInsurance = () => {
  const navigate = useNavigate();
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>("");

  const selectedInsurance = selectedInsuranceId
    ? getInsuranceById(selectedInsuranceId)
    : null;

  // Filter clinics that accept the selected insurance
  const compatibleClinics = selectedInsurance
    ? clinics.filter((clinic) =>
        clinic.acceptedInsurance.some(
          (ins) =>
            ins.toLowerCase().includes(selectedInsurance.name.toLowerCase()) ||
            selectedInsurance.name.toLowerCase().includes(ins.toLowerCase())
        )
      )
    : [];

  // Filter doctors that accept the selected insurance
  const compatibleDoctors = selectedInsurance
    ? doctors.filter((doctor) =>
        doctor.acceptedInsurance.some(
          (ins) =>
            ins.toLowerCase().includes(selectedInsurance.name.toLowerCase()) ||
            selectedInsurance.name.toLowerCase().includes(ins.toLowerCase())
        )
      )
    : [];

  // Check if medications are covered
  const getMedicationCoverage = () => {
    if (!selectedInsurance) return null;
    const medCoverage = selectedInsurance.coverage.find(
      (c) => c.category.toLowerCase().includes("medicamento")
    );
    return medCoverage;
  };

  const medicationCoverage = getMedicationCoverage();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="w-12 h-12" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Mi Seguro</h1>
                <p className="text-primary-foreground/80">
                  Consulta tu cobertura, clínicas y doctores disponibles
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Insurance Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Selecciona tu seguro médico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedInsuranceId}
                onValueChange={setSelectedInsuranceId}
              >
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Elige tu aseguradora..." />
                </SelectTrigger>
                <SelectContent>
                  {insuranceDetails.map((insurance) => (
                    <SelectItem key={insurance.id} value={insurance.id}>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {insurance.name}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {insurance.networkType}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Content when insurance is selected */}
          {selectedInsurance ? (
            <div className="space-y-6">
              {/* Insurance Quick Info */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary rounded-lg">
                        <Shield className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedInsurance.name}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Badge variant="secondary">{selectedInsurance.networkType}</Badge>
                          <span className="text-sm">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {selectedInsurance.customerServiceHours}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${selectedInsurance.phone}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Llamar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${selectedInsurance.emergencyPhone}`, '_self')}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Emergencias
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://${selectedInsurance.website}`, '_blank')}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Sitio Web
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${selectedInsurance.email}`, '_self')}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="coverage" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="coverage" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Cobertura</span>
                  </TabsTrigger>
                  <TabsTrigger value="clinics" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Clínicas</span>
                    <Badge variant="secondary" className="ml-1">
                      {compatibleClinics.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="doctors" className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    <span className="hidden sm:inline">Doctores</span>
                    <Badge variant="secondary" className="ml-1">
                      {compatibleDoctors.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="terms" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="hidden sm:inline">Términos</span>
                  </TabsTrigger>
                </TabsList>

                {/* Coverage Tab */}
                <TabsContent value="coverage" className="mt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedInsurance.coverage.map((item, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            {item.category}
                            {item.copay && (
                              <Badge variant="outline" className="font-normal">
                                {item.copay}
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {item.items.map((service, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {service}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Medication Coverage Highlight */}
                    <Card className={medicationCoverage ? "border-primary/50 bg-primary/5" : "border-destructive/50 bg-destructive/5"}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pill className={medicationCoverage ? "w-5 h-5 text-primary" : "w-5 h-5 text-destructive"} />
                          Cobertura de Medicamentos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {medicationCoverage ? (
                          <div className="space-y-2">
                            <p className="text-sm text-primary flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Medicamentos cubiertos
                            </p>
                            <ul className="space-y-1 text-sm">
                              {medicationCoverage.items.map((item, idx) => (
                                <li key={idx} className="text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                            {medicationCoverage.copay && (
                              <Badge className="mt-2">
                                Copago: {medicationCoverage.copay}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Consulta directamente con tu aseguradora sobre la cobertura de medicamentos
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Clinics Tab */}
                <TabsContent value="clinics" className="mt-6">
                  {compatibleClinics.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {compatibleClinics.map((clinic) => (
                        <Card
                          key={clinic.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => navigate(`/clinicas/${clinic.id}`)}
                        >
                          <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            <img
                              src={clinic.image}
                              alt={clinic.name}
                              className="w-full h-full object-cover"
                            />
                            {clinic.emergency && (
                              <Badge className="absolute top-2 right-2 bg-destructive">
                                Urgencias 24h
                              </Badge>
                            )}
                          </div>
                          <CardContent className="pt-4">
                            <h3 className="font-semibold text-lg mb-2">{clinic.name}</h3>
                            <div className="flex items-center gap-1 mb-2">
                              <RatingStars rating={clinic.rating} size="sm" />
                              <span className="text-sm text-muted-foreground">
                                ({clinic.ratingsCount})
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                              <MapPin className="w-4 h-4" />
                              {clinic.address}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {clinic.specialties.slice(0, 3).map((spec) => (
                                <Badge key={spec} variant="outline" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {clinic.specialties.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{clinic.specialties.length - 3}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No se encontraron clínicas afiliadas a este seguro
                      </p>
                    </Card>
                  )}
                </TabsContent>

                {/* Doctors Tab */}
                <TabsContent value="doctors" className="mt-6">
                  {compatibleDoctors.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {compatibleDoctors.map((doctor) => (
                        <Card
                          key={doctor.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => navigate(`/doctores/${doctor.id}`)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <img
                                src={doctor.image}
                                alt={doctor.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold">{doctor.name}</h3>
                                <Badge variant="secondary" className="mt-1">
                                  {doctor.specialty}
                                </Badge>
                                <div className="flex items-center gap-1 mt-2">
                                  <RatingStars rating={doctor.rating} size="sm" />
                                  <span className="text-sm text-muted-foreground">
                                    ({doctor.ratingsCount})
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                  {doctor.experience} años de experiencia
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No se encontraron doctores afiliados a este seguro
                      </p>
                    </Card>
                  )}
                </TabsContent>

                {/* Terms Tab */}
                <TabsContent value="terms" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Benefits */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                          <CheckCircle2 className="w-5 h-5" />
                          Beneficios Incluidos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {selectedInsurance.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Exclusions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                          <XCircle className="w-5 h-5" />
                          Exclusiones
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {selectedInsurance.exclusions.map((exclusion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{exclusion}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Copays Summary */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-primary" />
                          Resumen de Copagos y Deducibles
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          {selectedInsurance.coverage.map((item, index) => (
                            item.copay && (
                              <div key={index} className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  {item.category}
                                </p>
                                <p className="font-semibold text-primary">{item.copay}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact for More Info */}
                    <Card className="md:col-span-2 bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-primary" />
                            <div>
                              <p className="font-medium">¿Tienes dudas sobre tu cobertura?</p>
                              <p className="text-sm text-muted-foreground">
                                Contacta a tu aseguradora para información detallada sobre montos máximos y términos específicos
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => window.open(`tel:${selectedInsurance.phone}`, '_self')}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              {selectedInsurance.phone}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            /* Empty State */
            <Card className="p-12 text-center">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Selecciona tu seguro médico</h2>
              <p className="text-muted-foreground mb-4">
                Elige tu aseguradora para ver las clínicas, doctores y cobertura disponible
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {insuranceDetails.slice(0, 4).map((insurance) => (
                  <Badge
                    key={insurance.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setSelectedInsuranceId(insurance.id)}
                  >
                    {insurance.name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyInsurance;
