'use client';

import { motion } from 'framer-motion';
import { ScanFace } from 'lucide-react';
import { ArrowLeft, Lock } from '@phosphor-icons/react';
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
                <div className="bg-[#120c07] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">


                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-zinc-400 text-sm">Authenticate with your device biometric.</p>
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                        onClick={loginWithPasskey}
                        disabled={loading}
                        className="w-full relative group overflow-hidden bg-white text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            {loading ? (
                                <span className="flex items-center gap-2"><Lock size={16} className="animate-spin" /> Verifying...</span>
                            ) : (
                                <>
                                    <ScanFace size={20} className="text-orange-600" />
                                    <span>Face ID/ Fingerprint Login</span>
                                </>
                            )}
                        </div>
                        {/* Hover Gradient Effect */}
                        <div className="absolute inset-0 bg-linear-to-r from-orange-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-zinc-500">
                            No account?{' '}
                            <Link href="/create" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                                Create Smart Wallet
                            </Link>
                        </p>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
