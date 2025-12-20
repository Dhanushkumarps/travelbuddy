import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

const Dashboard = () => {
    const [matches, setMatches] = useState([]);
    const [liveLocation, setLiveLocation] = useState(null);
    const [currentTrip, setCurrentTrip] = useState(null);
    const [recentTrips, setRecentTrips] = useState([]);
    const [safetyStatus, setSafetyStatus] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        fetchDashboardData();
        checkLiveTracking();

        // Poll for updates every 10 seconds
        const interval = setInterval(() => {
            checkLiveTracking();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch travel matches
            const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
            const { data: matchesData } = await supabase
                .from('travel_matches')
                .select('*')
                .neq('user_id', user.id)
                .gte('last_updated', thirtySecondsAgo)
                .limit(2);
            setMatches(matchesData || []);

            // Fetch recent trips for timeline
            const { data: tripsData } = await supabase
                .from('trips')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);
            setRecentTrips(tripsData || []);

            // Fetch expenses
            const { data: expensesData } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);
            setExpenses(expensesData || []);

            const total = expensesData?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
            setTotalExpenses(total);

            // Check safety status from localStorage
            const savedSafety = localStorage.getItem('safetyStatus');
            if (savedSafety) {
                setSafetyStatus(JSON.parse(savedSafety));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const checkLiveTracking = () => {
        // Check if live tracking is active
        const liveData = localStorage.getItem('liveLocation');
        if (liveData) {
            const parsed = JSON.parse(liveData);
            const lastUpdate = new Date(parsed.time);
            const now = new Date();
            const diffSeconds = (now - lastUpdate) / 1000;

            if (diffSeconds < 30) {
                setIsTracking(true);
                setLiveLocation(parsed);
                setCurrentTrip({
                    from: 'Current Location',
                    to: parsed.destination || 'Tracking...',
                    distance: parsed.distance || '0',
                    eta: parsed.eta || 'Calculating...'
                });
            } else {
                setIsTracking(false);
                setLiveLocation(null);
            }
        }
    };

    const toggleSafetyStatus = () => {
        const newStatus = !safetyStatus;
        setSafetyStatus(newStatus);
        localStorage.setItem('safetyStatus', JSON.stringify(newStatus));

        if (newStatus) {
            alert('Safety status updated! Your contacts have been notified.');
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDistance = (dist) => {
        if (!dist) return '0 km';
        const km = parseFloat(dist);
        if (km < 1) return `${(km * 1000).toFixed(0)} m`;
        return `${km.toFixed(1)} km`;
    };

    const getExpenseIcon = (category) => {
        const icons = {
            'food': 'lucide:utensils',
            'transport': 'lucide:fuel',
            'accommodation': 'lucide:bed',
            'entertainment': 'lucide:ticket',
            'other': 'lucide:shopping-bag'
        };
        return icons[category] || 'lucide:dollar-sign';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
            {/* Top Row: Map & Route Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Map Card */}
                <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden flex flex-col h-[400px] relative group">
                    <div className="absolute inset-0 map-grid opacity-20"></div>

                    {isTracking && liveLocation ? (
                        <>
                            {/* Live tracking indicator */}
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
                                            <p className="text-sm text-white font-medium">
                                                {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider mb-0.5">Destination</p>
                                            <p className="text-sm text-white font-medium">{currentTrip?.to || 'Roaming'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Stats Overlay */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <div className="bg-[#09090b]/90 backdrop-blur border border-white/10 rounded-lg px-4 py-2 shadow-xl">
                                    <p className="text-[10px] text-zinc-500 uppercase font-medium">Tracking</p>
                                    <p className="text-sm text-emerald-400 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                        LIVE
                                    </p>
                                </div>
                                <div className="bg-[#09090b]/90 backdrop-blur border border-white/10 rounded-lg px-4 py-2 shadow-xl">
                                    <p className="text-[10px] text-zinc-500 uppercase font-medium">Accuracy</p>
                                    <p className="text-sm text-white font-medium">{liveLocation.accuracy?.toFixed(0) || '0'} m</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <span className="iconify text-zinc-700 mb-3" data-icon="lucide:map-off" data-width="48"></span>
                                <p className="text-zinc-500 text-sm">No active tracking</p>
                                <Link to="/live" className="mt-3 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
                                    Start Live Tracking
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Safety & Reminders Panel */}
                <div className="space-y-6">
                    {/* Safety Status */}
                    <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white tracking-tight">Safety Check</h3>
                            <span className="iconify text-emerald-500" data-icon="lucide:shield-check" data-width="18"></span>
                        </div>
                        <div className="space-y-4">
                            <div className={`p-3 ${isTracking ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-zinc-800/50 border-zinc-700/50'} border rounded-lg`}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <span className={`iconify ${isTracking ? 'text-emerald-500' : 'text-zinc-600'}`} data-icon="lucide:check-circle-2" data-width="18"></span>
                                    </div>
                                    <div>
                                        <p className={`text-xs font-medium ${isTracking ? 'text-emerald-200' : 'text-zinc-400'}`}>
                                            {isTracking ? 'Trip Shared' : 'Not Tracking'}
                                        </p>
                                        <p className={`text-[10px] mt-0.5 ${isTracking ? 'text-emerald-500/70' : 'text-zinc-600'}`}>
                                            {isTracking ? 'Live location is being broadcast' : 'Start tracking to share location'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">Reached Safely?</span>
                                    <div
                                        onClick={toggleSafetyStatus}
                                        className={`w-10 h-5 rounded-full relative shadow-inner transition-colors ${safetyStatus ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${safetyStatus ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="glass-panel rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white tracking-tight">Recent Trips</h3>
                            <span className="iconify text-zinc-500" data-icon="lucide:clock" data-width="18"></span>
                        </div>
                        <div className="relative pl-4 border-l border-zinc-800 space-y-6">
                            {recentTrips.length === 0 ? (
                                <div className="text-xs text-zinc-500">No recent trips</div>
                            ) : (
                                recentTrips.map((trip, index) => (
                                    <div key={trip.id} className={`relative ${index > 0 ? 'opacity-50' : ''}`}>
                                        <div className={`absolute -left-[21px] top-0 h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-indigo-500' : 'bg-zinc-700'} ring-4 ring-[#09090b]`}></div>
                                        <p className="text-xs text-zinc-400 mb-0.5">{formatTime(trip.created_at)}</p>
                                        <p className="text-sm text-zinc-200 font-medium">{trip.to_location || 'Unknown destination'}</p>
                                        <p className="text-[10px] text-zinc-600 mt-0.5">{formatDistance(trip.distance)}</p>
                                    </div>
                                ))
                            )}
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
                            <div className="p-6 text-center text-zinc-500 text-xs">
                                No matches found nearby.
                                <Link to="/live" className="block mt-2 text-indigo-400 hover:text-indigo-300">Start tracking to find travelers</Link>
                            </div>
                        ) : matches.map(match => {
                            const initials = (match.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            return (
                                <div key={match.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs text-white font-medium">
                                            {initials}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#09090b] rounded-full"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-medium text-zinc-200">{match.name || 'Anonymous'}</h4>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                                            <span className="iconify" data-icon="lucide:map-pin" data-width="12"></span>
                                            {match.destination || 'Roaming'}
                                        </p>
                                    </div>
                                    <Link to="/matches" className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100">
                                        <span className="iconify" data-icon="lucide:message-square" data-width="16"></span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Group Expenses */}
                <div className="glass-panel rounded-xl p-0 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-white tracking-tight">Trip Wallet</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">Your expenses</p>
                        </div>
                        <Link to="/expenses" className="flex items-center gap-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md transition-all shadow-lg shadow-indigo-500/20">
                            <span className="iconify" data-icon="lucide:plus" data-width="14"></span>
                            Add Expense
                        </Link>
                    </div>

                    <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-zinc-400">Total Spent</span>
                            <span className="text-lg text-white font-bold">${totalExpenses.toFixed(2)}</span>
                        </div>

                        <div className="space-y-4">
                            {expenses.length === 0 ? (
                                <div className="text-center text-zinc-500 text-xs py-4">
                                    No expenses yet
                                </div>
                            ) : (
                                expenses.map(expense => (
                                    <div key={expense.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                <span className="iconify" data-icon={getExpenseIcon(expense.category)} data-width="16"></span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-200">{expense.description || 'Expense'}</p>
                                                <p className="text-[10px] text-zinc-500">{expense.category || 'Other'}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-white">${expense.amount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {expenses.length > 0 && (
                            <div className="mt-5 pt-4 border-t border-white/5">
                                <Link to="/expenses" className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-all flex items-center justify-center gap-2">
                                    <span className="iconify" data-icon="lucide:file-text" data-width="14"></span>
                                    View All Expenses
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
