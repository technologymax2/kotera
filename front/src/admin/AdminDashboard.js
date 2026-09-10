
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


const API_URL = "https://poessa-digital-services-1.onrender.com";
const IMGBB_API_KEY = "ebd592608f4dba1e8271bec8e920c408";

// ============================================================
// USER TABLE
// ============================================================
const UserTable = ({
  users,
  toggleBlock,
  deleteUser,
  resetPassword,
}) => (
  <div className="table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          <th>ፎቶ</th>
          <th>Username</th>
          <th>ሙሉ ስም</th>
          <th>ሁኔታ</th>
          <th>ድርጊት</th>
        </tr>
      </thead>

      <tbody>
        {users.length === 0 ? (
          <tr>
            <td
              colSpan="5"
              style={{
                textAlign: "center",
                padding: "30px",
                color: "#777",
              }}
            >
              ምንም ተጠቃሚ አልተገኘም
            </td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user._id}>
              <td>
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="User"
                    style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      backgroundColor: "#cbd5e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {user.username
                      ? user.username.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                )}
              </td>

              <td>{user.username}</td>

              <td>{user.fullName || "N/A"}</td>

              <td>
                {user.isBlocked ? (
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    ታግዷል
                  </span>
                ) : (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    ንቁ
                  </span>
                )}
              </td>

              <td>
                <button
                  className="danger-btn"
                  onClick={() =>
                    toggleBlock(user._id, user.isBlocked)
                  }
                >
                  {user.isBlocked ? "አንቃ" : "አግድ"}
                </button>

                <button
                  className="warning-btn"
                  onClick={() => resetPassword(user._id)}
                >
                  የይለፍ ቃል ቀይር
                </button>

                <button
                  className="dark-btn"
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

  // ============================================================
  // UPLOAD IMAGE TO IMGBB
  // ============================================================
  const uploadToImgBB = async (file) => {
    const formData = new FormData();

    formData.append("image", file);

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );

    return res.data.data.url;
  };

  // ============================================================
  // FETCH USERS
  // ============================================================
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `${API_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(res.data?.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.message ||
          "ተጠቃሚዎችን ማምጣት አልተቻለም"
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ============================================================
  // LOAD USERS
  // ============================================================
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ============================================================
  // CLEAN IMAGE PREVIEW WHEN COMPONENT UNMOUNTS
  // ============================================================
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ============================================================
  // FILE CHANGE
  // ============================================================
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Only allow images
    if (!file.type.startsWith("image/")) {
      alert("እባክዎ የምስል ፋይል ይምረጡ");
      return;
    }

    // Optional size validation: 5MB
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

  // ============================================================
  // CREATE USER
  // ============================================================
  const createUser = async () => {
    if (!username.trim() || !fullName.trim() || !password.trim()) {
      alert(
        "እባክዎ Username፣ ሙሉ ስም እና Password ያስገቡ"
      );
      return;
    }

    setLoading(true);

    let imageUrl = "";

    try {
      // --------------------------------------------------------
      // Upload profile picture if selected
      // --------------------------------------------------------
      if (profileFile) {
        imageUrl = await uploadToImgBB(profileFile);
      }

      const token = localStorage.getItem("token");

      if (!token) {
        alert("የመግቢያ ጊዜዎ አልቋል። እንደገና ይግቡ።");
        navigate("/login");
        return;
      }

      // --------------------------------------------------------
      // Create user
      // --------------------------------------------------------
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

      // --------------------------------------------------------
      // Clear preview URL
      // --------------------------------------------------------
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      // --------------------------------------------------------
      // Reset form
      // --------------------------------------------------------
      setUsername("");
      setFullName("");
      setPassword("");
      setRole("employee");
      setProfileFile(null);
      setImagePreview("");

      // --------------------------------------------------------
      // Refresh users
      // --------------------------------------------------------
      await fetchUsers();
    } catch (err) {
      console.error("Create user error:", err);

      alert(
        err.response?.data?.message ||
          "ምዝገባ አልተሳካም"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // BLOCK / UNBLOCK USER
  // ============================================================
  const toggleBlock = async (id, blocked) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/admin/${
          blocked ? "unblock" : "block"
        }/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchUsers();
    } catch (err) {
      console.error("Block/unblock error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.message ||
          "Operation failed"
      );
    }
  };

  // ============================================================
  // DELETE USER
  // ============================================================
  const deleteUser = async (id) => {
    const confirmed = window.confirm(
      "ይህንን ተጠቃሚ ለመሰረዝ እርግጠኛ ነዎት?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/admin/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("ተጠቃሚው በስኬት ተሰርዟል።");

      await fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================
  const resetPassword = async (id) => {
    const newPassword = window.prompt(
      "አዲስ የይለፍ ቃል ያስገቡ"
    );

    if (!newPassword) {
      return;
    }

    if (newPassword.length < 4) {
      alert(
        "የይለፍ ቃሉ ቢያንስ 4 ቁምፊዎች ሊኖሩት ይገባል።"
      );
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
        {
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("የይለፍ ቃሉ ተሻሽሏል።");
    } catch (err) {
      console.error("Reset password error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.message ||
          "Failed"
      );
    }
  };

  // ============================================================
  // FILTER USERS BY ROLE
  // ============================================================
  const admins = useMemo(
    () => users.filter((u) => u.role === "admin"),
    [users]
  );

  const employees = useMemo(
    () => users.filter((u) => u.role === "employee"),
    [users]
  );

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        currentLang={currentLang}
        toggleLanguage={() =>
          setCurrentLang((prev) =>
            prev === "am" ? "en" : "am"
          )
        }
      />

      <main className="dashboard-main">
        <Header title="POESSA Admin Dashboard" />

        {/* ====================================================
            CREATE USER FORM
        ==================================================== */}
        <section className="user-form-card">
          <h3>አዲስ ተጠቃሚ መዝግብ</h3>

          {/* PHOTO UPLOAD */}
          <div className="admin-photo-upload-zone">
            <label
              htmlFor="admin-photo-file"
              className="admin-photo-label-box"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="admin-preview-img-circle"
                />
              ) : (
                <div className="admin-upload-placeholder-content">
                  <span className="upload-icon-style">
                    📷
                  </span>

                  <span>ፎቶ ምረጥ</span>
                </div>
              )}
            </label>

            <input
              type="file"
              id="admin-photo-file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* FORM */}
          <div className="form-grid">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="ሙሉ ስም"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="employee">
                ሰራተኛ (Employee)
              </option>

              <option value="admin">
                አድሚን (Admin)
              </option>
            </select>

            <button
              onClick={createUser}
              disabled={loading}
            >
              {loading
                ? "በመመዝገብ ላይ..."
                : "ተጠቃሚ ፍጠር"}
            </button>
          </div>
        </section>

        {/* ====================================================
            ADMINS
        ==================================================== */}
        <h3 className="section-title">
          አድሚኖች
        </h3>

        <UserTable
          users={admins}
          toggleBlock={toggleBlock}
          deleteUser={deleteUser}
          resetPassword={resetPassword}
        />

        {/* ====================================================
            EMPLOYEES
        ==================================================== */}
        <h3 className="section-title">
          ሰራተኞች
        </h3>

        <UserTable
          users={employees}
          toggleBlock={toggleBlock}
          deleteUser={deleteUser}
          resetPassword={resetPassword}
        />

    
      </main>
    </div>
  );
};

export default AdminDashboard;

