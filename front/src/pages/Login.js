// src/pages/Login.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://poessa-digital-services-1.onrender.com";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "", // Updated field to match standard Mongoose backend schemas (`email` instead of `username`)
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(), // Sent as email to match backend check
            password: formData.password,
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok || !data.success) {
        const message =
          data?.message || "Invalid email or password.";

        setError(message);
        return;
      }

      if (!data.token || !data.user) {
        setError("Login response is missing required information.");
        return;
      }

      // Save authentication token
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem(
        "username",
        data.user.username || data.user.email || ""
      );

      localStorage.setItem(
        "fullName",
        data.user.fullName || data.user.name || ""
      );

      localStorage.setItem(
        "role",
        data.user.role || ""
      );

      localStorage.setItem(
        "profilePic",
        data.user.profilePicture || ""
      );

      // Redirect according to role
      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "employee") {
        navigate("/employee-dashboard");
      } else if (data.user.role === "pensioner") {
        navigate("/customer-dashboard");
      } else {
        // Fallback catch-all for general dashboard route if role is generic admin
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message ===
          "The server returned an invalid response."
          ? error.message
          : "Login failed. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 relative">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-medium px-4 py-2.5 rounded-xl shadow-sm transition duration-200 flex items-center gap-2 cursor-pointer text-sm"
        >
          <span>←</span>
          <span>ወደ ዋና ማውጫ</span>
        </button>
      </div>

      {/* Login Box */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Login
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to access your account
            </p>
          </div>

          {/* Email / Username */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@poessa.gov.et"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-gray-800 text-sm placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-gray-800 text-sm placeholder-gray-400"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#162447] hover:bg-blue-900 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Signup */}
          <div className="text-center text-sm text-gray-600 pt-2">
            <span>
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-blue-600 hover:underline font-semibold"
              >
                Sign Up
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;