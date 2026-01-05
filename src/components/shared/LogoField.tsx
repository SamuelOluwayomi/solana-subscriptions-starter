'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SiSolana } from 'react-icons/si';

const LOGO_TYPES = ['lazorkit', 'solana', 'cadpay'] as const;

interface LogoItem {
    id: number;
    type: typeof LOGO_TYPES[number];
    top: number;
    left: number;
    size: number;
    opacity: number;
    rotation: number;
    driftDuration: number;
    driftX: number;
    driftY: number;
}

export default function LogoField({ count = 15, className = '' }: { count?: number; className?: string }) {
    const [mounted, setMounted] = useState(false);
    const [items, setItems] = useState<LogoItem[]>([]);

    // Mouse Parallax Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            mouseX.set((clientX / screenWidth) * 2 - 1);
            mouseY.set((clientY / screenHeight) * 2 - 1);
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Generate random items
        const newItems: LogoItem[] = [];
        for (let i = 0; i < count; i++) {
            newItems.push({
                id: i,
                type: LOGO_TYPES[Math.floor(Math.random() * LOGO_TYPES.length)],
                top: Math.random() * 100,
                left: Math.random() * 100,
                size: Math.random() * (80 - 30) + 30, // 30px to 80px
                opacity: Math.random() * (0.15 - 0.05) + 0.05,
                rotation: Math.random() * 360,
                driftDuration: Math.random() * (20 - 10) + 10, // 10s to 20s
                driftX: Math.random() * (50 - 20) + 20 * (Math.random() > 0.5 ? 1 : -1),
                driftY: Math.random() * (50 - 20) + 20 * (Math.random() > 0.5 ? 1 : -1),
            });
        }
        setItems(newItems);
        setMounted(true);

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [count, mouseX, mouseY]);

    if (!mounted) return null;

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {items.map((item) => (
                <DriftingLogo
                    key={item.id}
                    item={item}
                    x={springX}
                    y={springY}
                />
            ))}
        </div>
    );
}

function DriftingLogo({ item, x, y }: { item: LogoItem; x: any; y: any }) {
    // Parallax depth based on size (larger = clearer = closer = moves more)
    // Actually standard parallax: closer objects move *more* opposite to creation? 
    // Usually background moves slower. Let's say smaller = further = slower.
    const depth = (item.size / 80) * 30;

    const moveX = useTransform(x, (v: number) => v * depth * -1);
    const moveY = useTransform(y, (v: number) => v * depth * -1);

    return (
        <motion.div
            className="absolute pointer-events-auto" // Enable pointer events for hover
            style={{
                top: `${item.top}%`,
                left: `${item.left}%`,
                x: moveX,
                y: moveY,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: item.opacity,
                scale: 1,
                // Continuous Drift
                translateX: [0, item.driftX, 0],
                translateY: [0, item.driftY, 0],
                rotate: [item.rotation, item.rotation + 10, item.rotation],
            }}
            transition={{
                opacity: { duration: 1 },
                scale: { duration: 0.5 },
                translateX: { duration: item.driftDuration, repeat: Infinity, ease: "easeInOut" },
                translateY: { duration: item.driftDuration * 1.2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: item.driftDuration * 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            whileHover={{
                scale: 1.5,
                opacity: item.opacity * 2,
                transition: { duration: 0.2 }
            }}
        >
            {item.type === 'lazorkit' && (
                <div style={{ width: item.size, height: item.size }} className="relative">
                    <Image src="/lazorkit-logo.png" alt="" fill className="object-contain grayscale" />
                </div>
            )}
            {item.type === 'solana' && (
                <SiSolana size={item.size} className="text-white" />
            )}
            {item.type === 'cadpay' && (
                <div
                    style={{ width: item.size, height: item.size }}
                    className="rounded-xl bg-orange-500/10 flex items-center justify-center backdrop-blur-sm"
                >
                    <span className="font-black italic text-orange-500/40" style={{ fontSize: item.size * 0.6 }}>C</span>
                </div>
            )}
        </motion.div>
    );
}
