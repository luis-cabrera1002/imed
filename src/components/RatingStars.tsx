
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

const RatingStars = ({ rating, size = "md" }: RatingStarsProps) => {
  // Calculate the number of full and half stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Determine the size of the stars
  const starSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${starSize[size]} ${
            i < fullStars
              ? "text-amber-400 fill-amber-400"
              : i === fullStars && hasHalfStar
              ? "text-amber-400 fill-amber-400/50"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default RatingStars;
