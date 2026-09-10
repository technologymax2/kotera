import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ currentLang, toggleLanguage, collapsed, setCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: "/dashboard",
      labelAm: "ዳሽቦርድ",
      labelEn: "Dashboard",
      icon: "📊",
    },
    {
      path: "/verify",
      labelAm: "የህይወት ማረጋገጫ",
      labelEn: "Verify Pensioner",
      icon: "👤",
    },
    {
      path: "/register",
      labelAm: "ጡረተኛ መዝገብ",
      labelEn: "Register Pensioner",
      icon: "📝",
    },
    {
      path: "/renewal",
      labelAm: "እድሳት አስተዳደር",
      labelEn: "Renewal Management",
      icon: "🔄",
    },
    {
      path: "/reports",
      labelAm: "ሪፖርቶች",
      labelEn: "Reports",
      icon: "📈",
    },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile when sidebar is open */}
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#162447] text-white flex flex-col shadow-2xl transition-transform duration-300 transform ${
          collapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-blue-900/50">
          <div>
            <h2 className="text-2xl font-bold tracking-wide">
              {currentLang === "am" ? "ፖኢሳ" : "POESSA"}
            </h2>
            <p className="text-xs text-blue-300 mt-1">
              {currentLang === "am" ? "የጡረታ ፈንድ አስተዳደር" : "Pension Fund Admin"}
            </p>
          </div>

          {/* Close Button for Mobile */}
          <button
            onClick={() => setCollapsed(true)}
            className="md:hidden text-gray-300 hover:text-white text-xl p-1 rounded-lg cursor-pointer transition"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setCollapsed(true)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-blue-100 hover:bg-blue-800/60 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{currentLang === "am" ? item.labelAm : item.labelEn}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Language Switcher */}
        <div className="p-4 border-t border-blue-900/50 bg-[#121c36]">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-center gap-2 bg-blue-900/80 hover:bg-blue-800 text-blue-200 hover:text-white py-2.5 px-4 rounded-xl text-sm font-medium transition duration-200 cursor-pointer border border-blue-700/40"
          >
            <span>🌐</span>
            <span>{currentLang === "am" ? "Switch to English" : "ወደ አማርኛ ቀይር"}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;