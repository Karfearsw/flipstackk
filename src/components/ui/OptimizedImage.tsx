'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className,
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate fallback image URL
  const fallbackSrc = '/images/fallback-image.svg';

  // Generate responsive srcSet for different formats
  const generateSrcSet = (baseSrc: string, format: 'webp' | 'avif') => {
    const widths = [640, 750, 828, 1080, 1200, 1920];
    return widths
      .map(w => `${baseSrc}?format=${format}&w=${w}&q=${quality} ${w}w`)
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // If using fill prop, don't specify width/height
  const imageProps = fill 
    ? { fill: true }
    : { width, height };

  return (
    <div className={`relative ${className || ''}`}>
      {/* Loading skeleton */}
      {isLoading && !imageError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={fill ? {} : { width, height }}
        />
      )}

      <picture>
        {/* AVIF format for modern browsers */}
        <source 
          srcSet={generateSrcSet(imageError ? fallbackSrc : src, 'avif')}
          type="image/avif"
          sizes={sizes}
        />
        
        {/* WebP format for broader support */}
        <source 
          srcSet={generateSrcSet(imageError ? fallbackSrc : src, 'webp')}
          type="image/webp"
          sizes={sizes}
        />
        
        {/* Fallback to original format */}
        <Image
          {...imageProps}
          src={imageError ? fallbackSrc : src}
          alt={alt}
          priority={priority}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${className || ''}`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      </picture>
    </div>
  );
}

// Utility function to generate blur data URL
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

// Pre-built optimized image variants for common use cases
export function AvatarImage({ src, alt, size = 40, className }: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className || ''}`}
      sizes={`${size}px`}
      priority={false}
    />
  );
}

export function HeroImage({ src, alt, className }: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      className={className}
      sizes="100vw"
      priority={true}
      quality={90}
    />
  );
}

export function ThumbnailImage({ src, alt, className }: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={300}
      height={200}
      className={className}
      sizes="(max-width: 768px) 50vw, 300px"
      priority={false}
    />
  );
}