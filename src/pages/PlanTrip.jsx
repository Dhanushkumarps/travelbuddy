import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import axios from "axios";
import L from "leaflet";
import { supabase } from "../supabase";

/* Fix marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

/* Handle map clicks */
function MapClickHandler({ start, setStart, end, setEnd }) {
  useMapEvents({
    click(e) {
      if (!start) setStart(e.latlng);
      else if (!end) setEnd(e.latlng);
    }
  });
  return null;
}

function PlanTrip() {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateRoute = async () => {
    if (!start || !end) {
      alert("Please select start and end points");
      return;
    }

    try {
      setLoading(true);

      // OSRM public routing API
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

      const response = await axios.get(url);
      const route = response.data.routes[0];

      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
      const distance = (route.distance / 1000).toFixed(2);
      const duration = (route.duration / 60).toFixed(1);

      setRouteCoords(coords);
      setInfo({ distance, duration });

      /* 🔐 SAVE TO SUPABASE (IMPORTANT FIX) */
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        // alert("Please login again"); 
        // Allow guest for demo purposes if needed, strictly asking for login might break flow if not properly set up
        // But code says "Please login again", so we keep it logic-wise mostly same 
        // but maybe just warn instead of fail to match "better ui" request not breaking everything
        // For now sticking to logic.
        alert("Please login again");
        return;
      }

      const { error } = await supabase.from("trips").insert({
        user_id: userData.user.id,
        from_location: `${start.lat}, ${start.lng}`,
        to_location: `${end.lat}, ${end.lng}`,
        distance,
        duration
      });

      if (error) {
        console.error(error);
        alert(`Failed to save trip: ${error.message}`);
      } else {
        alert("Route calculated & trip saved successfully");
      }

    } catch (error) {
      console.error(error);
      alert("Routing service unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Plan New Trip</h2>
          <p className="text-zinc-500 text-sm mt-1">Select start and end points on the map</p>
        </div>

        <div className="flex items-center gap-4">
          {info && (
            <div className="flex gap-4">
              <div className="px-3 py-1.5 bg-zinc-900 rounded-lg border border-white/5">
                <span className="text-xs text-zinc-500 uppercase">Distance</span>
                <p className="text-sm text-white font-medium">{info.distance} km</p>
              </div>
              <div className="px-3 py-1.5 bg-zinc-900 rounded-lg border border-white/5">
                <span className="text-xs text-zinc-500 uppercase">Duration</span>
                <p className="text-sm text-white font-medium">{info.duration} mins</p>
              </div>
            </div>
          )}
          <button
            onClick={calculateRoute}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Calculating..." : "Calculate Route"}
          </button>
          <button
            onClick={() => { setStart(null); setEnd(null); setRouteCoords([]); setInfo(null); }}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-4 py-2 rounded-lg transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="glass-panel p-1 rounded-xl overflow-hidden h-[600px] w-full relative z-0">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          <MapClickHandler
            start={start}
            setStart={setStart}
            end={end}
            setEnd={setEnd}
          />

          {start && <Marker position={start} />}
          {end && <Marker position={end} />}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="#6366f1" weight={4} opacity={0.8} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default PlanTrip;
