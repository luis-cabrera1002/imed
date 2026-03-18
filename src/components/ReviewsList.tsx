
import { Review } from "@/types";
import RatingStars from "./RatingStars";
import { useState } from "react";
import { Button } from "./ui/button";

interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList = ({ reviews }: ReviewsListProps) => {
  const [visibleReviews, setVisibleReviews] = useState(3);
  
  const handleLoadMore = () => {
    setVisibleReviews((prev) => prev + 3);
  };

  if (!reviews.length) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay opiniones disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.slice(0, visibleReviews).map((review) => (
        <div key={review.id} className="p-4 bg-white border rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 overflow-hidden rounded-full">
                <img
                  src={review.userImage}
                  alt={review.userName}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="flex-1 ml-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{review.userName}</h4>
                <span className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="mt-1">
                <RatingStars rating={review.rating} size="sm" />
              </div>
              <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
              <div className="flex items-center mt-3">
                <button className="flex items-center text-xs text-gray-500 hover:text-guatehealth-primary">
                  <span className="mr-1">👍</span>
                  <span>{review.helpful} personas encontraron esto útil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {visibleReviews < reviews.length && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline"
            onClick={handleLoadMore}
          >
            Cargar más opiniones
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
