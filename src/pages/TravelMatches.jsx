import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function TravelMatches() {
    const [location, setLocation] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [connections, setConnections] = useState([]);
    const [selectedReasons, setSelectedReasons] = useState({});

    useEffect(() => {
        initializeData();
    }, []);

    const initializeData = async () => {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { latitude, longitude } = pos.coords;
                    setLocation({ lat: latitude, lng: longitude });
                },
                err => console.error("Error getting location:", err)
            );
        }

        await fetchMatches();
        await fetchConnections();
    };

    const fetchMatches = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch all travel_matches updated in last 30 seconds
            const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();

            const { data, error } = await supabase
                .from('travel_matches')
                .select('*')
                .neq('user_id', user.id) // Exclude current user
                .gte('last_updated', thirtySecondsAgo); // Active in last 30s

            if (error) throw error;
            setMatches(data || []);
        } catch (error) {
            console.error("Error fetching matches:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConnections = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('connection_requests')
                .select('*')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

            if (error) throw error;
            setConnections(data || []);
        } catch (error) {
            console.error("Error fetching connections:", error);
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    const getConnectionStatus = (userId) => {
        if (!currentUser) return null;

        const connection = connections.find(c =>
            (c.sender_id === currentUser.id && c.receiver_id === userId) ||
            (c.receiver_id === currentUser.id && c.sender_id === userId)
        );

        return connection;
    };

    const handleConnect = async (receiverId) => {
        try {
            if (!currentUser) return alert("Please login first");

            // Check for existing connection
            const existingConnection = getConnectionStatus(receiverId);
            if (existingConnection) {
                if (existingConnection.status === 'accepted') {
                    return alert("Already connected!");
                } else if (existingConnection.status === 'pending') {
                    return alert("Request already sent!");
                }
            }

            const reason = selectedReasons[receiverId] || 'general';

            const { error } = await supabase.from('connection_requests').insert({
                sender_id: currentUser.id,
                receiver_id: receiverId,
                status: 'pending',
                reason: reason
            });

            if (error) throw error;
            alert("Connection request sent!");
            await fetchConnections(); // Refresh connections
        } catch (error) {
            console.error(error);
            alert("Failed to send request");
        }
    };

    const getTimeSinceUpdate = (lastUpdated) => {
        const seconds = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
        if (seconds < 10) return "Just now";
        if (seconds < 60) return `${seconds}s ago`;
        return `${Math.floor(seconds / 60)}m ago`;
    };

    // Filter and sort matches
    const processedMatches = matches
        .map(m => {
            let dist = null;
            try {
                dist = location ? calculateDistance(location.lat, location.lng, m.latitude, m.longitude) : null;
            } catch (e) {
                console.error("Distance calc error", e);
            }
            return { ...m, distance: dist ? parseFloat(dist) : null };
        })
        .filter(m => {
            const connection = getConnectionStatus(m.user_id);
            // Show connected users OR users within 5km
            if (connection && connection.status === 'accepted') return true;
            return m.distance !== null && m.distance <= 5;
        })
        .sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });

    return (
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Travel Matches</h2>
                    <p className="text-zinc-500 text-sm mt-1">
                        {processedMatches.length} travelers nearby • {connections.filter(c => c.status === 'accepted').length} connected
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/connect" className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2">
                        <span className="iconify" data-icon="lucide:inbox" data-width="16"></span>
                        Requests
                    </Link>
                    <button onClick={() => { fetchMatches(); fetchConnections(); }} className="text-sm px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
                        <span className="iconify" data-icon="lucide:refresh-cw" data-width="16"></span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <span className="iconify animate-spin text-zinc-500" data-icon="lucide:loader-2" data-width="32"></span>
                </div>
            ) : processedMatches.length === 0 ? (
                <div className="p-12 text-center border border-white/5 rounded-xl border-dashed">
                    <span className="iconify text-zinc-500 mx-auto mb-3" data-icon="lucide:users" data-width="48"></span>
                    <p className="text-zinc-400 mb-2">No travelers found nearby</p>
                    <p className="text-zinc-600 text-sm">Start live tracking or wait for others to come online</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {processedMatches.map((match) => {
                        const safeName = String(match.name || 'Anonymous');
                        const initials = safeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        const connection = getConnectionStatus(match.user_id);
                        const isConnected = connection && connection.status === 'accepted';
                        const isPending = connection && connection.status === 'pending';
                        const isSameDestination = location && match.destination && match.destination !== 'Roaming';

                        return (
                            <div key={match.id} className="glass-panel p-5 rounded-xl hover:bg-white/5 transition-all group relative">
                                {/* Status Badges */}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-medium border border-red-500/20 animate-pulse">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                        LIVE
                                    </span>
                                    {isConnected && (
                                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium border border-emerald-500/20">
                                            CONNECTED
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-start gap-3 mb-4 mt-6">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm text-white font-medium shadow-lg">
                                        {initials}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-white">{safeName}</h3>
                                        <p className="text-xs text-zinc-500">{getTimeSinceUpdate(match.last_updated)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <span className="iconify" data-icon="lucide:map-pin" data-width="14"></span>
                                        <span className={isSameDestination ? "text-emerald-400 font-medium" : ""}>
                                            {match.destination || 'Roaming'}
                                        </span>
                                        {isSameDestination && (
                                            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Same destination
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <span className="iconify" data-icon="lucide:navigation" data-width="14"></span>
                                        <span className="text-indigo-400 font-medium">
                                            {match.distance !== null ? `${match.distance} km away` : 'Distance unknown'}
                                        </span>
                                    </div>
                                </div>

                                {/* Reason to Connect */}
                                {!isConnected && !isPending && (
                                    <div className="mb-4">
                                        <label className="block text-xs text-zinc-500 mb-2">Reason to connect:</label>
                                        <select
                                            value={selectedReasons[match.user_id] || 'general'}
                                            onChange={(e) => setSelectedReasons({ ...selectedReasons, [match.user_id]: e.target.value })}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                        >
                                            <option value="general">General connection</option>
                                            <option value="same_destination">Same destination</option>
                                            <option value="solo_traveler">Solo traveler</option>
                                            <option value="night_safety">Night safety</option>
                                            <option value="women_safety">Women safety</option>
                                        </select>
                                    </div>
                                )}

                                {/* Action Button */}
                                {isConnected ? (
                                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium cursor-default">
                                        <span className="iconify" data-icon="lucide:check-circle" data-width="16"></span>
                                        Connected
                                    </button>
                                ) : isPending ? (
                                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm font-medium cursor-default">
                                        <span className="iconify" data-icon="lucide:clock" data-width="16"></span>
                                        Request Sent
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(match.user_id)}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        <span className="iconify" data-icon="lucide:user-plus" data-width="16"></span>
                                        Send Request
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
