'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';

type Feature = {
    id: string;
    title: string;
    description: string;
    fullText: string;
    image: string;
};

const features: Feature[] = [
    {
        id: 'identity',
        title: 'Identity Simplified',
        description: 'We turn your face into your wallet.',
        fullText: 'We turn your face into your wallet. Forget complex passwords, seed phrases, and card numbers. CadPay uses the biometric security already in your device (FaceID or TouchID) to authorize transactions. It is the security of the blockchain with the simplicity of unlocking your phone.',
        image: '/features/identity.png'
    },
    {
        id: 'autopilot',
        title: 'Payments on Autopilot',
        description: 'True recurring billing for the digital age.',
        fullText: 'True recurring billing for the digital age. For the first time, you can handle crypto subscriptions effortlessly. Whether it is paying for software, a newsletter, or your monthly rent, CadPay automates the settlement. Set it up once, and we handle the rest—no manual signing required every month.',
        image: '/features/autopilot.png'
    },
    {
        id: 'security',
        title: 'Invisible Security',
        description: 'Bank-grade protection that does not get in your way.',
        fullText: 'Bank-grade protection that does not get in your way. We believe the best security is the kind you do not have to think about. Our infrastructure creates a secure, non-custodial vault for your funds that only your unique biometrics can access. You stay in full control without the technical headache.',
        image: '/features/security.png'
    },
    {
        id: 'economy',
        title: 'A Unified Economy',
        description: 'Building the rails for global commerce.',
        fullText: 'Building the rails for global commerce. We are closing the divide between traditional finance and the decentralized web. CadPay provides merchants and developers with a single, powerful dashboard to accept payments, manage revenue, and grow their business instantly, across any border.',
        image: '/features/economy.png'
    }
];

// Portal Component to move modal to document.body
const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(children, document.body);
};


export default function CoreFeatures() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (selectedId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedId]);

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-12 -mt-32 relative z-40">
            <div className="mb-20 text-center">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                    The 4 Core Goals
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
                    We are redesigning the financial stack from the ground up.
                </p>
            </div>

            {/* Scattered Layout - Standing Style (No Overlap) */}
            <div className="relative w-full max-w-6xl mx-auto" style={{ minHeight: '500px' }}>
                {/* Desktop: Cards standing at different heights/angles but NOT overlapping */}
                <div className="hidden md:block">
                    {/* Identity - Left */}
                    <div className="absolute top-0 left-0 w-[270px] transform -rotate-1 hover:z-50 hover:scale-105 transition-all duration-300" style={{ zIndex: 1 }}>
                        <Card feature={features[0]} onClick={() => setSelectedId(features[0].id)} className="h-[380px]" cornerPosition="top-left" />
                    </div>

                    {/* Autopilot - Mid Left - Lower down */}
                    <div className="absolute top-[80px] left-[300px] w-[270px] transform rotate-2 hover:z-50 hover:scale-105 transition-all duration-300" style={{ zIndex: 2 }}>
                        <Card feature={features[1]} onClick={() => setSelectedId(features[1].id)} className="h-[340px]" cornerPosition="top-right" />
                    </div>

                    {/* Security - Mid Right - Higher up */}
                    <div className="absolute top-[20px] left-[600px] w-[270px] transform -rotate-2 hover:z-50 hover:scale-105 transition-all duration-300" style={{ zIndex: 3 }}>
                        <Card feature={features[2]} onClick={() => setSelectedId(features[2].id)} className="h-[360px]" cornerPosition="top-right" />
                    </div>

                    {/* Economy - Right - Lower down */}
                    <div className="absolute top-[60px] right-0 w-[270px] transform rotate-1 hover:z-50 hover:scale-105 transition-all duration-300" style={{ zIndex: 4 }}>
                        <Card feature={features[3]} onClick={() => setSelectedId(features[3].id)} className="h-[320px]" cornerPosition="bottom-left" />
                    </div>
                </div>

                {/* Mobile: Grid Layout */}
                <div className="md:hidden grid grid-cols-1 gap-6">
                    <Card feature={features[0]} onClick={() => setSelectedId(features[0].id)} className="h-[320px]" cornerPosition="top-left" />
                    <Card feature={features[1]} onClick={() => setSelectedId(features[1].id)} className="h-[320px]" cornerPosition="top-right" />
                    <Card feature={features[2]} onClick={() => setSelectedId(features[2].id)} className="h-[320px]" cornerPosition="top-right" />
                    <Card feature={features[3]} onClick={() => setSelectedId(features[3].id)} className="h-[320px]" cornerPosition="bottom-left" />
                </div>
            </div>

            {/* Bottom Spacing */}
            <div className="h-32"></div>

            {/* Global Modal via Portal */}
            <ModalPortal>
                <AnimatePresence>
                    {selectedId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
                            onClick={() => setSelectedId(null)} // Close on background click
                        >
                            <motion.div
                                layoutId={selectedId}
                                className="bg-[#1c1209] w-full max-w-lg md:max-w-2xl max-h-[90vh] md:max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 flex flex-col"
                                onClick={(e) => e.stopPropagation()} // Stop propagation
                            >
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-orange-500 hover:text-black transition-colors z-20"
                                >
                                    <X size={20} />
                                </button>

                                <div className="relative h-48 md:h-72 w-full flex-shrink-0">
                                    <Image
                                        src={features.find(f => f.id === selectedId)?.image || ''}
                                        alt="Feature"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1209] to-transparent" />
                                </div>

                                <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
                                    <motion.h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                        {features.find(f => f.id === selectedId)?.title}
                                    </motion.h3>
                                    <motion.p className="text-zinc-300 text-base md:text-lg leading-relaxed">
                                        {features.find(f => f.id === selectedId)?.fullText}
                                    </motion.p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </ModalPortal>
        </div>
    );
}

function Card({ feature, onClick, className, cornerPosition, style }: {
    feature: Feature,
    onClick: () => void,
    className?: string,
    cornerPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    style?: React.CSSProperties
}) {
    return (
        <motion.div
            layoutId={feature.id}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            style={style}
            className={`relative cursor-pointer group ${className}`}
        >
            {/* Corner Notches */}
            {cornerPosition === 'top-left' && (
                <div className="absolute top-2 left-2 w-3 h-3 bg-orange-500 rounded-full z-30 shadow-md" />
            )}
            {cornerPosition === 'top-right' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full z-30 shadow-md" />
            )}
            {cornerPosition === 'bottom-left' && (
                <div className="absolute bottom-2 left-2 w-3 h-3 bg-orange-500 rounded-full z-30 shadow-md" />
            )}
            {cornerPosition === 'bottom-right' && (
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-orange-500 rounded-full z-30 shadow-md" />
            )}

            {/* Card Content */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl group-hover:shadow-orange-500/20 transition-all duration-300">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    <div className="w-10 h-10 mb-3 rounded-full bg-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <div className="w-2.5 h-2.5 bg-black rounded-full" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}