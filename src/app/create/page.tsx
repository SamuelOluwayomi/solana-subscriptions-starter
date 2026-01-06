'use client';

import { motion } from 'framer-motion';
import { Fingerprint, ShieldCheck, Lightning, ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';
import { useLazorkit } from '@/hooks/useLazorkit';

export default function CreateAccount() {
    const { createPasskeyWallet, loading, isAuthenticated } = useLazorkit();

    return (
        <div className="min-h-screen bg-[#1c1209] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

            {/* AMBER GLOW BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--tw-gradient-stops))] from-orange-900/20 via-[#1c1209] to-[#1c1209]" />
            <div className="absolute bottom-0 w-[200%] h-[50vh] bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.03)_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] transform-[perspective(500px)_rotateX(60deg)] pointer-events-none origin-bottom opacity-20" />

            {/* NAV BACK (Absolute top left) */}
            <div className="absolute top-8 left-8 z-20">
                <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-orange-400 transition-colors text-sm font-medium group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center relative z-10"
            >

                {/* LEFT SIDE: Value Prop (The "Why") */}
                <div className="space-y-8 hidden md:block">
                    <h1 className="text-5xl font-bold text-white leading-[1.1]">
                        Forget seed phrases. <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">
                            Forever.
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
                        CadPay uses Lazorkit Account Abstraction to turn your device into a hardware wallet. Secure, recoverable, and instant.
                    </p>

                    <div className="space-y-6 pt-4">
                        <FeatureRow
                            icon={<ShieldCheck size={20} />}
                            title="Bank-Grade Security"
                            desc="Keys are stored in your device's Secure Enclave."
                        />
                        <FeatureRow
                            icon={<Fingerprint size={20} />}
                            title="Biometric Signatures"
                            desc="Approve transactions with a touch or glance."
                        />
                        <FeatureRow
                            icon={<Lightning size={20} />}
                            title="Instant Onboarding"
                            desc="Deploy a Solana smart wallet in seconds."
                        />
                    </div>
                </div>

                {/* RIGHT SIDE: The Card (The "How") */}
                <div className="bg-[#120c07] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative">

                    {/* Existing Wallet Warning */}
                    {isAuthenticated && (
                        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                            <p className="text-sm text-orange-200 font-medium">
                                ℹ️ You already have a wallet. Creating a new one will disconnect your current wallet.
                            </p>
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                            <Fingerprint className="text-orange-500" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Create Smart Wallet</h2>
                        <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">
                            We will create a passkey on this device. No passwords or seed phrases required.
                        </p>
                    </div>

                    <button
                        onClick={createPasskeyWallet}
                        disabled={loading}
                        className="w-full py-4 text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:grayscale bg-orange-600 hover:bg-orange-500 shadow-orange-900/20"
                    >
                        {loading ? 'Deploying Wallet...' : 'Create Account'}
                    </button>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <div className="mb-4">
                            <p className="text-xs text-zinc-600 mb-2">Powered by</p>
                            <div className="inline-block px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                                Lazorkit SDK
                            </div>
                        </div>
                        <p className="text-xs text-zinc-400 mb-2">Already have a wallet?{' '}
                            <Link href="/signin" className="text-sm text-zinc-500 hover:text-white transition-colors">
                                Sign in
                            </Link>
                        </p>

                    </div>

                </div>

            </motion.div>
        </div>
    );
}

// Sub-component for the features list
function FeatureRow({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex gap-4 items-start group">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">{desc}</p>
            </div>
        </div>
    )
}
