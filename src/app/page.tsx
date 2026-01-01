'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from 'framer-motion';
import {
  Fingerprint,
  Zap,
  Clock,
  CreditCard,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  X,
  Wallet,
  TrendingUp,
  Plus,
  ArrowUpRight
} from 'lucide-react';

// --- Types & Constants ---
const PLANS = [
  { id: 'starter', name: 'Starter', price: 5, color: 'bg-blue-500' },
  { id: 'pro', name: 'Professional', price: 25, color: 'bg-purple-600' },
  { id: 'enterprise', name: 'Enterprise', price: 100, color: 'bg-slate-900' }
];

// --- Utilities ---
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// --- Components ---

/**
 * Custom Liquid Scrollbar
 * Performance-optimized, maps velocity to stretch.
 */
const CustomScrollbar = () => {
  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothProgress = useSpring(scrollYProgress, { mass: 0.1, stiffness: 100, damping: 20 });

  const scaleY = useTransform(scrollVelocity, [-1, 0, 1], [1.5, 1, 1.5]);
  const top = useTransform(smoothProgress, [0, 1], ["0%", "90%"]);

  return (
    <div className="fixed right-1 top-4 bottom-4 w-1 z-100 pointer-events-none hidden md:block">
      <motion.div
        style={{ top, scaleY, originY: 0 }}
        className="absolute w-full bg-slate-400/40 rounded-full backdrop-blur-sm"
      />
    </div>
  );
};

/**
 * Biometric "FaceID" Simulation Modal
 */
