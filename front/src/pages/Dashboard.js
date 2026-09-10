
// src/pages/Dashboard.js

import React, { useState } from "react";
import DashboardContent from "./DashboardContent";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const Dashboard = () => {
  const [lang, setLang] = useState("am");
  const [collapsed, setCollapsed] = useState(true);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "am" ? "en" : "am"));
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">

      {/* Mobile Menu Button */}
      {collapsed && (
        <button
          type="button"
          className="fixed top-4 left-4 z-30 bg-[#162447] text-white p-2 rounded-lg text-xl shadow-md md:hidden cursor-pointer"
          onClick={() => setCollapsed(false)}
          aria-label="Open menu"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <Sidebar
        currentLang={lang}
        toggleLanguage={toggleLanguage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full overflow-y-auto md:pl-72">

        {/* Header */}
        <Header
          title={
            lang === "am"
              ? "POESSA | ዲጂታል አገልግሎቶች"
              : "POESSA | Digital Services"
          }
        />

        {/* Dashboard Content */}
        <main className="flex-1">
          <DashboardContent />
        </main>

      </div>
    </div>
  );
};

export default Dashboard;

