'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningIcon, CheckCircleIcon, SparkleIcon, ArrowRightIcon, WarningIcon } from '@phosphor-icons/react';
import { useWallet } from '@lazorkit/wallet';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { createConnectionWithRetry } from '@/utils/rpc';

interface GaslessDemoProps {
    solBalance: number;
}

export default function GaslessDemo({ solBalance }: GaslessDemoProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [txSignature, setTxSignature] = useState<string>('');
    const [error, setError] = useState<string>('');
    // @ts-ignore
    const { wallet, signAndSendTransaction } = useWallet();

    const handleTestTransaction = async () => {
        setIsProcessing(true);
        setError('');
        setShowSuccess(false);

        try {
            // Create a demo transaction - transfer 0 SOL to self (just to test gasless)
            const connection = await createConnectionWithRetry();

            if (!wallet?.smartWallet) {
                throw new Error('Wallet not connected');
            }

            const walletPubkey = new PublicKey(wallet.smartWallet);

            // Create a simple transaction that transfers 0 lamports to self
            // This proves gasless works even with 0 SOL
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: walletPubkey,
                    toPubkey: walletPubkey,
                    lamports: 0, // 0 transfer - just testing the gas sponsorship
                })
            );

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletPubkey;

            // @ts-ignore - Lazorkit handles the signing and gas sponsorship
            const signature = await signAndSendTransaction(transaction);

            setTxSignature(signature);
            setShowSuccess(true);

            // Auto-hide success after 10 seconds
            setTimeout(() => setShowSuccess(false), 10000);
        } catch (err: any) {
            console.error('Demo transaction failed:', err);
            setError(err.message || 'Transaction failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-linear-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -z-10" />

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                            <LightningIcon size={24} className="text-green-400" weight="fill" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Test Gasless Payments</h3>
                    </div>
                    <p className="text-sm text-zinc-400 max-w-xl">
                        Pay with <span className="text-green-400 font-semibold">USDC</span> without needing SOL for gas.
                        Like swiping a Visa card - you don't pay the "electricity fee" to the payment processor.
                    </p>
                </div>
            </div>

            {/* Balance Display */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* USDC Balance - What User Cares About */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Your USDC Balance</span>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                            <span className="text-[10px] font-bold text-green-400">READY TO SPEND</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl md:text-4xl font-black text-white">
                            50.00
                        </span>
                        <span className="text-zinc-500 text-lg font-medium mb-1">USDC</span>
                    </div>
                    <p className="text-xs text-green-200/60 mt-2 flex items-center gap-1.5">
                        <CheckCircleIcon size={14} weight="fill" />
                        This is all you need - no SOL required
                    </p>
                </div>

                {/* SOL Balance - Proof of Gasless */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">SOL Balance (Gas Money)</span>
                        <span className="text-[10px] px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 font-bold">
                            NOT NEEDED
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl md:text-4xl font-black text-green-400">
                            {solBalance.toFixed(4)}
                        </span>
                        <span className="text-zinc-500 text-lg font-medium mb-1">SOL</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
                        <SparkleIcon size={14} weight="fill" className="text-orange-400" />
                        Paymaster covers this automatically
                    </p>
                </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                    >
                        <WarningIcon size={20} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-6 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center shrink-0 border border-green-500/30">
                                <CheckCircleIcon size={28} weight="fill" className="text-green-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-green-400 mb-1">Transaction Successful! 🎉</h4>
                                <p className="text-sm text-green-200/80 mb-3">
                                    Your transaction was executed with <span className="font-bold">0 SOL balance</span>.
                                    The Paymaster sponsored the network fee automatically.
                                </p>
                                {txSignature && (
                                    <a
                                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs text-green-400 hover:text-green-300 transition-colors font-medium"
                                    >
                                        View on Solana Explorer
                                        <ArrowRightIcon size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CTA Button */}
            <button
                onClick={handleTestTransaction}
                disabled={isProcessing}
                className="w-full relative group overflow-hidden bg-linear-to-r from-green-500 to-emerald-500 text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
            >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            <span>Processing Gasless Transaction...</span>
                        </>
                    ) : (
                        <>
                            <LightningIcon size={20} weight="fill" />
                            <span>Execute Test Transaction</span>
                        </>
                    )}
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>

            {/* Info Footer */}
            <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-xs text-zinc-500 text-center">
                    <span className="text-green-400 font-semibold">How it works:</span> The Paymaster sees you want to transact.
                    It covers the ~$0.0002 SOL network fee. You never need to think about gas.
                </p>
            </div>
        </div>
    );
}
