import React from 'react'
import Hero from '../components/Hero.jsx'
import Features from '../components/Features.jsx'
import Working from '../components/Working.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Pricing from '../components/Pricing.jsx'
import Stats from '../components/Stats.jsx'
import CTASection from '../components/Cta.jsx'

const Home = () => {
  return (
    <div>
      <Hero />
      <Features />
      <Working />
      <Testimonials />
      <Pricing />
      <Stats />
      <CTASection />
    </div>
  )
}

export default Home