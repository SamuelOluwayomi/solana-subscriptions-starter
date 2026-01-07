'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, LockKey, GenderMale, GenderFemale, Camera, Check } from '@phosphor-icons/react';

interface FullProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfile: {
        username: string;
        gender: string;
        avatar: string;
    };
    onSave: (profile: { username: string; pin?: string; gender: string; avatar: string }) => void;
}

const AVATAR_OPTIONS = [
    '👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓',
    '👨‍💻', '👩‍💻', '🧙‍♂️', '🧙‍♀️', '🦸‍♂️', '🦸‍♀️', '🧑‍🚀', '👨‍🚀'
];

export default function FullProfileEditModal({ isOpen, onClose, currentProfile, onSave }: FullProfileEditModalProps) {
    const [activeTab, setActiveTab] = useState<'basic' | 'security' | 'avatar'>('basic');
    const [username, setUsername] = useState(currentProfile.username);
    const [gender, setGender] = useState(currentProfile.gender);
    const [avatar, setAvatar] = useState(currentProfile.avatar);
    const [changePIN, setChangePIN] = useState(false);
    const [currentPIN, setCurrentPIN] = useState('');
    const [newPIN, setNewPIN] = useState('');
    const [confirmPIN, setConfirmPIN] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setUsername(currentProfile.username);
            setGender(currentProfile.gender);
            setAvatar(currentProfile.avatar);
            setChangePIN(false);
            setCurrentPIN('');
            setNewPIN('');
            setConfirmPIN('');
            setError('');
        }
    }, [isOpen, currentProfile]);

    const handleSave = () => {
        // Validate username
        if (!username.trim()) {
            setError('Username cannot be empty');
            return;
        }

        // Validate PIN change if requested
        if (changePIN) {
            const storedPIN = localStorage.getItem('userPIN');
            if (currentPIN !== storedPIN) {
                setError('Current PIN is incorrect');
                return;
            }
            if (newPIN.length !== 4) {
                setError('New PIN must be 4 digits');
                return;
            }
            if (newPIN !== confirmPIN) {
                setError('PINs do not match');
                return;
            }
            // Save new PIN
            localStorage.setItem('userPIN', newPIN);
        }

        // Save profile
        onSave({
            username: username.trim(),
            gender,
            avatar,
            ...(changePIN && { pin: newPIN })
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-zinc-800/50 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'basic'
                                ? 'bg-orange-500 text-white'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Basic Info
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'security'
                                ? 'bg-orange-500 text-white'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab('avatar')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'avatar'
                                ? 'bg-orange-500 text-white'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Avatar
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Username</label>
                                <div className="relative">
                                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            setError('');
                                        }}
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Gender</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setGender('male')}
                                        className={`p-4 rounded-xl border-2 transition-all ${gender === 'male'
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <GenderMale size={32} className={`mx-auto ${gender === 'male' ? 'text-orange-500' : 'text-zinc-500'}`} />
                                        <p className="text-xs text-white mt-2">Male</p>
                                    </button>
                                    <button
                                        onClick={() => setGender('female')}
                                        className={`p-4 rounded-xl border-2 transition-all ${gender === 'female'
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <GenderFemale size={32} className={`mx-auto ${gender === 'female' ? 'text-orange-500' : 'text-zinc-500'}`} />
                                        <p className="text-xs text-white mt-2">Female</p>
                                    </button>
                                    <button
                                        onClick={() => setGender('other')}
                                        className={`p-4 rounded-xl border-2 transition-all ${gender === 'other'
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <User size={32} className={`mx-auto ${gender === 'other' ? 'text-orange-500' : 'text-zinc-500'}`} />
                                        <p className="text-xs text-white mt-2">Other</p>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                                <div>
                                    <p className="text-sm font-medium text-white">Change PIN</p>
                                    <p className="text-xs text-zinc-500">Update your payment PIN</p>
                                </div>
                                <button
                                    onClick={() => setChangePIN(!changePIN)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${changePIN
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-zinc-700 text-zinc-300'
                                        }`}
                                >
                                    {changePIN ? 'Cancel' : 'Change'}
                                </button>
                            </div>

                            {changePIN && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Current PIN</label>
                                        <input
                                            type="password"
                                            value={currentPIN}
                                            onChange={(e) => e.target.value.length <= 4 && setCurrentPIN(e.target.value)}
                                            maxLength={4}
                                            placeholder="••••"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-orange-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">New PIN</label>
                                        <input
                                            type="password"
                                            value={newPIN}
                                            onChange={(e) => e.target.value.length <= 4 && setNewPIN(e.target.value)}
                                            maxLength={4}
                                            placeholder="••••"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-orange-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Confirm New PIN</label>
                                        <input
                                            type="password"
                                            value={confirmPIN}
                                            onChange={(e) => e.target.value.length <= 4 && setConfirmPIN(e.target.value)}
                                            maxLength={4}
                                            placeholder="••••"
                                            className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-orange-500/50"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Avatar Tab */}
                    {activeTab === 'avatar' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="grid grid-cols-4 gap-3 max-h-80 overflow-y-auto p-2">
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
                        </motion.div>
                    )}

                    {/* Save Button */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={20} weight="bold" />
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