const BiometricModal = ({ isOpen, onComplete, onCancel }: { isOpen: boolean; onComplete: () => void; onCancel: () => void }) => {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      const timer = setTimeout(() => {
        setScanning(false);
        onComplete();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center overflow-hidden"
          >
            <div className="mb-6 flex justify-center">
              <div className="relative w-20 h-20">
                <motion.div
                  animate={scanning ? { scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-blue-500/20 rounded-full"
                />
                <div className="relative flex items-center justify-center w-full h-full text-blue-500">
                  <Fingerprint size={48} />
                  {scanning && (
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: '100%' }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                    />
                  )}
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Verify Identity</h3>
            <p className="text-slate-500 mb-8">Authorizing secure transaction via Lazorkit Passkey...</p>
            <button
              onClick={onCancel}
              className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/**
 * Main App Component
 */
export default function App() {
  const [view, setView] = useState('landing'); // landing, dashboard, merchant
  const [user, setUser] = useState<{ id: string; name: string; address: string } | null>(null);
  const [balance, setBalance] = useState(0);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [merchantBalance, setMerchantBalance] = useState(12450.00);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [virtualDate, setVirtualDate] = useState(new Date());

  // Simulation Helpers
  const handleAuth = () => {
    setIsAuthModalOpen(true);
    setPendingAction(() => () => {
      setUser({ id: 'user_123', name: 'Demo User', address: '0x...Passkey' });
      setView('dashboard');
    });
  };

  const mintUSDC = () => {
    setBalance(prev => prev + 10);
  };

  const subscribeToPlan = (plan: any) => {
    if (balance < plan.price) return;
    setIsAuthModalOpen(true);
    setPendingAction(() => () => {
      const newSub = {
        ...plan,
        startDate: new Date(virtualDate),
        nextBilling: new Date(virtualDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      };
      setSubscriptions(prev => [...prev, newSub]);
      setBalance(prev => prev - plan.price);
    });
  };

  const simulateMonth = () => {
    const nextMonth = new Date(virtualDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    setVirtualDate(nextMonth);

    // Trigger payments
    let totalCollected = 0;
    subscriptions.forEach(sub => {
      totalCollected += sub.price;
    });

    setMerchantBalance(prev => prev + totalCollected);
    setBalance(prev => Math.max(0, prev - totalCollected));

    // Update next billing dates
    setSubscriptions(prev => prev.map(s => ({
      ...s,
      nextBilling: new Date(s.nextBilling.getTime() + 30 * 24 * 60 * 60 * 1000)
    })));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30 overflow-x-hidden">
      <CustomScrollbar />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight">S3</span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono text-slate-500">{user.address}</span>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-sm font-semibold">{formatCurrency(balance)}</span>
              <button
                onClick={mintUSDC}
                className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-blue-500"
                title="Mint 10 Demo USDC"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
          <button
            onClick={() => setView(view === 'merchant' ? 'dashboard' : 'merchant')}
            className="text-sm font-medium text-slate-500 hover:text-blue-500 transition-colors"
          >
            {view === 'merchant' ? 'Member View' : 'Merchant View'}
          </button>
          {!user ? (
            <button
              onClick={handleAuth}
              className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
              JD
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 pb-32 px-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center py-12 md:py-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium"
              >
                Now live on Solana Devnet
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                Subscribe with <br /> <span className="text-blue-600">your Face.</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
                The developer-first starter template for Web2-style recurring billing on Solana.
                No seed phrases, no wallets, just biometrics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-20">
                <button
                  onClick={handleAuth}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
                >
                  Get Started <ArrowRight size={20} />
                </button>
                <button className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Read Docs
                </button>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
                {[
                  { icon: <ShieldCheck />, title: 'Passkey Auth', desc: 'Secure biometric login using Lazorkit. No browser extensions needed.' },
                  { icon: <Zap />, title: 'Gasless UX', desc: 'Sponsorsed transactions via Paymaster. Users never need to hold SOL.' },
                  { icon: <Clock />, title: 'Recurring Logic', desc: 'Automated billing using smart wallet session keys and spending caps.' }
                ].map((f, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Welcome back, Demo User</h2>
                  <p className="text-slate-500">Managing subscriptions for {virtualDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[160px]">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">Balance</span>
                    <span className="text-2xl font-mono font-bold text-blue-600">{formatCurrency(balance)}</span>
                  </div>
                  <button
                    onClick={mintUSDC}
                    className="h-full px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <Plus size={20} /> Mint USDC
                  </button>
                </div>
              </header>

              {/* Subscriptions Grid */}
              <section>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-slate-400" /> Active Subscriptions
                </h3>
                {subscriptions.length === 0 ? (
                  <div className="p-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mb-6">
                      <CreditCard size={32} />
                    </div>
                    <p className="text-lg text-slate-500 mb-6">You haven't subscribed to any plans yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptions.map((sub, i) => (
                      <motion.div
                        key={i}
                        layoutId={`sub-${sub.id}-${i}`}
                        className="p-6 bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
                      >
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-12 -mt-12 ${sub.color}`} />
                        <div className="flex justify-between items-start mb-6">
                          <div className={`w-12 h-12 rounded-2xl ${sub.color} flex items-center justify-center text-white shadow-lg`}>
                            <Zap size={24} />
                          </div>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                            Active
                          </span>
                        </div>
                        <h4 className="text-xl font-bold mb-1">{sub.name}</h4>
                        <p className="text-slate-500 text-sm mb-6">Next payment: {sub.nextBilling.toLocaleDateString()}</p>

                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium">Monthly Cost</span>
                            <span className="font-bold">{formatCurrency(sub.price)}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              className={`h-full ${sub.color}`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              {/* Available Plans */}
              <section>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Plus size={20} className="text-slate-400" /> Browse Plans
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PLANS.map((plan) => (
                    <div key={plan.id} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all group">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">{plan.name}</span>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-extrabold">{formatCurrency(plan.price)}</span>
                        <span className="text-slate-500">/mo</span>
                      </div>
                      <div className="space-y-3 mb-8">
                        {['Unlimited Access', 'Biometric Security', 'Gasless Fees'].map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                            <CheckCircle2 size={16} className="text-blue-500" /> {feat}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => subscribeToPlan(plan)}
                        disabled={balance < plan.price}
                        className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${balance >= plan.price
                          ? 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                          }`}
                      >
                        Subscribe Now
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'merchant' && (
            <motion.div
              key="merchant"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Merchant Dashboard</h2>
                  <p className="text-slate-500">Revenue simulation for S3 SaaS</p>
                </div>
                <div className="flex items-center gap-4 p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                  <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Subscribers</p>
                    <p className="text-xl font-bold">{subscriptions.length}</p>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Revenue Card */}
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-20">
                    <TrendingUp size={120} />
                  </div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Total Revenue (Simulated)</p>
                  <h3 className="text-5xl font-mono font-bold mb-8">
                    {formatCurrency(merchantBalance)}
                  </h3>
                  <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                    <ArrowUpRight size={18} /> +12.5% from last month
                  </div>
                </div>

                {/* Automation Simulation */}
                <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6">
                    <Clock size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Simulate Future</h4>
                  <p className="text-slate-500 mb-8 max-w-xs">
                    Testing recurring billing? Use this tool to fast-forward time and trigger smart wallet logic.
                  </p>
                  <button
                    onClick={simulateMonth}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                  >
                    Simulate 1 Month Later
                  </button>
                </div>
              </div>

              {/* Transaction Stream */}
              <section>
                <h3 className="text-xl font-bold mb-6">Recent Payments</h3>
                <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-8 py-4 text-xs font-bold uppercase text-slate-400">Payer Address</th>
                        <th className="px-8 py-4 text-xs font-bold uppercase text-slate-400">Plan</th>
                        <th className="px-8 py-4 text-xs font-bold uppercase text-slate-400">Date</th>
                        <th className="px-8 py-4 text-xs font-bold uppercase text-slate-400 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {[
                        { addr: '0x32...f8e2', plan: 'Enterprise', date: 'Oct 12, 2024', amount: 100 },
                        { addr: '0x91...a210', plan: 'Starter', date: 'Oct 11, 2024', amount: 5 },
                        { addr: '0x45...b4b4', plan: 'Pro', date: 'Oct 10, 2024', amount: 25 },
                      ].map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-8 py-4 font-mono text-sm text-slate-500">{tx.addr}</td>
                          <td className="px-8 py-4 text-sm font-semibold">{tx.plan}</td>
                          <td className="px-8 py-4 text-sm text-slate-500">{tx.date}</td>
                          <td className="px-8 py-4 text-sm font-bold text-right text-blue-600">{formatCurrency(tx.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Simulation Controls (Hackathon Devtools) */}
      <div className="fixed bottom-8 left-8 z-60 flex flex-col gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-full shadow-2xl border border-slate-700 text-xs font-bold animate-pulse">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          SIMULATION ACTIVE
        </div>
      </div>

      <BiometricModal
        isOpen={isAuthModalOpen}
        onComplete={() => {
          setIsAuthModalOpen(false);
          if (pendingAction) pendingAction();
        }}
        onCancel={() => setIsAuthModalOpen(false)}
      />

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 px-6 py-4 flex justify-center pointer-events-none">
        <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-4 pointer-events-auto shadow-sm">
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-blue-500" /> LAZORKIT SECURE</span>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="flex items-center gap-1"><Zap size={12} className="text-blue-500" /> GASLESS PAYMASTER ENABLED</span>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span>V1.0.4-BETA</span>
        </div>
      </footer>
    </div>
  );
}
