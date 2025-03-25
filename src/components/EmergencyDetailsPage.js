import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "./firebase";  // Make sure to adjust the import according to your firebase setup
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"; // Import reauthentication methods

function EmergencyDetailsPage() {
  const [emergencyDetails, setEmergencyDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableEmergencyDetails, setEditableEmergencyDetails] = useState({
    contactName: '',
    contactNumber: '',
    relationship: ''
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Password modal state
  const [password, setPassword] = useState(''); // State to store the entered password
  const [error, setError] = useState(''); // State for error handling during password verification

  // Fetch emergency contact details from Firestore
  useEffect(() => {
    const fetchEmergencyData = async () => {
      const user = auth.currentUser;
      if (!user) return; // If no user is logged in, exit early

      try {
        const emergencySnap = await getDoc(doc(db, "EmergencyContacts", user.uid)); // Fetch emergency contact data

        if (emergencySnap.exists()) {
          setEmergencyDetails(emergencySnap.data());  // Set the data if it exists
          setEditableEmergencyDetails(emergencySnap.data());  // Set editable data for the form
        } else {
          setEmergencyDetails(null);  // Explicitly set as null if no data is found
        }
      } catch (error) {
        console.error("Error fetching emergency contact data: ", error);
      }
    };

    fetchEmergencyData();  // Fetch the emergency contact data
  }, []);

  // Handle input changes for editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableEmergencyDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = () => {
    setIsPasswordModalOpen(true); // Open password modal when saving
  };

  // Verify password before saving changes
  const handlePasswordSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return; // If no user is logged in, exit early

    const credential = EmailAuthProvider.credential(user.email, password);

    try {
      // Reauthenticate with the provided password
      await reauthenticateWithCredential(user, credential);

      // If reauthentication is successful, save the changes
      await updateDoc(doc(db, "EmergencyContacts", user.uid), editableEmergencyDetails);
      setEmergencyDetails(editableEmergencyDetails); // Update state with new data
      setIsEditing(false); // Exit editing mode
      setIsPasswordModalOpen(false); // Close password modal
      setPassword(''); // Clear password field
    } catch (error) {
      console.error("Error verifying password: ", error);
      setError('Incorrect password. Please try again.'); // Show error message
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditableEmergencyDetails(emergencyDetails); // Reset to original data
    setIsEditing(false); // Exit editing mode
  };

  return (
    <div style={styles.container}>
      <Link to="/profile">
        <button style={styles.backButton}>Back</button>
      </Link>
      <h3>Emergency Contact Registration</h3>

      {/* Render emergency contact details or editable fields */}
      {emergencyDetails !== null && (
        <div style={styles.detailsContainer}>
          {isEditing ? (
            <>
              <label>
                <strong>Contact Name:</strong>
                <input
                  type="text"
                  name="contactName"
                  value={editableEmergencyDetails.contactName}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
              <br />
              <label>
                <strong>Contact Number:</strong>
                <input
                  type="text"
                  name="contactNumber"
                  value={editableEmergencyDetails.contactNumber}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
              <br />
              <label>
                <strong>Relationship:</strong>
                <input
                  type="text"
                  name="relationship"
                  value={editableEmergencyDetails.relationship}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
            </>
          ) : (
            <>
              <div style={styles.detailItem}>
                <strong>Contact Name:</strong>
                <p>{emergencyDetails.contactName}</p>
              </div>
              <div style={styles.detailItem}>
                <strong>Contact Number:</strong>
                <p>{emergencyDetails.contactNumber}</p>
              </div>
              <div style={styles.detailItem}>
                <strong>Relationship:</strong>
                <p>{emergencyDetails.relationship}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Centered Edit Button */}
      {emergencyDetails !== null && !isEditing && (
        <div style={styles.editButtonContainer}>
          <button onClick={() => setIsEditing(true)} style={styles.editButton}>
            Edit
          </button>
        </div>
      )}

      {/* Save and Cancel buttons */}
      {isEditing && (
        <div style={styles.buttonContainer}>
          <button onClick={handleCancelEdit} style={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSaveChanges} style={styles.saveButton}>
            Save
          </button>
        </div>
      )}

      {/* Password modal */}
      {isPasswordModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            {/* Close button */}
            <button
              style={styles.closeButton}
              onClick={() => setIsPasswordModalOpen(false)}
            >
              ×
            </button>
            <h4>Confirm Password</h4>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
            />
            {error && <p style={styles.errorText}>{error}</p>}
            <div style={styles.buttonContainer}>
              <button onClick={handlePasswordSubmit} style={styles.saveButton}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
  },
  backButton: {
    position: "absolute",
    top: "10px",
    left: "10px",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  detailsContainer: {
    marginTop: "20px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
  },
  detailItem: {
    marginBottom: "10px",
    textAlign: "left",
  },
  input: {
    padding: "5px",
    marginTop: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "100%",
  },
  editButtonContainer: {
    textAlign: "center", // Ensures the Edit button is centered
    marginTop: "20px",  // Adds some space before the Edit button
  },
  editButton: {
    padding: "15px 40px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    width: "60%",
    maxWidth: "300px",
    display: "inline-block",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  buttonContainer: {
    marginTop: "20px",
    textAlign: "center",
  },
  modal: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "5px",
    width: "300px",
    textAlign: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    fontSize: "20px",
    background: "none",
    border: "none",
    color: "black",
    cursor: "pointer",
  },
  errorText: {
    color: "red",
    fontSize: "14px",
  },
};

export default EmergencyDetailsPage;
