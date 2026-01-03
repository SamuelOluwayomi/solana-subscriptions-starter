'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Hero from '@/components/shared/Hero';
import TrailerLoader from '@/components/shared/TrailerLoader';
// import BentoGrid from '@/components/landing/BentoGrid'; // Component not yet available

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="min-h-screen bg-black selection:bg-indigo-500/30">

      {/* THE MERGE & REVEAL LOADER */}
      <AnimatePresence mode='wait'>
        {isLoading && (
          <TrailerLoader onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <Navbar />

      <main className="w-full">
        {/* Pass the signal! Start animation when NOT loading */}
        <Hero startAnimation={!isLoading} />
        {/* <BentoGrid /> */}
      </main>
    </div>
  );
}
