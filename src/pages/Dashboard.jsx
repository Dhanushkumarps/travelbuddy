import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

const Dashboard = () => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        supabase.from('travel_matches')
            .select('*')
            .order('match_percentage', { ascending: false })
            .limit(2)
            .then(({ data }) => setMatches(data || []));
    }, []);
    return (
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">

            {/* Top Row: Map & Route Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Map Card */}
                <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden flex flex-col h-[400px] relative group">
                    <div className="absolute inset-0 map-grid opacity-20"></div>
                    {/* Fake Map Elements */}
                    <div className="absolute top-1/2 left-1/4 h-32 w-64 border-t-2 border-r-2 border-indigo-500/50 rounded-tr-3xl transform -translate-y-1/2 translate-x-12 z-0"></div>
                    <div className="absolute top-1/2 left-1/4 h-3 w-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10 animate-pulse"></div>
                    <div className="absolute top-[35%] right-[20%] h-3 w-3 bg-white rounded-full border-2 border-zinc-700 z-10"></div>

                    {/* Route UI Overlay */}
                    <div className="absolute top-4 left-4 bg-[#09090b]/90 backdrop-blur border border-white/10 rounded-lg p-3 w-64 shadow-2xl z-10">
                        <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 mt-1">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                <div className="w-0.5 h-8 bg-zinc-800"></div>
                                <div className="w-2 h-2 rounded-full border border-zinc-500"></div>
                            </div>
                            <div className="flex-1">
                                <div className="mb-3">
                                    <p className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider mb-0.5">Current Location</p>
                                    <p className="text-sm text-white font-medium">Santa Monica Pier</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider mb-0.5">Destination</p>
                                    <p className="text-sm text-white font-medium">Malibu Beach</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Stats Overlay */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <div className="bg-[#09090b]/90 backdrop-blur border border-white/10 rounded-lg px-4 py-2 shadow-xl">
                            <p className="text-[10px] text-zinc-500 uppercase font-medium">Est. Arrival</p>
                            <p className="text-sm text-white font-medium">10:45 AM</p>
                        </div>
                        <div className="bg-[#09090b]/90 backdrop-blur border border-white/10 rounded-lg px-4 py-2 shadow-xl">
                            <p className="text-[10px] text-zinc-500 uppercase font-medium">Distance</p>
                            <p className="text-sm text-white font-medium">12.4 mi</p>
                        </div>
                    </div>
                </div>

                {/* Safety & Reminders Panel */}
                <div className="space-y-6">
                    {/* Safety Status */}
                    <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white tracking-tight">Safety Check</h3>
                            <span className="iconify text-emerald-500" data-icon="lucide:shield-check" data-width="1.5"></span>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <span className="iconify text-emerald-500" data-icon="lucide:check-circle-2" data-width="1.5"></span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-emerald-200">Trip Shared</p>
                                        <p className="text-[10px] text-emerald-500/70 mt-0.5">Live location shared with Mom & Partner.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">Reached Safely?</span>
                                    <div className="w-10 h-5 bg-zinc-700 rounded-full relative shadow-inner">
                                        <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-400 rounded-full transition-all"></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Next Reminder */}
                    <div className="glass-panel rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white tracking-tight">Timeline</h3>
                            <span className="iconify text-zinc-500" data-icon="lucide:clock" data-width="1.5"></span>
                        </div>
                        <div className="relative pl-4 border-l border-zinc-800 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-0 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-[#09090b]"></div>
                                <p className="text-xs text-zinc-400 mb-0.5">10:45 AM</p>
                                <p className="text-sm text-zinc-200 font-medium">Coffee Break at Malibu</p>
                            </div>
                            <div className="relative opacity-50">
                                <div className="absolute -left-[21px] top-0 h-2.5 w-2.5 rounded-full bg-zinc-700 ring-4 ring-[#09090b]"></div>
                                <p className="text-xs text-zinc-400 mb-0.5">12:30 PM</p>
                                <p className="text-sm text-zinc-200 font-medium">Check-in at Hotel</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Connect & Expenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Solo Traveller Match */}
                <div className="glass-panel rounded-xl p-0 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-white tracking-tight">Traveller Match</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">Nearby solo travellers going your way</p>
                        </div>
                        <Link to="/matches" className="text-xs bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-1.5 rounded-md border border-white/5 transition-all">View All</Link>
                    </div>

                    <div className="divide-y divide-white/5">
                        {matches.length === 0 ? (
                            <div className="p-6 text-center text-zinc-500 text-xs">No matches found nearby.</div>
                        ) : matches.map(match => (
                            <div key={match.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                <div className="relative">
                                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${match.avatar_color || 'from-zinc-700 to-zinc-600'} flex items-center justify-center text-xs text-white font-medium`}>
                                        {match.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#09090b] rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-medium text-zinc-200">{match.name}</h4>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">{match.match_percentage}% Match</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                        <span className="iconify" data-icon="lucide:map-pin" data-width="1.5" data-height="10"></span>
                                        {match.destination}
                                    </p>
                                </div>
                                <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100">
                                    <span className="iconify" data-icon="lucide:message-square" data-width="1.5"></span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Group Expenses */}
                <div className="glass-panel rounded-xl p-0 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-white tracking-tight">Trip Wallet</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">Group spending & splits</p>
                        </div>
                        <Link to="/expenses" className="flex items-center gap-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md transition-all shadow-lg shadow-indigo-500/20">
                            <span className="iconify" data-icon="lucide:plus" data-width="1.5"></span>
                            Add Expense
                        </Link>
                    </div>

                    <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-400">Total Spent</span>
                            <span className="text-xs text-zinc-400">Your Share: <span className="text-white">$145.00</span></span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-6 flex">
                            <div className="bg-indigo-500 h-full w-[45%]"></div>
                            <div className="bg-emerald-500 h-full w-[30%]"></div>
                            <div className="bg-zinc-600 h-full w-[25%]"></div>
                        </div>

                        <div className="space-y-4">
                            {/* Expense Item */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <span class="iconify" data-icon="lucide:fuel" data-width="1.5"></span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">Gas Station</p>
                                        <p className="text-[10px] text-zinc-500">Paid by You • Split equally</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-white">$45.00</span>
                            </div>

                            {/* Expense Item */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <span class="iconify" data-icon="lucide:utensils" data-width="1.5"></span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">Lunch @ Diner</p>
                                        <p className="text-[10px] text-zinc-500">Paid by Sarah • You owe $12</p>
                                    </div>
                                </div>
                                <span class="text-sm font-medium text-white">$36.00</span>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/5">
                            <button className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-all flex items-center justify-center gap-2">
                                <span class="iconify" data-icon="lucide:file-text" data-width="1.5"></span>
                                View Settlement Report
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Dashboard;
