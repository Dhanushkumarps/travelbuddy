import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import NotificationDropdown from './NotificationDropdown';

const Layout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Subscribe to new messages and requests
            const subscription = supabase
                .channel('global-notifications')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
                    () => fetchNotifications())
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connection_requests', filter: `receiver_id=eq.${user.id}` },
                    () => fetchNotifications())
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;

        // Fetch pending requests
        const { data: requests } = await supabase
            .from('connection_requests')
            .select(`
                id,
                created_at,
                sender_id
            `)
            .eq('receiver_id', user.id)
            .eq('status', 'pending');

        // Fetch unread messages
        const { data: messages } = await supabase
            .from('messages')
            .select(`
                id,
                content,
                created_at,
                sender_id
            `)
            .eq('receiver_id', user.id)
            .eq('is_read', false);

        // Get sender names (optimization: could be better but works for now)
        const senderIds = [...new Set([
            ...(requests?.map(r => r.sender_id) || []),
            ...(messages?.map(m => m.sender_id) || [])
        ])];

        let senderNames = {};
        if (senderIds.length > 0) {
            const { data: users } = await supabase
                .from('travel_matches') // Assuming travel_matches has names
                .select('user_id, name')
                .in('user_id', senderIds);

            users?.forEach(u => senderNames[u.user_id] = u.name);
        }

        const formattedRequests = (requests || []).map(r => ({
            type: 'request',
            id: r.id,
            title: 'New Connection Request',
            description: `${senderNames[r.sender_id] || 'Someone'} wants to connect`,
            time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            originalTime: new Date(r.created_at)
        }));

        const formattedMessages = (messages || []).map(m => ({
            type: 'message',
            id: m.id,
            title: senderNames[m.sender_id] || 'Unknown User',
            description: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            originalTime: new Date(m.created_at)
        }));

        const allNotifications = [...formattedRequests, ...formattedMessages]
            .sort((a, b) => b.originalTime - a.originalTime);

        setNotifications(allNotifications);
    };

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const handleLogout = async () => {
        const confirmed = confirm('Are you sure you want to logout?');
        if (!confirmed) return;

        await supabase.auth.signOut();
        navigate('/login');
    };

    const getInitials = (email) => {
        if (!email) return 'U';
        return email.substring(0, 2).toUpperCase();
    };

    const getUserName = (email) => {
        if (!email) return 'User';
        return email.split('@')[0];
    };

    return (
        <div className="h-screen w-full flex overflow-hidden text-sm antialiased selection:bg-indigo-500/30 selection:text-indigo-200 bg-zinc-950 text-zinc-200 font-sans">
            {/* Sidebar Navigation */}
            <aside className={`w-64 border-r border-white/5 bg-[#0c0c0e] flex-col justify-between md:flex ${mobileMenuOpen ? 'flex absolute inset-y-0 left-0 z-50' : 'hidden'}`}>
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8 text-white">
                        <span className="iconify text-indigo-500" data-icon="lucide:compass" data-width="24"></span>
                        <span className="font-medium tracking-tight text-lg">TRAVEL BUDDY</span>
                    </div>

                    <nav className="space-y-1">
                        <Link to="/" className="flex items-center gap-3 px-3 py-2 text-white bg-white/5 rounded-lg border border-white/5 transition-all">
                            <span className="iconify" data-icon="lucide:layout-dashboard" data-width="18"></span>
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link to="/connect" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:users" data-width="18"></span>
                            <span className="font-medium">Connect</span>
                        </Link>
                        <Link to="/plan" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:map-pin" data-width="18"></span>
                            <span className="font-medium">Plan Trip</span>
                        </Link>
                        <Link to="/history" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:history" data-width="18"></span>
                            <span className="font-medium">History</span>
                        </Link>
                        <Link to="/women-safety" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:heart-handshake" data-width="18"></span>
                            <span className="font-medium">Women Safety</span>
                            <span className="ml-auto text-[10px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded-full border border-pink-500/20">New</span>
                        </Link>
                        <Link to="/expenses" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                            <span className="iconify" data-icon="lucide:wallet" data-width="18"></span>
                            <span className="font-medium">Expenses</span>
                        </Link>
                    </nav>

                    <div className="mt-8">
                        <p className="px-3 text-xs font-medium text-zinc-600 mb-2 uppercase tracking-wider">Safety</p>
                        <nav className="space-y-1">
                            <Link to="/live" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                                <span className="iconify" data-icon="lucide:shield-check" data-width="18"></span>
                                <span className="font-medium">Status Check</span>
                            </Link>
                            <Link to="/sos" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all">
                                <span className="iconify" data-icon="lucide:alert-circle" data-width="18"></span>
                                <span className="font-medium">SOS</span>
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="p-4 border-t border-white/5 relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-white/5 rounded-lg transition-all group"
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs text-white border border-white/10 shadow-lg">
                            {getInitials(user?.email)}
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                                {getUserName(user?.email)}
                            </span>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <span className="iconify text-emerald-500" data-icon="lucide:verified" data-width="10"></span>
                                Verified
                            </span>
                        </div>
                        <span className={`iconify ml-auto text-zinc-600 group-hover:text-zinc-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} data-icon="lucide:chevron-up" data-width="16"></span>
                    </button>

                    {/* Slide-up Profile Menu */}
                    {showProfileMenu && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-[#0c0c0e] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[60]">
                            <div className="p-4 border-b border-white/5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm text-white border-2 border-white/10 shadow-lg">
                                        {getInitials(user?.email)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{getUserName(user?.email)}</p>
                                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                                        <span className="iconify" data-icon="lucide:verified" data-width="12"></span>
                                        Verified
                                    </span>
                                    <span className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                                        <span className="iconify" data-icon="lucide:shield-check" data-width="12"></span>
                                        Secure
                                    </span>
                                </div>
                            </div>

                            <div className="p-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-all group cursor-pointer"
                                >
                                    <span className="iconify" data-icon="lucide:log-out" data-width="16"></span>
                                    <span className="font-medium">Logout</span>
                                    <span className="iconify ml-auto text-zinc-600 group-hover:text-red-400" data-icon="lucide:arrow-right" data-width="14"></span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-black/20">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-zinc-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <span className="iconify" data-icon="lucide:menu" data-width="20"></span>
                        </button>
                        <h1 className="text-base font-medium text-white tracking-tight">Travel Buddy Assistant</h1>
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 ring-1 ring-inset ring-emerald-500/20">
                            Online
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`text-zinc-400 hover:text-white transition-colors relative ${showNotifications ? 'text-white' : ''}`}
                            >
                                <span className="iconify" data-icon="lucide:bell" data-width="20"></span>
                                {notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-indigo-500 border border-[#09090b]"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                    <NotificationDropdown
                                        notifications={notifications}
                                        onClose={() => setShowNotifications(false)}
                                        onMarkRead={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                                    />
                                </>
                            )}
                        </div>
                        <Link to="/sos" className="h-8 w-24 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-md flex items-center justify-center gap-2 text-xs font-medium transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <span className="iconify" data-icon="lucide:alert-circle" data-width="14"></span>
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

            {/* Click outside to close profile menu */}
            {showProfileMenu && (
                <div className="fixed inset-0 z-50" onClick={() => setShowProfileMenu(false)}></div>
            )}
        </div>
    );
};

export default Layout;
