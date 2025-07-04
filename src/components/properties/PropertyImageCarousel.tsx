
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyImage {
  id: string;
  url: string;
  alt_text?: string;
  display_order: number;
}

interface PropertyImageCarouselProps {
  images: PropertyImage[];
  propertyTitle: string;
}

const PropertyImageCarousel = ({ images, propertyTitle }: PropertyImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback placeholder if no images
  const fallbackImage = "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=400&fit=crop";
  
  const displayImages = images.length > 0 ? images : [{ 
    id: 'fallback', 
    url: fallbackImage, 
    alt_text: `${propertyTitle} - Property Image`,
    display_order: 0 
  }];

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
  };

  if (displayImages.length === 1) {
    return (
      <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={displayImages[0].url}
          alt={displayImages[0].alt_text || `${propertyTitle} - Property Image`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        {images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No images available</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg bg-gray-100">
      <img
        src={displayImages[currentIndex].url}
        alt={displayImages[currentIndex].alt_text || `${propertyTitle} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={(e) => {
          e.currentTarget.src = fallbackImage;
        }}
      />
      
      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="sm"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={prevImage}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={nextImage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Image Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {displayImages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {currentIndex + 1} / {displayImages.length}
      </div>
    </div>
  );
};

export default PropertyImageCarousel;
