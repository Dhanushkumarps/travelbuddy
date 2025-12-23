import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

export default function ChatWindow({ currentUser, receiver, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        const subscription = subscribeToMessages();

        return () => {
            subscription.unsubscribe();
        };
    }, [receiver.user_id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiver.user_id}),and(sender_id.eq.${receiver.user_id},receiver_id.eq.${currentUser.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const subscribeToMessages = () => {
        return supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    if (payload.new.sender_id === receiver.user_id) {
                        setMessages((prev) => [...prev, payload.new]);
                    }
                }
            )
            .subscribe();
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const messagePayload = {
                sender_id: currentUser.id,
                receiver_id: receiver.user_id,
                content: newMessage.trim(),
            };

            // Optimistic update
            const tempId = Date.now();
            setMessages((prev) => [...prev, { ...messagePayload, id: tempId, created_at: new Date().toISOString() }]);
            setNewMessage('');

            const { data, error } = await supabase
                .from('messages')
                .insert(messagePayload)
                .select()
                .single();

            if (error) throw error;

            // Replace temp message with actual one (optional, but good for consistency)
            setMessages((prev) => prev.map(m => m.id === tempId ? data : m));

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md h-[600px] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-800/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {receiver.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-white font-bold">{receiver.name}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs text-emerald-400 font-medium">Online</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <span className="iconify" data-icon="lucide:x" data-width="20"></span>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="iconify animate-spin text-indigo-500" data-icon="lucide:loader-2" data-width="32"></span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2 opacity-50">
                            <span className="iconify" data-icon="lucide:message-square" data-width="48"></span>
                            <p className="text-sm">No messages yet. Say hello!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === currentUser.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-white/5'
                                        }`}>
                                        <p>{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-zinc-500'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-zinc-800/30 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center aspect-square"
                        >
                            <span className="iconify" data-icon="lucide:send" data-width="18"></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
