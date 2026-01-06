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

type NavSection = 'overview' | 'subscriptions' | 'wallet' | 'payment-link' | 'invoices' | 'dev-keys';

export default function Dashboard() {
    const { address, loading, balance, requestAirdrop, logout } = useLazorkit();
    const [activeSection, setActiveSection] = useState<NavSection>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const walletAddress = address || "Loading...";
    const displayBalance = balance !== null ? balance.toFixed(4) : "0.00";

    const copyToClipboard = () => {
        if (address) {
            navigator.clipboard.writeText(address);
        }
    };

    return (
        <div className="min-h-screen bg-[#1c1209] text-white font-sans relative overflow-hidden">
            {/* Background Logo Field */}
            <LogoField count={15} className="fixed inset-0 z-0 opacity-30" />

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed top-6 left-6 z-50 w-10 h-10 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center"
            >
                {sidebarOpen ? <X size={20} /> : <List size={20} />}
            </button>

            {/* Glassmorphism Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || window.innerWidth >= 768) && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className="fixed left-0 top-0 h-screen w-72 bg-zinc-900/40 backdrop-blur-xl border-r border-white/10 z-40 p-6 flex flex-col"
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-8 mt-2">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-black font-black text-xl">
                                C
                            </div>
                            <span className="text-xl font-bold tracking-tight">CadPay</span>
                        </div>

                        {/* Profile Section */}
                        <div className="mb-8 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                                    <UserCircle size={28} weight="fill" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white">User</p>
                                    <p className="text-xs text-zinc-400 truncate">{walletAddress.slice(0, 12)}...</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">Devnet</span>
                                <div className="flex items-center gap-1 text-green-500">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Active
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-6">
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
                                        onClick={() => setActiveSection('overview')}
                                    />
                                    <NavItem
                                        icon={<Receipt size={20} />}
                                        label="My Subscriptions"
                                        active={activeSection === 'subscriptions'}
                                        onClick={() => setActiveSection('subscriptions')}
                                    />
                                    <NavItem
                                        icon={<Wallet size={20} />}
                                        label="Wallet & Cards"
                                        active={activeSection === 'wallet'}
                                        onClick={() => setActiveSection('wallet')}
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
                                        onClick={() => setActiveSection('payment-link')}
                                    />
                                    <NavItem
                                        icon={<CreditCard size={20} />}
                                        label="Invoices"
                                        active={activeSection === 'invoices'}
                                        onClick={() => setActiveSection('invoices')}
                                    />
                                    <NavItem
                                        icon={<Key size={20} />}
                                        label="Developer Keys"
                                        active={activeSection === 'dev-keys'}
                                        onClick={() => setActiveSection('dev-keys')}
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
            <div className="md:ml-72 relative z-10">
                <div className="p-6 md:p-12">
                    {activeSection === 'overview' && <OverviewSection balance={displayBalance} address={walletAddress} requestAirdrop={requestAirdrop} loading={loading} copyToClipboard={copyToClipboard} />}
                    {activeSection === 'subscriptions' && <SubscriptionsSection />}
                    {activeSection === 'wallet' && <WalletSection balance={displayBalance} address={walletAddress} copyToClipboard={copyToClipboard} />}
                    {activeSection === 'payment-link' && <PaymentLinkSection />}
                    {activeSection === 'invoices' && <InvoicesSection />}
                    {activeSection === 'dev-keys' && <DevKeysSection />}
                </div>
            </div>
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
function OverviewSection({ balance, address, requestAirdrop, loading, copyToClipboard }: any) {
    const [showUSD, setShowUSD] = useState(false);
    const [solPrice, setSolPrice] = useState<number | null>(null);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);

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
                setTransactions(signatures);
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

    const handleAddFunds = async (amount: number) => {
        await requestAirdrop();
        setShowAddFunds(false);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight">Welcome back! 👋</h1>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-linear-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-md border border-orange-500/30 rounded-3xl p-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <SiSolana size={150} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-orange-200 text-sm">Total Balance</p>
                            <button
                                onClick={() => setShowUSD(!showUSD)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-orange-100 transition-all border border-white/20"
                            >
                                {showUSD ? (
                                    <>
                                        <SiSolana size={14} />
                                        SOL
                                    </>
                                ) : (
                                    <>
                                        <CurrencyDollar size={14} weight="bold" />
                                        USD
                                    </>
                                )}
                            </button>
                        </div>
                        <h2 className="text-5xl font-bold mb-6 text-white">
                            {showUSD ? (
                                <>
                                    ${usdValue} <span className="text-orange-300/60 text-2xl font-normal">USD</span>
                                </>
                            ) : (
                                <>
                                    {balance} <span className="text-orange-300/60 text-2xl font-normal">SOL</span>
                                </>
                            )}
                        </h2>
                        {solPrice && (
                            <p className="text-xs text-orange-200/60 mb-4">
                                1 SOL = ${solPrice.toFixed(2)} USD
                            </p>
                        )}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowAddFunds(true)}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-orange-100 transition-all hover:scale-105 disabled:opacity-50"
                            >
                                <Plus weight="bold" /> {loading ? 'Processing...' : 'Add Funds'}
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20">
                                <ArrowRight weight="bold" /> Send
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="space-y-4">
                    <StatCard title="Active Subscriptions" value="0" color="blue" />
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
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.err ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
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
                                <div className={`text-xs font-medium ${tx.err ? 'text-red-400' : 'text-green-400'
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

            {/* Add Funds Modal */}
            <AddFundsModal
                isOpen={showAddFunds}
                onClose={() => setShowAddFunds(false)}
                onConfirm={handleAddFunds}
                loading={loading}
            />
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
    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold">My Subscriptions</h1>
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center">
                <Receipt size={64} className="mx-auto mb-4 text-zinc-600" />
                <p className="text-zinc-400 mb-4">No active subscriptions</p>
                <button className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all">
                    Browse Services
                </button>
            </div>
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
