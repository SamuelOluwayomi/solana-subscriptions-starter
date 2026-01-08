'use client';

import { FingerprintIcon, ShieldCheckIcon, LightningIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useLazorkit } from '@/hooks/useLazorkit';
import { useState } from 'react';

export default function CreateAccount() {
    const { createPasskeyWallet, loading, isAuthenticated } = useLazorkit();
    const [isCreatingWallet, setIsCreatingWallet] = useState(false);

    const handleCreateWallet = async () => {
        setIsCreatingWallet(true);
        await createPasskeyWallet();
        // Will redirect to dashboard after creation
    };

    return (
        <div className="min-h-screen bg-[#1c1209] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Full screen loader overlay */}
            {isCreatingWallet && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-6" />
                        <p className="text-2xl font-bold text-white mb-2">Creating Your Wallet</p>
                        <p className="text-sm text-zinc-400">Please complete biometric authentication...</p>
                    </div>
                </div>
            )}

            {/* AMBER GLOW BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--tw-gradient-stops))] from-orange-900/20 via-[#1c1209] to-[#1c1209]" />
            <div className="absolute bottom-0 w-[200%] h-[50vh] bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.03)_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] transform-[perspective(500px)_rotateX(60deg)] pointer-events-none origin-bottom opacity-20" />

            {/* NAV BACK (Absolute top left) */}
            <div className="absolute top-8 left-8 z-20">
                <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all group">
                    <ArrowLeftIcon size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="w-full max-w-6xl relative z-10 grid md:grid-cols-2 gap-12 items-center">
                {/* LEFT SIDE: The "Why" */}
                <div>
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                        Forget seed phrases.<br />
                        <span className="text-orange-500">Forever.</span>
                    </h1>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        CadPay uses Lazorkit Account Abstraction to turn your device into a hardware wallet. Secure, recoverable, and instant.
                    </p>

                    <div className="space-y-4">
                        <FeatureRow
                            icon={<ShieldCheckIcon size={20} />}
                            title="Bank-Grade Security"
                            desc="Keys are stored in your device's Secure Enclave."
                        />
                        <FeatureRow
                            icon={<FingerprintIcon size={20} />}
                            title="Biometric Signatures"
                            desc="Approve transactions with a touch or glance."
                        />
                        <FeatureRow
                            icon={<LightningIcon size={20} />}
                            title="Gasless Transactions"
                            desc="All fees sponsored by Paymaster. You don't need SOL!"

                        />
                        <FeatureRow
                            icon={<LightningIcon size={20} />}
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
                            <FingerprintIcon className="text-orange-500" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Create Smart Wallet</h2>
                        <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">
                            We will create a passkey on this device. No passwords or seed phrases required.
                        </p>

                        {/* Gasless Badge */}
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                            <span className="text-xs font-bold text-orange-400">100% Gasless</span>
                            <span className="text-xs text-orange-200/60">• No SOL needed for fees</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateWallet}
                        disabled={loading || isCreatingWallet}
                        className="w-full relative group overflow-hidden bg-white text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            {isCreatingWallet ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    <span>Setting Up Your Wallet...</span>
                                </>
                            ) : (
                                <>
                                    <FingerprintIcon size={20} className="text-orange-600" />
                                    <span>Create Wallet with Passkey</span>
                                </>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-linear-to-r from-orange-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-zinc-500 mb-4">
                            Already have a wallet?{' '}
                            <Link href="/signin" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                                Sign In
                            </Link>
                        </p>
                        <div className="text-xs md:text-sm text-center text-zinc-500 mt-6">
                            <p>Are you a Merchant?{" "}<Link href="/merchant-auth" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                                <span className="text-orange-500 hover:text-orange-400 font-medium">Login to Portal</span>
                            </Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureRow({ icon, title, desc, highlight = false }: any) {
    return (
        <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${highlight
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-orange-500/10 border-orange-500/20'
                }`}>
                <div className={'text-orange-500'}>{icon}</div>
            </div>
            <div>
                <h3 className={`font-semibold mb-0.5 text-white`}>

                    {title}
                </h3>
                <p className={`text-sm text-zinc-500`}>
                    {desc}
                </p>
            </div>
        </div>
    );
}
