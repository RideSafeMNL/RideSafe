import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useParams, useNavigate, Link } from "react-router-dom";

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  // Get dark mode state from localStorage, default to true if not found
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fields = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Contact Number", key: "contactNumber" },
    { label: "Fingerprint ID", key: "fingerprintID" },
    { section: "Emergency Contact" },
    { label: "Name", key: "contactName" },
    { label: "Relationship", key: "relationship" },
    { label: "Contact Number", key: "contactNumber" },
    { section: "Motor Info" },
    { label: "Motor Name", key: "motorName" },
    { label: "Plate Number", key: "plateNumber" },
  ];

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDocRef = doc(db, "Users", userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUser(data);
        setFormData(data);
      } else {
        console.log("User not found");
      }
      setLoading(false);
    };
    fetchUserDetails();

    // Check for dark mode changes from localStorage
    const handleStorageChange = () => {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        setDarkMode(JSON.parse(savedMode));
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Clean up event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const userDocRef = doc(db, "Users", userId);
    try {
      await updateDoc(userDocRef, formData);
      setUser(formData);
      setIsEditing(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error updating user: ", error);
    }
  };

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    const userDocRef = doc(db, "Users", userId);
    try {
      await deleteDoc(userDocRef);
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const styles = {
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: "2rem",
      minHeight: "100vh",
      backgroundColor: darkMode ? "#181818" : "#ffffff",
      color: darkMode ? "#ddd" : "#000",
      transition: "all 0.3s ease",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
title: {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center",
  color: darkMode ? "#fff" : "#333",
  margin: "0.5rem 0 1rem", // ← Reduced top margin
},
contentCard: {
  maxWidth: "700px",
  margin: "0 auto",
  backgroundColor: darkMode ? "#2a2a2a" : "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  padding: "1.5rem",
  marginBottom: "2rem",
  overflowY: "auto",
  maxHeight: "calc(100vh - 250px)",
  marginTop: "-10px", // ← Moves the card up slightly
},

    sectionTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      color: darkMode ? "#687eff" : "#687eff",
      marginTop: "1.5rem",
      marginBottom: "0.75rem",
    },
    field: {
      marginBottom: "0.75rem",
    },
    fieldLabel: {
      fontWeight: "600",
      color: darkMode ? "#aaa" : "#555",
      fontSize: "14px",
      marginBottom: "0.3rem",
    },
    fieldValue: {
      color: darkMode ? "#fff" : "#333",
      fontSize: "16px",
      marginTop: "0.2rem",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      border: darkMode ? "1px solid #444" : "1px solid #ccc",
      borderRadius: "12px",
      fontSize: "0.875rem",
      backgroundColor: darkMode ? "#333" : "#fff",
      color: darkMode ? "#fff" : "#333",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "1rem",
      marginTop: "1.5rem",
    },
    button: {
      padding: "0.75rem 1.25rem",
      borderRadius: "8px",
      border: "none",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "0.875rem",
    },
    backButton: {
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "18px",
      color: darkMode ? "#687eff" : "#687eff",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    editButton: {
      backgroundColor: "#687eff",
      color: "#fff",
      marginTop: "-10px", // Move it up slightly
    },
    
    deleteButton: {
      backgroundColor: "#ff5252",
      color: "#fff",
      marginTop: "-10px", // Same
    },
    
    saveButton: {
      backgroundColor: "#4caf50",
      color: "#fff",
      marginTop: "-10px", // Same
    },
    cancelButton: {
      backgroundColor: "#9e9e9e",
      color: "#fff",
      marginTop: "-10px", // Same
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: darkMode ? "#2b2b2b" : "#fff",
      padding: "30px",
      borderRadius: "10px",
      textAlign: "center",
      width: "90%",
      maxWidth: "303px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
    },
    modalTitle: {
      marginBottom: "16px",
      fontSize: "14px",
      fontWeight: "600",
      letterSpacing: "0.4px",
      color: darkMode ? "#ddd" : "#333"
    },
    modalButtons: {
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
    },
    cancelModalButton: {
      padding: "8px 14px",
      borderRadius: "6px",
      border: "1px solid #999",
      backgroundColor: "#f0f0f0",
      cursor: "pointer",
      fontSize: "14px"
    },
    confirmModalButton: {
      padding: "8px 14px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#687eff",
      color: "#fff",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "14px"
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "calc(100vh - 100px)",
    },
    loadingText: {
      color: darkMode ? "#aaa" : "#555",
      marginTop: "1rem",
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={{ width: "50px", height: "50px" }}>
            {/* You can add a loading spinner image here */}
            <div style={{ fontSize: "36px", textAlign: "center" }}>⏳</div>
          </div>
          <p style={styles.loadingText}>Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>
          ← users
        </button>
        <Link to="/admin-dashboard">
          <div style={{ width: "60px", height: "60px" }}>
            <img
              src="/RideSafe Logo.png"
              alt="Ride Safe Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </Link>
      </div>

      <div style={{ ...styles.title, display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "-20px", marginBottom: "30px" }}>
      {isEditing ? (
    <input
      type="text"
      name="username"
      value={formData.username || ""}
      onChange={handleChange}
      style={{ ...styles.input, maxWidth: "250px", marginBottom: "0" }}
    />
  ) : (
    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: darkMode ? "#fff" : "#333" }}>
      {user?.username || "User"}
    </h1>
  )}

</div>

      <div style={styles.contentCard}>
        {isEditing ? (
          <>
            {fields.map((field, idx) => {
              if (field.section) {
                return (
                  <h3 key={idx} style={styles.sectionTitle}>
                    {field.section}
                  </h3>
                );
              }

              return (
                <div key={idx} style={styles.field}>
                  <label style={styles.fieldLabel}>
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name={field.key}
                    value={formData[field.key] || ""}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <>
            {fields.map((field, idx) => {
              if (field.section) {
                return (
                  <h3 key={idx} style={styles.sectionTitle}>
                    {field.section}
                  </h3>
                );
              }

              return (
                <div key={idx} style={styles.field}>
                  <p style={styles.fieldLabel}>
                    {field.label}
                  </p>
                  <p style={styles.fieldValue}>
                    {user[field.key] || "—"}
                  </p>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <button
              onClick={handleUpdate}
              style={{ ...styles.button, ...styles.saveButton }}
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              style={{ ...styles.button, ...styles.editButton }}
            >
              Edit User Info
            </button>
            <button
              onClick={handleDelete}
              style={{ ...styles.button, ...styles.deleteButton }}
            >
              Delete User
            </button>
          </>
        )}
      </div>

      {isModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>
              {isEditing ? "User updated successfully!" : "Delete this user?"}
            </h2>
            <div style={styles.modalButtons}>
              {isEditing ? (
                <button
                  onClick={closeModal}
                  style={styles.confirmModalButton}
                >
                  OK
                </button>
              ) : (
                <>
                  <button
                    onClick={closeModal}
                    style={styles.cancelModalButton}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    style={styles.confirmModalButton}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetails;