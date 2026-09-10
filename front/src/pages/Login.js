
// src/pages/Login.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://poessa-digital-services-1.onrender.com";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
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

    if (!formData.username.trim() || !formData.password) {
      setError("Please enter your username and password.");
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
            username: formData.username.trim(),
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
          data?.message || "Invalid username or password.";

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
        data.user.username || ""
      );

      localStorage.setItem(
        "fullName",
        data.user.fullName || ""
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
        setError("Your account role is not recognized.");
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
    <div className="login-container">

      {/* Back Button */}
      <div className="signup-nav-btn-container">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="back-to-dashboard-btn"
        >
          <strong>← ወደ ዋና ማውጫ</strong>
        </button>
      </div>

      {/* Login Box */}
      <div className="login-box">
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <h2>Login</h2>

          {/* Username */}
          <div className="input-group">
            <label>Email or TIN Number</label>

            <input
              type="text"
              name="username"
              placeholder="example@email.com or 1234567890"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Signup */}
          <div className="login-footer">
            <span>
              Don't have an account?{" "}
              <a href="/signup">Sign Up</a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

