'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Fingerprint, ShieldCheck } from '@phosphor-icons/react';
import { ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';
import { useLazorkit } from '@/hooks/useLazorkit';

export default function SignIn() {
    const { loginWithPasskey, loading } = useLazorkit();

    return (
        <div className="min-h-screen bg-[#1c1209] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

            {/* BACKGROUND ELEMENTS (Matches your About Section) */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-orange-500/50 to-transparent shadow-[0_0_20px_rgba(249,115,22,0.4)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-orange-500/10 via-[#1c1209] to-[#1c1209]" />

            {/* GRID FLOOR (Subtle texture) */}
            <div className="absolute bottom-0 w-[200%] h-[50vh] bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.03)_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] transform-[perspective(500px)_rotateX(60deg)] pointer-events-none origin-bottom opacity-20" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                {/* NAV BACK */}
                <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-orange-400 mb-8 transition-colors text-sm font-medium group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
                </Link>

                {/* LOGIN CARD */}
                <div className="bg-zinc-900/80 backdrop-blur-lg border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-orange-500/20 rounded-2xl flex items-center justify-center"
                    >
                        <ShoppingBag size={40} className="text-orange-500" weight="bold" />
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Welcome Back</h1>
                    <p className="text-sm md:text-base text-zinc-400 mb-8 text-center px-4">
                        Authenticate with your device biometric
                    </p>

                    {/* WebAuthn Badge */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <ShieldCheck size={16} className="text-green-400" weight="bold" />
                        <span className="text-xs md:text-sm text-green-400 font-medium">Secured by WebAuthn</span>
                    </div>

                    {/* Auth Button */}
                    <button
                        onClick={loginWithPasskey}
                        disabled={loading}
                        className="w-full py-3 md:py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                    >
                        <Fingerprint size={24} weight="bold" />
                        Authenticate with Biometrics
                    </button>

                    {/* Security Info */}
                    <div className="mt-8 p-4 bg-zinc-800/50 rounded-xl border border-white/5">
                        <p className="text-xs md:text-sm text-zinc-400 text-center px-2">
                            🔒 Your wallet is secured by your device's biometric hardware. Touch ID, Face ID or PIN required.
                        </p>
                    </div>

                    {/* Create Wallet Link */}
                    <p className="text-xs md:text-sm text-center text-zinc-500 mt-6">
                        No account?{' '}
                        <a href="/create" className="text-orange-500 hover:text-orange-400 font-medium">
                            Create Smart Wallet
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
