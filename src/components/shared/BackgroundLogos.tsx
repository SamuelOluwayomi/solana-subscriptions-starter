'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SiSolana } from "react-icons/si";

export default function BackgroundLogos() {
    const [mounted, setMounted] = useState(false);

    // Mouse position state
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for logos
    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        setMounted(true);

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Normalize mouse position from -1 to 1
            const normalizedX = (clientX / screenWidth) * 2 - 1;
            const normalizedY = (clientY / screenHeight) * 2 - 1;

            mouseX.set(normalizedX);
            mouseY.set(normalizedY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Lazorkit Logo - Top Right Area */}
            <FloatingLogo
                x={springX}
                y={springY}
                depth={20}
                className="top-[15%] right-[10%]"
            >
                <div className="relative w-32 h-32 opacity-[0.03] rotate-12 blur-[1px]">
                    <Image
                        src="/lazorkit-logo.png"
                        alt="Lazorkit"
                        fill
                        className="object-contain grayscale"
                    />
                </div>
            </FloatingLogo>

            {/* Solana Logo - Bottom Left Area */}
            <FloatingLogo
                x={springX}
                y={springY}
                depth={-15}
                className="bottom-[20%] left-[5%]"
            >
                <div className="opacity-[0.03] -rotate-12 blur-[1px]">
                    <SiSolana size={140} />
                </div>
            </FloatingLogo>

            {/* CadPay 'C' - Center Leftish */}
            <FloatingLogo
                x={springX}
                y={springY}
                depth={30}
                className="top-[40%] left-[15%]"
            >
                <div className="w-24 h-24 rounded-3xl bg-orange-500/5 flex items-center justify-center -rotate-6 backdrop-blur-sm">
                    <span className="font-black italic text-4xl text-orange-500/20">C</span>
                </div>
            </FloatingLogo>

            {/* Small Lazorkit - Bottom Right */}
            <FloatingLogo
                x={springX}
                y={springY}
                depth={-25}
                className="bottom-[10%] right-[20%]"
            >
                <div className="relative w-20 h-20 opacity-[0.02] rotate-45">
                    <Image
                        src="/lazorkit-logo.png"
                        alt="Lazorkit"
                        fill
                        className="object-contain grayscale"
                    />
                </div>
            </FloatingLogo>

        </div>
    );
}

function FloatingLogo({
    x,
    y,
    depth,
    className,
    children
}: {
    x: any,
    y: any,
    depth: number,
    className: string,
    children: React.ReactNode
}) {
    const moveX = useTransform(x, (v: number) => v * depth * -1);
    const moveY = useTransform(y, (v: number) => v * depth * -1);

    return (
        <motion.div
            className={`absolute ${className}`}
            style={{ x: moveX, y: moveY }}
        >
            {children}
        </motion.div>
    );
}
