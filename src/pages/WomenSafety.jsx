import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function WomenSafety() {
  const [matches, setMatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [requestData, setRequestData] = useState({
    location: '',
    to_location: '',
    name: ''
  });

  useEffect(() => {
    supabase
      .from("travel_requests")
      .select("*")
      .eq("gender", "female")
      .then(({ data }) => setMatches(data || []));
  }, []);

  const handleCreateRequest = async () => {
    const user = await supabase.auth.getUser();
    // Mock for now if no auth setup or allow any for demo
    const newRequest = {
      gender: 'female',
      location: requestData.location || 'Current Loc',
      to_location: requestData.to_location || 'Destination',
      name: requestData.name || 'Anonymous'
    };

    const { error } = await supabase.from('travel_requests').insert(newRequest);
    if (error) {
      alert('Error creating request');
      console.error(error);
    } else {
      alert('Safety request created!');
      setShowModal(false);
      // Refresh list
      const { data } = await supabase.from("travel_requests").select("*").eq("gender", "female");
      setMatches(data || []);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Women Safety & Connect</h2>
          <p className="text-zinc-500 text-sm mt-1">Connect with verified women travellers nearby</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-pink-500/20"
        >
          Create Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.length === 0 && (
          <div className="col-span-full p-12 text-center border border-white/5 rounded-xl border-dashed">
            <span className="iconify text-zinc-500 mx-auto mb-3" data-icon="lucide:users" data-width="48"></span>
            <p className="text-zinc-400">No nearby travellers found at the moment.</p>
          </div>
        )}

        {matches.map(m => (
          <div key={m.id} className="glass-panel p-5 rounded-xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="iconify text-pink-500" data-icon="lucide:badge-check" data-width="20"></span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {m.name ? m.name[0] : 'U'}
              </div>
              <div>
                <h3 className="text-white font-medium">{m.name || 'Anonymous User'}</h3>
                <p className="text-xs text-zinc-400">Going to {m.to_location || 'Unknown'}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="iconify" data-icon="lucide:map-pin" data-width="14"></span>
                Current Location: <span className="text-zinc-300">{m.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="iconify" data-icon="lucide:clock" data-width="14"></span>
                Leaving: <span className="text-zinc-300">Today, 2 PM</span>
              </div>
            </div>

            <button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-pink-500 group-hover:border-pink-500">
              <span className="iconify" data-icon="lucide:message-circle" data-width="16"></span>
              Connect Securely
            </button>
          </div>
        ))}
      </div>

      {/* Simple Modal for Request */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">Create Travel Request</h3>
            <input
              placeholder="Your Name (Optional)"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
              value={requestData.name} onChange={e => setRequestData({ ...requestData, name: e.target.value })}
            />
            <input
              placeholder="Current Location"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
              value={requestData.location} onChange={e => setRequestData({ ...requestData, location: e.target.value })}
            />
            <input
              placeholder="Destination"
              className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
              value={requestData.to_location} onChange={e => setRequestData({ ...requestData, to_location: e.target.value })}
            />
            <div className="flex gap-2 pt-2">
              <button onClick={handleCreateRequest} className="flex-1 bg-pink-600 hover:bg-pink-500 text-white py-2 rounded-lg text-sm font-medium">Post Request</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
