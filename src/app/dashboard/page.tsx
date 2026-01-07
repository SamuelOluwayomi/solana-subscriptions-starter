'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLazorkit } from '@/hooks/useLazorkit';
import { useState, useEffect } from 'react';
import {
    House, UserCircle, CreditCard, Plus, Link as LinkIcon,
    Receipt, Key, SignOut, Copy, ArrowRight, Wallet,
    CaretRight, List, X, CurrencyDollar, ArrowUp, ArrowDown
} from '@phosphor-icons/react';
import { SiSolana } from 'react-icons/si';
import LogoField from '@/components/shared/LogoField';
import AddFundsModal from '@/components/shared/AddFundsModal';
import { Connection, PublicKey } from '@solana/web3.js';
import { SERVICES, CATEGORIES, Service, SubscriptionPlan } from '@/data/subscriptions';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import ServiceCard from '@/components/subscriptions/ServiceCard';
import SubscribeModal from '@/components/subscriptions/SubscribeModal';
import ActiveSubscriptionCard from '@/components/subscriptions/ActiveSubscriptionCard';

import SecuritySettings from '@/components/security/SecuritySettings';
import TransactionDetailsModal from '@/components/shared/TransactionDetailsModal';
import FullProfileEditModal from '@/components/shared/FullProfileEditModal';
import OnboardingModal from '@/components/shared/OnboardingModal';
import USDCFaucet from '@/components/shared/USDCFaucet';
import { useUSDCBalance } from '@/hooks/useUSDCBalance';
import { constructMintTransaction } from '@/utils/cadpayToken';

type NavSection = 'overview' | 'subscriptions' | 'wallet' | 'security' | 'payment-link' | 'invoices' | 'dev-keys';

