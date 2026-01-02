'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ScanFace, QrCode, Copy, Check, Plus, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';
import { SiNetflix, SiSpotify } from "react-icons/si";
import { useState, useEffect } from 'react';

// The 8 Phases of the User Journey
type Phase =
  | 'intro'       // Welcome
  | 'auth-choice' // FaceID or TouchID?
  | 'scanning'    // Biometric Action
  | 'dash-empty'  // $0.00
  | 'fund-action' // Show QR/Address
  | 'dash-funded' // $500.00
  | 'connecting'  // Linking Apps
  | 'dash-final'; // Active Subscriptions Manager

export default function LaptopHero() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile to optimize animations
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let mounted = true;

    const runSequence = async () => {
      while (mounted) {
        // 1. INTRO
        setPhase('intro');
        await wait(2500);

        // 2. CHOOSE AUTH
        if (!mounted) return;
        setPhase('auth-choice');
        await wait(2000);

        // 3. SCANNING
        if (!mounted) return;
        setPhase('scanning');
        await wait(3000);

        // 4. DASHBOARD (EMPTY)
        if (!mounted) return;
        setPhase('dash-empty');
        await wait(2500);

        // 5. FUNDING INSTRUCTION
        if (!mounted) return;
        setPhase('fund-action');
        await wait(3000);

        // 6. DASHBOARD (FUNDED)
        if (!mounted) return;
        setPhase('dash-funded');
        await wait(2500);

        // 7. CONNECTING APPS
        if (!mounted) return;
        setPhase('connecting');
        await wait(3500);

        // 8. FINAL MANAGER VIEW
        if (!mounted) return;
        setPhase('dash-final');
        await wait(6000);
      }
    };

    runSequence();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="relative min-h-dvh w-full overflow-hidden bg-black text-white pt-24 md:pt-36 pb-20 perspective-[2000px]">

      {/* 1. OPTIMIZED BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* Only play video on desktop/strong connections if possible, otherwise CSS gradient */}
        <video
          autoPlay loop muted playsInline
          className="w-full h-full object-cover opacity-40 md:opacity-50"
          poster="/hero-bg-poster.jpg"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center h-full">

        {/* LEFT: Content (Mobile Optimized) */}
        <div className="flex flex-col gap-6 md:gap-8 text-center lg:text-left pt-10 lg:pt-0">

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 w-fit backdrop-blur-md mx-auto lg:mx-0"
          >
          </motion.div>

          <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white">
            Your face is your <br />
            <span className="text-indigo-400">Private Key.</span>
          </h1>

          <p className="text-base md:text-lg text-zinc-400 max-w-lg leading-relaxed mx-auto lg:mx-0">
            CadPay is the operating system for recurring on-chain revenue.
            Replace seed phrases with device biometrics and automate billing instantly.
          </p>

          <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
            <button className="px-8 py-3.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2">
              <Fingerprint size={16} /> Start Demo
            </button>
          </div>
        </div>

        {/* RIGHT: The Laptop (SCALED FOR MOBILE) */}
        <div className="relative w-full flex justify-center perspective-[1000px]">
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1 }}
            // MAGIC FIX: Scale down on mobile using Tailwind classes
            className="relative w-[120%] -mx-6 sm:w-full sm:mx-0 max-w-[650px] origin-top transform scale-[0.9] sm:scale-100 md:scale-100 lg:scale-110"
          >
            {/* LAPTOP CHASSIS */}
            <div className="relative bg-[#111] rounded-t-3xl border border-zinc-800 shadow-2xl overflow-hidden aspect-3/4 md:aspect-16/10 ring-1 ring-white/10">

              {/* SCREEN CONTENT */}
              <div className="absolute inset-0 bg-[#09090b] flex flex-col font-sans overflow-hidden">

                {/* Fake OS Header */}
                <div className="h-8 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-900/50 z-20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                    <ShieldCheck size={10} /> cadpay_secure_enclave
                  </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-8">
                  <AnimatePresence mode='wait'>

                    {/* 1. INTRO */}
                    {phase === 'intro' && (
                      <motion.div
                        key="intro"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center space-y-4"
                      >
                        <div className="w-16 h-16 bg-white rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-white/10">
                          <span className="font-black italic text-3xl text-black">C</span>
                        </div>
                        <h2 className="text-2xl font-bold">Welcome to CadPay</h2>
                        <p className="text-zinc-500 text-sm">Secure. Seamless. Solana.</p>
                      </motion.div>
                    )}

                    {/* 2. AUTH CHOICE */}
                    {phase === 'auth-choice' && (
                      <motion.div
                        key="auth"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="text-center space-y-6 w-full max-w-xs"
                      >
                        <h3 className="text-lg font-bold">Create Smart Wallet</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl flex flex-col items-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer group">
                            <ScanFace size={32} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Face ID</span>
                          </div>
                          <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl flex flex-col items-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer group">
                            <Fingerprint size={32} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Touch ID</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 3. SCANNING */}
                    {phase === 'scanning' && (
                      <motion.div
                        key="scan"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-6"
                      >
                        <div className="relative">
                          <ScanFace size={64} className="text-white" />
                          <motion.div
                            animate={{ height: ["0%", "100%", "0%"] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 w-full bg-indigo-500/30 blur-sm border-b-2 border-indigo-400"
                          />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold">Verifying Biometrics</span>
                          <span className="text-xs text-zinc-500 font-mono">Generating Keypair...</span>
                        </div>
                      </motion.div>
                    )}

                    {/* 4. DASHBOARD (EMPTY) */}
                    {phase === 'dash-empty' && (
                      <DashboardFrame balance="0.00" status="Active">
                        <div className="mt-8 flex flex-col items-center justify-center h-32 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-600 gap-2">
                          <Wallet size={24} />
                          <span className="text-xs">No funds available</span>
                        </div>
                        <motion.button
                          animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                          className="mt-4 w-full py-3 bg-indigo-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <Plus size={16} /> Fund Account
                        </motion.button>
                      </DashboardFrame>
                    )}

                    {/* 5. FUNDING INSTRUCTION */}
                    {phase === 'fund-action' && (
                      <motion.div
                        key="fund-action"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="w-full max-w-xs bg-zinc-900 border border-white/10 rounded-xl p-6 text-center shadow-2xl"
                      >
                        <div className="text-sm font-bold mb-4">Deposit SOL / USDC</div>
                        <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 p-2">
                          <QrCode className="w-full h-full text-black" />
                        </div>
                        <div className="flex items-center justify-between bg-black/50 p-2 rounded-lg border border-white/5">
                          <span className="text-[10px] font-mono text-zinc-400">0x7F...9A2B</span>
                          <Copy size={12} className="text-zinc-500" />
                        </div>
                        <div className="mt-4 text-xs text-emerald-400 animate-pulse">Incoming Transfer Detected...</div>
                      </motion.div>
                    )}

                    {/* 6. DASHBOARD (FUNDED) */}
                    {phase === 'dash-funded' && (
                      <DashboardFrame balance="500.00" status="Funded">
                        <motion.div
                          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                          className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <ArrowRight size={16} className="text-emerald-500 rotate-45" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Deposit Received</div>
                            <div className="text-[10px] text-zinc-500">Just now</div>
                          </div>
                          <div className="ml-auto font-mono text-emerald-400 text-sm">+$500.00</div>
                        </motion.div>
                      </DashboardFrame>
                    )}

                    {/* 7. CONNECTING APPS */}
                    {phase === 'connecting' && (
                      <motion.div
                        key="connecting"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="w-full max-w-xs space-y-4"
                      >
                        <h3 className="text-center text-sm font-bold text-zinc-400 mb-2">Linking Subscriptions</h3>

                        <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <SiNetflix size={20} className="text-[#E50914]" />
                            <span className="text-sm font-bold">Netflix</span>
                          </div>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check size={12} className="text-black" /></div>
                          </motion.div>
                        </div>

                        <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <SiSpotify size={20} className="text-[#1DB954]" />
                            <span className="text-sm font-bold">Spotify</span>
                          </div>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }}>
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check size={12} className="text-black" /></div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* 8. FINAL MANAGER VIEW */}
                    {phase === 'dash-final' && (
                      <DashboardFrame balance="467.01" status="Active">
                        <div className="mt-4 space-y-2">
                          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Active Subscriptions</div>

                          <div className="p-3 bg-zinc-800/50 rounded-lg flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-3">
                              <SiNetflix size={16} className="text-[#E50914]" />
                              <div>
                                <div className="text-xs font-bold">Netflix</div>
                                <div className="text-[10px] text-zinc-500">Next: Aug 24</div>
                              </div>
                            </div>
                            <div className="text-xs font-mono">-$19.99</div>
                          </div>

                          <div className="p-3 bg-zinc-800/50 rounded-lg flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-3">
                              <SiSpotify size={16} className="text-[#1DB954]" />
                              <div>
                                <div className="text-xs font-bold">Spotify</div>
                                <div className="text-[10px] text-zinc-500">Next: Aug 28</div>
                              </div>
                            </div>
                            <div className="text-xs font-mono">-$12.99</div>
                          </div>

                          <div className="mt-4 pt-2 border-t border-white/5 flex gap-2">
                            <button className="flex-1 py-2 bg-zinc-800 rounded-lg text-[10px] font-bold hover:bg-zinc-700 transition-colors">
                              Add New
                            </button>
                            <button className="flex-1 py-2 bg-zinc-800 rounded-lg text-[10px] font-bold hover:bg-zinc-700 transition-colors">
                              History
                            </button>
                          </div>
                        </div>
                      </DashboardFrame>
                    )}

                  </AnimatePresence>
                </div>
              </div>

            </div>
            {/* BASE */}
            <div className="h-3 bg-[#1a1a1a] rounded-b-xl mx-4 shadow-xl border-t border-black" />
          </motion.div>
        </div>

      </div>
    </section>
  );
}

// --- SUB-COMPONENTS ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function DashboardFrame({ children, balance, status }: { children: React.ReactNode, balance: string, status: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm"
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-zinc-800/50 p-6 border-b border-white/5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-zinc-400 font-medium">Wallet Balance</span>
            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {status}
            </div>
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">${balance}</div>
        </div>
        {/* Body */}
        <div className="p-4 bg-black/20">
          {children}
        </div>
      </div>
    </motion.div>
  )
}