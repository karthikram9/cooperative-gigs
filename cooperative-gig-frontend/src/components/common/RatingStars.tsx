import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  value?: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
}) => {
  const [hover, setHover] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hover ?? value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(null)}
            className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
