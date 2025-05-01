import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged, deleteUser, updatePassword } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import emailjs from "emailjs-com";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

const TaoPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState({
    username: "User",
    email: "",
    phoneNumber: "",
    fullName: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  
  // New state for active tab
  const [activeTab, setActiveTab] = useState('tao');
  
  // New state for page transition animation
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (location.state && location.state.userData) {
          setUserDetails(location.state.userData);
        } else {
          console.warn("No user data passed from previous page.");
          navigate("/profile");
        }
      } else {
        setUser(null);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, location.state, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setShowLogoutConfirm(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
  
    try {
      const usersRef = collection(db, "Users"); // <-- fixed
      const q = query(usersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
  
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, "Users", docSnap.id));
      }
  
      await deleteUser(user);
  
      setShowDeleteConfirm(false);
      navigate("/login");
    } catch (error) {
      console.error("Delete account failed:", error);
      alert("Failed to delete account. Please try again later.");
    }
  };
  

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updatePassword(currentUser, newPassword);
        setShowPasswordModal(false);
        alert("Password updated successfully!");
      }
    } catch (error) {
      console.error("Password update failed:", error);
      setPasswordError("Failed to update password. Please try again later.");
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const navigateToChangePassword = () => {
    setShowPasswordModal(true);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
  };

  const navigateToSupport = () => {
    setShowSupportModal(true);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();

    const templateParams = {
      from_name: userDetails.username,
      reply_to: userDetails.email,
      message: supportMessage,
    };
    
    emailjs.send("service_ttzzqpl", "template_oguordi", templateParams, "H2h8WGOoUq8ExZp5d")
      .then((response) => {
        console.log("Email sent successfully:", response);
        alert("Your message has been sent successfully!");
        setSupportMessage("");
        setShowSupportModal(false);
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Failed to send your message. Please try again later.");
      });
  };

  // Handle tab change with fade animation
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    // Start fade out transition
    setIsPageTransitioning(true);
    
    // Wait for fade out animation to complete before changing tab
    setTimeout(() => {
      setActiveTab(tab);
      if (tab === 'profile') {
        navigate('/profile');
      }
      // Start fade in animation
      setTimeout(() => {
        setIsPageTransitioning(false);
      }, 50);
    }, 300); // Match this with the CSS transition duration
  };

  // Create page transition class based on state
  const pageTransitionClass = isPageTransitioning ? 'fade-out' : 'fade-in';

  return (
    <div style={darkMode ? styles.pageWrapperDark : styles.pageWrapperLight}>
      {/* Add fade transition style */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          
          .fade-in {
            animation: fadeIn 0.3s ease forwards;
          }
          
          .fade-out {
            animation: fadeOut 0.3s ease forwards;
          }
        `}
      </style>

      {/* Header with Logo */}
      <div style={darkMode ? styles.headerDark : styles.headerLight}>
        <div style={styles.headerLeft}>
          <img src="/RideSafe Logo.png" alt="Ride Safe Logo" style={styles.logoImage} />
        </div>
        <div style={styles.headerRight}>
          <img
            src="/logout.png"
            alt="Logout"
            style={styles.logoutIcon}
            onClick={() => setShowLogoutConfirm(true)}
          />
        </div>
      </div>

      {/* Main Content with fade animation */}
      <div style={styles.contentArea} className={pageTransitionClass}>
        {/* Greeting */}
        <div style={styles.greetingContainer}>
          <h2 style={darkMode ? styles.greetingTextDark : styles.greetingTextLight}>
            Hello, {userDetails.username}!
          </h2>
        </div>

        {/* Choices Section */}
        <div style={styles.choicesSection}>
          <div style={styles.choiceButtonContainer}>
            <button
              style={darkMode ? styles.choiceButtonDark : styles.choiceButtonLight}
              onClick={navigateToChangePassword}
            >
              <div style={styles.buttonContent}>
                <span style={styles.buttonIcon}>🔒</span>
                <span style={styles.buttonText}>Change Password</span>
              </div>
            </button>
            
            <button
              style={darkMode ? styles.choiceButtonDark : styles.choiceButtonLight}
              onClick={navigateToSupport}
            >
              <div style={styles.buttonContent}>
                <span style={styles.buttonIcon}>❓</span>
                <span style={styles.buttonText}>Help & Support</span>
              </div>
            </button>
            
            <button
              style={darkMode ? styles.choiceButtonDark : styles.choiceButtonLight}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <div style={styles.buttonContent}>
                <span style={styles.buttonIcon}>⚠️</span>
                <span style={styles.buttonText}>Delete Account</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div style={styles.logoutButtonContainer}>
        <button
          style={darkMode ? styles.logoutButtonDark : styles.logoutButtonLight}
          onClick={() => setShowLogoutConfirm(true)}
        >
          Logout
        </button>
      </div>

      {/* Redesigned Bottom Task Bar */}
      <div style={darkMode ? styles.taskBarDark : styles.taskBarLight}>
        <div style={styles.taskBarContainer}>
          {/* Home/Profile Tab */}
          <div 
            style={activeTab === 'profile' ? {...styles.tabItem, ...styles.activeTab} : styles.tabItem}
            onClick={() => handleTabChange('profile')}
          >
            <img src="/home.png" alt="Home" style={styles.taskIcon} />
            <span style={styles.tabText}>Home</span>
          </div>
          
          {/* Tao Tab */}
          <div 
            style={activeTab === 'tao' ? {...styles.tabItem, ...styles.activeTab} : styles.tabItem}
            onClick={() => handleTabChange('tao')}
          >
            <img src="/tao.png" alt="Tao" style={styles.taskIcon} />
            <span style={styles.tabText}>Settings</span>
          </div>
        </div>
      </div>

      {/* Dark Mode Button */}
      <div style={styles.darkModeToggleContainer}>
        <button
          style={styles.darkModeToggleButton}
          onClick={toggleDarkMode}
        >
          {darkMode ? "🌙" : "🌞"}
        </button>
      </div>

      {/* Help & Support Modal */}
      {showSupportModal && (
        <div style={styles.modalOverlay}>
          <div style={darkMode ? {...styles.modal, ...styles.modalDark} : styles.modal}>
            <h2 style={darkMode ? styles.modalTitleDark : styles.modalTitleLight}>Need Help?</h2>
            <p style={darkMode ? styles.modalSubtitleDark : styles.modalSubtitleLight}>
              Send us a message and we'll get back to you soon.
            </p>
            <textarea
              placeholder="Enter your message here"
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              style={darkMode ? styles.modalTextareaDark : styles.modalTextareaLight}
              rows={5}
            />
            <div style={styles.modalButtons}>
              <button 
                style={darkMode ? styles.cancelButtonDark : styles.cancelButtonLight} 
                onClick={() => setShowSupportModal(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.saveButton} 
                onClick={handleSupportSubmit}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={darkMode ? {...styles.modal, ...styles.modalDark} : styles.modal}>
            <p style={{...styles.modalText, color: darkMode ? "white" : "#333"}}>Log out of your account?</p>
            <div style={styles.modalButtons}>
              <button style={styles.cancelButton} onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button 
                style={darkMode ? {...styles.logoutButton, ...styles.logoutButtonDark} : styles.logoutButton} 
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={darkMode ? {...styles.modal, ...styles.modalDark} : styles.modal}>
            <h2 style={darkMode ? styles.modalTitleDark : styles.modalTitleLight}>Delete Account</h2>
            <p style={darkMode ? styles.modalTextDark : styles.modalTextLight}>
              Are you sure you want to delete your account?
            </p>
            <p style={styles.modalWarning}>This action cannot be undone.</p>
            <div style={styles.modalButtons}>
              <button 
                style={darkMode ? styles.cancelButtonDark : styles.cancelButtonLight} 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.deleteButton} 
                onClick={handleDeleteAccount}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={styles.modalOverlay}>
          <div style={darkMode ? {...styles.modal, ...styles.modalDark} : styles.modal}>
            <h2 style={darkMode ? styles.modalTitleDark : styles.modalTitleLight}>Change Your Password</h2>
            <p style={darkMode ? styles.modalSubtitleDark : styles.modalSubtitleLight}>
              Create a new secure password
            </p>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={darkMode ? styles.modalInputDark : styles.modalInputLight}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={darkMode ? styles.modalInputDark : styles.modalInputLight}
            />
            {passwordError && <p style={styles.modalWarning}>{passwordError}</p>}
            <div style={styles.modalButtons}>
              <button 
                style={darkMode ? styles.cancelButtonDark : styles.cancelButtonLight} 
                onClick={handlePasswordModalClose}
              >
                Cancel
              </button>
              <button 
                style={styles.saveButton} 
                onClick={handlePasswordChange}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageWrapperLight: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#ffffff",
    textAlign: "center",
    paddingTop: "95px",
    paddingBottom: "90px",
    overflow: "auto",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  
  pageWrapperDark: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#181818",
    color: "#bbb",
    textAlign: "center",
    paddingTop: "95px",
    paddingBottom: "90px",
    overflow: "auto",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  
  headerLight: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1.2rem",
    backgroundColor: "#fff",
    zIndex: 1000,
    justifyContent: "flex-start",
    gap: "15px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  
  headerDark: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: "0.3rem 1.5rem",
    backgroundColor: "#181818",
    zIndex: 1000,
    justifyContent: "flex-start",
    gap: "15px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  
  headerLeft: {
    flexShrink: 0,
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: "auto",
    gap: "0px",
  },
  logoImage: {
    width: "85px",
    height: "85px",
    objectFit: "contain",
  },
  logoutIcon: {
    width: "20px",
    height: "20px",
    cursor: "pointer",
    marginLeft: "auto",
  },
  greetingContainer: {
    marginTop: "10px",
    padding: "0 20px",
    textAlign: "left",
  },
  greetingTextLight: {
    fontSize: "27px",
    fontWeight: "bold",
    color: "#687eff",
    marginBottom: "30px",
    marginLeft: "10px",
  },
  greetingTextDark: {
    fontSize: "27px",
    fontWeight: "bold",
    color: "#687eff",
    marginBottom: "30px",
    marginLeft: "10px",
  },
  contentArea: {
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "left",
    height: "calc(100vh - 210px)",
    padding: "1rem",
    overflowY: "auto",
  },
  choicesSection: {
    display: "flex",
    justifyContent: "center",
  },
  choiceButtonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "25px", // Increased spacing between buttons
    width: "85%",
    maxWidth: "450px",
  },
  choiceButtonLight: {
    padding: "20px 25px", // Increased padding
    fontSize: "18px",
    border: "2px solid #687eff",  // Change border color to #687eff
    backgroundColor: "#ffffff",
    color: "#333333", 
    borderRadius: "12px", // More rounded corners
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "left",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "block",
    width: "100%",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
  
  choiceButtonDark: {
    padding: "20px 25px", // Increased padding
    fontSize: "18px",
    border: "2px solid #687eff",  // Change border color to #687eff
    backgroundColor: "#2a2a2a",
    color: "#f0f0f0",
    borderRadius: "12px", // More rounded corners
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    textAlign: "left",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "block",
    width: "100%",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    },
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
  },
  buttonIcon: {
    fontSize: "22px",
    marginRight: "15px",
  },
  buttonText: {
    fontSize: "18px",
    fontWeight: "500",
  },
  logoutButtonContainer: {
    position: "fixed",
    bottom: "115px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
  },
  logoutButtonLight: {
    backgroundColor: "#ff4757",
    color: "#fff",
    border: "none",
    padding: "14px 45px",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(255, 71, 87, 0.3)",
    transition: "background-color 0.2s ease, transform 0.2s ease",
    "&:hover": {
      backgroundColor: "#ff3344",
      transform: "translateY(-2px)",
    },
  },
  logoutButtonDark: {
    backgroundColor: "#ff4757",
    color: "#fff",
    border: "none",
    padding: "14px 45px",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(255, 71, 87, 0.3)",
    transition: "background-color 0.2s ease, transform 0.2s ease",
    "&:hover": {
      backgroundColor: "#ff3344",
      transform: "translateY(-2px)",
    },
  },
  // Redesigned taskbar styles to match reference code
  taskBarLight: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    padding: "7px 0",
    borderTop: "1px solid #eeeeee",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
  },
  
  taskBarDark: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#1e1e1e",
    padding: "7px 0",
    borderTop: "1px solid #333333",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
  },
  
  taskBarContainer: {
    display: "flex",
    justifyContent: "space-between", // Spread icons wider
    alignItems: "center",
    padding: "0 0px",  // Add padding to the left and right to create space
    width: "100%",
    maxWidth: "500px",
    height: "100%",
  },
  
  tabItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "12px",
    transition: "all 0.2s ease",
    height: "90%",
    width: "45%",
  },
  
  activeTab: {
    backgroundColor: "rgba(104, 126, 255, 0.1)",
  },
  
  tabText: {
    fontSize: "12px",
    color: "#666",
  },
  
  taskIcon: {
    width: "28px",
    height: "28px",
    objectFit: "contain",
  },
  
  // Dark Mode Toggle Button
  darkModeToggleContainer: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1500,
  },
  darkModeToggleButton: {
    backgroundColor: "transparent",
    border: "1px solid #ddd",
    borderRadius: "50%",
    fontSize: "24px",
    padding: "10px",
    cursor: "pointer",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    width: "80%",
    maxWidth: "300px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  },
  modalDark: {
    backgroundColor: "#2b2b2b",
    color: "#ddd",
  },
  modalText: {
    fontSize: "16px",
    marginBottom: "20px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  modalTitleLight: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#333",
  },
  modalTitleDark: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#f0f0f0",
  },
  modalSubtitleLight: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "20px",
  },
  modalSubtitleDark: {
    fontSize: "16px",
    color: "#bbb",
    marginBottom: "20px",
  },
  modalTextLight: {
    fontSize: "18px",
    marginBottom: "20px",
    color: "#333",
  },
  modalTextDark: {
    fontSize: "18px",
    marginBottom: "20px",
    color: "#f0f0f0",
  },
  modalWarning: {
    fontSize: "16px",
    color: "#ff4757",
    marginBottom: "25px",
    fontWeight: "500",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  cancelButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #999",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#687eff",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },

  cancelButtonLight: {
    padding: "12px 0",
    backgroundColor: "#f1f2f6",
    color: "#333",
    borderRadius: "8px",
    cursor: "pointer",
    width: "48%",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  cancelButtonDark: {
    padding: "12px 0",
    backgroundColor: "#3a3a3a",
    color: "#f0f0f0",
    borderRadius: "8px",
    cursor: "pointer",
    width: "48%",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  saveButton: {
    padding: "12px 0",
    backgroundColor: "#2ed573",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#fff",
    width: "48%",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  deleteButton: {
    padding: "12px 0",
    backgroundColor: "#ff4757",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#fff",
    width: "48%",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  modalInputLight: {
    padding: "15px",
    margin: "10px 0",
    fontSize: "16px",
    border: "1px solid #dfe4ea",
    borderRadius: "8px",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    color: "#333",
  },
  modalInputDark: {
    padding: "15px",
    margin: "10px 0",
    fontSize: "16px",
    border: "1px solid #444",
    borderRadius: "8px",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#3a3a3a",
    color: "#f0f0f0",
  },
  modalTextareaLight: {
    padding: "15px",
    margin: "10px 0",
    fontSize: "16px",
    border: "1px solid #dfe4ea",
    borderRadius: "8px",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    backgroundColor: "#fff",
    color: "#333",
  },
  modalTextareaDark: {
    padding: "15px",
    margin: "10px 0",
    fontSize: "16px",
    border: "1px solid #444",
    borderRadius: "8px",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    backgroundColor: "#3a3a3a",
    color: "#f0f0f0",
  },
};

export default TaoPage;