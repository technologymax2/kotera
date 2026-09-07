import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

import Register from "./employee/Register";
import Verify from "./pentioner/Verify";

import Dashboard from "./pages/Dashboard";
import ViewPensioner from "./employee/ViewPensioner";
import EditPensioner from "./employee/EditPensioner";

import Liveness from "./pentioner/Liveness";

import RenewalManagement from "./admin/RenewalManagement";
import AdminDashboard from "./admin/adminDashboard";

import Report from "./employee/Report";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==============================
            PUBLIC ROUTES
        ============================== */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />


        {/* ==============================
            PROTECTED ROUTES
        ============================== */}

        <Route path="/register" element={<Register />} />

        <Route path="/verify" element={<Verify />} />

        <Route path="/dashboard" element={<Dashboard />} />


        {/* ==============================
            PENSIONER ROUTES
        ============================== */}

        <Route
          path="/pensioners/view/:id"
          element={<ViewPensioner />}
        />

        <Route
          path="/pensioners/edit/:id"
          element={<EditPensioner />}
        />

        <Route
          path="/liveness"
          element={<Liveness />}
        />


        {/* ==============================
            RENEWAL MANAGEMENT
        ============================== */}

        <Route
          path="/renewal"
          element={<RenewalManagement />}
        />


        {/* ==============================
            ADMIN DASHBOARD
        ============================== */}

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />


        {/* ==============================
            REPORTS
        ============================== */}

        <Route
          path="/reports"
          element={<Report />}
        />


        {/* ==============================
            404 PAGE
        ============================== */}

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
              <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md w-full">

                <h1 className="text-6xl font-bold text-red-600">
                  404
                </h1>

                <p className="text-2xl mt-4 font-semibold text-gray-800">
                  Page Not Found
                </p>

                <p className="text-gray-500 mt-2">
                  The page you are looking for doesn't exist or has been moved.
                </p>

                <Link
                  to="/"
                  className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Go Home
                </Link>

              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;