import { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import financial1 from "../assets/financial-1.jpg";
import financial2 from "../assets/financial-2.jpg";
import financial3 from "../assets/financial-3.jpg";
import financial4 from "../assets/financial-4.jpg";

const carouselData = [
  {
    image: financial1,
    title: "Advanced Analytics",
    description: "Real-time market insights and data visualization"
  },
  {
    image: financial2,
    title: "Trading Excellence", 
    description: "Professional trading platform with cutting-edge technology"
  },
  {
    image: financial3,
    title: "Growth Strategy",
    description: "Strategic financial planning for sustainable growth"
  },
  {
    image: financial4,
    title: "Digital Banking",
    description: "Next-generation financial services and cryptocurrency solutions"
  }
];

export const FinancialCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      duration: 30
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-financial-dark">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {carouselData.map((slide, index) => (
            <div key={index} className="embla__slide relative flex-[0_0_100%] min-w-0">
              <div className="relative w-full h-screen">
                {/* Background Image */}
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-overlay" />
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center h-full px-8">
                  <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-financial-accent font-light max-w-2xl mx-auto animate-fade-in [animation-delay:200ms]">
                      {slide.description}
                    </p>
                  </div>
                </div>
                
                {/* Slide Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-3">
                    {carouselData.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === index 
                            ? 'bg-financial-blue w-8' 
                            : 'bg-financial-muted hover:bg-financial-accent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-background/20 hover:bg-background/30 backdrop-blur-sm rounded-full p-4 transition-all duration-300 group"
      >
        <svg 
          className="w-6 h-6 text-foreground group-hover:text-financial-accent transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-background/20 hover:bg-background/30 backdrop-blur-sm rounded-full p-4 transition-all duration-300 group"
      >
        <svg 
          className="w-6 h-6 text-foreground group-hover:text-financial-accent transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};