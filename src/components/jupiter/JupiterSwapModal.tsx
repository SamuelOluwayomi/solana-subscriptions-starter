'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { useJupiterSwap } from '@/hooks/useJupiterSwap';

interface JupiterSwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwapSuccess?: (signature: string) => void;
}

export default function JupiterSwapModal({ isOpen, onClose, onSwapSuccess }: JupiterSwapModalProps) {
    const [inputAmount, setInputAmount] = useState('10');
    const [slippage, setSlippage] = useState(0.5); // 0.5%

    const {
        isFetchingQuote,
        isExecuting,
        error,
        quote,
        outputAmount,
        exchangeRate,
        fetchQuote,
        executeSwap,
        clearError,
    } = useJupiterSwap();

    // Auto-fetch quote when amount changes
    useEffect(() => {
        if (isOpen && inputAmount && parseFloat(inputAmount) > 0) {
            const timer = setTimeout(() => {
                fetchQuote({
                    inputAmount: parseFloat(inputAmount),
                    slippageBps: slippage * 100, // Convert to basis points
                });
            }, 500); // Debounce

            return () => clearTimeout(timer);
        }
    }, [inputAmount, slippage, isOpen]);

    const handleSwap = async () => {
        if (!quote) return;

        const signature = await executeSwap(quote);
        if (signature) {
            onSwapSuccess?.(signature);
            setTimeout(() => {
                onClose();
                setInputAmount('10');
                clearError();
            }, 2000);
        }
    };

    const handleRefreshQuote = () => {
        if (inputAmount && parseFloat(inputAmount) > 0) {
            fetchQuote({
                inputAmount: parseFloat(inputAmount),
                slippageBps: slippage * 100,
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-linear-to-br from-yellow-400 to-orange-500 rounded-lg">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Jupiter Swap</h2>
                                        <p className="text-sm text-gray-400">Powered by Jupiter Aggregator</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4">
                                {/* Input Token */}
                                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                    <label className="text-sm text-gray-400 mb-2 block">You Pay</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={inputAmount}
                                            onChange={(e) => setInputAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="flex-1 bg-transparent text-2xl font-bold text-white outline-none"
                                            min="0"
                                            step="0.01"
                                        />
                                        <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                $
                                            </div>
                                            <span className="font-semibold text-white">USDC</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Swap Arrow */}
                                <div className="flex justify-center">
                                    <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
                                        <ArrowDown className="w-5 h-5 text-yellow-400" />
                                    </div>
                                </div>

                                {/* Output Token */}
                                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                    <label className="text-sm text-gray-400 mb-2 block">You Receive (estimated)</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 text-2xl font-bold text-white">
                                            {isFetchingQuote ? (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    <span className="text-lg">Fetching...</span>
                                                </div>
                                            ) : outputAmount ? (
                                                outputAmount.toFixed(6)
                                            ) : (
                                                '0.000000'
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
                                            <div className="w-6 h-6 bg-linear-to-br from-purple-500 to-blue-500 rounded-full" />
                                            <span className="font-semibold text-white">SOL</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quote Info */}
                                {quote && !isFetchingQuote && (
                                    <div className="bg-gray-800/30 rounded-lg p-3 space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Rate</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">
                                                    1 USDC ≈ {exchangeRate?.toFixed(6)} SOL
                                                </span>
                                                <button
                                                    onClick={handleRefreshQuote}
                                                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                                                    disabled={isFetchingQuote}
                                                >
                                                    <RefreshCw className={`w-3 h-3 text-gray-400 ${isFetchingQuote ? 'animate-spin' : ''}`} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Price Impact</span>
                                            <span className="text-green-400">{quote.priceImpactPct}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Slippage Tolerance</span>
                                            <span className="text-white">{slippage}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Network Fee</span>
                                            <span className="text-green-400 font-medium">🎉 FREE (Gasless)</span>
                                        </div>
                                    </div>
                                )}

                                {/* Error Display */}
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm text-red-400 font-medium">Swap Failed</p>
                                            <p className="text-xs text-red-300 mt-1">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Swap Button */}
                                <button
                                    onClick={handleSwap}
                                    disabled={!quote || isExecuting || isFetchingQuote || !inputAmount}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!quote || isExecuting || isFetchingQuote || !inputAmount
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-linear-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg hover:shadow-yellow-500/50'
                                        }`}
                                >
                                    {isExecuting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Swapping...
                                        </span>
                                    ) : isFetchingQuote ? (
                                        'Fetching Quote...'
                                    ) : !quote ? (
                                        'Enter Amount'
                                    ) : (
                                        'Swap (Gasless)'
                                    )}
                                </button>

                                {/* Info */}
                                <p className="text-xs text-center text-gray-500">
                                    ⚡ Powered by Jupiter • 🚀 Transaction sponsored by Lazorkit
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
