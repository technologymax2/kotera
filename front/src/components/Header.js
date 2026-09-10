import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ title }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleAuthAction = () => {
    if (token) {
      localStorage.clear();
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-100 sticky top-0 z-20">
      <h1 className="text-xl font-bold text-gray-800 tracking-tight">
        {title || "System Dashboard"}
      </h1>

      <button
        onClick={handleAuthAction}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl text-sm transition duration-200 shadow-sm cursor-pointer"
      >
        {token ? "Logout" : "Login"}
      </button>
    </header>
  );
};

export default Header;