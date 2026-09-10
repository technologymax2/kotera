
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_URL = "https://poessa-digital-services-1.onrender.com";

const Report = () => {
  const [loading, setLoading] = useState(false);

  const [renewals, setRenewals] = useState([]);
  const [renewalId, setRenewalId] = useState("");
  const [branch, setBranch] = useState("");

  const [summary, setSummary] = useState(null);
  const [renewed, setRenewed] = useState([]);
  const [notRenewed, setNotRenewed] = useState([]);
  const [branchSummary, setBranchSummary] = useState([]);

  // =========================================================
  // LOAD RENEWAL PERIODS
  // =========================================================
  useEffect(() => {
    loadRenewals();
  }, []);

  const loadRenewals = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/renewals`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data?.data || [];

      setRenewals(data);

      if (data.length > 0) {
        setRenewalId(data[0]._id);
      }
    } catch (err) {
      console.error("Load renewals error:", err);

      if (err.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to load renewal periods."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GENERATE REPORT
  // =========================================================
  const generateReport = async () => {
    if (!renewalId) {
      alert("Please select a renewal period.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // Renewal report
      const reportRes = await axios.get(
        `${API_URL}/api/renewals/report/${renewalId}`,
        {
          params: {
            branch: branch || undefined,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const reportData = reportRes.data || {};

      setSummary(reportData.summary || null);
      setRenewed(reportData.renewed || []);
      setNotRenewed(reportData.notRenewed || []);

      // Branch summary
      const branchRes = await axios.get(
        `${API_URL}/api/renewals/branch-summary/${renewalId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBranchSummary(branchRes.data?.data || []);
    } catch (err) {
      console.error("Generate report error:", err);

      if (err.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EXPORT TO EXCEL
  // =========================================================
  const exportToExcel = () => {
    if (!summary) {
      alert("Generate report first.");
      return;
    }

    try {
      // -----------------------------------------------------
      // RENEWED SHEET
      // -----------------------------------------------------
      const renewedSheet = renewed.map((p) => ({
        PensionerID: p.pensionerId || "",
        Name: p.nameEng || "",
        Branch: p.poessaBranch || "",
        Phone: p.phone || "",
        Fayda: p.faydaNumber || "",
        Status: "Renewed",
        VerifiedAt: p.verifiedAt
          ? new Date(p.verifiedAt).toLocaleString()
          : "",
      }));

      // -----------------------------------------------------
      // NOT RENEWED SHEET
      // -----------------------------------------------------
      const notRenewedSheet = notRenewed.map((p) => ({
        PensionerID: p.pensionerId || "",
        Name: p.nameEng || "",
        Branch: p.poessaBranch || "",
        Phone: p.phone || "",
        Fayda: p.faydaNumber || "",
        Status: "Not Renewed",
      }));

      // -----------------------------------------------------
      // BRANCH SUMMARY SHEET
      // -----------------------------------------------------
      const branchSheet = branchSummary.map((b) => ({
        Branch: b.branch || "",
        Total: b.total || 0,
        Renewed: b.renewed || 0,
        NotRenewed: b.notRenewed || 0,
        Percent:
          b.percent !== undefined
            ? `${b.percent}%`
            : "",
      }));

      // -----------------------------------------------------
      // SUMMARY SHEET
      // -----------------------------------------------------
      const summarySheet = [
        {
          Report: "Renewal Report",
          Total: summary.total || 0,
          Renewed: summary.renewed || 0,
          NotRenewed: summary.notRenewed || 0,
          RenewalPercentage:
            summary.renewedPercent !== undefined
              ? `${summary.renewedPercent}%`
              : "",
          Branch: branch || "All Branches",
        },
      ];

      // -----------------------------------------------------
      // CREATE WORKBOOK
      // -----------------------------------------------------
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(summarySheet),
        "Summary"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(renewedSheet),
        "Renewed"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(notRenewedSheet),
        "Not Renewed"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(branchSheet),
        "Branch Summary"
      );

      // -----------------------------------------------------
      // DOWNLOAD
      // -----------------------------------------------------
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const file = new Blob(
        [excelBuffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      saveAs(file, "Renewal_Report.xlsx");
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Unable to export report.");
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================
  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* =====================================================
          LOADING OVERLAY
      ===================================================== */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
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
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              textAlign: "center",
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
                animation: "reportSpin 1s linear infinite",
              }}
            />

            <p
              style={{
                margin: 0,
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              Loading Report...
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}
      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700">
            Renewal Report
          </h1>

          <p className="text-gray-600 mt-1">
            View pensioner renewal statistics and export reports.
          </p>
        </div>

        {/* ===================================================
            FILTER CARD
        =================================================== */}
        <div className="bg-white shadow rounded-lg p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Renewal Period */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Renewal Period
              </label>

              <select
                className="w-full border p-3 rounded-lg"
                value={renewalId}
                onChange={(e) => setRenewalId(e.target.value)}
              >
                <option value="">
                  Select Renewal Period
                </option>

                {renewals.map((r) => (
                  <option
                    key={r._id}
                    value={r._id}
                  >
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Branch
              </label>

              <input
                type="text"
                placeholder="Branch (optional)"
                className="w-full border p-3 rounded-lg"
                value={branch}
                onChange={(e) =>
                  setBranch(e.target.value)
                }
              />
            </div>

            {/* Generate */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={generateReport}
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-lg p-3 font-semibold disabled:bg-gray-400"
              >
                Generate Report
              </button>
            </div>

            {/* Export */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={exportToExcel}
                disabled={!summary || loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-semibold disabled:bg-gray-400"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================
            NO REPORT MESSAGE
        =================================================== */}
        {!summary && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-4">
              📊
            </div>

            <h2 className="text-xl font-semibold text-gray-700">
              No Report Generated
            </h2>

            <p className="text-gray-500 mt-2">
              Select a renewal period and click
              "Generate Report".
            </p>
          </div>
        )}

        {/* ===================================================
            REPORT
        =================================================== */}
        {summary && (
          <>
            {/* =================================================
                SUMMARY CARDS
            ================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total */}
              <div className="bg-blue-100 p-5 rounded-lg shadow-sm">
                <h3 className="text-gray-700 font-semibold">
                  Total
                </h3>

                <h1 className="text-3xl font-bold text-blue-700 mt-2">
                  {summary.total || 0}
                </h1>
              </div>

              {/* Renewed */}
              <div className="bg-green-100 p-5 rounded-lg shadow-sm">
                <h3 className="text-gray-700 font-semibold">
                  Renewed
                </h3>

                <h1 className="text-3xl font-bold text-green-700 mt-2">
                  {summary.renewed || 0}
                </h1>
              </div>

              {/* Not Renewed */}
              <div className="bg-red-100 p-5 rounded-lg shadow-sm">
                <h3 className="text-gray-700 font-semibold">
                  Not Renewed
                </h3>

                <h1 className="text-3xl font-bold text-red-700 mt-2">
                  {summary.notRenewed || 0}
                </h1>
              </div>

              {/* Percentage */}
              <div className="bg-yellow-100 p-5 rounded-lg shadow-sm">
                <h3 className="text-gray-700 font-semibold">
                  Renewal %
                </h3>

                <h1 className="text-3xl font-bold text-yellow-700 mt-2">
                  {summary.renewedPercent || 0}%
                </h1>
              </div>
            </div>

            {/* =================================================
                RENEWED / NOT RENEWED TABLES
            ================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RENEWED */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 bg-green-100">
                  <h2 className="text-xl font-bold text-green-700">
                    Renewed
                  </h2>

                  <p className="text-sm text-gray-600">
                    {renewed.length} pensioner(s)
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-green-200">
                      <tr>
                        <th className="border p-2 text-left">
                          ID
                        </th>

                        <th className="border p-2 text-left">
                          Name
                        </th>

                        <th className="border p-2 text-left">
                          Branch
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {renewed.length > 0 ? (
                        renewed.map((p) => (
                          <tr
                            key={p._id}
                            className="hover:bg-gray-50"
                          >
                            <td className="border p-2">
                              {p.pensionerId}
                            </td>

                            <td className="border p-2">
                              {p.nameEng}
                            </td>

                            <td className="border p-2">
                              {p.poessaBranch}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="border p-5 text-center text-gray-500"
                          >
                            No renewed pensioners found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NOT RENEWED */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 bg-red-100">
                  <h2 className="text-xl font-bold text-red-700">
                    Not Renewed
                  </h2>

                  <p className="text-sm text-gray-600">
                    {notRenewed.length} pensioner(s)
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-red-200">
                      <tr>
                        <th className="border p-2 text-left">
                          ID
                        </th>

                        <th className="border p-2 text-left">
                          Name
                        </th>

                        <th className="border p-2 text-left">
                          Branch
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {notRenewed.length > 0 ? (
                        notRenewed.map((p) => (
                          <tr
                            key={p._id}
                            className="hover:bg-gray-50"
                          >
                            <td className="border p-2">
                              {p.pensionerId}
                            </td>

                            <td className="border p-2">
                              {p.nameEng}
                            </td>

                            <td className="border p-2">
                              {p.poessaBranch}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="border p-5 text-center text-gray-500"
                          >
                            All pensioners have been renewed.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* =================================================
                BRANCH SUMMARY
            ================================================= */}
            <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5 bg-blue-100">
                <h2 className="text-2xl font-bold text-blue-700">
                  Branch Summary
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-200">
                    <tr>
                      <th className="border p-3 text-left">
                        Branch
                      </th>

                      <th className="border p-3 text-left">
                        Total
                      </th>

                      <th className="border p-3 text-left">
                        Renewed
                      </th>

                      <th className="border p-3 text-left">
                        Not Renewed
                      </th>

                      <th className="border p-3 text-left">
                        Percentage
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {branchSummary.length > 0 ? (
                      branchSummary.map((b) => (
                        <tr
                          key={b.branch}
                          className="hover:bg-gray-50"
                        >
                          <td className="border p-3 font-semibold">
                            {b.branch}
                          </td>

                          <td className="border p-3">
                            {b.total || 0}
                          </td>

                          <td className="border p-3 text-green-700 font-semibold">
                            {b.renewed || 0}
                          </td>

                          <td className="border p-3 text-red-700 font-semibold">
                            {b.notRenewed || 0}
                          </td>

                          <td className="border p-3">
                            {b.percent !== undefined
                              ? `${b.percent}%`
                              : "0%"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="border p-5 text-center text-gray-500"
                        >
                          No branch summary available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =================================================
                REPORT INFORMATION
            ================================================= */}
            <div className="mt-6 bg-gray-50 border rounded-lg p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">
                    Renewal Period
                  </span>

                  <p className="font-semibold">
                    {renewals.find(
                      (r) => r._id === renewalId
                    )?.title || "Selected Period"}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">
                    Branch Filter
                  </span>

                  <p className="font-semibold">
                    {branch || "All Branches"}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">
                    Generated
                  </span>

                  <p className="font-semibold">
                    {formatDate(new Date())}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          LOADING ANIMATION
      ===================================================== */}
      <style>
        {`
          @keyframes reportSpin {
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
};

export default Report;

