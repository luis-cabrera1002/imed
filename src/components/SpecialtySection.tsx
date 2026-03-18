import { useMemo } from "react";
import { Doctor, Specialty } from "@/types";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import DoctorCard from "./DoctorCard";

interface SpecialtySectionProps {
  specialty: Specialty;
  doctors: Doctor[];
}

const SpecialtySection = ({ specialty, doctors }: SpecialtySectionProps) => {
  const sortedDoctors = useMemo(() => {
    return [...doctors]
      .filter(doc => doc.specialty === specialty)
      .sort((a, b) => b.rating - a.rating);
  }, [doctors, specialty]);

  if (sortedDoctors.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-display text-foreground">{specialty}</h2>
        <Link
          to={`/especialidades/${specialty}`}
          className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          Ver todos <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedDoctors.slice(0, 3).map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </section>
  );
};

export default SpecialtySection;
