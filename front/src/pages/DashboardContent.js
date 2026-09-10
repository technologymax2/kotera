
// src/pages/DashboardContent.js

import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardContent = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-content">

      {/* የቪዲዮ ጥሪ ባነር */}
      <div className="floating-banner">
        <div
          style={{
            color: "#ffd700",
            marginBottom: "10px",
            fontSize: "50px",
            lineHeight: "1",
          }}
        >
          📹
        </div>

        <h3
          style={{
            color: "white",
            marginBottom: "5px",
          }}
        >
          የቪዲዮ ጥሪ ድጋፍ
        </h3>

        <p
          style={{
            color: "#dbe6f3",
            fontSize: "0.9rem",
          }}
        >
          ለጤና እና ለልዩ ድጋፍ ለሚፈልጉ ወገኖች
        </p>

        <button
          type="button"
          className="video-btn"
          onClick={() => navigate("/video-call")}
        >
          ቪዲዮ ጥሪ ይጀምሩ
        </button>
      </div>

      {/* ሌሎች የዳሽቦርድ አገልግሎት ካርዶች */}
      <div className="action-cards-grid">

        {/* Liveness */}
        <div className="action-card">
          <div className="icon-box">👤</div>

          <h3>የህይወት ማረጋገጫ</h3>

          <p>Liveness Proof</p>

          <button
            type="button"
            className="video-btn"
            onClick={() => navigate("/verify")}
          >
            አሁኑኑ ይጀምሩ
          </button>
        </div>

        {/* Proxy Document */}
        <div className="action-card">
          <div className="icon-box">📄</div>

          <h3>የውክልና ሰነድ ማቅረቢያ</h3>

          <p>Proxy Document Submission</p>

          <button
            type="button"
            onClick={() => {
              alert("የውክልና ሰነድ ማቅረቢያ አገልግሎት በቅርቡ ይገኛል።");
            }}
          >
            አሁኑኑ ይጀምሩ
          </button>
        </div>

        {/* Case Tracking */}
        <div className="action-card">
          <div className="icon-box">📂</div>

          <h3>የጉዳይ ክትትል</h3>

          <p>Case Tracking</p>

          <button
            type="button"
            onClick={() => navigate("/check-status")}
          >
            ሁኔታውን ይፈትሹ
          </button>
        </div>

      </div>
    </div>
  );
};

export default DashboardContent;

