// File: AutoCarousel.jsx
import { useEffect, useState, useRef } from "react";

const AutoCarousel = () => {
  const carouselImages = [
    "https://images.unsplash.com/photo-1590080879107-29c3fce663b4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1588776814546-cbe3f80c5d4f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590080879121-4975bc8a3b12?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1588776814471-89b3eac2a5d7?auto=format&fit=crop&w=800&q=80",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % carouselImages.length);
    }, 4000); // 4 seconds per slide
    return () => clearTimeout(timeoutRef.current);
  }, [currentSlide]);

  return (
    <div className="w-full max-w-5xl mx-auto overflow-hidden rounded-3xl shadow-2xl border-4 border-yellow-400 relative">
      <div
        className="flex transition-transform duration-[2000ms] ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {carouselImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`slide-${idx}`}
            className="w-full flex-shrink-0 h-80 md:h-[400px] object-cover rounded-3xl"
          />
        ))}
      </div>

      {/* Optional navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselImages.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              currentSlide === idx ? "bg-yellow-400" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AutoCarousel;
