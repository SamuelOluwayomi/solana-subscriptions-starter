'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ArrowUpRight } from 'lucide-react';

type Feature = {
    id: string;
    headline: string;
    description: string;
    fullDescription: string;
    image: string;
};

const cadpayFeatures: Feature[] = [
    {
        id: 'biometric',
        headline: 'Your Face is Your Private Key.',
        description: 'Powered by Lazorkit, we map your device\'s FaceID directly to a Solana keypair.',
        fullDescription: 'Powered by Lazorkit, we map your device\'s FaceID directly to a Solana keypair. This eliminates the need for seed phrases, creating a non-custodial wallet that is as secure as a ledger but as easy to access as your phone.',
        image: '/features/identity.png'
    },
    {
        id: 'autosettlement',
        headline: 'True Recurring Crypto Payments.',
        description: 'Smart contracts typically require manual approval for every transaction.',
        fullDescription: 'Smart contracts typically require manual approval for every transaction. We utilize Lazorkit Session Keys to pre-approve specific subscription parameters, enabling Netflix-style automated billing on-chain without compromising user sovereignty.',
        image: '/features/autopilot.png'
    },
    {
        id: 'infrastructure',
        headline: 'Global Payments at 400ms Finality.',
        description: 'Built on Solana\'s parallelized architecture, CadPay handles thousands of transactions per second.',
        fullDescription: 'Built on Solana\'s parallelized architecture, CadPay handles thousands of transactions per second with near-zero latency. We provide a payment rail fast enough for real-time commerce and cheap enough for micro-transactions.',
        image: '/features/security.png'
    },
    {
        id: 'sdk',
        headline: 'A Composable Financial OS.',
        description: 'We are more than a wallet; we are an open protocol.',
        fullDescription: 'We are more than a wallet; we are an open protocol. Developers can build directly on our settlement layer to create custom subscription models, automated treasury flows, and loyalty rewards that inherit the security of the Solana network.',
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
        <div className="w-full max-w-7xl mx-auto px-6 py-12 -mt-32 relative z-50">
            <div className="mb-20 text-center">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                    The CadPay Ecosystem
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
                    The 4 Core Pillars
                </p>
            </div>

            {/* Cards Section - Horizontal Layout */}
            <div className="relative w-full max-w-7xl mx-auto mb-32">
                {/* Desktop: Cards in horizontal row, evenly spaced */}
                <div className="hidden md:flex flex-row items-stretch justify-center gap-6 md:gap-8 relative z-50">
                    {cadpayFeatures.map((feature, index) => (
                        <div 
                            key={feature.id} 
                            className="relative flex-1 max-w-[280px] hover:z-[60] transition-all duration-300"
                            style={{ zIndex: 50 + index }}
                        >
                            <Card 
                                feature={feature} 
                                onClick={() => setSelectedId(feature.id)} 
                                isSelected={selectedId === feature.id}
                            />
                        </div>
                    ))}
                </div>

                {/* Mobile: Grid Layout */}
                <div className="md:hidden grid grid-cols-1 gap-6 relative z-50">
                    {cadpayFeatures.map((feature) => (
                        <Card 
                            key={feature.id}
                            feature={feature} 
                            onClick={() => setSelectedId(feature.id)} 
                            isSelected={selectedId === feature.id}
                        />
                    ))}
                </div>
            </div>

            {/* Lazorkit Section */}
            <div className="relative z-50 mt-32 mb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                            Powered by Lazorkit
                        </h3>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                        <p className="text-zinc-300 text-lg md:text-xl leading-relaxed text-center">
                            Lazorkit is the advanced Account Abstraction (AA) SDK for the Solana blockchain. It serves as the hidden engine inside CadPay, replacing complex crypto standards with familiar Web2 experiences.
                        </p>
                        <p className="text-zinc-400 text-base md:text-lg leading-relaxed text-center mt-6">
                            It powers our Passkey integration (allowing users to log in with biometrics instead of passwords) and manages our Session Keys (allowing decentralized apps to perform automated tasks like recurring payments securely). Lazorkit bridges the gap between the raw power of Solana and the smooth user experience of modern fintech.
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Modal via Portal */}
            <ModalPortal>
                <AnimatePresence>
                    {selectedId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
                            onClick={() => setSelectedId(null)}
                        >
                            <motion.div
                                layoutId={selectedId}
                                className="bg-[#1c1209] w-full max-w-lg md:max-w-2xl max-h-[85vh] md:max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            >
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-orange-500 hover:text-black transition-colors z-20"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>

                                <div className="relative h-48 md:h-64 w-full flex-shrink-0">
                                    <Image
                                        src={cadpayFeatures.find(f => f.id === selectedId)?.image || ''}
                                        alt="Feature"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 672px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1209] to-transparent" />
                                </div>

                                <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1">
                                    <motion.h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                        {cadpayFeatures.find(f => f.id === selectedId)?.headline}
                                    </motion.h3>
                                    <motion.p className="text-zinc-300 text-base md:text-lg leading-relaxed">
                                        {cadpayFeatures.find(f => f.id === selectedId)?.fullDescription}
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

function Card({ 
    feature, 
    onClick, 
    isSelected 
}: {
    feature: Feature;
    onClick: () => void;
    isSelected?: boolean;
}) {
    return (
        <motion.div
            layoutId={feature.id}
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -8 }}
            initial={false}
            animate={{ opacity: 1 }}
            className="relative cursor-pointer group h-[420px] md:h-[450px] w-full"
        >
            {/* Arrow Icon - Top Right Corner */}
            <div className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300">
                <ArrowUpRight size={18} className="text-white group-hover:text-black" />
            </div>

            {/* Card Content */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl group-hover:shadow-orange-500/30 group-hover:border-orange-500/50 transition-all duration-300">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={feature.image}
                        alt={feature.headline}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 280px"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    {/* Title Badge */}
                    <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-zinc-800/80 backdrop-blur-sm rounded-full text-xs font-semibold text-orange-500 uppercase tracking-wide">
                            {feature.id === 'biometric' ? 'Biometric Account Abstraction' :
                             feature.id === 'autosettlement' ? 'Auto-Settlement Engine' :
                             feature.id === 'infrastructure' ? 'Hyper-Scale Infrastructure' :
                             'Programmable Commerce SDK'}
                        </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-3 leading-tight line-clamp-2">
                        {feature.headline}
                    </h3>

                    {/* Preview Description */}
                    <p className="text-zinc-300 text-sm md:text-base leading-relaxed line-clamp-3 mb-4">
                        {feature.description}
                    </p>

                    {/* Read More Indicator */}
                    <div className="flex items-center gap-2 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Read more</span>
                        <ArrowUpRight size={16} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
