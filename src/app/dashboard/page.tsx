'use client';

import { motion } from 'framer-motion';
import { useLazorkit } from '@/hooks/useLazorkit'; // Assuming we'll expose wallet info here
import { Copy, Plus, ArrowRight, CreditCard } from '@phosphor-icons/react';
import { SiSolana } from 'react-icons/si';

export default function Dashboard() {
    const { address, loading, balance, requestAirdrop } = useLazorkit();
    const walletAddress = address || "Loading...";
    const displayBalance = balance !== null ? balance.toFixed(4) : "0.00";

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-black font-black text-xl">C</div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-[#1c1c1c] rounded-full border border-white/5 flex items-center gap-2 text-sm text-zinc-400">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Devnet
                        </div>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Wallet Card */}
                    <div className="md:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-linear-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <SiSolana size={120} />
                            </div>

                            <div className="relative z-10">
                                <p className="text-zinc-400 mb-2">Total Balance</p>
                                <h2 className="text-5xl font-bold mb-8">
                                    {displayBalance} <span className="text-zinc-500 text-2xl font-normal">SOL</span>
                                </h2>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={requestAirdrop}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                    >
                                        <Plus weight="bold" /> {loading ? 'Requesting...' : 'Airdrop 1 SOL'}
                                    </button>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-colors">
                                        <ArrowRight weight="bold" /> Send
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Activity Placeholder */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                            <div className="bg-[#111] rounded-2xl p-8 text-center text-zinc-500 border border-white/5">
                                <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No transactions yet</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Profile / Address */}
                    <div className="space-y-6">
                        <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">Your Smart Wallet</h3>
                            <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-white/5 mb-4">
                                <span className="font-mono text-sm text-zinc-300 truncate w-32">{walletAddress}</span>
                                <button className="text-orange-500 hover:text-orange-400">
                                    <Copy size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                This wallet is secured by your device's biometric enclave. No seed phrase exists.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
