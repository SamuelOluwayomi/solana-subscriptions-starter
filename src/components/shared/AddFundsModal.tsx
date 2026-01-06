'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Bank, Check } from '@phosphor-icons/react';

interface AddFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    loading: boolean;
}

export default function AddFundsModal({ isOpen, onClose, onConfirm, loading }: AddFundsModalProps) {
    const [step, setStep] = useState<'amount' | 'card' | 'processing'>('amount');
    const [amount, setAmount] = useState('1.00');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const handleConfirm = async () => {
        setStep('processing');
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        onConfirm(parseFloat(amount));
        // Reset after successful transaction
        setTimeout(() => {
            setStep('amount');
            setAmount('1.00');
            setCardNumber('');
            setExpiry('');
            setCvv('');
        }, 500);
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const chunks = cleaned.match(/.{1,4}/g) || [];
        return chunks.join(' ').substring(0, 19);
    };

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        }
        return cleaned;
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Add Funds</h2>
                                <button
                                    onClick={onClose}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Step: Amount */}
                            {step === 'amount' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Amount (SOL)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full px-4 py-4 bg-zinc-800 border border-white/10 rounded-xl text-2xl font-bold text-white focus:outline-none focus:border-orange-500/50"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">SOL</span>
                                        </div>
                                    </div>

                                    {/* Quick amounts */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {[0.5, 1, 2].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => setAmount(val.toString())}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                {val} SOL
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setStep('card')}
                                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                                    >
                                        Continue
                                    </button>
                                </motion.div>
                            )}

                            {/* Step: Card Details */}
                            {step === 'card' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-linear-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <CreditCard size={32} className="text-orange-400" />
                                            <Bank size={24} className="text-orange-400/60" />
                                        </div>
                                        <p className="text-sm text-orange-200/60 mb-2">Total Amount</p>
                                        <p className="text-3xl font-bold text-white">{amount} SOL</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">Card Number</label>
                                            <input
                                                type="text"
                                                placeholder="1234 5678 9012 3456"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 font-mono"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-zinc-400 mb-2">Expiry</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    value={expiry}
                                                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                                    className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-zinc-400 mb-2">CVV</label>
                                                <input
                                                    type="text"
                                                    placeholder="123"
                                                    maxLength={3}
                                                    value={cvv}
                                                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setStep('amount')}
                                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            disabled={!cardNumber || !expiry || !cvv}
                                            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                                        >
                                            Confirm Payment
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step: Processing */}
                            {step === 'processing' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <Check size={40} weight="bold" className="text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
                                    <p className="text-zinc-400 mb-6">Adding {amount} SOL to your wallet...</p>
                                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 2 }}
                                            className="h-full bg-linear-to-r from-orange-500 to-orange-600"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
