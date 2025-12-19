import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
// Existing Pages
import PlanTrip from "./pages/PlanTrip";
import TripHistory from "./pages/TripHistory";
import LiveTracking from "./pages/LiveTracking";
import Expenses from "./pages/Expenses";
import SOS from "./pages/SOS";
import WomenSafety from "./pages/WomenSafety";
import TravelMatches from "./pages/TravelMatches";
import Connect from "./pages/Connect";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Wrapped in ProtectedRoute & Layout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="plan" element={<PlanTrip />} />
            <Route path="history" element={<TripHistory />} />
            <Route path="live" element={<LiveTracking />} />
            <Route path="matches" element={<TravelMatches />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="sos" element={<SOS />} />
            <Route path="women-safety" element={<WomenSafety />} />
            <Route path="connect" element={<Connect />} />
          </Route>
        </Route>

        {/* Catch all - redirect to dashboard if logged in, else login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
