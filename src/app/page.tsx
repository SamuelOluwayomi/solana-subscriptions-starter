'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Hero from '@/components/shared/Hero';
import TrailerLoader from '@/components/shared/TrailerLoader';
import About from '@/components/shared/About';
import Footer from '@/components/shared/Footer';
// import BentoGrid from '@/components/landing/BentoGrid'; // Component not yet available

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="min-h-screen bg-black selection:bg-orange-500/30">

      {/* THE MERGE & REVEAL LOADER */}
      <AnimatePresence mode='wait'>
        {isLoading && (
          <TrailerLoader onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <Navbar />

      <main className="w-full">
        <Hero startAnimation={!isLoading} />
        <About />
        <Footer />
      </main>
    </div>
  );
}
