// src/pages/ViewPensioner.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "https://poessa-digital-services-1.onrender.com";

const ViewPensioner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pensioner, setPensioner] = useState(null);

  useEffect(() => {
    loadPensioner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =========================================================
  // LOAD PENSIONER DIRECTLY FROM BACKEND
  // =========================================================
  const loadPensioner = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/pensioners/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPensioner(res.data?.data || res.data);
    } catch (error) {
      console.error("Load pensioner error:", error);

      if (error.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        navigate("/login");
        return;
      }

      alert(
        error.response?.data?.message ||
          "Unable to load pensioner."
      );

      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              width: "55px",
              height: "55px",
              border: "6px solid #e5e7eb",
              borderTop: "6px solid #1d4ed8",
              borderRadius: "50%",
              animation: "viewPensionerSpin 1s linear infinite",
              marginBottom: "20px",
            }}
          />

          <p className="text-lg font-semibold text-gray-700">
            Loading Pensioner...
          </p>
        </div>

        <style>
          {`
            @keyframes viewPensionerSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // =========================================================
  // PENSIONER NOT FOUND
  // =========================================================
  if (!pensioner) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-10 text-center mt-10">
            <div className="text-5xl mb-4">
              🔍
            </div>

            <h2 className="text-2xl font-bold text-gray-700">
              Pensioner not found
            </h2>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // IMAGE URL
  // =========================================================
  const getImageUrl = () => {
    if (!pensioner.image) {
      return null;
    }

    // If backend already returns a complete URL
    if (
      pensioner.image.startsWith("http://") ||
      pensioner.image.startsWith("https://")
    ) {
      return pensioner.image;
    }

    // Otherwise append backend URL
    return `${API_URL}${pensioner.image.startsWith("/") ? "" : "/"}${pensioner.image}`;
  };

  const imageUrl = getImageUrl();

  // =========================================================
  // DATE FORMAT
  // =========================================================
  const formatDate = (date) => {
    if (!date) return "-";

    return date.substring
      ? date.substring(0, 10)
      : new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <div className="max-w-6xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow-lg p-8">

          {/* =================================================
              HEADER
          ================================================= */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

            <div>
              <h2 className="text-3xl font-bold text-blue-700">
                Pensioner Details
              </h2>

              <p className="text-gray-500 mt-1">
                View complete pensioner information
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
            >
              ← Back
            </button>

          </div>

          {/* =================================================
              CONTENT
          ================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* =================================================
                IMAGE
            ================================================= */}
            <div>

              <div className="bg-gray-50 border rounded-xl p-4">

                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={pensioner.nameEng || "Pensioner"}
                    className="w-full aspect-square object-cover rounded-xl border shadow"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="w-full aspect-square rounded-xl bg-gray-200 flex items-center justify-center"
                  >
                    <div className="text-center text-gray-500">
                      <div className="text-6xl mb-3">
                        👤
                      </div>

                      <p>
                        No Photo Available
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Photo caption */}
              <div className="text-center mt-4">
                <p className="font-semibold text-gray-700">
                  {pensioner.nameEng || "Pensioner"}
                </p>

                <p className="text-sm text-gray-500">
                  Pensioner ID: {pensioner.pensionerId || "-"}
                </p>
              </div>

            </div>

            {/* =================================================
                DETAILS
            ================================================= */}
            <div className="md:col-span-2">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <Info
                  label="Pensioner ID"
                  value={pensioner.pensionerId}
                />

                <Info
                  label="Fayda Number"
                  value={pensioner.faydaNumber}
                />

                <Info
                  label="English Name"
                  value={pensioner.nameEng}
                />

                <Info
                  label="Amharic Name"
                  value={pensioner.nameAmh}
                />

                <Info
                  label="TIN"
                  value={pensioner.tin}
                />

                <Info
                  label="Phone"
                  value={pensioner.phone}
                />

                <Info
                  label="Age"
                  value={pensioner.age}
                />

                <Info
                  label="Gender"
                  value={pensioner.gender}
                />

                <Info
                  label="POESSA Branch"
                  value={pensioner.poessaBranch}
                />

                <Info
                  label="Bank Name (English)"
                  value={pensioner.bankNameEng}
                />

                <Info
                  label="Bank Name (Amharic)"
                  value={pensioner.bankNameAmh}
                />

                <Info
                  label="Bank Branch"
                  value={pensioner.bankBranch}
                />

                <Info
                  label="Pension Amount"
                  value={pensioner.pensionAmount}
                />

                <Info
                  label="Issue Date"
                  value={formatDate(pensioner.issueDate)}
                />

                <Info
                  label="Expiry Date"
                  value={formatDate(pensioner.expiryDate)}
                />

                <Info
                  label="Verified"
                  value={
                    pensioner.verified
                      ? "Yes"
                      : "No"
                  }
                />

              </div>

              {/* =================================================
                  ENGLISH ADDRESS
              ================================================= */}
              <div className="mt-6">

                <label className="block font-semibold text-gray-700 mb-2">
                  Address (English)
                </label>

                <div className="border rounded-lg p-4 bg-gray-50 min-h-[70px]">
                  {pensioner.addressEng || "-"}
                </div>

              </div>

              {/* =================================================
                  AMHARIC ADDRESS
              ================================================= */}
              <div className="mt-5">

                <label className="block font-semibold text-gray-700 mb-2">
                  Address (Amharic)
                </label>

                <div className="border rounded-lg p-4 bg-gray-50 min-h-[70px]">
                  {pensioner.addressAmh || "-"}
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              ACTION BUTTONS
          ================================================= */}
          <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row gap-4">

            <button
              onClick={() =>
                navigate(`/employee/edit-pensioner/${pensioner._id}`)
              }
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Edit Pensioner
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Dashboard
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

// =============================================================
// INFORMATION FIELD
// =============================================================
const Info = ({ label, value }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>

    <div className="border rounded-lg p-3 bg-gray-50 min-h-[46px]">
      {value !== undefined &&
      value !== null &&
      value !== ""
        ? value
        : "-"}
    </div>
  </div>
);

export default ViewPensioner;