export default function Dashboard() {
    const { address, loading, balance, requestAirdrop, logout } = useLazorkit();
    const [activeSection, setActiveSection] = useState<NavSection>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default
    const [userProfile, setUserProfile] = useState({
        username: 'User',
        gender: 'other',
        avatar: '👤'
    });

    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Use Real On-Chain Balance
    const { balance: usdcBalance, refetch: refetchUsdc } = useUSDCBalance(address);
    // const [demoUSDCBalance, setDemoUSDCBalance] = useState(0); // Removed mock state

    // Load profile and demo USDC from localStorage
    useEffect(() => {
        // Must wait for loading to finish to know if we have a wallet or not
        if (loading) return;

        const savedUsername = localStorage.getItem('userName');
        const savedGender = localStorage.getItem('userGender');
        const savedAvatar = localStorage.getItem('userAvatar');
        const savedPIN = localStorage.getItem('userPIN');
        const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
        const savedDemoUSDC = localStorage.getItem('demoUSDCBalance');

        setUserProfile({
            username: savedUsername || 'User',
            gender: savedGender || 'other',
            avatar: savedAvatar || '👤'
        });

        // Load demo USDC balance - REMOVED (Using Real On-Chain)
        // if (savedDemoUSDC) {
        //     setDemoUSDCBalance(parseFloat(savedDemoUSDC));
        // }

        // Show onboarding if:
        // 1. We have a wallet connected (address exists)
        // 2. We haven't completed onboarding yet
        if (address && !hasCompletedOnboarding) {
            setShowOnboarding(true);
        }
    }, [address, loading]);

    // Handle onboarding completion
    const handleOnboardingComplete = (data: { username: string; pin: string; gender: string; avatar: string }) => {
        setUserProfile({
            username: data.username,
            gender: data.gender,
            avatar: data.avatar
        });
        localStorage.setItem('userName', data.username);
        localStorage.setItem('userGender', data.gender);
        localStorage.setItem('userAvatar', data.avatar);
        localStorage.setItem('userPIN', data.pin);
        localStorage.setItem('onboardingComplete', 'true');
        setShowOnboarding(false);
    };

    // Save profile to localStorage
    const saveUserProfile = (profile: { username: string; gender: string; avatar: string; pin?: string }) => {
        setUserProfile({
            username: profile.username,
            gender: profile.gender,
            avatar: profile.avatar
        });
        localStorage.setItem('userName', profile.username);
        localStorage.setItem('userGender', profile.gender);
        localStorage.setItem('userAvatar', profile.avatar);
    };

    const walletAddress = address || "Loading...";
    const displayBalance = balance !== null ? balance.toFixed(4) : "0.00";

    const copyToClipboard = () => {
        if (address) {
            navigator.clipboard.writeText(address);
        }
    };

    return (
        <div className="min-h-screen bg-[#1c1209] text-white font-sans relative overflow-hidden">
            {/* Orange Glow Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(234,88,12,0.1),transparent_50%)] z-0" />

            {/* Background Logo Field */}
            <LogoField count={6} className="fixed inset-0 z-0 opacity-30" />

            {/* Sidebar Toggle Button - Only shows when sidebar is closed */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-6 left-6 z-50 w-10 h-10 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center hover:bg-zinc-800/80 transition-colors"
                >
                    <List size={20} />
                </button>
            )}

            {/* Mobile Backdrop Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
                    />
                )}
            </AnimatePresence>

            {/* Glassmorphism Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className="fixed left-0 top-0 h-screen w-72 bg-zinc-900/40 backdrop-blur-xl border-r border-white/10 z-40 p-6 flex flex-col overflow-y-auto"
                    >
                        {/* Header with Logo and Close Button */}
                        <div className="flex items-center justify-between mb-8 mt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-black font-black text-xl">
                                    C
                                </div>
                                <span className="text-xl font-bold tracking-tight">CadPay</span>
                            </div>
                            {/* Close button on the right - visible on all screens */}
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Profile Section */}
                        <div className="mb-8 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setShowProfileEdit(true)}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-2xl">
                                    {userProfile.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white">{userProfile.username}</p>
                                    <p className="text-xs text-zinc-400 truncate">{walletAddress.slice(0, 12)}...</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Devnet</span>
                                <div className="flex items-center gap-1 text-orange-500">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    Active
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-6 overflow-y-auto">
                            {/* MAIN Section */}
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-3">
                                    Personal
                                </p>
                                <div className="space-y-1">
                                    <NavItem
                                        icon={<House size={20} />}
                                        label="Overview"
                                        active={activeSection === 'overview'}
                                        onClick={() => { setActiveSection('overview'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                                    />
                                    <NavItem
                                        icon={<Receipt size={20} />}
                                        label="My Subscriptions"
                                        active={activeSection === 'subscriptions'}
                                        onClick={() => { setActiveSection('subscriptions'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                                    />
                                    <NavItem
                                        icon={<Wallet size={20} />}
                                        label="Wallet & Cards"
                                        active={activeSection === 'wallet'}
                                        onClick={() => { setActiveSection('wallet'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                                    />
                                    <NavItem
                                        icon={<Key size={20} />}
                                        label="Security"
                                        active={activeSection === 'security'}
                                        onClick={() => { setActiveSection('security'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                                    />
                                </div>
                            </div>

                            {/* MERCHANT Section */}
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-3">
                                    Business
                                </p>
                                <div className="space-y-1">
                                    <NavItem
                                        icon={<LinkIcon size={20} />}
                                        label="Create Payment Link"
                                        active={activeSection === 'payment-link'}
                                        onClick={() => { setActiveSection('payment-link'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                                    />
                                    <NavItem
                                        icon={<CreditCard size={20} />}
                                        label="Invoices"
                                        active={activeSection === 'invoices'}
                                        onClick={() => { setActiveSection('invoices'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                                    />
                                    <NavItem
                                        icon={<Key size={20} />}
                                        label="Developer Keys"
                                        active={activeSection === 'dev-keys'}
                                        onClick={() => { setActiveSection('dev-keys'); if (window.innerWidth < 768) setSidebarOpen(false); }}
                                    />
                                </div>
                            </div>
                        </nav>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <SignOut size={20} />
                            Logout
                        </button>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className={`${sidebarOpen ? 'ml-0 md:ml-72' : 'ml-0'} relative z-10 transition-all duration-300`}>
                <div className="p-6 md:p-12 pt-20">
                    {activeSection === 'overview' && (
                        <OverviewSection
                            userName={userProfile.username}
                            balance={displayBalance}
                            address={walletAddress}
                            usdcBalance={usdcBalance}   // <-- Real Balance
                            refetchUsdc={refetchUsdc}   // <-- Refetch Function
                            loading={loading}
                            copyToClipboard={copyToClipboard}
                        />
                    )}
                    {activeSection === 'subscriptions' && <SubscriptionsSection />}
                    {activeSection === 'wallet' && <WalletSection balance={displayBalance} address={walletAddress} copyToClipboard={copyToClipboard} />}
                    {activeSection === 'security' && <SecuritySettings />}
                    {activeSection === 'payment-link' && <PaymentLinkSection />}
                    {activeSection === 'invoices' && <InvoicesSection />}
                    {activeSection === 'dev-keys' && <DevKeysSection />}
                </div>
            </div>

            {/* Full Profile Edit Modal */}
            <FullProfileEditModal
                isOpen={showProfileEdit}
                onClose={() => setShowProfileEdit(false)}
                currentProfile={{
                    username: userProfile.username,
                    gender: userProfile.gender,
                    avatar: userProfile.avatar
                }}
                onSave={saveUserProfile}
            />

            {/* Onboarding Modal - First Time Setup */}
            <OnboardingModal
                isOpen={showOnboarding}
                onComplete={handleOnboardingComplete}
            />
        </div>
    );
}

// Navigation Item Component
function NavItem({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            <span className="text-sm font-medium flex-1 text-left">{label}</span>
            {active && <CaretRight size={16} weight="bold" />}
        </button>
    );
}

// Overview Section
function OverviewSection({ userName, balance, address, usdcBalance, refetchUsdc, loading, copyToClipboard }: any) {
    const [showUSD, setShowUSD] = useState(true);
    const [solPrice, setSolPrice] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const { subscriptions } = useSubscriptions();
    const [isFunding, setIsFunding] = useState(false);

    // @ts-ignore
    const { wallet } = useLazorkit();

    const handleFundDemo = async () => {
        setIsFunding(true);
        try {
            if (!address) return;

            // 1. Construct REAL Mint Transaction (Signed by Authority)
            const { sendTransaction } = await constructMintTransaction(address);

            // 2. Send directly (User does not need to sign!)
            const signature = await sendTransaction();

            console.log("Mint Success! Signature:", signature);

            // 3. Update UI
            // Wait a few seconds for confirmation then refetch
            setTimeout(() => {
                refetchUsdc();
            }, 2000);

            // Add REAL transaction to history
            const newTx = {
                signature: signature || "tx_" + Date.now(),
                err: null,
                blockTime: Math.floor(Date.now() / 1000),
                memo: "CadPay USDC Access Grant"
            };
            setTransactions(prev => [newTx, ...prev]);
        } catch (error) {
            console.error("Funding failed", error);
        } finally {
            setIsFunding(false);
        }
    };

    // Fetch SOL price from CoinGecko
    useEffect(() => {
        const fetchSolPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                const data = await response.json();
                setSolPrice(data.solana.usd);
            } catch (error) {
                console.error('Failed to fetch SOL price:', error);
            }
        };
        fetchSolPrice();
        // Refresh price every 30 seconds
        const interval = setInterval(fetchSolPrice, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch transaction history
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!address || address === 'Loading...') return;
            try {
                const connection = new Connection('https://api.devnet.solana.com');
                const pubkey = new PublicKey(address);
                const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 10 });
                setTransactions(prev => {
                    // Merge real signatures with simulated ones, keeping simulated ones at top if recent
                    const realTxs = signatures;
                    const existingSigs = new Set(realTxs.map(tx => tx.signature));
                    const keptSimulated = prev.filter(tx => tx.signature.startsWith('funding_') && !existingSigs.has(tx.signature));
                    return [...keptSimulated, ...realTxs];
                });
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            }
        };
        fetchTransactions();
        // Refresh every 10 seconds
        const interval = setInterval(fetchTransactions, 10000);
        return () => clearInterval(interval);
    }, [address]);

    const balanceValue = parseFloat(balance);
    const usdValue = solPrice ? (balanceValue * solPrice).toFixed(2) : '0.00';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Welcome back, {userName}! 👋</h1>
                <p className="text-zinc-400 mt-2">Here's what's happening with your account today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-linear-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-md border border-orange-500/30 rounded-3xl p-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CurrencyDollar size={150} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-orange-200 text-sm">USDC Balance</p>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                                <span className="text-[10px] font-bold text-orange-400">GASLESS ENABLED</span>
                            </div>
                        </div>
                        <h2 className="text-5xl font-bold mb-2 text-white">
                            <span className={usdcBalance > 0 ? "text-[#FF8C33]" : "text-white"}>
                                ${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-orange-300/60 text-2xl font-normal ml-2">USDC</span>
                        </h2>
                        <div className="flex items-center gap-2 mb-4 text-xs text-orange-200/60">
                            <div className="flex items-center gap-1.5">
                                <span>SOL: {balance}</span>
                                <span className="px-2 py-0.5 bg-zinc-900/50 border border-orange-500/20 rounded text-[10px] font-bold text-orange-400">NOT NEEDED</span>
                            </div>
                        </div>
                        <p className="text-xs text-orange-200/60 mb-6">
                            Paymaster covers all network fees • You only need USDC to transact
                        </p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleFundDemo}
                                disabled={loading || isFunding}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-orange-100 transition-all hover:scale-105 disabled:opacity-50"
                            >
                                {isFunding ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Minting...
                                    </>
                                ) : (
                                    <>
                                        <Plus weight="bold" /> Add USDC
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="space-y-4">
                    <StatCard title="Active Subscriptions" value={subscriptions.length.toString()} color="blue" />
                    <StatCard title="Pending Invoices" value="0" color="purple" />
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.length === 0 ? (
                        <p className="text-zinc-500 text-sm text-center py-8">No transactions yet</p>
                    ) : (
                        transactions.map((tx, i) => (
                            <div key={tx.signature} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.err ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                    {tx.err ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {tx.signature.slice(0, 20)}...{tx.signature.slice(-20)}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {new Date((tx.blockTime || 0) * 1000).toLocaleString()}
                                    </p>
                                </div>
                                <div className={`text-xs font-medium ${tx.err ? 'text-red-400' : 'text-orange-400'
                                    }`}>
                                    {tx.err ? 'Failed' : 'Success'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Wallet Address Card */}
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">Your Smart Wallet</h3>
                <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                    <span className="font-mono text-sm text-zinc-200 truncate flex-1">{address}</span>
                    <button onClick={copyToClipboard} className="text-orange-500 hover:text-orange-400 ml-4">
                        <Copy size={20} />
                    </button>
                </div>
            </div>

        </div>
    );
}

function StatCard({ title, value, color }: { title: string; value: string; color: 'blue' | 'purple' }) {
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    };
    return (
        <div className={`bg-linear-to-br ${colors[color]} backdrop-blur-md border rounded-2xl p-5`}>
            <p className="text-xs text-zinc-400 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}

// Subscriptions Section
function SubscriptionsSection() {
    const [activeTab, setActiveTab] = useState<'browse' | 'active' | 'analytics'>('browse');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [solPrice, setSolPrice] = useState<number | null>(null);
    const { balance } = useLazorkit();
    const { subscriptions, addSubscription, removeSubscription, getMonthlyTotal, getHistoricalData } = useSubscriptions();

    // Fetch SOL price
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                const data = await response.json();
                setSolPrice(data.solana.usd);
            } catch (error) {
                console.error('Failed to fetch SOL price:', error);
            }
        };
        fetchPrice();
        const interval = setInterval(fetchPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    const filteredServices = categoryFilter === 'all'
        ? SERVICES
        : SERVICES.filter(s => s.category === categoryFilter);

    const handleServiceClick = (service: Service) => {
        setSelectedService(service);
        setShowSubscribeModal(true);
    };

    const handleSubscribe = async (serviceId: string, plan: SubscriptionPlan, email: string, price: number) => {
        const service = SERVICES.find(s => s.id === serviceId);
        if (!service) return;

        addSubscription({
            serviceId,
            serviceName: service.name,
            plan: plan.name,
            price,
            email,
            color: service.color,
            icon: service.icon
        });

        setShowSubscribeModal(false);
    };

    const categoryCount = (cat: string) => {
        if (cat === 'all') return SERVICES.length;
        return SERVICES.filter(s => s.category === cat).length;
    };

    return (
        <div className="space-y-8">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Subscriptions</h2>
                <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'browse' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Browse
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'active' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Active ({subscriptions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            {/* Browse Tab */}
            {activeTab === 'browse' && (
                <div>
                    {/* Category Filters */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategoryFilter(cat.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${categoryFilter === cat.id
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-zinc-900/50 text-zinc-400 hover:text-white border border-white/10'
                                    }`}
                            >
                                {cat.name} ({categoryCount(cat.id)})
                            </button>
                        ))}
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onClick={() => handleServiceClick(service)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Active Subscriptions Tab */}
            {activeTab === 'active' && (
                <div>
                    {subscriptions.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Receipt size={40} className="text-zinc-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Active Subscriptions</h3>
                            <p className="text-zinc-400 mb-6">Browse services and subscribe to get started</p>
                            <button
                                onClick={() => setActiveTab('browse')}
                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                            >
                                Browse Services
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-linear-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-200/60 mb-1">Monthly Spending</p>
                                        <p className="text-4xl font-bold text-white">${getMonthlyTotal().toFixed(2)}</p>
                                        {solPrice && (
                                            <p className="text-sm text-orange-200/40 mt-1">
                                                ≈ {(getMonthlyTotal() / solPrice).toFixed(4)} SOL
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-orange-200/60 mb-1">Active Services</p>
                                        <p className="text-4xl font-bold text-white">{subscriptions.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {subscriptions.map((sub) => (
                                        <ActiveSubscriptionCard
                                            key={sub.id}
                                            subscription={sub}
                                            onUnsubscribe={removeSubscription}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Monthly Spending Chart */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Monthly Spending Trend</h3>
                            <div className="space-y-3">
                                {getHistoricalData().map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-zinc-400">{item.month}</span>
                                            <span className="text-white font-medium">${item.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-linear-to-r from-orange-500 to-orange-600 rounded-full"
                                                style={{ width: `${(item.amount / Math.max(...getHistoricalData().map(d => d.amount))) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Breakdown by Service */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Spending Breakdown</h3>
                            {subscriptions.length === 0 ? (
                                <p className="text-zinc-500 text-sm text-center py-8">No active subscriptions to analyze</p>
                            ) : (
                                <div className="space-y-3">
                                    {subscriptions.map((sub) => (
                                        <div key={sub.id} className="flex items-center gap-3">
                                            <div className="text-2xl" style={{ color: sub.color }}>
                                                <sub.icon size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{sub.serviceName}</p>
                                                <p className="text-xs text-zinc-500">{sub.plan} Plan</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">${sub.price}</p>
                                                <p className="text-xs text-zinc-500">
                                                    {((sub.price / getMonthlyTotal()) * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
                            <p className="text-xs text-zinc-500 mb-1">Average per Service</p>
                            <p className="text-2xl font-bold text-white">
                                ${subscriptions.length > 0 ? (getMonthlyTotal() / subscriptions.length).toFixed(2) : '0.00'}
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
                            <p className="text-xs text-zinc-500 mb-1">Yearly Projection</p>
                            <p className="text-2xl font-bold text-orange-400">${(getMonthlyTotal() * 12).toFixed(2)}</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
                            <p className="text-xs text-zinc-500 mb-1">Most Expensive</p>
                            <p className="text-2xl font-bold text-white">
                                {subscriptions.length > 0
                                    ? `$${Math.max(...subscriptions.map(s => s.price)).toFixed(2)}`
                                    : '$0.00'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscribe Modal */}
            <SubscribeModal
                isOpen={showSubscribeModal}
                onClose={() => setShowSubscribeModal(false)}
                service={selectedService}
                onSubscribe={handleSubscribe}
                balance={balance || 0}
                solPrice={solPrice}
            />
        </div>
    );
}

// Wallet Section
function WalletSection({ balance, address, copyToClipboard }: any) {
    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold">Wallet & Cards</h1>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-zinc-900/80 to-black/60 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                    <h3 className="text-lg font-bold mb-6">Main Wallet</h3>
                    <p className="text-4xl font-bold mb-6">{balance} SOL</p>
                    <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5 text-sm">
                        <span className="font-mono text-zinc-300 truncate">{address}</span>
                        <button onClick={copyToClipboard} className="text-orange-500 ml-3">
                            <Copy size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Payment Link Section
function PaymentLinkSection() {
    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold">Create Payment Link</h1>
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                <p className="text-zinc-400 mb-6">Generate payment links to receive SOL payments</p>
                <button className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2">
                    <Plus weight="bold" size={20} /> Create New Payment Link
                </button>
            </div>
        </div>
    );
}

// Invoices Section
function InvoicesSection() {
    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold">Invoices</h1>
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center">
                <CreditCard size={64} className="mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400">No invoices yet</p>
            </div>
        </div>
    );
}

// Dev Keys Section
function DevKeysSection() {
    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold">Developer Keys</h1>
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                <p className="text-zinc-400 mb-6">Manage API keys for your applications</p>
                <button className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2">
                    <Key weight="bold" size={20} /> Generate API Key
                </button>
            </div>
        </div>
    );
}
