import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "./firebase"; // Make sure to adjust the import according to your firebase setup
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"; // Import the reauthentication methods

function UserDetailsPage() {
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUserDetails, setEditableUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // State for the password modal
  const [password, setPassword] = useState(''); // State for storing the entered password
  const [error, setError] = useState(''); // State for handling errors during password verification

  // Fetch user details from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return; // If no user is logged in, exit early

      try {
        const userSnap = await getDoc(doc(db, "Users", user.uid)); // Fetch user data from "Users" collection

        if (userSnap.exists()) {
          setUserDetails(userSnap.data()); // Set the data if it exists
          setEditableUserDetails(userSnap.data()); // Set editable data for the form
        } else {
          setUserDetails(null); // Explicitly set as null if no data is found
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData(); // Call the function to fetch user data
  }, []);

  // Handle input change for editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUserDetails(prevState => ({
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
      await updateDoc(doc(db, "Users", user.uid), editableUserDetails);
      setUserDetails(editableUserDetails); // Update state with new data
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
    setEditableUserDetails(userDetails); // Reset the editable fields to original data
    setIsEditing(false); // Exit editing mode
  };

  return (
    <div style={styles.container}>
      <Link to="/profile">
        <button style={styles.backButton}>Back</button>
      </Link>
      <h3>User Details</h3>

      {/* Only render if data has been fetched */}
      {userDetails !== null && (
        <div style={styles.detailsContainer}>
          {isEditing ? (
            <>
              <label>
                <strong>First Name:</strong>
                <input
                  type="text"
                  name="firstName"
                  value={editableUserDetails.firstName}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
              <br />
              <label>
                <strong>Last Name:</strong>
                <input
                  type="text"
                  name="lastName"
                  value={editableUserDetails.lastName}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
              <br />
              <label>
                <strong>Email:</strong>
                <input
                  type="email"
                  name="email"
                  value={editableUserDetails.email}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
            </>
          ) : (
            <>
              <div style={styles.detailItem}>
                <strong>First Name:</strong>
                <p>{userDetails.firstName}</p>
              </div>
              <div style={styles.detailItem}>
                <strong>Last Name:</strong>
                <p>{userDetails.lastName}</p>
              </div>
              <div style={styles.detailItem}>
                <strong>Email:</strong>
                <p>{userDetails.email}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Edit, Save, Cancel buttons */}
      {userDetails !== null && !isEditing && (
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
    textAlign: "center", // Center everything inside the container
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
    wordWrap: "break-word", // Ensure text breaks and wraps inside the container
  },
  detailItem: {
    marginBottom: "10px", // Adds space between label-value pairs
    textAlign: "left", // Align the labels and values to the left
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
    padding: "15px 40px", // Increased padding for a wider button
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px", // Slightly larger font for better visibility
    width: "60%", // Make the button take up 60% of the container width
    maxWidth: "300px", // Max width to prevent it from getting too large on bigger screens
    display: "inline-block", // Ensure it behaves like a block element while staying centered
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "10px", // Make space between buttons
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px", // Make space between buttons
  },
  buttonContainer: {
    marginTop: "20px", // Move the buttons a little bit down
    textAlign: "center", // Center the buttons horizontally
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
    position: "relative", // To position the close button
  },
  closeButton: {
    position: "absolute",
    top: "10px", // Position top-right
    right: "10px", // Position top-right
    fontSize: "20px",
    background: "none",
    border: "none",
    color: "black",
    cursor: "pointer",
  },
  errorText: {
    color: "red",
    fontSize: "14px",
  }
};

export default UserDetailsPage;
