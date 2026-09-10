import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-8 text-center">Kotera Admin</h2>
      <nav className="space-y-4">
        <Link to="/dashboard" className="block py-2.5 px-4 rounded transition hover:bg-blue-800">
          Dashboard
        </Link>
        <Link to="/verify" className="block py-2.5 px-4 rounded transition hover:bg-blue-800">
          Verify Pensioner
        </Link>
        <Link to="/register" className="block py-2.5 px-4 rounded transition hover:bg-blue-800">
          Register Pensioner
        </Link>
        <Link to="/renewal" className="block py-2.5 px-4 rounded transition hover:bg-blue-800">
          Renewal Management
        </Link>
        <Link to="/reports" className="block py-2.5 px-4 rounded transition hover:bg-blue-800">
          Reports
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;