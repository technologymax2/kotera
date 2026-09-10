
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = "https://poessa-digital-services-1.onrender.com";

const RenewalManagement = () => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [renewals, setRenewals] = useState([]);
  const [current, setCurrent] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    startDate: "",
    endDate: "",
  });

  // ============================================================
  // RESET FORM
  // ============================================================
  const resetForm = () => {
    setEditing(false);
    setCurrent(null);
    setForm({
      title: "",
      message: "",
      startDate: "",
      endDate: "",
    });
  };

  // ============================================================
  // LOAD RENEWALS
  // ============================================================
  const loadRenewals = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const res = await axios.get(
        `${API_URL}/api/renewals`,
        config
      );

      const data = res.data?.data;

      setRenewals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load renewals error:", err);

      if (err.response?.status === 401) {
        alert("የመግቢያ ጊዜዎ አልቋል። እባክዎ እንደገና ይግቡ።");
      } else {
        alert(
          err.response?.data?.message ||
            "Renewals could not be loaded."
        );
      }

      setRenewals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // LOAD ON PAGE OPEN
  // ============================================================
  useEffect(() => {
    loadRenewals();
  }, [loadRenewals]);

  // ============================================================
  // FORM CHANGE
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // EDIT RENEWAL
  // ============================================================
  const handleEdit = (item) => {
    setEditing(true);
    setCurrent(item);

    setForm({
      title: item.title || "",
      message: item.message || "",
      startDate: item.startDate
        ? new Date(item.startDate)
            .toISOString()
            .slice(0, 16)
        : "",
      endDate: item.endDate
        ? new Date(item.endDate)
            .toISOString()
            .slice(0, 16)
        : "",
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // ============================================================
  // DELETE RENEWAL
  // ============================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this renewal?")) {
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/api/renewals/${id}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      alert("Renewal deleted.");

      resetForm();

      await loadRenewals();
    } catch (err) {
      console.error("Delete renewal error:", err);

      alert(
        err.response?.data?.message ||
          "Delete failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CREATE / UPDATE RENEWAL
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.message.trim() ||
      !form.startDate ||
      !form.endDate
    ) {
      alert("Please fill all fields.");
      return;
    }

    // Validate date order
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (end <= start) {
      alert("End Date must be after Start Date.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      };

      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
      };

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------
      if (editing && current?._id) {
        await axios.put(
          `${API_URL}/api/renewals/${current._id}`,
          payload,
          config
        );

        alert("Renewal updated successfully.");
      }

      // --------------------------------------------------------
      // CREATE
      // --------------------------------------------------------
      else {
        await axios.post(
          `${API_URL}/api/renewals`,
          payload,
          config
        );

        alert("Renewal created successfully.");
      }

      resetForm();

      await loadRenewals();
    } catch (err) {
      console.error("Renewal operation error:", err);

      alert(
        err.response?.data?.message ||
          "Operation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">

          {/* ==================================================
              HEADER
          ================================================== */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-blue-700">
              Renewal Management
            </h2>

            {loading && (
              <div className="text-blue-700 font-semibold">
                Processing...
              </div>
            )}
          </div>

          {/* ==================================================
              RENEWAL LIST
          ================================================== */}
          <div className="mb-8">
            {renewals.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border rounded-lg">
                No renewals found.
              </div>
            ) : (
              renewals.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-lg p-5 mb-5 bg-blue-50"
                >
                  <h3 className="font-bold text-xl text-gray-800">
                    {item.title}
                  </h3>

                  <p className="my-2 text-gray-700">
                    {item.message}
                  </p>

                  <p className="text-gray-700">
                    <strong>Start:</strong>{" "}
                    {item.startDate
                      ? new Date(
                          item.startDate
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                  <p className="text-gray-700">
                    <strong>End:</strong>{" "}
                    {item.endDate
                      ? new Date(
                          item.endDate
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      disabled={loading}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
                      onClick={() =>
                        handleDelete(item._id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ==================================================
              FORM
          ================================================== */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 border-t pt-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {editing
                  ? "Edit Renewal"
                  : "Create New Renewal"}
              </h3>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* TITLE */}
            <div>
              <label className="block mb-2 font-semibold">
                Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                placeholder="Renewal title"
                required
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block mb-2 font-semibold">
                Message
              </label>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                rows="3"
                placeholder="Renewal message"
                required
              />
            </div>

            {/* DATES */}
            <div className="grid md:grid-cols-2 gap-5">

              {/* START DATE */}
              <div>
                <label className="block mb-2 font-semibold">
                  Start Date
                </label>

                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>

              {/* END DATE */}
              <div>
                <label className="block mb-2 font-semibold">
                  End Date
                </label>

                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg disabled:bg-gray-400 font-semibold"
            >
              {loading
                ? "Processing..."
                : editing
                ? "Update Renewal"
                : "Publish Renewal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RenewalManagement;
