'use client';

import Link from 'next/link';
import { ChevronRight, Fingerprint, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 w-full z-50 transition-all duration-300">

                {/* Glass Background */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border-b border-white/5" />

                <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                    {/* LOGO */}
                    <Link href="/" className="font-black italic tracking-tighter text-xl text-white z-10 flex items-center gap-2">
                        <div className="w-6 h-6 bg-white text-black flex items-center justify-center rounded-sm not-italic">C</div>
                        CADPAY
                    </Link>

                    {/* DESKTOP LINKS (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink href="/mechanism">The Bridge</NavLink>
                        <NavLink href="/merchants">For Merchants</NavLink>
                        <NavLink href="/engine">Lazorkit Engine</NavLink>
                    </div>

                    {/* DESKTOP ACTIONS (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-6 z-10">
                        <Link href="/signin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link href="/create" className="group flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all">
                            <Fingerprint size={14} className="text-zinc-600" />
                            Create Wallet
                        </Link>
                    </div>

                    {/* MOBILE TOGGLE (Visible ONLY on Mobile) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white z-50 relative"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU DRAWER */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6 text-lg font-medium">
                            <MobileLink href="/mechanism" onClick={() => setIsOpen(false)}>The Bridge</MobileLink>
                            <MobileLink href="/merchants" onClick={() => setIsOpen(false)}>For Merchants</MobileLink>
                            <MobileLink href="/engine" onClick={() => setIsOpen(false)}>Lazorkit Engine</MobileLink>
                            <hr className="border-white/10" />
                            <MobileLink href="/signin" onClick={() => setIsOpen(false)}>Log In</MobileLink>
                            <Link
                                href="/create"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 bg-white text-black px-4 py-3 rounded-full font-bold"
                            >
                                <Fingerprint size={18} />
                                Create Smart Wallet
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            {children}
        </Link>
    );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="text-zinc-300 hover:text-white border-b border-white/5 pb-4"
        >
            {children}
        </Link>
    );
}