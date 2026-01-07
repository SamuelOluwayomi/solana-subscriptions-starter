'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, LockKey, GenderMale, GenderFemale, Camera, Check } from '@phosphor-icons/react';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: (data: { username: string; pin: string; gender: string; avatar: string }) => void;
}

const AVATAR_OPTIONS = [
    '👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓',
    '👨‍💻', '👩‍💻', '🧙‍♂️', '🧙‍♀️', '🦸‍♂️', '🦸‍♀️', '🧑‍🚀', '👨‍🚀'
];

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [gender, setGender] = useState('');
    const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);

    const handleComplete = () => {
        if (username && pin && pin === confirmPin && gender && avatar) {
            onComplete({ username, pin, gender, avatar });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full"
            >
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome to CadPay! 👋</h2>
                    <p className="text-zinc-400">Let's set up your profile</p>
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-orange-500' : 'bg-zinc-800'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Step 1: Username */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Choose a username</label>
                            <div className="relative">
                                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe"
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => username && setStep(2)}
                            disabled={!username}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                        >
                            Continue
                        </button>
                    </motion.div>
                )}

                {/* Step 2: PIN */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Create a 4-digit PIN</label>
                            <div className="relative">
                                <LockKey size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => e.target.value.length <= 4 && setPin(e.target.value)}
                                    placeholder="••••"
                                    maxLength={4}
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-orange-500/50"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">This PIN will be required for all payments</p>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Confirm PIN</label>
                            <div className="relative">
                                <LockKey size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="password"
                                    value={confirmPin}
                                    onChange={(e) => e.target.value.length <= 4 && setConfirmPin(e.target.value)}
                                    placeholder="••••"
                                    maxLength={4}
                                    className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                            {confirmPin && pin !== confirmPin && (
                                <p className="text-xs text-red-400 mt-2">PINs don't match</p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => pin.length === 4 && pin === confirmPin && setStep(3)}
                                disabled={pin.length !== 4 || pin !== confirmPin}
                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Gender */}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-4">Select your gender</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setGender('male')}
                                    className={`p-6 rounded-xl border-2 transition-all ${gender === 'male'
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <GenderMale size={48} className={`mx-auto mb-2 ${gender === 'male' ? 'text-orange-500' : 'text-zinc-500'}`} />
                                    <p className="text-white font-medium">Male</p>
                                </button>
                                <button
                                    onClick={() => setGender('female')}
                                    className={`p-6 rounded-xl border-2 transition-all ${gender === 'female'
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <GenderFemale size={48} className={`mx-auto mb-2 ${gender === 'female' ? 'text-orange-500' : 'text-zinc-500'}`} />
                                    <p className="text-white font-medium">Female</p>
                                </button>
                                <button
                                    onClick={() => setGender('other')}
                                    className={`col-span-2 p-4 rounded-xl border-2 transition-all ${gender === 'other'
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <p className="text-white font-medium">Prefer not to say</p>
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => gender && setStep(4)}
                                disabled={!gender}
                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Avatar */}
                {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-4">Choose your avatar</label>
                            <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2">
                                {AVATAR_OPTIONS.map((av) => (
                                    <button
                                        key={av}
                                        onClick={() => setAvatar(av)}
                                        className={`p-4 rounded-xl border-2 text-4xl transition-all ${avatar === av
                                            ? 'border-orange-500 bg-orange-500/10 scale-110'
                                            : 'border-white/10 hover:border-white/20 hover:scale-105'
                                            }`}
                                    >
                                        {av}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(3)}
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleComplete}
                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={20} weight="bold" />
                                Complete Setup
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
