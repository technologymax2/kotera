import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardContent = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* የቪዲዮ ጥሪ ባነር */}
      <div className="bg-gradient-to-r from-[#162447] to-[#1f4068] text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
          <div className="text-5xl bg-white/10 p-3 rounded-2xl">📹</div>
          <div>
            <h3 className="text-2xl font-bold mb-1">
              የቪዲዮ ጥሪ ድጋፍ
            </h3>
            <p className="text-blue-200 text-sm md:text-base">
              ለጤና እና ለልዩ ድጋፍ ለሚፈልጉ ወገኖች
            </p>
          </div>
        </div>

        <button
          type="button"
          className="bg-[#ffd700] hover:bg-[#e6c200] text-gray-900 font-bold px-6 py-3 rounded-xl shadow-md transition duration-200 cursor-pointer whitespace-nowrap"
          onClick={() => navigate("/video-call")}
        >
          ቪዲዮ ጥሪ ይጀምሩ
        </button>
      </div>

      {/* ሌሎች የዳሽቦርድ አገልግሎት ካርዶች */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liveness */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition duration-200">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm">
            👤
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-1">
            የህይወት ማረጋገጫ
          </h3>

          <p className="text-gray-500 text-sm mb-6">
            Liveness Proof
          </p>

          <button
            type="button"
            className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition duration-200 cursor-pointer"
            onClick={() => navigate("/verify")}
          >
            አሁኑኑ ይጀምሩ
          </button>
        </div>

        {/* Proxy Document */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition duration-200">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm">
            📄
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-1">
            የውክልና ሰነድ ማቅረቢያ
          </h3>

          <p className="text-gray-500 text-sm mb-6">
            Proxy Document Submission
          </p>

          <button
            type="button"
            className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition duration-200 cursor-pointer"
            onClick={() => {
              alert("የውክልና ሰነድ ማቅረቢያ አገልግሎት በቅርቡ ይገኛል።");
            }}
          >
            አሁኑኑ ይጀምሩ
          </button>
        </div>

        {/* Case Tracking */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition duration-200">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm">
            📂
          </div>

          <h3 className="text-lg font-bold text-gray-800 mb-1">
            የጉዳይ ክትትል
          </h3>

          <p className="text-gray-500 text-sm mb-6">
            Case Tracking
          </p>

          <button
            type="button"
            className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition duration-200 cursor-pointer"
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