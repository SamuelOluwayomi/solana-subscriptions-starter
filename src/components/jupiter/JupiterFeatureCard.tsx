'use client';

import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import JupiterSwapModal from '../jupiter/JupiterSwapModal';

export default function JupiterFeatureCard() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative group"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-linear-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />

                {/* Card */}
                <div className="relative bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                            Protocol Integration
                        </span>
                    </div>

                    {/* Icon */}
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                        Jupiter Auto-Swap
                    </h3>

                    <p className="text-gray-400 mb-6 leading-relaxed">
                        Integrate with <span className="text-yellow-400 font-semibold">Jupiter DEX aggregator</span> for
                        automatic token swaps. Subscribe to auto-convert USDC → SOL monthly with the best rates, all gasless.
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                            Best swap rates via aggregation
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                            Gasless transactions (sponsored)
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                            Automated monthly swaps
                        </li>
                    </ul>

                    {/* CTA Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full py-3 bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-500/50"
                    >
                        Try Jupiter Swap
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Jupiter Logo Credit */}
                    <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Powered by</span>
                        <span className="text-sm font-bold bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            Jupiter Aggregator
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Swap Modal */}
            <JupiterSwapModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSwapSuccess={(signature) => {
                    console.log('✅ Swap successful!', signature);
                }}
            />
        </>
    );
}
