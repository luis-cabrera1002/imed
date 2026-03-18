import { Doctor } from "@/types";
import { useNavigate } from "react-router-dom";
import { Calendar, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RatingStars from "./RatingStars";

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-card-hover cursor-pointer group border-border/50 hover:border-primary/20"
      onClick={() => navigate(`/doctores/${doctor.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 overflow-hidden rounded-2xl ring-4 ring-primary/10 group-hover:ring-primary/25 transition-all duration-300">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          
          <h3 className="mt-4 font-bold text-lg text-center group-hover:text-primary transition-colors font-display">
            {doctor.name}
          </h3>
          
          <Badge variant="outline" className="mt-2 text-xs rounded-full border-secondary/30 text-secondary">
            {doctor.specialty}
          </Badge>
          
          <div className="flex items-center justify-center mt-3">
            <RatingStars rating={doctor.rating} size="sm" />
            <span className="ml-2 text-sm text-muted-foreground">
              ({doctor.ratingsCount})
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex items-center text-xs text-muted-foreground">
              <Award className="w-3 h-3 mr-1 text-secondary" />
              {doctor.experience} años
            </div>
          </div>

          <div className="w-full mt-4 space-y-2">
            <Button 
              className="w-full rounded-xl bg-gradient-to-r from-primary to-navy-light hover:opacity-90"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/citas?doctorId=${doctor.id}&specialty=${doctor.specialty}`);
              }}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Agendar Cita
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="w-full rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/doctores/${doctor.id}`);
              }}
            >
              Ver Perfil Completo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
