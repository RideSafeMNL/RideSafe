import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Papa from 'papaparse';

// Utility function to determine greeting and emoji
const getGreetingAndEmoji = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { greeting: "Good Morning", emoji: "🌞" };
  if (hour < 18) return { greeting: "Good Afternoon", emoji: "🌤️" };
  return { greeting: "Good Evening", emoji: "🌙" };
};

const UserDataDisplay = () => {
  const [userData, setUserData] = useState([]);
  const [user, setUser] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // New states for edit functionality
  const [editMode, setEditMode] = useState(null); // can be 'driver', 'motor', 'emergency'
  const [editData, setEditData] = useState({});
  const [docId, setDocId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track active tab
  const [activeTab, setActiveTab] = useState('profile');
  
  // New state for page transition animation
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  
  // New states for location modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();

  // Check localStorage for dark mode preference on initial load
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async (uid) => {
    try {
      setIsLoading(true);
      const q = query(collection(db, "Users"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          docId: doc.id
        }));
        setUserData(data);
        setDocId(data[0].docId);
        setEditData(data[0]);
      } else {
        console.log("No data found for the user.");
        setUserData([]);
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData([]);
      setShowLogoutConfirm(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Toggle dark mode and save to localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
  };

  // Handle starting edit mode for a section
  const handleStartEdit = (section) => {
    setEditMode(section);
    // Set the current data as the edit data
    setEditData(userData[0]);
  };

  // Handle input changes in edit mode
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  // Handle saving changes to Firestore
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      const userDocRef = doc(db, "Users", docId);
      const dataToUpdate = { ...editData };
      
      // Remove docId from the data to update (this is just for our local tracking)
      delete dataToUpdate.docId;
      
      await updateDoc(userDocRef, dataToUpdate);
      
      // Update local userData state to reflect changes
      const updatedUserData = userData.map(user => 
        user.docId === docId ? { ...editData, docId } : user
      );
      
      setUserData(updatedUserData);
      setSaveSuccess(true);
      
      // Reset after successful save
      setTimeout(() => {
        setEditMode(null);
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(null);
    // Reset edit data to original data
    setEditData(userData[0]);
  };

  // Handle tab change with fade animation
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    // Start fade out transition
    setIsPageTransitioning(true);
    
    // Wait for fade out animation to complete before changing tab
    setTimeout(() => {
      setActiveTab(tab);
      if (tab === 'tao') {
        navigate('/tao', { state: { userData: userData[0] } });
      }
      // Start fade in animation
      setTimeout(() => {
        setIsPageTransitioning(false);
      }, 50);
    }, 300); // Match this with the CSS transition duration
  };
  



  const fetchLastLocation = async () => {
    if (!userData || !userData[0] || !userData[0].fingerprintID) {
      alert("No fingerprint ID found for this user");
      return;
    }
  
    setIsLoadingLocation(true);
    setShowLocationModal(true);
  
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQOynnLesHIG33YGs5nbPYHtkvlNDdJtyqMDgf1IH2i3QDZ4VRpzpXcrdF0cCxYibXKNKHWPLoantzL/pub?output=csv');
      const csvText = await response.text();
      
      // Log the first few lines of CSV for debugging
      console.log("CSV sample:", csvText.substring(0, 200));
  
      const parsedData = Papa.parse(csvText, { header: true });
      
      // Check the actual column names from the parsed data
      console.log("Available columns:", Object.keys(parsedData.data[0] || {}));
      
      const locationRecords = parsedData.data.filter(record => 
        record && typeof record === 'object' && Object.keys(record).length > 0
      );
  
      const userFingerprintID = userData[0].fingerprintID.toString();
      console.log("Looking for fingerprint ID:", userFingerprintID);
      
      // Filter based on the correct column name from your Apps Script
      const filteredLocations = locationRecords.filter(loc => {
        // Use the correct column name as defined in your Apps Script
        return loc["Fingerprint ID"] === userFingerprintID;
      });
      
      console.log("Found matching locations:", filteredLocations.length);
  
      if (filteredLocations.length > 0) {
        // Sort by timestamp to get the most recent
        filteredLocations.sort((a, b) => 
          new Date(b.Timestamp) - new Date(a.Timestamp)
        );
        
        const latest = filteredLocations[0];
        console.log("Latest location record:", latest);
        
        setLocationData({
          timestamp: latest.Timestamp,
          latitude: latest["GPS Latitude"],
          longitude: latest["GPS Longitude"],
          fingerprintID: latest["Fingerprint ID"],
          address: latest["GPS Address"] && latest["GPS Address"] !== "N/A" 
                  ? latest["GPS Address"] 
                  : "Unavailable",
        });
      } else {
        setLocationData(null);
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      setLocationData(null);
    } finally {
      setIsLoadingLocation(false);
    }
  };
  


  

  // Get greeting and emoji
  const { greeting, emoji } = getGreetingAndEmoji();

  // Create page transition class based on state
  const pageTransitionClass = isPageTransitioning ? 'fade-out' : 'fade-in';

  return (
    <div style={darkMode ? styles.pageWrapperDark : styles.pageWrapperLight}>
      {/* Add fade transition class to the content */}
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
    
      {/* Header */}
      <div style={darkMode ? styles.headerDark : styles.headerLight}>
        <div style={styles.headerLeft}>
          <img src="/RideSafe Logo.png" alt="Ride Safe Logo" style={styles.logoImageSmall} />
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
        {user && (
          <div style={darkMode ? styles.greetingTextDark : styles.greetingTextLight}>
            {greeting}, {userData[0]?.username || "User"}! {emoji}
          </div>
        )}

        {/* Time + Day Header with Location Button */}
        <div style={styles.infoHeader}>
          <span style={styles.timeWithDay}>
            {dateTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }).replace(":", ":")}{" "}
            —{" "}
            {dateTime.toLocaleDateString("en-US", { weekday: "short" })}
          </span>
          <img
            src="/loc.png"
            alt="Last Location"
            style={styles.locationIcon}
            onClick={fetchLastLocation}
          />
        </div>

        {isLoading ? (
          <div style={styles.loaderContainer}>
            <div className="loader"></div>
            <p style={{ color: darkMode ? "#ccc" : "#333" }}>Loading your data...</p>
          </div>
        ) : user ? (
          userData.length > 0 ? (
            <div style={styles.sectionsContainer}>
              {/* User/Driver Information Card */}
              <div style={darkMode ? styles.cardTitleContainerDark : styles.cardTitleContainerLight}>
                <div style={styles.cardTitleRow}>
                  <h2 style={{ ...styles.cardTitle, color: darkMode ? 'white' : '#333' }}>Driver Information</h2>
                  {editMode !== 'driver' && (
                    <button 
                      style={styles.editButton} 
                      onClick={() => handleStartEdit('driver')}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.detailsContainer}>
                {editMode === 'driver' ? (
                  <div style={styles.editForm}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Username</label>
                      <input
                        style={styles.formInput}
                        name="username"
                        value={editData.username || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>First Name</label>
                      <input
                        style={styles.formInput}
                        name="firstName"
                        value={editData.firstName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Last Name</label>
                      <input
                        style={styles.formInput}
                        name="lastName"
                        value={editData.lastName || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div style={styles.buttonGroup}>
                      <button 
                        style={styles.cancelButton} 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                      <button 
                        style={styles.saveButton} 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Detail label="Username" value={userData[0]?.username} />
                    <Detail label="First Name" value={userData[0]?.firstName} />
                    <Detail label="Last Name" value={userData[0]?.lastName} />
                  </>
                )}
              </div>

              {/* Motor Details Card */}
              <div style={darkMode ? styles.cardTitleContainerDark : styles.cardTitleContainerLight}>
                <div style={styles.cardTitleRow}>
                  <h2 style={{ ...styles.cardTitle, color: darkMode ? 'white' : '#333' }}>Motor Details</h2>
                  {editMode !== 'motor' && (
                    <button 
                      style={styles.editButton} 
                      onClick={() => handleStartEdit('motor')}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.detailsContainer}>
                {editMode === 'motor' ? (
                  <div style={styles.editForm}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Motor Name</label>
                      <input
                        style={styles.formInput}
                        name="motorName"
                        value={editData.motorName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Plate Number</label>
                      <input
                        style={styles.formInput}
                        name="plateNumber"
                        value={editData.plateNumber || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div style={styles.buttonGroup}>
                      <button 
                        style={styles.cancelButton} 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                      <button 
                        style={styles.saveButton} 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Detail label="Motor Name" value={userData[0]?.motorName} />
                    <Detail label="Plate Number" value={userData[0]?.plateNumber} />
                  </>
                )}
              </div>

              {/* Emergency Contact Card */}
              <div style={darkMode ? styles.cardTitleContainerDark : styles.cardTitleContainerLight}>
                <div style={styles.cardTitleRow}>
                  <h2 style={{ ...styles.cardTitle, color: darkMode ? 'white' : '#333' }}>Emergency Contact</h2>
                  {editMode !== 'emergency' && (
                    <button 
                      style={styles.editButton} 
                      onClick={() => handleStartEdit('emergency')}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.detailsContainer}>
                {editMode === 'emergency' ? (
                  <div style={styles.editForm}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Relationship</label>
                      <input
                        style={styles.formInput}
                        name="relationship"
                        value={editData.relationship || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Emergency Contact Name</label>
                      <input
                        style={styles.formInput}
                        name="contactName"
                        value={editData.contactName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Emergency Contact Number</label>
                      <input
                        style={styles.formInput}
                        name="contactNumber"
                        value={editData.contactNumber || ''}
                        onChange={handleInputChange}
                        type="tel"
                      />
                    </div>
                    <div style={styles.buttonGroup}>
                      <button 
                        style={styles.cancelButton} 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                      <button 
                        style={styles.saveButton} 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Detail label="Relationship" value={userData[0]?.relationship} />
                    <Detail label="Emergency Contact" value={userData[0]?.contactName} />
                    <Detail label="Emergency Contact Number" value={userData[0]?.contactNumber} />
                  </>
                )}
              </div>
            </div>
          ) : (
            <p>No data found for this user.</p>
          )
        ) : (
          <p>Please log in to view your details.</p>
        )}
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

      {/* Location Modal */}
      {showLocationModal && (
        <div style={styles.modalOverlay}>
          <div style={darkMode ? {...styles.locationModal, ...styles.locationModalDark} : styles.locationModal}>
            <h2 style={darkMode ? styles.locationTitleDark : styles.locationTitleLight}>
              Last Known Location
            </h2>
            
            {isLoadingLocation ? (
              <div style={styles.loaderContainer}>
                <p style={{ color: darkMode ? "#ccc" : "#333" }}>Loading location data...</p>
              </div>
            ) : locationData ? (
              <div style={styles.locationContent}>
                <div style={styles.locationDetail}>
                  <span style={styles.locationLabel}>Address:</span>
                  <span style={styles.locationValue}>{locationData.address}</span>
                </div>
                
                <div style={styles.locationDetail}>
                  <span style={styles.locationLabel}>Coordinates:</span>
                  <span style={styles.locationValue}>
                    {locationData.latitude}, {locationData.longitude}
                  </span>
                </div>
                
                <div style={styles.locationDetail}>
                  <span style={styles.locationLabel}>Last Updated:</span>
                  <span style={styles.locationValue}>
                    {new Date(locationData.timestamp).toLocaleString()}
                  </span>
                </div>
                

                <div style={{ width: "100%", height: "180px", borderRadius: "8px", overflow: "hidden" }}>
  <iframe
    width="100%"
    height="180"
    frameBorder="0"
    style={{ border: 0 }}
    src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyATtKmutB7_tAJipi7O8mzsdcfTrfH4v34&center=${locationData.latitude},${locationData.longitude}&zoom=15`}
    allowFullScreen
  ></iframe>
</div>


              </div>
            ) : (
              <p style={{ color: darkMode ? "#ccc" : "#333" }}>
                No location data found for this user.
              </p>
            )}
            
            <button
              style={styles.closeLocationButton}
              onClick={() => setShowLocationModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {saveSuccess && (
        <div style={styles.saveSuccessToast}>
          Changes saved successfully!
        </div>
      )}
    </div>
  );
};

// Reusable Info Line
const Detail = ({ label, value }) => (
  <div style={styles.detailRow}>
    <span style={styles.detailLabel}>{label}:</span>{" "}
    <span style={styles.detailValue}>{value || "—"}</span>
  </div>
);

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

  logoutIcon: {
    width: "20px",
    height: "20px",
    cursor: "pointer",
    marginLeft: "auto",
  },
  greetingTextLight: {
    fontSize: "27px",
    fontWeight: "bold",
    color: "#687eff",
    margin: 0,
    marginLeft: "10px",
  },
  greetingTextDark: {
    fontSize: "27px",
    fontWeight: "bold",
    color: "#687eff",
    margin: 0,
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
  
  sectionsContainer: {
    paddingBottom: "80px",
  },
  
  locationIcon: {
    width: "30px",
    height: "30px",
    objectFit: "contain",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    marginRight: "95px", // <-- This pushes it to the left
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  
  
  // Location Modal Styles
  locationModal: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
    textAlign: "left",
  },
  
  locationModalDark: {
    backgroundColor: "#2b2b2b",
    color: "#eee",
  },
  
  locationTitleLight: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
  },
  
  locationTitleDark: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
    color: "#eee",
  },
  
  locationContent: {
    marginBottom: "20px",
  },
  
  locationDetail: {
    marginBottom: "12px",
  },
  
  locationLabel: {
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
    color: "#687eff",
  },
  
  locationValue: {
    display: "block",
    paddingLeft: "10px",
  },
  
  mapContainer: {
    marginTop: "25px",
    width: "100%",
  },
  
  mapPlaceholder: {
    width: "100%",
    height: "180px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#666",
    border: "1px solid #ddd",
  },
  
  mapPlaceholderText: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: 0,
    marginBottom: "10px",
  },
  
  mapCoordinates: {
    fontSize: "14px",
    margin: 0,
    fontFamily: "monospace",
  },
  
  closeLocationButton: {
    backgroundColor: "#687eff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    marginTop: "15px",
    transition: "background-color 0.2s ease",
  },
  
  cardLight: {
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "16px",
    padding: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  cardDark: {
    backgroundColor: "#1f1f1f",
    border: "1px solid #444",
    borderRadius: "16px",
    padding: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    textAlign: "left",
    color: "#ddd",
    marginBottom: "1rem",
  },
  
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
    letterSpacing: "1px",
  },

  cardTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  // Edit button styles
  editButton: {
    backgroundColor: "#687eff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  
  // Form styles for edit mode
  editForm: {
    width: "100%",
  },
  
  formGroup: {
    marginBottom: "8px", // was 15px
  },
  
  formLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#687eff",
  },
  
  formInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    backgroundColor: "transparent",
  },
  
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "15px",
  },
  
  saveButton: {
    backgroundColor: "#687eff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },

  // Detail Label Styles (for user details)
  detailLabel: {
    fontSize: "14px",
    fontWeight: "bold",
    letterSpacing: "1.5px",
  },
  detailValue: {
    fontSize: "14px",
  },
  
  detailRow: {
    marginBottom: "5px", // was 8px
  },
  
  // Redesigned taskbar styles to match Tao page
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
  
  infoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
    padding: "0 12px",
    marginLeft: "-11px",
    fontSize: "34px",
    fontWeight: "800",
    color: "#ccc",
    letterSpacing: "1.5px",
  },
  
  timeWithDay: {
    fontSize: "34px",
    fontWeight: "800",
    color: "#ccc",
    letterSpacing: "1px",
    paddingLeft: "10px",
  },
  
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
  modalText: {
    fontSize: "16px",
    marginBottom: "20px",
    fontWeight: "600",
    letterSpacing: "0.5px",
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
  
  // Update modal for dark mode
  modalDark: {
    backgroundColor: "#2b2b2b",
    color: "#ddd",
  },
  logoutButtonDark: {
    backgroundColor: "#687eff",
  },
  
  cardTitleContainerLight: {
    backgroundColor: "#fff",
    padding: "0.8rem",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    marginBottom: "0.3rem",
    border: "1px solid #687eff",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  
  cardTitleContainerDark: {
    backgroundColor: "#1f1f1f",
    padding: "0.8rem",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "0.3rem",
    border: "1px solid #687eff",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },

  // Details Container (outside the card)
  detailsContainer: {
    padding: "0.5rem",  // was 1rem
    textAlign: "left",
    marginBottom: "0.5rem", // was 1rem
    backgroundColor: "transparent",
    letterSpacing: "0.5px",
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
  
  // Success toast notification
  saveSuccessToast: {
    position: "fixed",
    bottom: "120px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    zIndex: 1600,
    fontWeight: "bold",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "70vh",
    textAlign: "center",
  },
};
  
export default UserDataDisplay;