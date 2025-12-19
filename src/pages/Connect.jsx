import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Connect() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'sent'

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let query = supabase
                .from('connection_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (activeTab === 'incoming') {
                query = query.eq('receiver_id', user.id).eq('status', 'pending');
            } else {
                query = query.eq('sender_id', user.id);
            }

            const { data: reqs, error } = await query;
            if (error) throw error;

            if (reqs && reqs.length > 0) {
                // Fetch user details from travel_matches for both sender and receiver
                const userIds = activeTab === 'incoming'
                    ? reqs.map(r => r.sender_id)
                    : reqs.map(r => r.receiver_id);

                const { data: matches } = await supabase
                    .from('travel_matches')
                    .select('user_id, name')
                    .in('user_id', userIds);

                // Enrich requests with names
                const enrichedRequests = reqs.map(r => {
                    const targetId = activeTab === 'incoming' ? r.sender_id : r.receiver_id;
                    const match = matches?.find(m => m.user_id === targetId);
                    return {
                        ...r,
                        user_name: match?.name || 'Anonymous Traveler'
                    };
                });

                setRequests(enrichedRequests);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, status) => {
        try {
            const { error } = await supabase
                .from('connection_requests')
                .update({ status })
                .eq('id', requestId);

            if (error) throw error;

            setRequests(prev => prev.filter(r => r.id !== requestId));
            alert(`Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}`);
        } catch (error) {
            console.error("Error updating request:", error);
            alert("Failed to update request");
        }
    };

    const getReasonLabel = (reason) => {
        const labels = {
            'same_destination': 'Same Destination',
            'solo_traveler': 'Solo Traveler',
            'night_safety': 'Night Safety',
            'women_safety': 'Women Safety',
            'general': 'General Connection'
        };
        return labels[reason] || 'General Connection';
    };

    const getReasonColor = (reason) => {
        const colors = {
            'same_destination': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'solo_traveler': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'night_safety': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            'women_safety': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
            'general': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
        };
        return colors[reason] || colors['general'];
    };

    const getStatusBadge = (status) => {
        if (status === 'accepted') {
            return <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Accepted</span>;
        } else if (status === 'rejected') {
            return <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">Rejected</span>;
        } else {
            return <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">Pending</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Connection Requests</h2>
                    <p className="text-zinc-500 text-sm mt-1">Manage your travel connections</p>
                </div>
                <Link to="/matches" className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2">
                    <span className="iconify" data-icon="lucide:users" data-width="16"></span>
                    Find Travelers
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('incoming')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'incoming'
                            ? 'text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Incoming
                    {activeTab === 'incoming' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === 'sent'
                            ? 'text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Sent
                    {activeTab === 'sent' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                    )}
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <span className="iconify animate-spin text-zinc-500" data-icon="lucide:loader-2" data-width="32"></span>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-white/5 rounded-xl border-dashed bg-white/[0.02]">
                    <span className="iconify text-zinc-600 mb-3" data-icon="lucide:inbox" data-width="48"></span>
                    <p className="text-zinc-400 font-medium">
                        {activeTab === 'incoming' ? 'No pending requests' : 'No sent requests'}
                    </p>
                    <p className="text-zinc-600 text-sm mt-1">
                        {activeTab === 'incoming'
                            ? 'When travelers send you connection requests, they will appear here'
                            : 'Go to Matches to send connection requests'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => {
                        const initials = req.user_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                        return (
                            <div key={req.id} className="glass-panel p-5 rounded-xl">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {initials}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h3 className="text-white font-medium">{req.user_name}</h3>
                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                    {new Date(req.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            {activeTab === 'sent' && getStatusBadge(req.status)}
                                        </div>

                                        {req.reason && (
                                            <div className="mb-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getReasonColor(req.reason)}`}>
                                                    <span className="iconify" data-icon="lucide:info" data-width="12"></span>
                                                    {getReasonLabel(req.reason)}
                                                </span>
                                            </div>
                                        )}

                                        {activeTab === 'incoming' && req.status === 'pending' && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleAction(req.id, 'accepted')}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-sm font-medium"
                                                >
                                                    <span className="iconify" data-icon="lucide:check" data-width="16"></span>
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'rejected')}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm font-medium"
                                                >
                                                    <span className="iconify" data-icon="lucide:x" data-width="16"></span>
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
