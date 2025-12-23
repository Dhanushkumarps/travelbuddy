import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const NotificationDropdown = ({ notifications, onClose, onMarkRead }) => {
    const navigate = useNavigate();

    const handleItemClick = async (item) => {
        if (item.type === 'message') {
            // Mark message as read
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', item.id);

            onMarkRead(item.id);
            navigate('/matches'); // Or ideally open specific chat
        } else if (item.type === 'request') {
            navigate('/connect');
        }
        onClose();
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Notifications</h3>
                {notifications.length > 0 && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        {notifications.length} New
                    </span>
                )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="iconify text-zinc-600 mx-auto mb-2" data-icon="lucide:bell-off" data-width="24"></span>
                        <p className="text-xs text-zinc-500">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((item) => (
                            <button
                                key={`${item.type}-${item.id}`}
                                onClick={() => handleItemClick(item)}
                                className="w-full text-left p-4 hover:bg-white/5 transition-colors flex gap-3"
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'message'
                                        ? 'bg-indigo-500/10 text-indigo-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                    }`}>
                                    <span className="iconify"
                                        data-icon={item.type === 'message' ? "lucide:message-circle" : "lucide:user-plus"}
                                        data-width="14"
                                    ></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-200 font-medium truncate">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                                        {item.description}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 mt-1.5">
                                        {item.time}
                                    </p>
                                </div>
                                {item.type === 'message' && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2"></div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
