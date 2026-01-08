'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import {
    WalletIcon, TrendUpIcon, UsersIcon, LightningIcon, CopyIcon, CheckIcon, StorefrontIcon,
    ReceiptIcon, ChartPieIcon, KeyIcon, ShieldCheckIcon, CaretRightIcon, ArrowLeftIcon,
    EyeIcon, EyeSlashIcon, PlusIcon, XIcon // Added Plus, X
} from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added Router
import { Connection, PublicKey } from '@solana/web3.js';
import { useMerchant } from '@/context/MerchantContext'; // Added Context

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SERVICES } from '@/data/subscriptions';

export default function MerchantDashboard() {
    const { merchant, createNewService, logoutMerchant } = useMerchant();
    const router = useRouter();

    // Create Service Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newServiceName, setNewServiceName] = useState('');

    // State for Metrics & Data
    const [transactions, setTransactions] = useState<any[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [txCount, setTxCount] = useState(0);
    const [mrr, setMrr] = useState(0);
    const [gasSaved, setGasSaved] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showKey, setShowKey] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);

    const [newServicePrice, setNewServicePrice] = useState(19.99);
    const [newServiceColor, setNewServiceColor] = useState('#EF4444');

    // Navigation state
    const [activeSection, setActiveSection] = useState<'dashboard' | 'analytics' | 'customers' | 'invoices' | 'developer'>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Protect Route
    useEffect(() => {
        if (!merchant) {
            router.push('/merchant-auth');
        }
    }, [merchant, router]);

    // Calculate Base Logic & Fetch Ledger
    useEffect(() => {
        if (!merchant) return;

        // 1. Determine Authorization for Mock Data
        const isDefaultMerchant = merchant.email === 'samuelfaith500@gmail.com';

        let baseRevenue = 0;
        let baseUsers = 0;
        let baseMrr = 0;
        let initialChartData: any[] = [];

        if (isDefaultMerchant) {
            // Calculate totals from hardcoded SERVICES
            baseUsers = SERVICES.length * 42; // Fake multiplier for scale
            baseRevenue = SERVICES.reduce((acc, s) => acc + (s.plans[0].price * 42), 0);
            baseMrr = baseRevenue; // Simple assumption

            // Prepare Pie Chart Data from SERVICES
            initialChartData = SERVICES.slice(0, 5).map(s => ({
                name: s.name,
                value: s.plans[0].price * 42,
                color: s.color
            }));
        } else {
            // New Merchant starts fresh
            initialChartData = [
                { name: 'No Data', value: 100, color: '#27272a' }
            ];
        }

        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const merchantKey = new PublicKey(merchant.walletPublicKey);

        const fetchHistory = async () => {
            try {
                // Fetch recent signatures for the MERCHANT wallet
                const signatures = await connection.getSignaturesForAddress(merchantKey, { limit: 20 });

                // Transform into "Legible" Ledger items
                const formattedTxs = signatures.map((sig, i) => {
                    return {
                        id: sig.signature,
                        customer: '0x' + sig.signature.slice(0, 4) + '...' + sig.signature.slice(-4),
                        service: { name: 'Subscription', color: '#888' }, // Generic
                        amount: 19.99, // Hack: Standard price
                        status: sig.err ? 'Failed' : 'Success',
                        date: new Date((sig.blockTime || 0) * 1000),
                        gasFee: '0.00 SOL'
                    };
                });

                setTransactions(formattedTxs);

                // Add Real Activity to Base
                const realUsers = formattedTxs.length;
                const realRevenue = realUsers * 19.99;

                setTxCount(baseUsers + realUsers);
                setTotalRevenue(baseRevenue + realRevenue);
                setMrr(baseMrr + realRevenue);
                setGasSaved(realUsers * 0.000005);

                // Update Chart if there is real data
                if (realRevenue > 0) {
                    // Add "New Subs" slice to chart for visibility
                    const newSlice = { name: 'New Subs', value: realRevenue, color: '#f97316' };
                    if (isDefaultMerchant) {
                        setChartData([...initialChartData, newSlice]);
                    } else {
                        setChartData([newSlice]);
                    }
                } else {
                    setChartData(initialChartData);
                }

                setLoading(false);
            } catch (e) {
                console.error("Failed to fetch merchant history", e);
                setLoading(false);
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 10000);
        return () => clearInterval(interval);
    }, [merchant]);

    const handleCreateService = (e: React.FormEvent) => {
        e.preventDefault();
        createNewService(newServiceName, newServicePrice, "Monthly Subscription", newServiceColor);
        setIsCreateModalOpen(false);
        setNewServiceName('');
        setNewServicePrice(19.99);
    };

    if (!merchant) return null; // Wait for redirect

    return (
        <div className="flex min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
            {/* SIDEBAR */}
            <aside className="w-64 border-r border-white/10 bg-zinc-900/50 hidden md:flex flex-col fixed inset-y-0 z-20 backdrop-blur-xl">
                <div className="p-6">
                    <Link href="/" className="group flex items-center gap-3 mb-8">
                        <div className="relative w-8 h-8 flex items-center justify-center bg-orange-500 rounded-lg shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            <LightningIcon size={20} weight="fill" className="text-white" />
                        </div>
                        <span className="text-xl font-black bg-white text-transparent bg-clip-text">
                            CadPay <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded ml-1">MERCHANT</span>
                        </span>
                    </Link>

                    <nav className="space-y-1">
                        <NavItem
                            icon={<StorefrontIcon size={20} />}
                            label="Dashboard"
                            active={activeSection === 'dashboard'}
                            onClick={() => setActiveSection('dashboard')}
                        />
                        <NavItem
                            icon={<ChartPieIcon size={20} />}
                            label="Analytics"
                            active={activeSection === 'analytics'}
                            onClick={() => setActiveSection('analytics')}
                        />
                        <NavItem
                            icon={<UsersIcon size={20} />}
                            label="Customers"
                            active={activeSection === 'customers'}
                            onClick={() => setActiveSection('customers')}
                        />
                        <NavItem
                            icon={<ReceiptIcon size={20} />}
                            label="Invoices"
                            active={activeSection === 'invoices'}
                            onClick={() => setActiveSection('invoices')}
                        />
                        <NavItem
                            icon={<KeyIcon size={20} />}
                            label="Developer"
                            active={activeSection === 'developer'}
                            onClick={() => setActiveSection('developer')}
                        />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-black border-2 border-white/10">
                            {merchant.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{merchant.name}</p>
                            <p className="text-xs text-zinc-400 truncate">{merchant.email}</p>
                        </div>
                    </div>
                    <button onClick={logoutMerchant} className="w-full py-2 text-xs text-zinc-500 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                        <p className="text-zinc-400">Welcome back, here's what's happening with {merchant.name} today.</p>
                    </div>
                </header>

                {/* 1. NORTH STAR METRICS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <MetricCard
                        title="Total Revenue"
                        value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        trend={merchant.email === 'samuelfaith500@gmail.com' ? "+12%" : "+0%"}
                        icon={<TrendUpIcon size={24} className="text-green-400" />}
                        color="green"
                    />
                    <MetricCard
                        title="Total Customers"
                        value={txCount.toLocaleString()}
                        trend={merchant.email === 'samuelfaith500@gmail.com' ? "+42 new" : "+0 new"}
                        icon={<UsersIcon size={24} className="text-blue-400" />}
                        color="blue"
                    />
                    <MetricCard
                        title="Monthly Recurring (MRR)"
                        value={`$${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        trend={merchant.email === 'samuelfaith500@gmail.com' ? "+8%" : "+0%"}
                        icon={<ReceiptIcon size={24} className="text-purple-400" />}
                        color="purple"
                    />
                    <MetricCard
                        title="Gas Subsidized (The Flex)"
                        value={`${gasSaved.toFixed(4)} SOL`}
                        trend="100% Covered"
                        icon={<LightningIcon size={24} className="text-orange-400 fill-orange-400" />}
                        color="orange"
                        subtext="You saved users this much!"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* 2. REVENUE SPLIT CHART */}
                    <div className="lg:col-span-1 bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white">Revenue Split</h3>
                            <button className="text-zinc-500 hover:text-white"><ChartPieIcon size={20} /></button>
                        </div>

                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => `$${value?.toLocaleString()}`}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="block text-zinc-500 text-xs">Total</span>
                                    <span className="block text-xl font-bold text-white">
                                        ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-center text-zinc-500 text-sm">Revenue distribution across your active products.</p>
                        </div>
                    </div>

                    {/* 3. LIVE LEDGER */}
                    <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-white">Live Ledger</h3>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wide">Live Feed</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-mono">{merchant.walletPublicKey.slice(0, 4)}...{merchant.walletPublicKey.slice(-4)}</span>
                                <CopyIcon size={14} className="text-zinc-500 cursor-pointer hover:text-white" />
                            </div>
                        </div>

                        <div className="overflow-hidden flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
                                        <th className="pb-3 pl-2 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Product</th>
                                        <th className="pb-3 font-medium">Customer</th>
                                        <th className="pb-3 text-right font-medium">Amount</th>
                                        <th className="pb-3 text-right font-medium pr-2">Gas Fee</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-zinc-500">Scanning Solana Blockchain...</td>
                                        </tr>
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-zinc-700">
                                                No transactions yet. Create a product and share the link!
                                            </td>
                                        </tr>
                                    ) : transactions.map((tx, i) => (
                                        <motion.tr
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-3 pl-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckIcon size={14} className="text-green-500 font-bold" />
                                                    <span className='text-green-400'>Success</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className="font-medium text-zinc-200">Subscription</span>
                                            </td>
                                            <td className="py-3 font-mono text-xs text-zinc-400">
                                                {tx.customer}
                                            </td>
                                            <td className="py-3 text-right font-bold text-white">
                                                +${tx.amount.toFixed(2)} USDC
                                            </td>
                                            <td className="py-3 pr-2 text-right">
                                                <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                                    0.00 SOL
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 4. PRODUCT STUDIO & DEV KEYS */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Products */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white">Active Plans</h3>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1"
                            >
                                <PlusIcon size={14} /> Create Payment Link
                            </button>
                        </div>

                        {/* Empty State or List */}
                        <div className="space-y-4">
                            <div className="p-8 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center">
                                <div className="p-3 bg-zinc-800 rounded-full mb-3 text-zinc-400">
                                    <StorefrontIcon size={24} />
                                </div>
                                <p className="text-sm font-medium text-zinc-300">No active plans</p>
                                <p className="text-xs text-zinc-500 mb-3">Create your first subscription tier</p>
                                <button onClick={() => setIsCreateModalOpen(true)} className="text-orange-500 text-xs font-bold hover:underline">Create Now</button>
                            </div>
                        </div>
                    </div>

                    {/* Developer Keys */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <KeyIcon size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Developer API Keys</h3>
                                <p className="text-xs text-zinc-400">Manage your integration secrets</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider mb-2 block">Publishable Key</label>
                                <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-3">
                                    <code className="text-sm font-mono text-zinc-300">{merchant.walletPublicKey}</code>
                                    <CopyIcon size={16} className="text-zinc-500 cursor-pointer hover:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider mb-2 block">Secret Key</label>
                                <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-3">
                                    <code className="text-sm font-mono text-zinc-300">
                                        {showKey ? merchant.walletSecretKey : 'sk_live_•••••••••••••••••••••'}
                                    </code>
                                    <button onClick={() => setShowKey(!showKey)} className="text-zinc-500 cursor-pointer hover:text-white">
                                        {showKey ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
                                    </button>
                                </div>
                                <p className="text-xs text-orange-500/80 mt-2 flex items-center gap-1.5">
                                    <ShieldCheckIcon size={14} /> Never share your secret key client-side.
                                </p>
                            </div>
                        </div>

                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    </div>
                </div>
            </main>

            {/* Create Service Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsCreateModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">New Subscription Plan</h3>
                                <button onClick={() => setIsCreateModalOpen(false)}><XIcon size={20} className="text-zinc-400 hover:text-white" /></button>
                            </div>

                            <form onSubmit={handleCreateService} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Service Name</label>
                                    <input
                                        type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                        placeholder="e.g. Premium Plan"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Price (USDC)</label>
                                    <input
                                        type="number" step="0.01" value={newServicePrice} onChange={e => setNewServicePrice(parseFloat(e.target.value))}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Brand Color</label>
                                    <div className="flex gap-2">
                                        {['#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'].map(color => (
                                            <div
                                                key={color}
                                                onClick={() => setNewServiceColor(color)}
                                                className={`w-8 h-8 rounded-full cursor-pointer border-2 ${newServiceColor === color ? 'border-white' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-colors mt-4"
                                >
                                    Create Plan
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            <span className="text-sm">{label}</span>
        </div>
    );
}

function MetricCard({ title, value, trend, icon, color, subtext }: { title: string, value: string, trend: string, icon: any, color: 'green' | 'blue' | 'purple' | 'orange', subtext?: string }) {
    const colors: Record<string, string> = {
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };

    return (
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
                <span className="text-xs font-medium bg-white/5 px-2 py-1 rounded-full text-zinc-400">
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
            </div>
        </div>
    );
}
