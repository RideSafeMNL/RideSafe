import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "./firebase"; // Make sure to adjust the import according to your firebase setup
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"; // Import reauthentication methods

function MotorDetailsPage() {
  const [motorDetails, setMotorDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableMotorDetails, setEditableMotorDetails] = useState({
    motorName: '',
    plateNumber: ''
  });
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // State for password modal
  const [password, setPassword] = useState(''); // State for storing entered password
  const [error, setError] = useState(''); // Error state for password verification

  // Fetch motor details from Firestore
  useEffect(() => {
    const fetchMotorData = async () => {
      const user = auth.currentUser;
      if (!user) return; // If no user is logged in, exit early

      try {
        const motorSnap = await getDoc(doc(db, "Motors", user.uid)); // Fetch motor data from "Motors" collection

        if (motorSnap.exists()) {
          setMotorDetails(motorSnap.data()); // Set the data if it exists
          setEditableMotorDetails(motorSnap.data()); // Set editable data for the form
        } else {
          setMotorDetails(null); // Explicitly set as null if no data is found
        }
      } catch (error) {
        console.error("Error fetching motor data: ", error);
      }
    };

    fetchMotorData(); // Call the function to fetch motor data
  }, []);

  // Handle input change for editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableMotorDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsPasswordModalOpen(true); // Open password modal on Save
  };

  // Verify password before saving changes
  const handlePasswordSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return; // If no user is logged in, exit early

    const credential = EmailAuthProvider.credential(user.email, password);

    try {
      // Reauthenticate the user with the provided password
      await reauthenticateWithCredential(user, credential);

      // If reauthentication is successful, save the changes
      await updateDoc(doc(db, "Motors", user.uid), editableMotorDetails);
      setMotorDetails(editableMotorDetails); // Update state with new data
      setIsEditing(false); // Exit editing mode
      setIsPasswordModalOpen(false); // Close the password modal
      setPassword(''); // Clear the password field
    } catch (error) {
      console.error("Error verifying password: ", error);
      setError('Incorrect password. Please try again.'); // Handle the error message
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditableMotorDetails(motorDetails); // Reset the editable fields to original data
    setIsEditing(false); // Exit editing mode
  };

  return (
    <div style={styles.container}>
      <Link to="/profile">
        <button style={styles.backButton}>Back</button>
      </Link>
      <h3>Motor Details</h3>

      {/* Only render if data has been fetched */}
      {motorDetails !== null && (
        <div style={styles.detailsContainer}>
          {isEditing ? (
            <>
              <label>
                <strong>Motor Name:</strong>
                <input
                  type="text"
                  name="motorName"
                  value={editableMotorDetails.motorName}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
              <br />
              <label>
                <strong>Plate Number:</strong>
                <input
                  type="text"
                  name="plateNumber"
                  value={editableMotorDetails.plateNumber}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
            </>
          ) : (
            <>
              <div style={styles.detailItem}>
                <strong>Motor Name:</strong>
                <p>{motorDetails.motorName}</p>
              </div>
              <div style={styles.detailItem}>
                <strong>Plate Number:</strong>
                <p>{motorDetails.plateNumber}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Edit, Save, Cancel buttons */}
      {motorDetails !== null && !isEditing && (
        <button onClick={() => setIsEditing(true)} style={styles.editButton}>
          Edit
        </button>
      )}

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
            {/* Close button at top-right */}
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
    textAlign: "center",
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
  editButton: {
    marginTop: "20px",
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

export default MotorDetailsPage;
