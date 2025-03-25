import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase";  // Firebase auth import
import { signOut } from "firebase/auth"; // Firebase sign out

function Profile() {
  const [menuVisible, setMenuVisible] = useState(false); // State to control menu visibility
  const [showPasswordForm, setShowPasswordForm] = useState(false); // State to control the visibility of the Change Password form
  const [newPassword, setNewPassword] = useState(""); // State for new password
  const [currentPassword, setCurrentPassword] = useState(""); // State for current password
  const [error, setError] = useState(""); // For error handling in Change Password

  const navigate = useNavigate(); // Hook to navigate to login page after log out

  // Toggle the visibility of the menu
  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  // Handle log out and navigate to the Login page
  const handleLogOut = async () => {
    try {
      await signOut(auth);  // Log the user out using Firebase Authentication
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  // Handle password change (basic example)
  const handlePasswordChange = () => {
    if (newPassword && currentPassword) {
      // Implement password change logic here with Firebase Auth
      console.log("Change password requested", { currentPassword, newPassword });
      // Reset form and hide the menu
      setShowPasswordForm(false);
      setMenuVisible(false);
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setError("Please fill out both fields!");
    }
  };

  return (
    <div style={styles.container}>
      {/* Hamburger Menu Icon */}
      <div style={styles.hamburgerIconContainer} onClick={handleMenuToggle}>
        <div style={styles.hamburgerIcon}></div>
        <div style={styles.hamburgerIcon}></div>
        <div style={styles.hamburgerIcon}></div>
      </div>

      {/* Table for displaying data */}
      <div style={styles.tableContainer}>
        <h3 style={styles.tableTitle}>Your Data Table</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Column 1</th>
              <th style={styles.tableHeader}>Column 2</th>
              <th style={styles.tableHeader}>Column 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.tableCell}>Data 1</td>
              <td style={styles.tableCell}>Data 2</td>
              <td style={styles.tableCell}>Data 3</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Main Content Below the Table */}
      <div style={styles.sectionsContainer}>
        <Link to="/userDetails" style={styles.link}>
          <div style={styles.sectionBox}>
            <img src="/assets/icons/user.png" alt="User Icon" style={styles.icon} />
            <h3 style={styles.sectionTitle}>User Details</h3>
          </div>
        </Link>

        <Link to="/motorDetails" style={styles.link}>
          <div style={styles.sectionBox}>
            <img src="/assets/icons/motor.png" alt="Motor Icon" style={styles.icon} />
            <h3 style={styles.sectionTitle}>Motor Details</h3>
          </div>
        </Link>

        <Link to="/emergencyDetails" style={styles.link}>
          <div style={styles.sectionBox}>
            <img src="/assets/icons/phone.png" alt="Phone Icon" style={styles.icon} />
            <h3 style={styles.sectionTitle}>Emergency Contact Registration</h3>
          </div>
        </Link>
      </div>

      {/* Dropdown Menu for Hamburger */}
      {menuVisible && (
        <div style={styles.menu}>
          <div onClick={handleLogOut} style={styles.menuItem}>
            Log Out
          </div>
          <div
            onClick={() => {
              setShowPasswordForm(true); // Show the Change Password form when clicked
              setMenuVisible(false); // Hide the hamburger menu
            }}
            style={styles.menuItem}
          >
            Change Password
          </div>
        </div>
      )}

      {/* Change Password Form (Shown only if showPasswordForm is true) */}
      {showPasswordForm && (
        <div style={styles.changePasswordContainer}>
          <h4>Change Password</h4>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
          />
          {error && <p style={styles.errorText}>{error}</p>}
          <button onClick={handlePasswordChange} style={styles.saveButton}>
            Save New Password
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "480px",
    margin: "auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    fontFamily: "'Roboto', sans-serif",
    marginTop: "40px",
    color: "#333",
  },
  hamburgerIconContainer: {
    position: "absolute",
    top: "20px",
    right: "20px",
    cursor: "pointer",
  },
  hamburgerIcon: {
    width: "30px",
    height: "5px",
    backgroundColor: "#333",
    margin: "5px 0",
  },
  tableContainer: {
    marginBottom: "20px",
  },
  tableTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse", // Ensures borders collapse into single borders
    border: "1px solid #ddd", // Outer border for the table
  },
  tableHeader: {
    borderBottom: "2px solid #ddd", // Bottom border for the table headers
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#f9f9f9", // Optional: adds a background color to the header
  },
  tableCell: {
    border: "1px solid #ddd", // Border around table cells
    padding: "10px",
    textAlign: "left",
  },
  sectionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sectionBox: {
    backgroundColor: "#f0f0f0",
    padding: "20px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    border: "1px solid #ddd",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "10px", // Space between the icon and the title
  },
  sectionTitle: {
    fontSize: "18px",
    color: "#333",
    fontWeight: "600",
  },
  icon: {
    width: "30px", // Adjust the width of the icons
    height: "30px", // Adjust the height of the icons
    objectFit: "contain", // Ensures the icon maintains its aspect ratio
  },
  link: {
    textDecoration: "none", // This removes the blue underline from the links
  },
  menu: {
    position: "absolute",
    top: "60px",
    right: "20px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    width: "200px",
    borderRadius: "5px",
    zIndex: "10",
  },
  menuItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #ddd",
    textAlign: "center",
  },
  changePasswordContainer: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  saveButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  errorText: {
    color: "red",
    fontSize: "14px",
  },
};

export default Profile;
