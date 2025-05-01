import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from localStorage, default to true if not found
    const savedMode = localStorage.getItem("darkMode");
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });
  const [user, setUser] = useState(null); // To store the logged-in user's data
  const [currentTime, setCurrentTime] = useState(""); // To store the current time and day
  const [greeting, setGreeting] = useState(""); // Store the personalized greeting
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const navigate = useNavigate();

  const getCurrentTimeAndDay = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Abbreviated day names
    const day = daysOfWeek[now.getDay()];

    // Determine the greeting based on the time of day
    let greetingMessage = "";
    let emoji = "";
    if (hours < 12) {
      greetingMessage = "Good Morning";
      emoji = "🌞"; // Morning emoji
    } else if (hours < 18) {
      greetingMessage = "Good Afternoon";
      emoji = "🌤️"; // Afternoon emoji
    } else {
      greetingMessage = "Good Evening";
      emoji = "🌙"; // Evening emoji
    }

    setGreeting(`${greetingMessage}, Admin ${emoji}`); // Set the greeting with emoji
    return `${time} — ${day}`; // Use en dash (–) instead of a regular dash
  };

  useEffect(() => {
    // Update time and day every minute
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeAndDay());
    }, 60000); // Update every minute

    // Set the initial time and day
    setCurrentTime(getCurrentTimeAndDay());

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        
        // Assuming the current user is the first one in the list for now (this logic could be adjusted)
        if (usersList.length > 0) {
          setUser(usersList[0]); // Set logged-in user (this can be adjusted based on your auth logic)
        }
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setProgress(100);
        setLoading(false);
        clearInterval(interval);
      }
    };

    fetchUsers();
    
    // Clean up the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  // Save darkMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleSignOut = () => {
    setIsModalOpen(true); // Open the modal when user clicks logout
  };

  const handleLogout = () => {
    // Handle logout logic here (e.g., clear user session or token)
    navigate("/login"); // Navigate to the login page
    setIsModalOpen(false); // Close the modal after logging out
  };

  const handleCancelLogout = () => {
    setIsModalOpen(false); // Close the modal without logging out
  };

  const handleSortByName = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (user.motorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.plateNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedFilteredUsers = [...filteredUsers].sort((a, b) => {
    const nameA = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
    const nameB = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
    return sortDirection === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const styles = {
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      textAlign: "left",
      padding: "2rem",
      paddingTop: "110px", // Add padding at the top to account for the fixed header
      minHeight: "100vh",
      backgroundColor: darkMode ? "#181818" : "#ffffff",
      color: darkMode ? "#ddd" : "#000",
      transition: "all 0.3s ease",
    },
    header: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      display: "flex",
      alignItems: "center",
      padding: "0.5rem 1.2rem",
      backgroundColor: darkMode ? "#181818" : "#fff",
      zIndex: 1000,
      justifyContent: "flex-start",
      gap: "15px",
      transition: "background-color 0.3s ease, border-color 0.3s ease",
    },
    headerLeft: {
      flexShrink: 0,
    },
    logoImageSmall: {
      width: "85px",
      height: "85px",
      objectFit: "contain",
    },
    headerRight: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      justifyContent: "center",
      marginLeft: "auto",
      gap: "0px",
    },
    menuButton: {
      background: "none",
      border: "none",
      fontSize: "25px",
      cursor: "pointer",
      color: darkMode ? "#ddd" : "#000", // Adjust text color based on mode
    },
    logoutIcon: {
      width: "20px",
      height: "20px",
      cursor: "pointer",
      marginLeft: "auto", // This pushes it to the right
    },
    darkModeButton: {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      backgroundColor: darkMode ? "#333" : "#fff",
      color: darkMode ? "#fff" : "#333",
      fontSize: "24px",
      border: "none",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
    },
    userTable: {
      maxWidth: "900px",
      margin: "0 auto",
      border: "1px solid #ccc",
      borderRadius: "16px",
      overflow: "hidden",
      marginTop: "2rem", // Increase from 2rem to 3rem
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "1fr 2fr 2fr",
      backgroundColor: darkMode ? "#1f1f1f" : "#f4f4f4", // Table background in dark mode
      padding: "1rem",
      fontWeight: "bold",
      textAlign: "left",
      color: darkMode ? "#fff" : "#000", // Text color in dark mode
    },
    tableRow: {
      display: "grid",
      gridTemplateColumns: "1fr 2fr 2fr",
      padding: "0.75rem 1rem",
      backgroundColor: darkMode ? "#2a2a2a" : "#fff", // Row background in dark mode
      borderTop: "1px solid #eee",
      alignItems: "center",
      textAlign: "left",
      color: darkMode ? "#fff" : "#000", // Row text color in dark mode
    },
    searchInput: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "1rem",
      borderRadius: "12px",
      border: "1px solid #ccc",
      marginTop: "0.8rem", // Add some space above the search bar
    },
    greetingTextLight: {
      fontSize: "25px",
      fontWeight: "bold",
      color: "#687eff",
      marginTop: "0px", // Add top margin to push down from header
      marginLeft: "0px",
   },
    greetingTextDark: {
      fontSize: "25px",
      fontWeight: "bold",
      color: "#687eff",
      marginTop: "0px", // Add top margin to push down from header
      marginLeft: "0px",
    },
    
    timeWithDay: {
      fontSize: "34px",
      fontWeight: "800",
      color: "#ccc",
      letterSpacing: "1px",
      paddingLeft: "0px",
      fontFamily: "Arial, sans-serif",
      marginBottom: "8px", // Add bottom margin to create space before the table
    },
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: isModalOpen ? "flex" : "none",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1000",
    },
    modalContent: {
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      textAlign: "center",
      width: "300px",
    },
    modalButton: {
      padding: "10px 20px",
      margin: "10px",
      cursor: "pointer",
      borderRadius: "4px",
      border: "none",
      fontSize: "16px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/admin-dashboard">
          <div style={{ width: "80px", height: "80px", marginRight: "-20px" }}>
            <img
              src="/RideSafe Logo.png"
              alt="Ride Safe Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </Link>


        <img
          src="/logout.png"
          alt="Logout"
          style={styles.logoutIcon}
          onClick={handleSignOut}
        />
      </div>

      {user && (
        <div style={darkMode ? styles.greetingTextDark : styles.greetingTextLight}>
          {greeting}
        </div>
      )}

      <div style={styles.timeWithDay}>
        {currentTime}
      </div>

      {loading ? (
        <>
          <div style={{ width: "250px", height: "20px", border: "2px solid black", borderRadius: "999px", margin: "0 auto", overflow: "hidden", marginBottom: "0.5rem" }}>
            <div style={{ width: progress + "%", height: "100%", backgroundColor: "#007bff", borderRadius: "999px", transition: "width 0.4s ease" }} />
          </div>
          <p style={{ color: "#555" }}>Loading user data...</p>
        </>
      ) : users.length === 0 ? (
        <p style={{ color: "#555" }}>No user data found.</p>
      ) : (
        <>
          <div style={{ maxWidth: "700px", margin: "0 auto 1.5rem" }}>
            <input
              type="text"
              placeholder="Search by name, motor or plate info"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.userTable}>
            <div style={styles.tableHeader}>
              <div>User</div>
              <div onClick={handleSortByName} style={{ cursor: "pointer", userSelect: "none" }}>
                Name {sortDirection === "asc" ? "🔼" : "🔽"}
              </div>
              <div>Motor & Plate</div>
            </div>

            <div style={{ maxHeight: "450px", overflowY: "auto", overflowX: "hidden", padding: "0" }}>
              {sortedFilteredUsers.map((user) => (
                <Link to={`/user/${user.id}`} key={user.id} style={{ textDecoration: "none", color: darkMode ? "#ddd" : "#000" }}>
                  <div style={styles.tableRow}>
                    <div><span style={{ fontSize: "1.5rem" }}>👤</span></div>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100px" }}>
                      <div>{`${user.firstName || ""} ${user.lastName || ""}`.trim().slice(0, 10) || "—"}</div>
                      <div style={{ fontSize: "0.85rem", color: "#666" }}>@{user.username || "unknown"}</div>
                    </div>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <div>{user.motorName || "—"}</div>
                      <div style={{ fontSize: "0.85rem", color: "#666" }}>{user.plateNumber || "—"}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <button onClick={toggleDarkMode} style={styles.darkModeButton}>
        {darkMode ? "🌙" : "🌞"}
      </button>

      {isModalOpen && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: darkMode ? "#2b2b2b" : "#fff",
            padding: "30px",
            borderRadius: "10px",
            textAlign: "center",
            width: "90%",
            maxWidth: "303px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
          }}>
            <h2 style={{
              marginBottom: "16px",
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "0.4px",
              color: darkMode ? "#ddd" : "#333"
            }}>
              Log out of your account?
            </h2>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              
            }}>
              <button
                onClick={handleCancelLogout}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #999",
                  backgroundColor: "#f0f0f0",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#687eff",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;