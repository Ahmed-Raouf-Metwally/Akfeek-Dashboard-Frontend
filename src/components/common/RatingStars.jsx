import React from 'react';
import { Star } from 'lucide-react';

/**
 * RatingStars Component
 * Display star ratings (read-only or interactive)
 */
const RatingStars = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 20, 
  interactive = false,
  onChange = null,
  showValue = false 
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartial = !isFilled && starValue - 0.5 <= displayRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              } transition-transform`}
              aria-label={`Rate ${starValue} stars`}
            >
              {isPartial ? (
                <div className="relative" style={{ width: size, height: size }}>
                  <Star
                    size={size}
                    className="absolute text-gray-300"
                    fill="currentColor"
                  />
                  <div className="absolute overflow-hidden" style={{ width: '50%' }}>
                    <Star
                      size={size}
                      className="text-yellow-400"
                      fill="currentColor"
                    />
                  </div>
                </div>
              ) : (
                <Star
                  size={size}
                  className={isFilled ? 'text-yellow-400' : 'text-gray-300'}
                  fill="currentColor"
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
