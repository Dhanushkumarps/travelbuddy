import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/plan">Plan Trip</Link>
      <Link to="/history">History</Link>
      <Link to="/live">Live Tracking</Link>
      <Link to="/expenses">Expenses</Link>
      <Link to="/sos">SOS</Link>
      <Link to="/women-safety">Women Safety</Link>

    </nav>
  );
}
