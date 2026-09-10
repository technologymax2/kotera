
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WebcamCapture from "../components/WebcamCapture";
import ImageUpload from "../components/ImageUpload";
import Navbar from "../components/Navbar";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://poessa-digital-services-1.onrender.com";

const normalizeApiUrl = (url) => {
  if (!url) return "https://poessa-digital-services-1.onrender.com";

  return url.endsWith("/api")
    ? url.slice(0, -4)
    : url.replace(/\/+$/, "");
};

const BASE_URL = normalizeApiUrl(API_URL);

const initialFormState = {
  pensionerId: "",
  nameAmh: "",
  nameEng: "",
  tin: "",
  phone: "",
  age: "",
  gender: "",
  faydaNumber: "",
  poessaBranch: "",
  bankNameAmh: "",
  bankNameEng: "",
  bankBranch: "",
  pensionAmount: "",
  addressAmh: "",
  addressEng: "",
  issueDate: "",
  expiryDate: "",
};

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);

  const [imageMethod, setImageMethod] = useState("camera");

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // CAMERA CAPTURE
  // ============================================================

  const handleCapture = (file, imagePreview, descriptor) => {
    console.log("Camera file:", file);
    console.log("Camera preview:", imagePreview);
    console.log("Face descriptor:", descriptor);

    setImageFile(file);
    setPreview(imagePreview);
    setFaceDescriptor(descriptor || null);
  };

  // ============================================================
  // IMAGE UPLOAD
  // ============================================================

  const handleUpload = (file, imgPreview, descriptor) => {
    console.log("Uploaded file:", file);
    console.log("Uploaded preview:", imgPreview);
    console.log("Uploaded face descriptor:", descriptor);

    setImageFile(file);
    setPreview(imgPreview);
    setFaceDescriptor(descriptor || null);
  };

  // ============================================================
  // CAMERA / UPLOAD METHOD
  // ============================================================

  const handleMethodChange = (method) => {
    setImageMethod(method);
    setImageFile(null);
    setPreview(null);
    setFaceDescriptor(null);
  };

  // ============================================================
  // VALIDATION HELPERS
  // ============================================================

  const onlyLetters = (value) => {
    return /^[A-Za-z\s]+$/.test(value);
  };

  const onlyAmharic = (value) => {
    return /^[\u1200-\u137F\s]+$/.test(value);
  };

  // ============================================================
  // REGISTER PENSIONER DIRECTLY
  // No services/api.js
  // No axios
  // ============================================================

  const registerPensioner = async (data) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/api/pensioners/register`, {
      method: "POST",
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: data,
    });

    let result = {};

    try {
      result = await response.json();
    } catch (error) {
      console.warn("Server did not return JSON:", error);
    }

    if (!response.ok) {
      const error = new Error(
        result?.message || "Pensioner registration failed."
      );

      error.response = {
        status: response.status,
        data: result,
      };

      throw error;
    }

    return result;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----------------------------------------------------------
    // Required fields
    // ----------------------------------------------------------

    const requiredFields = [
      ["pensionerId", "Pensioner ID"],
      ["tin", "TIN"],
      ["faydaNumber", "Fayda Number"],
      ["nameEng", "English Name"],
      ["nameAmh", "Amharic Name"],
      ["phone", "Phone Number"],
      ["age", "Age"],
      ["gender", "Gender"],
      ["poessaBranch", "POESSA Branch"],
      ["bankNameEng", "Bank Name (English)"],
      ["bankBranch", "Bank Branch"],
      ["pensionAmount", "Pension Amount"],
      ["addressEng", "Address (English)"],
      ["issueDate", "Issue Date"],
      ["expiryDate", "Expiry Date"],
    ];

    for (const [field, label] of requiredFields) {
      if (!String(formData[field] || "").trim()) {
        alert(`${label} is required.`);
        return;
      }
    }

    // ----------------------------------------------------------
    // Pensioner ID
    // ----------------------------------------------------------

    if (!/^\d{10}$/.test(formData.pensionerId)) {
      alert("Pensioner ID must contain exactly 10 digits.");
      return;
    }

    // ----------------------------------------------------------
    // TIN
    // ----------------------------------------------------------

    if (!/^\d{10}$/.test(formData.tin)) {
      alert("TIN must contain exactly 10 digits.");
      return;
    }

    // ----------------------------------------------------------
    // Fayda
    // ----------------------------------------------------------

    if (!/^\d{16}$/.test(formData.faydaNumber)) {
      alert("Fayda Number must contain exactly 16 digits.");
      return;
    }

    // ----------------------------------------------------------
    // Phone
    // ----------------------------------------------------------

    if (!/^0\d{9,14}$/.test(formData.phone)) {
      alert(
        "Phone number must start with 0 and contain between 10 and 15 digits."
      );
      return;
    }

    // ----------------------------------------------------------
    // English name
    // ----------------------------------------------------------

    if (!onlyLetters(formData.nameEng.trim())) {
      alert("English Name must contain letters only.");
      return;
    }

    // ----------------------------------------------------------
    // Amharic name
    // ----------------------------------------------------------

    if (!onlyAmharic(formData.nameAmh.trim())) {
      alert("Amharic Name must contain Amharic letters only.");
      return;
    }

    // ----------------------------------------------------------
    // Age
    // ----------------------------------------------------------

    const age = Number(formData.age);

    if (!Number.isFinite(age) || age < 18 || age > 120) {
      alert("Age must be between 18 and 120.");
      return;
    }

    // ----------------------------------------------------------
    // Pension amount
    // ----------------------------------------------------------

    const pensionAmount = Number(formData.pensionAmount);

    if (!Number.isFinite(pensionAmount) || pensionAmount <= 0) {
      alert("Invalid pension amount.");
      return;
    }

    // ----------------------------------------------------------
    // Dates
    // ----------------------------------------------------------

    const issueDate = new Date(formData.issueDate);
    const expiryDate = new Date(formData.expiryDate);

    if (
      Number.isNaN(issueDate.getTime()) ||
      Number.isNaN(expiryDate.getTime())
    ) {
      alert("Please enter valid Issue Date and Expiry Date.");
      return;
    }

    if (issueDate >= expiryDate) {
      alert("Expiry Date must be later than Issue Date.");
      return;
    }

    // ----------------------------------------------------------
    // Photo
    // ----------------------------------------------------------

    if (!imageFile) {
      alert("Please capture or upload a registration photo.");
      return;
    }

    // ----------------------------------------------------------
    // Camera requires face descriptor
    // ----------------------------------------------------------

    if (imageMethod === "camera" && !faceDescriptor) {
      alert(
        "⚠️ ፊት አልተገኘም! እባክዎ በካሜራው በግልጽ ፊትዎን ያሳዩ።"
      );
      return;
    }

    try {
      setLoading(true);

      // --------------------------------------------------------
      // FormData
      // --------------------------------------------------------

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // --------------------------------------------------------
      // Image
      // --------------------------------------------------------

      data.append("image", imageFile);

      // --------------------------------------------------------
      // Face descriptor
      // --------------------------------------------------------

      if (faceDescriptor) {
        let descriptorArray = faceDescriptor;

        if (faceDescriptor instanceof Float32Array) {
          descriptorArray = Array.from(faceDescriptor);
        } else if (Array.isArray(faceDescriptor)) {
          descriptorArray = faceDescriptor;
        } else if (
          faceDescriptor &&
          typeof faceDescriptor.length === "number"
        ) {
          descriptorArray = Array.from(faceDescriptor);
        }

        data.append(
          "faceDescriptor",
          JSON.stringify(descriptorArray)
        );
      }

      // --------------------------------------------------------
      // Send to backend
      // --------------------------------------------------------

      const result = await registerPensioner(data);

      console.log("Registration response:", result);

      alert("Pensioner registered successfully.");

      // --------------------------------------------------------
      // Reset
      // --------------------------------------------------------

      setFormData(initialFormState);
      setImageFile(null);
      setPreview(null);
      setFaceDescriptor(null);
      setImageMethod("camera");

      // Optional:
      // If your dashboard should open automatically after
      // registration, uncomment this line.
      //
      // navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <Navbar />

      {/* ======================================================
          LOCAL LOADING OVERLAY
          No Loader.js required
      ====================================================== */}

      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "30px 40px",
              borderRadius: "14px",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                width: "45px",
                height: "45px",
                border: "5px solid #e5e7eb",
                borderTop: "5px solid #1d4ed8",
                borderRadius: "50%",
                margin: "0 auto 15px",
                animation: "registerSpin 0.8s linear infinite",
              }}
            />

            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e3a8a",
              }}
            >
              Registering Pensioner...
            </div>

            <div
              style={{
                marginTop: "6px",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              Please wait...
            </div>
          </div>

          <style>
            {`
              @keyframes registerSpin {
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
      )}

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-xl p-6">

          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
            Pensioner Registration
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >

            {/* ==================================================
                PENSIONER ID
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Pensioner ID
              </label>

              <input
                type="text"
                name="pensionerId"
                value={formData.pensionerId}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pensionerId: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10),
                  })
                }
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                TIN
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                TIN (Tax Identification Number)
              </label>

              <input
                type="text"
                name="tin"
                value={formData.tin}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tin: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10),
                  })
                }
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                FAYDA
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Fayda Number
              </label>

              <input
                type="text"
                name="faydaNumber"
                value={formData.faydaNumber}
                maxLength={16}
                inputMode="numeric"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    faydaNumber: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 16),
                  })
                }
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                ENGLISH NAME
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Name (English)
              </label>

              <input
                type="text"
                name="nameEng"
                value={formData.nameEng}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nameEng: e.target.value.replace(
                      /[^A-Za-z\s]/g,
                      ""
                    ),
                  })
                }
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                AMHARIC NAME
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Name (Amharic)
              </label>

              <input
                type="text"
                name="nameAmh"
                value={formData.nameAmh}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nameAmh: e.target.value.replace(
                      /[^\u1200-\u137F\s]/g,
                      ""
                    ),
                  })
                }
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                PHONE
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                maxLength={15}
                inputMode="numeric"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 15),
                  })
                }
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                AGE
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Age
              </label>

              <input
                type="number"
                name="age"
                value={formData.age}
                min="18"
                max="120"
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                GENDER
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* ==================================================
                POESSA BRANCH
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                POESSA Branch
              </label>

              <input
                type="text"
                name="poessaBranch"
                value={formData.poessaBranch}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                BANK AMHARIC
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Bank Name (Amharic)
              </label>

              <input
                type="text"
                name="bankNameAmh"
                value={formData.bankNameAmh}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankNameAmh: e.target.value,
                  })
                }
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                BANK ENGLISH
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Bank Name (English)
              </label>

              <input
                type="text"
                name="bankNameEng"
                value={formData.bankNameEng}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                BANK BRANCH
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Bank Branch
              </label>

              <input
                type="text"
                name="bankBranch"
                value={formData.bankBranch}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                PENSION AMOUNT
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Pension Amount
              </label>

              <input
                type="number"
                name="pensionAmount"
                value={formData.pensionAmount}
                min="0"
                step="0.01"
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                ADDRESS AMHARIC
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Address (Amharic)
              </label>

              <textarea
                rows="2"
                name="addressAmh"
                value={formData.addressAmh}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                ADDRESS ENGLISH
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Address (English)
              </label>

              <textarea
                rows="2"
                name="addressEng"
                value={formData.addressEng}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                ISSUE DATE
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Issue Date
              </label>

              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                EXPIRY DATE
            ================================================== */}

            <div>
              <label className="block mb-2 font-semibold">
                Expiry Date
              </label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ==================================================
                PHOTO SECTION
            ================================================== */}

            <div className="md:col-span-2 border-t pt-4 mt-2">

              <label className="block mb-3 font-semibold text-lg">
                Registration Photo
              </label>

              {/* CAMERA / UPLOAD BUTTONS */}

              <div className="flex gap-4 mb-5">

                <button
                  type="button"
                  onClick={() =>
                    handleMethodChange("camera")
                  }
                  className={`px-5 py-2 rounded-lg font-medium transition ${
                    imageMethod === "camera"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  📷 Camera
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleMethodChange("upload")
                  }
                  className={`px-5 py-2 rounded-lg font-medium transition ${
                    imageMethod === "upload"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  📁 Upload
                </button>

              </div>

              {/* CAMERA */}

              {imageMethod === "camera" ? (
                <WebcamCapture
                  onCapture={handleCapture}
                  preview={preview}
                />
              ) : (
                /* UPLOAD */

                <div className="space-y-4">

                  <ImageUpload
                    onResult={handleUpload}
                  />

                  {preview && (
                    <img
                      src={preview}
                      alt="Upload Preview"
                      className="w-64 h-64 object-cover rounded-lg border shadow-md"
                    />
                  )}

                </div>
              )}

              {/* CURRENT PREVIEW */}

              {imageMethod === "camera" && preview && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">
                    Captured Photo
                  </p>

                  <img
                    src={preview}
                    alt="Captured Preview"
                    className="w-64 h-64 object-cover rounded-lg border shadow-md"
                  />
                </div>
              )}

              {/* FACE DESCRIPTOR STATUS */}

              {imageMethod === "camera" && imageFile && (
                <div className="mt-3">
                  {faceDescriptor ? (
                    <p className="text-green-600 font-semibold">
                      ✓ Face detected successfully
                    </p>
                  ) : (
                    <p className="text-red-600 font-semibold">
                      ⚠️ Face not detected
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* ==================================================
                REGISTER BUTTON
            ================================================== */}

            <div className="md:col-span-2 mt-4">

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-lg text-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Registering Pensioner..."
                  : "Register Pensioner"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default Register;

