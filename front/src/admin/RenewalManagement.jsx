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

      const data = res.data?.data || res.data?.renewals || res.data;

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
      const renewalId = current?._id || current?.id;
      if (editing && renewalId) {
        await axios.put(
          `${API_URL}/api/renewals/${renewalId}`,
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
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 mb-8">
      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Renewal Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">የእድሳት ማስታወቂያዎችን ይፍጠሩ እና ያስተዳድሩ</p>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <div className="text-blue-600 text-xs font-semibold">
              Processing...
            </div>
          )}
          <button
            type="button"
            onClick={loadRenewals}
            disabled={loading}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer"
          >
            አድስ (Refresh)
          </button>
        </div>
      </div>

      {/* ==================================================
          RENEWAL LIST
      ================================================== */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          ነባር የእድሳት ማስታወቂያዎች
        </h4>
        
        {renewals.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-sm font-medium">
            No renewals found.
          </div>
        ) : (
          <div className="space-y-4">
            {renewals.map((item) => {
              const itemId = item._id || item.id;
              return (
                <div
                  key={itemId}
                  className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow transition"
                >
                  <h5 className="font-bold text-base text-gray-900">
                    {item.title}
                  </h5>

                  <p className="my-2 text-sm text-gray-600">
                    {item.message}
                  </p>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 mb-4">
                    <span>
                      <strong className="text-gray-700">Start:</strong>{" "}
                      {item.startDate
                        ? new Date(item.startDate).toLocaleString()
                        : "N/A"}
                    </span>
                    <span>
                      <strong className="text-gray-700">End:</strong>{" "}
                      {item.endDate
                        ? new Date(item.endDate).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer disabled:opacity-50"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer disabled:opacity-50"
                      onClick={() => handleDelete(itemId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================
          FORM
      ================================================== */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 border-t border-gray-100 pt-6"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-gray-900">
            {editing ? "Edit Renewal" : "Create New Renewal"}
          </h4>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold underline cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* TITLE */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            placeholder="Renewal title"
            required
          />
        </div>

        {/* MESSAGE */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Message
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            rows="3"
            placeholder="Renewal message"
            required
          />
        </div>

        {/* DATES */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* START DATE */}
          <div>
            <label className="block mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
              required
            />
          </div>

          {/* END DATE */}
          <div>
            <label className="block mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              End Date
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
              required
            />
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-[#162447] hover:bg-blue-900 text-white font-semibold py-3 px-8 rounded-xl transition duration-200 shadow-md cursor-pointer disabled:opacity-50 text-sm"
        >
          {loading
            ? "Processing..."
            : editing
            ? "Update Renewal"
            : "Publish Renewal"}
        </button>
      </form>
    </div>
  );
};

export default RenewalManagement;