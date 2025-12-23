import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* Fix Leaflet icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

import { supabase } from "../supabase";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

function LiveTracking() {
  const [position, setPosition] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [routePath, setRoutePath] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const watchId = useRef(null);
  const lastUpdate = useRef(0); // To throttle DB updates

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);


  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setTracking(true);
    setStartTime(Date.now());
    setRoutePath([]);

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 30000
    };

    const handleError = (err) => {
      console.error("GPS Error:", err);
      let msg = "Unable to track location";
      if (err.code === 1) {
        msg = "Permission Denied. Please allow location access.";
      } else if (err.code === 2) {
        msg = "Position Unavailable. Check your GPS signal.";
      } else if (err.code === 3) {
        msg = "GPS Timeout. Taking too long to find you.";
      }
      alert(`GPS Error (${err.code}): ${msg}`);
      setTracking(false);
    };

    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log(`Pos: ${latitude}, ${longitude} Accuracy: ${accuracy}m`);

        const loc = { lat: latitude, lng: longitude };
        setPosition(loc);
        setRoutePath(prev => [...prev, loc]);

        // Save latest location locally
        localStorage.setItem(
          "liveLocation",
          JSON.stringify({
            ...loc,
            accuracy,
            time: new Date().toISOString()
          })
        );

        // Broadcast to Supabase (Throttle: every 5 seconds max)
        const now = Date.now();
        if (now - lastUpdate.current > 5000) {
          lastUpdate.current = now;
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              supabase.from('travel_matches').upsert({
                user_id: user.id,
                latitude: latitude,
                longitude: longitude,
                last_updated: new Date().toISOString(),
                name: user.user_metadata.full_name || user.email.split('@')[0],
                destination: 'Roaming'
              }, {
                onConflict: 'user_id' // Specify the unique constraint column
              }).then(({ data, error }) => {
                if (error) {
                  console.error("❌ Error broadcasting location:", error);
                } else {
                  console.log("✅ Location broadcast successful:", { lat: latitude, lng: longitude });
                }
              });
            }
          });
        }
      },
      handleError,
      options
    );
  };

  const stopTracking = async () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setTracking(false);

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 60000).toFixed(1);

      let distance = 0;
      for (let i = 0; i < routePath.length - 1; i++) {
        distance += calculateDistance(
          routePath[i].lat, routePath[i].lng,
          routePath[i + 1].lat, routePath[i + 1].lng
        );
      }
      distance = distance.toFixed(2);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && routePath.length > 0) {
          const { error } = await supabase.from('trips').insert({
            user_id: user.id,
            from_location: `${routePath[0].lat}, ${routePath[0].lng}`,
            to_location: `${routePath[routePath.length - 1].lat}, ${routePath[routePath.length - 1].lng}`,
            distance,
            duration
          });
          if (error) throw error;
          alert(`Trip saved! Distance: ${distance}km, Duration: ${duration}m`);
        }
      } catch (err) {
        console.error("Error saving trip:", err);
        alert("Trip saved locally, but failed to sync.");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Live Location Tracking</h2>
          <p className="text-zinc-500 text-sm mt-1">Share your real-time location with trusted contacts</p>
          {position && (
            <p className="text-indigo-400 text-[10px] font-mono mt-1">
              RAW: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {tracking ? (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 text-xs font-medium rounded-full border border-red-500/20 animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-zinc-500 text-xs font-medium rounded-full border border-white/5">
              <span className="w-2 h-2 bg-zinc-500 rounded-full"></span>
              OFFLINE
            </span>
          )}

          {!tracking ? (
            <button onClick={startTracking} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
              <span className="iconify" data-icon="lucide:play" data-width="16"></span>
              Start Tracking
            </button>
          ) : (
            <button onClick={stopTracking} className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2">
              <span className="iconify" data-icon="lucide:square" data-width="16"></span>
              Stop Tracking
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel p-1 rounded-xl overflow-hidden h-[600px] w-full relative z-0">
        <MapContainer
          center={position || [20.5937, 78.9629]}
          zoom={position ? 16 : 5}
          style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          {position && <Marker position={position} />}
        </MapContainer>

        {!position && tracking && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[1000] text-white">
            <div className="flex flex-col items-center">
              <span className="iconify animate-spin mb-2" data-icon="lucide:loader-2" data-width="24"></span>
              <p>Acquiring GPS Signal...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default LiveTracking;
