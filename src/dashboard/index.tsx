'use client';

import { clsx, type ClassValue } from 'clsx';
import {
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { twMerge } from 'tailwind-merge';
import { logout } from '../auth/actions';
import { AnalyticsData, PaymentIntent } from '../types';
import ApiKeysSection from './api-section';
import { Icons } from './constant';
import PaymentsTable from './payment-table';
import {LoginScreen} from '../auth/login-screen';


function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function PayGridDashboard({ baseUrl = '/api/paygrid' }: { baseUrl?: string; }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'apikeys'>('overview');
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [intents, setIntents] = useState<PaymentIntent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [timeframe, setTimeframe] = useState<7 | 30>(30);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    const apiKey = process.env.NEXT_PUBLIC_PAYGRID_API_SECRET;

    const fetchAnalytics = async (showLoading = false) => {
        if (showLoading) setIsAnalyticsLoading(true);
        try {
            const headers: Record<string, string> = {};
            if (apiKey) headers['x-api-key'] = apiKey;
            const res = await fetch(`${baseUrl}/analytics?days=${timeframe}`, { headers });
            if (res.ok) {
                const stats = await res.json();
                setAnalytics(stats);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            if (showLoading) setIsAnalyticsLoading(false);
        }
    };

    const fetchPayments = async () => {
        try {
            const headers: Record<string, string> = {};
            if (apiKey) headers['x-api-key'] = apiKey;
            const res = await fetch(`${baseUrl}/payments`, { headers });
            if (res.ok) {
                const list = await res.json();
                setIntents(list);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    };

    // Initial load for payments
    useEffect(() => {
        setIsLoading(true);
        fetchPayments().then(() => setIsLoading(false));
    }, [apiKey, baseUrl]);

    // Analytics load (including timeframe changes)
    useEffect(() => {
        fetchAnalytics(true);
        // Check admin session cookie on client side
        const hasSession = document.cookie.includes('paygrid_admin_session=true');
        setIsAdmin(hasSession);
    }, [apiKey, baseUrl, timeframe]);

    const filteredIntents = intents.filter(intent => {
        const query = searchQuery.toLowerCase();
        return (
            intent.id.toLowerCase().includes(query) ||
            intent.status.toLowerCase().includes(query) ||
            intent.amount.toString().includes(query) ||
            (intent.walletAddress && intent.walletAddress.toLowerCase().includes(query))
        );
    });

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6">
                            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl relative overflow-hidden">
                                {isAnalyticsLoading && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <p className="text-gray-400 text-sm font-medium">Total Volume</p>
                                <h3 className="text-3xl font-bold mt-1 text-white">${analytics?.totalRevenue.toFixed(2)}</h3>
                                <p className={cn("text-xs mt-2", (analytics?.revenueGrowth || 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                                    {(analytics?.revenueGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(analytics?.revenueGrowth || 0).toFixed(1)}% from last {timeframe === 30 ? 'month' : 'week'}
                                </p>
                            </div>
                            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl relative overflow-hidden">
                                {isAnalyticsLoading && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <p className="text-gray-400 text-sm font-medium">Payment Intents</p>
                                <h3 className="text-3xl font-bold mt-1 text-white">{analytics?.transactionCount}</h3>
                                <p className="text-gray-500 text-xs mt-2">Past {timeframe} days</p>
                            </div>
                            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl relative overflow-hidden">
                                {isAnalyticsLoading && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <p className="text-gray-400 text-sm font-medium">Settlement Rate</p>
                                <h3 className="text-3xl font-bold mt-1 text-white">{analytics?.settlementRate.toFixed(1)}%</h3>
                                <p className="text-emerald-400 text-xs mt-2">High performance</p>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-white/10 p-6 rounded-2xl h-[400px] relative overflow-hidden">
                            {isAnalyticsLoading && (
                                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-lg">Revenue Over Time</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTimeframe(7)}
                                        className={cn(
                                            "text-xs px-3 py-1 rounded-full transition-all border",
                                            timeframe === 7
                                                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                        )}
                                    >
                                        7D
                                    </button>
                                    <button
                                        onClick={() => setTimeframe(30)}
                                        className={cn(
                                            "text-xs px-3 py-1 rounded-full transition-all border",
                                            timeframe === 30
                                                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                        )}
                                    >
                                        30D
                                    </button>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height="80%" minWidth={0}>
                                <AreaChart data={analytics?.history || []}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-semibold">Recent Activity</h3>
                                <button onClick={() => setActiveTab('payments')} className="text-xs text-indigo-400 hover:text-indigo-300">View all</button>
                            </div>
                            <PaymentsTable intents={filteredIntents.slice(0, 5)} />
                        </div>
                    </div>
                );
            case 'payments':
                return <PaymentsTable intents={filteredIntents} isFullPage />;
            case 'apikeys':
                return <ApiKeysSection apiKey={apiKey} baseUrl={baseUrl} />;
        }
    };




    if (isAdmin === null) {
        return null; // or loading spinner
    }
    if (!isAdmin) {
        return <LoginScreen />;
    }
    return (
        <div className="flex min-h-screen">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "w-64 border-r border-white/10 flex flex-col fixed h-full bg-[#050505] z-40 transition-transform duration-300 ease-in-out",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">P</div>
                            <span className="font-bold text-xl tracking-tight">PayGrid</span>
                        </div>
                        <button
                            className="lg:hidden text-gray-400 hover:text-white"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                            className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icons.Dashboard /> Overview
                        </button>
                        <button
                            onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }}
                            className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icons.Payments /> Payments
                        </button>
                        <button
                            onClick={() => { setActiveTab('apikeys'); setIsSidebarOpen(false); }}
                            className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === 'apikeys' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icons.Key /> API Keys
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <img src="https://picsum.photos/32/32" className="w-8 h-8 rounded-full" alt="User" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Merchant Account</span>
                            <span className="text-xs text-gray-500">Live Mode</span>
                        </div>
                    </div>
                    {(
                        <button
                            onClick={logout}
                            className="w-full cursor-pointer flex items-center gap-2 mt-4 px-2 py-2 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-all text-sm font-medium"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 w-full bg-[#050505] overflow-hidden">
                <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 bg-[#111] border border-white/10 rounded-lg text-gray-400"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold capitalize">{activeTab}</h1>
                            <p className="text-gray-500 text-xs md:text-sm">Manage your Solana payments infrastructure</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <Icons.Search />
                            </div>
                            <input
                                type="text"
                                placeholder="Search intents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : renderContent()}
            </main>
        </div>
    );
}

