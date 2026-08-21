import React, { useState } from 'react';
import {
  Camera,
  Compass,
  Droplets,
  HeartHandshake,
  Mountain,
  Palmtree,
  Sparkles,
  Tent,
  Truck,
} from 'lucide-react';

interface TourismImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  className?: string;
  category?: string | null;
  showBadge?: boolean;
}

function getCategoryIcon(category?: string | null) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('waterfall') || cat.includes('fall') || cat.includes('lake') || cat.includes('dam')) {
    return Droplets;
  }
  if (cat.includes('wildlife') || cat.includes('safari') || cat.includes('nature')) {
    return Palmtree;
  }
  if (cat.includes('trek') || cat.includes('hill') || cat.includes('mountain')) {
    return Mountain;
  }
  if (cat.includes('temple') || cat.includes('heritage') || cat.includes('fort') || cat.includes('sacred')) {
    return Mountain;
  }
  if (cat.includes('stay') || cat.includes('resort') || cat.includes('camp') || cat.includes('homestay')) {
    return Tent;
  }
  if (cat.includes('craft') || cat.includes('art') || cat.includes('handloom') || cat.includes('silk')) {
    return HeartHandshake;
  }
  if (cat.includes('transport') || cat.includes('cab') || cat.includes('vehicle')) {
    return Truck;
  }
  if (cat.includes('tour') || cat.includes('experience')) {
    return Compass;
  }
  return Camera;
}

export function TourismImage({
  src,
  alt,
  className = '',
  category,
  showBadge = true,
  ...props
}: TourismImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check if valid image source is provided (ignore empty strings or undefined)
  const isImageEmpty = !src || src.trim() === '';
  const IconComponent = getCategoryIcon(category);

  if (isImageEmpty || hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5EFE6] to-[#EAE0D0] p-4 text-center select-none ${className}`}
      >
        {/* Subtle geometric tribal pattern background */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#8C3B1E_1px,transparent_1px)] [background-size:12px_12px]" />

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-clay-700 shadow-sm backdrop-blur-xs border border-clay-200/60">
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="space-y-0.5 max-w-[14rem]">
            <p className="font-display text-xs font-bold text-ink-800 line-clamp-1">{alt || 'Jharkhand Tourism'}</p>
            <p className="text-[10px] font-medium text-clay-700">Photo coming soon</p>
          </div>

          {showBadge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-ink-600 border border-ink-200/50 shadow-2xs">
              <Sparkles className="h-2.5 w-2.5 text-amber-600" />
              Verified Authentic Listing
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-sand-100 ${className}`}>
      {/* Loading shimmer skeleton */}
      {!loaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-ink-100 via-sand-200 to-ink-100" />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
}
