import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="h-screen w-full flex overflow-hidden text-sm antialiased selection:bg-indigo-500/30 selection:text-indigo-200 bg-zinc-950 text-zinc-200 font-sans">
            {/* Sidebar Navigation */}
            <aside className={`w-64 border-r border-white/5 bg-[#0c0c0e] flex-col justify-between md:flex ${mobileMenuOpen ? 'flex absolute inset-y-0 left-0 z-50' : 'hidden'}`}>
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8 text-white">
                        <span className="iconify text-indigo-500" data-icon="lucide:compass" data-width="1.5" data-height="24"></span>
                        <span className="font-medium tracking-tight text-lg">TRAVEL BUDDY</span>
                    </div>

                    <nav className="space-y-1">
                        <Link to="/" className="flex items-center gap-3 px-3 py-2 text-white bg-white/5 rounded-lg border border-white/5 transition-all">
                            <span className="iconify" data-icon="lucide:layout-dashboard" data-width="1.5"></span>
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link to="/connect" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:users" data-width="1.5"></span>
                            <span className="font-medium">Connect</span>
                        </Link>
                        <Link to="/plan" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:map-pin" data-width="1.5"></span>
                            <span className="font-medium">Plan Trip</span>
                        </Link>
                        <Link to="/history" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:history" data-width="1.5"></span>
                            <span className="font-medium">History</span>
                        </Link>
                        <Link to="/women-safety" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:heart-handshake" data-width="1.5"></span>
                            <span className="font-medium">Women Safety</span>
                            <span className="ml-auto text-[10px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded-full border border-pink-500/20">New</span>
                        </Link>
                        <Link to="/expenses" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:wallet" data-width="1.5"></span>
                            <span className="font-medium">Expenses</span>
                        </Link>
                    </nav>

                    <div className="mt-8">
                        <p className="px-3 text-xs font-medium text-zinc-600 mb-2 uppercase tracking-wider">Safety</p>
                        <nav className="space-y-1">
                            <Link to="/live" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                                <span className="iconify" data-icon="lucide:shield-check" data-width="1.5"></span>
                                <span className="font-medium">Status Check</span>
                            </Link>
                            <Link to="/sos" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                                <span className="iconify" data-icon="lucide:alert-circle" data-width="1.5"></span>
                                <span className="font-medium">SOS</span>
                            </Link>
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5">
                    <button className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-white/5 rounded-lg transition-all group">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-xs text-white border border-white/10 shadow-inner">
                            JD
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-zinc-200 group-hover:text-white">John Doe</span>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <span className="iconify text-emerald-500" data-icon="lucide:verified" data-width="1.5" data-height="10"></span>
                                Verified
                            </span>
                        </div>
                        <span className="iconify ml-auto text-zinc-600 group-hover:text-zinc-400" data-icon="lucide:chevrons-up-down" data-width="1.5"></span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-black/20">

                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-zinc-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <span className="iconify" data-icon="lucide:menu" data-width="1.5" data-height="20"></span>
                        </button>
                        <h1 className="text-base font-medium text-white tracking-tight">Travel Buddy Assistant</h1>
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 ring-1 ring-inset ring-emerald-500/20">
                            Online
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-zinc-400 hover:text-white transition-colors relative">
                            <span className="iconify" data-icon="lucide:bell" data-width="1.5" data-height="20"></span>
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-indigo-500 border border-[#09090b]"></span>
                        </button>
                        <Link to="/sos" className="h-8 w-24 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-md flex items-center justify-center gap-2 text-xs font-medium transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <span className="iconify" data-icon="lucide:alert-circle" data-width="1.5"></span>
                            SOS
                        </Link>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <div className="flex-1">
                    <Outlet />
                </div>

            </main>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
            )}
        </div>
    );
};

export default Layout;
