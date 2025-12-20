import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function TripHistory() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    supabase.from("trips")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setTrips(data || []));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Trip History</h2>
          <p className="text-zinc-500 text-sm mt-1">Your past journeys and routes</p>
        </div>
      </div>

      {trips.length === 0 && (
        <div className="p-12 text-center border border-white/5 rounded-xl border-dashed">
          <span className="iconify text-zinc-500 mx-auto mb-3" data-icon="lucide:map-off" data-width="48"></span>
          <p className="text-zinc-400">No trips recorded yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map(t => (
          <div key={t.id} className="glass-panel p-5 rounded-xl hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <span className="iconify" data-icon="lucide:map" data-width="20"></span>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium">Trip ID: {t.id.slice(0, 8)}</p>
                <p className="text-xs text-zinc-400">{new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <div className="ml-auto">
                <span className="iconify text-zinc-600 group-hover:text-zinc-300 transition-colors" data-icon="lucide:chevron-right" data-width="20"></span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <div className="w-0.5 h-6 bg-zinc-800"></div>
                  <div className="w-2 h-2 rounded-full border border-zinc-500"></div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider mb-0.5">Origin</p>
                    <p className="text-sm text-zinc-200 font-medium truncate" title={t.from_location}>{t.from_location}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider mb-0.5">Destination</p>
                    <p className="text-sm text-zinc-200 font-medium truncate" title={t.to_location}>{t.to_location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">Distance</p>
                <p className="text-sm font-medium text-white">{t.distance} km</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase">Duration</p>
                <p className="text-sm font-medium text-white">{t.duration || 0} mins</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
