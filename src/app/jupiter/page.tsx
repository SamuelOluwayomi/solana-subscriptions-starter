'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ExternalLink, Code, Sparkles } from 'lucide-react';
import JupiterSwapModal from '@/components/jupiter/JupiterSwapModal';
import { useWallet } from '@lazorkit/wallet';
import { useRouter } from 'next/navigation';

export default function JupiterPage() {
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [swapHistory, setSwapHistory] = useState<string[]>([]);
    const { smartWalletPubkey } = useWallet();
    const router = useRouter();

    const handleSwapSuccess = (signature: string) => {
        setSwapHistory((prev) => [signature, ...prev]);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-950 sticky top-0 z-40 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg">Jupiter Integration</span>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-semibold text-orange-400 uppercase tracking-wider">
                            Example 1: Existing Protocol Integration
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                        Jupiter Auto-Swap
                    </h1>

                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
                        Demonstrate protocol integration by automatically swapping USDC to SOL using{' '}
                        <span className="text-orange-400 font-semibold">Jupiter DEX aggregator</span>. All
                        transactions are <span className="text-green-400 font-semibold">gasless</span> via Lazorkit.
                    </p>

                    {!smartWalletPubkey ? (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 max-w-xl mx-auto">
                            <p className="text-blue-400 mb-4">
                                🔐 Connect your wallet to try Jupiter swaps
                            </p>
                            <button
                                onClick={() => router.push('/create')}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
                            >
                                Create Wallet
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsSwapModalOpen(true)}
                            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-lg flex items-center gap-2 mx-auto transition-all"
                        >
                            <Zap className="w-5 h-5" />
                            Try Gasless Swap
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </motion.div>

                {/* What is Jupiter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-16"
                >
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                        </div>
                        What is Jupiter?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                            <h3 className="text-xl font-bold text-white mb-3">DEX Aggregator</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Jupiter is the leading DEX aggregator on Solana, routing your swaps through multiple
                                liquidity sources (Raydium, Orca, Serum, etc.) to find the best prices.
                            </p>
                        </div>

                        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                            <h3 className="text-xl font-bold text-white mb-3">Why Use It?</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">•</span>
                                    Best exchange rates across all Solana DEXs
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">•</span>
                                    Smart routing to minimize slippage
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">•</span>
                                    Most liquid trading on Solana
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                        <p className="text-orange-400 font-semibold mb-2">
                            🎯 How CadPay Integrates with Jupiter
                        </p>
                        <p className="text-gray-400">
                            CadPay uses Jupiter's API to fetch swap quotes and execute trades on behalf of users.
                            The Lazorkit paymaster sponsors all transaction fees, making swaps completely gasless for
                            end users.
                        </p>
                    </div>
                </motion.div>

                {/* Swap History */}
                {swapHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl font-bold mb-6">Recent Swaps</h2>
                        <div className="space-y-3">
                            {swapHistory.map((signature, index) => (
                                <div
                                    key={signature}
                                    className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-green-400 font-bold">✓</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">USDC → SOL Swap</p>
                                            <p className="text-sm text-gray-400 font-mono">
                                                {signature.slice(0, 8)}...{signature.slice(-8)}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-colors"
                                    >
                                        View on Explorer
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Technical Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <h2 className="text-3xl font-bold mb-6">How It Works</h2>
                    <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
                        <ol className="space-y-4">
                            {[
                                { step: 1, title: 'Fetch Quote', desc: 'Query Jupiter API for best USDC → SOL rate' },
                                { step: 2, title: 'Build Transaction', desc: 'Jupiter returns an optimized swap transaction' },
                                { step: 3, title: 'Sign & Execute', desc: 'Lazorkit signs transaction and sponsors gas fees' },
                                { step: 4, title: 'Confirm', desc: 'Swap completes on-chain, SOL deposited to your wallet' },
                            ].map((item) => (
                                <li key={item.step} className="flex gap-4">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0 font-bold text-white">
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-6 pt-6 border-t border-zinc-800">
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-orange-400" />
                                All swaps are gasless - CadPay sponsors your transaction fees!
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Swap Modal */}
            <JupiterSwapModal
                isOpen={isSwapModalOpen}
                onClose={() => setIsSwapModalOpen(false)}
                onSwapSuccess={handleSwapSuccess}
            />
        </div>
    );
}
