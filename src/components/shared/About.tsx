'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import CoreFeatures from './CoreFeatures';

export default function About() {
    const containerRef = useRef(null);

    return (
        // Increased z-index relative to previous section to ensure clean stacking
        <section ref={containerRef} className="relative min-h-[60vh] bg-[#1c1209] flex flex-col items-center pt-30 -mt-1 overflow-hidden z-30">

            {/* 4. CORE FEATURES (Replaces simple text) */}
            <div className="w-full mt-0 relative z-10">
                <CoreFeatures />
            </div>

            {/* SLANTED BOTTOM EDGE (Opposite direction to Hero) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden z-20 pointer-events-none">
                <svg
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    className="w-full h-[120px] md:h-[150px]"
                    style={{ fill: '#1c1209' }}
                >
                    <path d="M0,0 L1200,120 L1200,0 Z" />
                    <line x1="0" y1="0" x2="1200" y2="120" stroke="#f97316" strokeWidth="1" />
                </svg>
            </div>

        </section>
    );
}
