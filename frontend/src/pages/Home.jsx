import React from "react";
import Hero from "../components/Hero.jsx";
import Features from "../components/Features.jsx";
import Working from "../components/Working.jsx";
import Testimonials from "../components/Testimonials.jsx";
import Pricing from "../components/Pricing.jsx";
import Stats from "../components/Stats.jsx";
import CTASection from "../components/Cta.jsx";
import AutoCarousel from "../components/AutoCourosel.jsx";

const Home = () => {
  return (
    <main className="overflow-x-hidden">
      {/* Hero Section */}
      <Features />

      <Hero />

      {/* Optional Carousel */}

      {/* Features Section */}

      {/* How It Works Section */}
      <Working />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Section */}
      <Pricing />

      {/* Stats / Metrics Section */}
      <Stats />

      {/* Call To Action Section */}
      <CTASection />
    </main>
  );
};

export default Home;
