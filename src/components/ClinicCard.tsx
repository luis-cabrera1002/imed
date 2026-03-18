import { useNavigate } from "react-router-dom";
import { Clinic } from "@/types";
import { MapPin, Phone, Star, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RatingStars from "./RatingStars";

interface ClinicCardProps {
  clinic: Clinic;
}

const ClinicCard = ({ clinic }: ClinicCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-card-hover cursor-pointer group border-border/50 hover:border-primary/20"
      onClick={() => navigate(`/clinicas/${clinic.id}`)}
    >
      <div className="relative h-40 bg-muted overflow-hidden">
        {clinic.image ? (
          <img
            src={clinic.image}
            alt={clinic.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-[image:var(--gradient-hero)]">
            <span className="text-3xl font-bold text-white font-display">{clinic.name.charAt(0)}</span>
          </div>
        )}
        {clinic.emergency && (
          <Badge className="absolute top-2 right-2 bg-destructive hover:bg-destructive text-white border-0 shadow-lg">
            Urgencias 24/7
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <CardHeader className="pb-3">
        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors font-display">
          {clinic.name}
        </h3>
        <div className="flex items-center mt-2">
          <RatingStars rating={clinic.rating} size="sm" />
          <span className="ml-2 text-sm text-muted-foreground">
            ({clinic.ratingsCount})
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start text-sm text-muted-foreground">
          <MapPin className="flex-shrink-0 w-4 h-4 mt-0.5 mr-2 text-secondary" />
          <span className="line-clamp-2">{clinic.address}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="flex-shrink-0 w-4 h-4 mr-2 text-secondary" />
          <span>{clinic.phone}</span>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="flex-shrink-0 w-4 h-4 mr-2 text-secondary" />
          <span>{clinic.schedule.weekdays}</span>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {clinic.specialties.slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="secondary" className="text-xs rounded-full">
              {specialty}
            </Badge>
          ))}
          {clinic.specialties.length > 3 && (
            <Badge variant="secondary" className="text-xs rounded-full">
              +{clinic.specialties.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-3">
          <Button 
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-navy-light hover:opacity-90"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/citas?clinic=${clinic.id}`);
            }}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Agendar
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clinicas?view=mapa&selected=${clinic.id}`);
            }}
            title="Ver en mapa"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Mapa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClinicCard;
