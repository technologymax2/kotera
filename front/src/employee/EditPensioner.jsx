
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import WebcamCapture from "../components/WebcamCapture";
import ImageUpload from "../components/ImageUpload";

const API_URL =
  process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "")
    : "https://poessa-digital-services-1.onrender.com";

// ============================================================
// EDIT PENSIONER
// ============================================================
const EditPensioner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingPensioner, setLoadingPensioner] = useState(true);

  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [imageMethod, setImageMethod] = useState("camera");

  // ==========================================================
  // FORM DATA
  // ==========================================================
  const [formData, setFormData] = useState({
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
  });

  // ==========================================================
  // GET AUTH TOKEN
  // ==========================================================
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==========================================================
  // LOAD PENSIONER
  // ==========================================================
  const loadPensioner = useCallback(async () => {
    try {
      setLoadingPensioner(true);

      const token = getToken();

      const response = await axios.get(
        `${API_URL}/api/pensioners/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const p = response.data?.data;

      if (!p) {
        throw new Error("Pensioner data not found.");
      }

      setFormData({
        pensionerId: p.pensionerId || "",
        nameAmh: p.nameAmh || "",
        nameEng: p.nameEng || "",
        tin: p.tin || "",
        phone: p.phone || "",
        age: p.age ?? "",
        gender: p.gender || "",
        faydaNumber: p.faydaNumber || "",
        poessaBranch: p.poessaBranch || "",
        bankNameAmh: p.bankNameAmh || "",
        bankNameEng: p.bankNameEng || "",
        bankBranch: p.bankBranch || "",
        pensionAmount: p.pensionAmount ?? "",
        addressAmh: p.addressAmh || "",
        addressEng: p.addressEng || "",
        issueDate: p.issueDate
          ? String(p.issueDate).substring(0, 10)
          : "",
        expiryDate: p.expiryDate
          ? String(p.expiryDate).substring(0, 10)
          : "",
      });

      // ========================================================
      // CURRENT IMAGE
      // ========================================================
      if (p.image) {
        if (
          typeof p.image === "string" &&
          (p.image.startsWith("http://") ||
            p.image.startsWith("https://"))
        ) {
          setPreview(p.image);
        } else if (p.image.startsWith("/")) {
          setPreview(`${API_URL}${p.image}`);
        } else {
          setPreview(`${API_URL}/${p.image}`);
        }
      } else if (p.photoUrl) {
        setPreview(p.photoUrl);
      } else if (p.imageUrl) {
        setPreview(p.imageUrl);
      } else {
        setPreview("");
      }
    } catch (error) {
      console.error("Load pensioner error:", error);

      if (error.response?.status === 401) {
        alert(
          "Your session has expired. Please login again."
        );
        navigate("/login");
        return;
      }

      if (error.response?.status === 404) {
        alert("Pensioner not found.");
      } else {
        alert(
          error.response?.data?.message ||
            "Unable to load pensioner."
        );
      }

      navigate("/dashboard");
    } finally {
      setLoadingPensioner(false);
    }
  }, [id, navigate]);

  // ==========================================================
  // LOAD WHEN PAGE OPENS
  // ==========================================================
  useEffect(() => {
    loadPensioner();
  }, [loadPensioner]);

  // ==========================================================
  // HANDLE FORM CHANGE
  // ==========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // CAMERA CAPTURE
  // ==========================================================
  const handleCapture = (
    file,
    imagePreview,
    descriptor
  ) => {
    console.log("CAMERA FILE:", file);
    console.log("CAMERA PREVIEW:", imagePreview);
    console.log("CAMERA DESCRIPTOR:", descriptor);

    setImageFile(file);
    setPreview(imagePreview);
    setFaceDescriptor(descriptor || null);
  };

  // ==========================================================
  // IMAGE UPLOAD
  // ==========================================================
  const handleUpload = (
    file,
    imagePreview,
    descriptor
  ) => {
    console.log("UPLOAD FILE:", file);
    console.log("UPLOAD PREVIEW:", imagePreview);
    console.log("UPLOAD DESCRIPTOR:", descriptor);

    setImageFile(file);
    setPreview(imagePreview);
    setFaceDescriptor(descriptor || null);
  };

  // ==========================================================
  // CHANGE IMAGE METHOD
  // ==========================================================
  const handleMethodChange = (method) => {
    setImageMethod(method);
    setImageFile(null);
    setFaceDescriptor(null);
  };

  // ==========================================================
  // SUBMIT UPDATE
  // ==========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      alert("Pensioner ID is missing.");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      // ========================================================
      // CREATE FORM DATA
      // ========================================================
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key] ?? "");
      });

      // ========================================================
      // ADD NEW IMAGE IF SELECTED
      // ========================================================
      if (imageFile) {
        data.append("image", imageFile);
      }

      // ========================================================
      // ADD FACE DESCRIPTOR
      // ========================================================
      if (faceDescriptor) {
        try {
          const descriptorArray = Array.from(faceDescriptor);

          data.append(
            "faceDescriptor",
            JSON.stringify(descriptorArray)
          );
        } catch (descriptorError) {
          console.error(
            "Face descriptor conversion error:",
            descriptorError
          );
        }
      }

      // ========================================================
      // UPDATE PENSIONER
      // ========================================================
      const response = await axios.put(
        `${API_URL}/api/pensioners/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(
        "Update response:",
        response.data
      );

      alert("Pensioner updated successfully.");

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Update pensioner error:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Your session has expired. Please login again."
        );
        navigate("/login");
        return;
      }

      alert(
        error.response?.data?.message ||
          "Update failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOADING PAGE
  // ==========================================================
  if (loadingPensioner) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-700 font-semibold">
            Loading pensioner information...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      {/* ========================================================
          MAIN CONTAINER
      ======================================================== */}
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-xl shadow-lg p-8">

          {/* ======================================================
              HEADER
          ====================================================== */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>
              <h2 className="text-3xl font-bold text-blue-700">
                Edit Pensioner
              </h2>

              <p className="text-gray-500 mt-1">
                Update pensioner information and photo
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>

          {/* ======================================================
              FORM
          ====================================================== */}
          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-6"
          >

            {/* ====================================================
                PENSIONER ID
            ==================================================== */}
            <Input
              label="Pensioner ID"
              name="pensionerId"
              value={formData.pensionerId}
              onChange={handleChange}
            />

            {/* ====================================================
                FAYDA
            ==================================================== */}
            <Input
              label="Fayda Number"
              name="faydaNumber"
              value={formData.faydaNumber}
              onChange={handleChange}
            />

            {/* ====================================================
                ENGLISH NAME
            ==================================================== */}
            <Input
              label="English Name"
              name="nameEng"
              value={formData.nameEng}
              onChange={handleChange}
            />

            {/* ====================================================
                AMHARIC NAME
            ==================================================== */}
            <Input
              label="Amharic Name"
              name="nameAmh"
              value={formData.nameAmh}
              onChange={handleChange}
            />

            {/* ====================================================
                TIN
            ==================================================== */}
            <Input
              label="TIN"
              name="tin"
              value={formData.tin}
              onChange={handleChange}
            />

            {/* ====================================================
                PHONE
            ==================================================== */}
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            {/* ====================================================
                AGE
            ==================================================== */}
            <Input
              label="Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />

            {/* ====================================================
                GENDER
            ==================================================== */}
            <div>
              <label className="block mb-2 font-semibold">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 bg-white"
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </div>

            {/* ====================================================
                POESSA BRANCH
            ==================================================== */}
            <Input
              label="POESSA Branch"
              name="poessaBranch"
              value={formData.poessaBranch}
              onChange={handleChange}
            />

            {/* ====================================================
                BANK NAME AMHARIC
            ==================================================== */}
            <Input
              label="Bank Name (Amharic)"
              name="bankNameAmh"
              value={formData.bankNameAmh}
              onChange={handleChange}
            />

            {/* ====================================================
                BANK NAME ENGLISH
            ==================================================== */}
            <Input
              label="Bank Name (English)"
              name="bankNameEng"
              value={formData.bankNameEng}
              onChange={handleChange}
            />

            {/* ====================================================
                BANK BRANCH
            ==================================================== */}
            <Input
              label="Bank Branch"
              name="bankBranch"
              value={formData.bankBranch}
              onChange={handleChange}
            />

            {/* ====================================================
                PENSION AMOUNT
            ==================================================== */}
            <Input
              label="Pension Amount"
              type="number"
              name="pensionAmount"
              value={formData.pensionAmount}
              onChange={handleChange}
            />

            {/* ====================================================
                ADDRESS ENGLISH
            ==================================================== */}
            <div>
              <label className="block mb-2 font-semibold">
                Address (English)
              </label>

              <textarea
                rows="3"
                name="addressEng"
                value={formData.addressEng}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ====================================================
                ADDRESS AMHARIC
            ==================================================== */}
            <div>
              <label className="block mb-2 font-semibold">
                Address (Amharic)
              </label>

              <textarea
                rows="3"
                name="addressAmh"
                value={formData.addressAmh}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* ====================================================
                ISSUE DATE
            ==================================================== */}
            <Input
              label="Issue Date"
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
            />

            {/* ====================================================
                EXPIRY DATE
            ==================================================== */}
            <Input
              label="Expiry Date"
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
            />

            {/* ====================================================
                PHOTO UPDATE
            ==================================================== */}
            <div className="md:col-span-2 border-t pt-6">

              <label className="block mb-4 font-semibold text-lg">
                Update Photo
              </label>

              {/* ==================================================
                  METHOD BUTTONS
              ================================================== */}
              <div className="flex flex-wrap gap-4 mb-6">

                <button
                  type="button"
                  onClick={() =>
                    handleMethodChange("camera")
                  }
                  className={`px-5 py-2 rounded-lg font-medium ${
                    imageMethod === "camera"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  📷 Camera
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleMethodChange("upload")
                  }
                  className={`px-5 py-2 rounded-lg font-medium ${
                    imageMethod === "upload"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  📁 Upload
                </button>

              </div>

              {/* ==================================================
                  CAMERA
              ================================================== */}
              {imageMethod === "camera" ? (
                <WebcamCapture
                  onCapture={handleCapture}
                  preview={preview}
                />
              ) : (
                /* ==================================================
                   UPLOAD
                ================================================== */
                <ImageUpload
                  onResult={handleUpload}
                />
              )}

              {/* ==================================================
                  CURRENT / SELECTED PHOTO
              ================================================== */}
              {preview && (
                <div className="mt-6">

                  <p className="font-semibold mb-3">
                    {imageFile
                      ? "New Photo"
                      : "Current Photo"}
                  </p>

                  <img
                    src={preview}
                    alt="Pensioner"
                    className="w-60 h-60 object-cover rounded-lg border shadow-sm"
                  />

                </div>
              )}

            </div>

            {/* ====================================================
                ACTION BUTTONS
            ==================================================== */}
            <div className="md:col-span-2 flex flex-wrap gap-4 pt-4">

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Updating..."
                  : "Update Pensioner"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  navigate("/dashboard")
                }
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400"
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// REUSABLE INPUT
// ============================================================
const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="block mb-2 font-semibold">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-3"
      />
    </div>
  );
};

export default EditPensioner;

