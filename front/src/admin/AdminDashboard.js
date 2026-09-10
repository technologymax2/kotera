import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import RenewalManagement from "./RenewalManagement"; // Make sure the path matches your project structure

const API_URL = "https://poessa-digital-services-1.onrender.com";
const IMGBB_API_KEY = "ebd592608f4dba1e8271bec8e920c408";

// ============================================================
// USER TABLE
// ============================================================
const UserTable = ({ users, toggleBlock, deleteUser, resetPassword }) => (
  <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100 mb-8">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-wider font-semibold">
            <th className="py-4 px-6">ፎቶ</th>
            <th className="py-4 px-6">Username</th>
            <th className="py-4 px-6">ሙሉ ስም</th>
            <th className="py-4 px-6">ሁኔታ</th>
            <th className="py-4 px-6 text-right">ድርጊት</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-10 text-gray-500 font-medium">
                ምንም ተጠቃሚ አልተገኘም
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50/50 transition">
                <td className="py-4 px-6">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm border border-blue-100">
                      {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 font-medium text-gray-900">{user.username}</td>
                <td className="py-4 px-6 text-gray-600">{user.fullName || "N/A"}</td>
                <td className="py-4 px-6">
                  {user.isBlocked ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                      ታግዷል
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-100">
                      ንቁ
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer ${
                      user.isBlocked
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                    onClick={() => toggleBlock(user._id, user.isBlocked)}
                  >
                    {user.isBlocked ? "አንቃ" : "አግድ"}
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
                    onClick={() => resetPassword(user._id)}
                  >
                    የይለፍ ቃል ቀይር
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
                    onClick={() => deleteUser(user._id)}
                  >
                    ሰርዝ
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ============================================================
// ADMIN DASHBOARD
// ============================================================
const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [currentLang, setCurrentLang] = useState("am");

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const [profileFile, setProfileFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );
    return res.data.data.url;
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      alert(err.response?.data?.message || "ተጠቃሚዎችን ማምጣት አልተቻለም");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("እባክዎ የምስል ፋይል ይምረጡ");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("የፎቶው መጠን ከ 5MB መብለጥ የለበትም");
      return;
    }
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setProfileFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const createUser = async () => {
    if (!username.trim() || !fullName.trim() || !password.trim()) {
      alert("እባክዎ Username፣ ሙሉ ስም እና Password ያስገቡ");
      return;
    }

    setLoading(true);
    let imageUrl = "";

    try {
      if (profileFile) {
        imageUrl = await uploadToImgBB(profileFile);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("የመግቢያ ጊዜዎ አልቋል። እንደገና ይግቡ።");
        navigate("/login");
        return;
      }

      await axios.post(
        `${API_URL}/api/admin/create-user`,
        {
          username: username.trim(),
          fullName: fullName.trim(),
          password,
          role,
          profilePicture: imageUrl,
          tinNumber: null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("ተጠቃሚው በስኬት ተመዝግቧል!");
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setUsername("");
      setFullName("");
      setPassword("");
      setRole("employee");
      setProfileFile(null);
      setImagePreview("");

      await fetchUsers();
    } catch (err) {
      console.error("Create user error:", err);
      alert(err.response?.data?.message || "ምዝገባ አልተሳካም");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id, blocked) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/admin/${blocked ? "unblock" : "block"}/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUsers();
    } catch (err) {
      console.error("Block/unblock error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const deleteUser = async (id) => {
    const confirmed = window.confirm("ይህንን ተጠቃሚ ለመሰረዝ እርግጠኛ ነዎት?");
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("ተጠቃሚው በስኬት ተሰርዟል።");
      await fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const resetPassword = async (id) => {
    const newPassword = window.prompt("አዲስ የይለፍ ቃል ያስገቡ");
    if (!newPassword) return;

    if (newPassword.length < 4) {
      alert("የይለፍ ቃሉ ቢያንስ 4 ቁምፊዎች ሊኖሩት ይገባል።");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/admin/reset-password/${id}`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("የይለፍ ቃሉ ተሻሽሏል።");
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      alert(err.response?.data?.message || "Failed");
    }
  };

  const admins = useMemo(() => users.filter((u) => u.role === "admin"), [users]);
  const employees = useMemo(() => users.filter((u) => u.role === "employee"), [users]);

  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-800">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        currentLang={currentLang}
        toggleLanguage={() =>
          setCurrentLang((prev) => (prev === "am" ? "en" : "am"))
        }
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "md:ml-0" : "md:ml-72"}`}>
        <Header title="POESSA Admin Dashboard" />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* ====================================================
              CREATE USER FORM
          ==================================================== */}
          <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              አዲስ ተጠቃሚ መዝግብ
            </h3>

            <div className="mb-6 flex justify-center">
              <label
                htmlFor="admin-photo-file"
                className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-gray-50 transition duration-200 shadow-sm"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-xs font-medium">ፎቶ ምረጥ</span>
                  </div>
                )}
              </label>

              <input
                type="file"
                id="admin-photo-file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />

              <input
                type="text"
                placeholder="ሙሉ ስም"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
              >
                <option value="employee">ሰራተኛ (Employee)</option>
                <option value="admin">አድሚን (Admin)</option>
              </select>
            </div>

            <button
              onClick={createUser}
              disabled={loading}
              className="w-full md:w-auto bg-[#162447] hover:bg-blue-900 text-white font-semibold py-3 px-8 rounded-xl transition duration-200 shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "በመመዝገብ ላይ..." : "ተጠቃሚ ፍጠር"}
            </button>
          </section>

          {/* ====================================================
              RENEWAL MANAGEMENT SECTION (imported from separate file)
          ==================================================== */}
          <RenewalManagement />

          {/* ====================================================
              ADMINS
          ==================================================== */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              አድሚኖች
            </h3>
            <UserTable
              users={admins}
              toggleBlock={toggleBlock}
              deleteUser={deleteUser}
              resetPassword={resetPassword}
            />
          </div>

          {/* ====================================================
              EMPLOYEES
          ==================================================== */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              ሰራተኞች
            </h3>
            <UserTable
              users={employees}
              toggleBlock={toggleBlock}
              deleteUser={deleteUser}
              resetPassword={resetPassword}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;