import { useState, useEffect } from "react";
import { supabase } from "../supabase";

function SOS() {
  const [status, setStatus] = useState("");
  const [active, setActive] = useState(false);
  const [guardianPhone, setGuardianPhone] = useState("");
  const [loadingPhone, setLoadingPhone] = useState(true);
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('guardian_phone')
          .eq('id', user.id)
          .single();

        if (data && data.guardian_phone) {
          setGuardianPhone(data.guardian_phone);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingPhone(false);
    }
  };

  const saveGuardianPhone = async () => {
    try {
      if (!newPhone) return alert("Please enter a phone number");

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({ id: user.id, guardian_phone: newPhone });

        if (error) throw error;
        setGuardianPhone(newPhone);
        alert("Guardian phone saved!");
      }
    } catch (error) {
      console.error("Error saving phone:", error);
      alert("Failed to save phone number");
    }
  };

  const triggerSOS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setStatus("Activating Emergency Protocols... Fetching Location...");
    setActive(true);

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        // 1. WhatsApp Link
        if (guardianPhone) {
          const message = `SOS! I need help. My location: ${mapsLink}`;
          const whatsappUrl = `https://wa.me/${guardianPhone}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }

        setStatus(
          `SOS ACTIVATED.\nLocation sent to Guardian (${guardianPhone || 'Not Set'}).\nLat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
        );
      },
      err => {
        console.error(err);
        alert("Unable to fetch location");
        setStatus("Failed to fetch location.");
        setActive(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="text-center w-full max-w-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Emergency SOS</h2>
          <p className="text-zinc-400">Pressing this button will share your live location via WhatsApp to your Guardian.</p>

          {!loadingPhone && !guardianPhone && (
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl max-w-sm mx-auto">
              <p className="text-orange-200 text-sm mb-2">⚠️ Guardian Phone Not Set</p>
              <div className="flex gap-2">
                <input
                  placeholder="Enter code+number (e.g. 919876543210)"
                  className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-1 text-sm text-white"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
                <button onClick={saveGuardianPhone} className="bg-orange-600 hover:bg-orange-500 text-white text-xs px-3 py-1 rounded font-medium">Save</button>
              </div>
            </div>
          )}

          {!loadingPhone && guardianPhone && (
            <div className="mt-2 text-sm text-emerald-400 flex items-center justify-center gap-2">
              <span className="iconify" data-icon="lucide:shield-check" data-width="16"></span>
              Guardian Configured: {guardianPhone}
            </div>
          )}
        </div>

        <button
          onClick={triggerSOS}
          className={`group relative w-64 h-64 rounded-full border-8 transition-all duration-300 flex flex-col items-center justify-center
                    ${active
              ? 'bg-red-600 border-red-800 shadow-[0_0_100px_rgba(220,38,38,0.6)] animate-pulse'
              : 'bg-zinc-900 border-zinc-800 hover:border-red-500/50 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)]'
            }`}
        >
          <span className="iconify text-white w-20 h-20 mb-2" data-icon="lucide:alert-octagon"></span>
          <span className="text-2xl font-bold text-white tracking-widest">SOS</span>

          {active && (
            <span className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></span>
          )}
        </button>

        {status && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 animate-in fade-in slide-in-from-bottom-4">
            <p className="font-mono text-sm whitespace-pre-wrap">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SOS;
