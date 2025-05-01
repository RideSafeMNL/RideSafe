import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react"; // Removed useEffect if not used
import { auth, db } from "./firebase";
import { setDoc, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { Form, Button, ProgressBar, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const styles = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "white",
    overflow: "hidden",
    padding: "0 15px",
  },
  headerImage: {
    width: "100%",
    height: "auto",
    marginBottom: "-25px",
  },
  card: {
    padding: "1rem",
    width: "100%",
    maxWidth: "28rem",
    backgroundColor: "#fff",
    boxShadow: "none",
    marginTop: "10px",
  },
  formControl: {
    padding: "0.3rem",
    fontSize: "13px",
    marginBottom: "5px",
    transition: "border-color 0.3s",
  },
  formControlError: {
    border: "1px solid red",
    animation: "shake 0.3s ease-in-out",
  },
  formControlSuccess: {
    border: "1px solid green",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    border: "2px solid #007bff",
    borderRadius: "5px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
    width: "45%",
    marginBottom: "5px",
    outline: "none",
  },
  progressBar: {
    marginBottom: "10px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  iconButton: {
    fontSize: "18px",
    padding: "8px",
    cursor: "pointer",
    color: "black",
    border: "none",
    backgroundColor: "transparent",
  },
  confirmButtonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },
  confirmButton: {
    backgroundColor: "white",
    color: "black",
    border: "2px solid #007bff",
    borderRadius: "5px",
    padding: "10px 25px",
    fontSize: "15px",
    cursor: "pointer",
    width: "80%",
    outline: "none",
  },
  fingerprintScanContainer: {
    textAlign: "center",
    padding: "20px",
  },
  agreeButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "15px",
  },
  modalContainer: {
    maxWidth: "385px", // For larger screens, the modal will be at this width
    width: "100%", // For smaller screens, it will use the full width
    margin: "0 auto", // Horizontally center the modal
    padding: "15px", // Add padding for a more polished look
    display: "flex",
    justifyContent: "center", // Center content horizontally
    alignItems: "center", // Center content vertically
  },
  errorText: {
    color: "red",
    fontSize: "12px",
    marginBottom: "5px",
  },

  termsModal: {
    display: "flex",
    justifyContent: "center", // Center content horizontally
    alignItems: "center",     // Center content vertically
  },
  
  termsModalDialog: {
    margin: "auto",
    maxWidth: "400px",
    width: "90%",
  },
  
  
  
};

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [motorName, setMotorName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [relationship, setRelationship] = useState("");
  const [fingerprintID, setFingerprintID] = useState(null);
  const [fingerprintAssigned, setFingerprintAssigned] = useState(false);
  const [contactNumberError, setContactNumberError] = useState(null);

  const [showTerms, setShowTerms] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  
  const [emailError, setEmailError] = useState(false); // New state for email error
  const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility state

  

  // 🔎 Check if email exists
  const checkEmailExists = async (enteredEmail) => {
    const usersSnapshot = await getDocs(collection(db, "Users"));
    const emails = usersSnapshot.docs.map((doc) => doc.data().email.toLowerCase());
    return emails.includes(enteredEmail.toLowerCase());
  };

  // 🔎 Check if username exists
  const checkUsernameExists = async (enteredUsername) => {
    const usersSnapshot = await getDocs(collection(db, "Users"));
    const usernames = usersSnapshot.docs.map((doc) => doc.data().username?.toLowerCase());
    return usernames.includes(enteredUsername.toLowerCase());
  };

  const handleUsernameBlur = async () => {
    if (!username) return;
  
    const exists = await checkUsernameExists(username);
    setUsernameError(exists);  // Sets the error state
  
    // If username exists, no toast here, just set the error state
  };
  

  const handleEmailChange = async (e) => {
    const enteredEmail = e.target.value;
    setEmail(enteredEmail);
  
    // Regular Expression to validate email format
    const emailFormatRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidEmailFormat = emailFormatRegex.test(enteredEmail);
  
    if (!isValidEmailFormat) {
      setEmailError("invalid"); // Error type for invalid email format
      return;
    }
  
    // If format is valid, check if email exists
    const exists = await checkEmailExists(enteredEmail);
    if (exists) {
      setEmailError("exists"); // Error type for email already in use
    } else {
      setEmailError(null); // No error if email is valid and not in use
    }
  };
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordMatch(e.target.value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        setUsernameError(true);
        toast.error("Username is already taken");
        return;
      }

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        toast.error("Email is already in use.");
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    step === 1 ? navigate("/login") : setStep(step - 1);
  };

  const handlePlateNumberChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 3) value = value.slice(0, 3) + "-" + value.slice(3);
    if (value.length > 7) value = value.slice(0, 7);
    setPlateNumber(value);
  };

  const handleContactNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove all non-digits
  
    // Check if the number starts with "63" and is exactly 12 digits long
    if (value.length > 12) {
      value = value.slice(0, 12); // Limit to 12 digits
    }
  
    // Update the contact number state
    setContactNumber(value);
  
    // Check if the number starts with "63" and is exactly 12 digits long
    if (value.length === 12 && value.startsWith("63")) {
      setContactNumberError(null); // No error if valid
    } else {
      setContactNumberError("invalid"); // Set error if not valid
    }
  };
  

  const handleFingerprintScan = async () => {
    try {
      toast.info("Requesting fingerprint enrollment...");
      
      // 1. Send scan command to Firestore (ESP32 will be polling this)
      await setDoc(doc(db, "Commands", "fingerprintRequest"), {
        action: "scan",
        timestamp: Date.now(),
      });
      
      toast.info("Waiting for fingerprint sensor to be ready...");
      
      // 2. Wait for ESP32 to respond (poll for result every 2s)
      const maxAttempts = 25; // ~50s timeout (increased for complete enrollment process)
      let attempt = 0;
      let enrolling = false;
      let success = false;
      let result = null;
      
      while (attempt < maxAttempts) {
        await new Promise((res) => setTimeout(res, 2000)); // wait 2s
        
        const resultSnap = await getDoc(doc(db, "Results", "lastScan"));
        if (resultSnap.exists()) {
          const data = resultSnap.data();
          
          if (!enrolling && data.message === "ENROLL") {
            // First fingerprint scan started
            enrolling = true;
            toast.info("Place your finger on the sensor...");
          } 
          else if (data.message === "ENROLL SUCCESS" || 
                  (data.status === "success" && data.message && data.message.includes("successfully"))) {
            success = true;
            result = data;
            break;
          } 
          else if (data.status === "error" || data.message === "ENROLL ERROR") {
            const errorMessage = data.message || "Fingerprint scan failed";
            const errorDetails = data.errorCode ? ` (Error code: ${data.errorCode})` : '';
            toast.error(errorMessage + errorDetails);
            return;
          }
        }
        
        attempt++;
      }
      
      if (success) {
        toast.success("Fingerprint enrolled successfully!");
        setFingerprintAssigned(true);
        setFingerprintID(result.fingerprintID || "Unknown ID");
        if (result.message === "ENROLL SUCCESS") {
          setStep(5);
        }
        
        // Clear the scan command
        await setDoc(doc(db, "Commands", "fingerprintRequest"), {
          action: "idle",
        });
      } else {
        toast.error("Timeout waiting for ESP32. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to trigger fingerprint scan.");
    }
  };
  

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (contactNumber.length !== 12) {
      toast.error("Contact number must be exactly 12 digits (including the country code).");
      return;
    }
  
    if (!fingerprintID) {
      toast.error("Please complete fingerprint scanning.");
      return;
    }
  
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const fingerprintDocID = String(fingerprintID);
  
      // This is the key change - create the document with the fields structure
      await setDoc(doc(db, "Users", fingerprintDocID), {
        fingerprintID: fingerprintDocID,
        email,
        username: username.toLowerCase(),
        firstName: fname,
        lastName: lname,
        motorName,
        plateNumber,
        contactName,
        contactNumber,
        relationship,
        uid: user.uid
      });
      
  
      // Also create a plaintext version in a different collection for your app
      await setDoc(doc(db, "UserProfiles", user.uid), {
        fingerprintID: fingerprintDocID,
        email,
        username: username.toLowerCase(),
        firstName: fname,
        lastName: lname,
        motorName,
        plateNumber,
        contactName,
        contactNumber,
        relationship,
      });
  
      toast.success("Registration Successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message);
    }
  };

  const handleTermsClose = () => {
    agreedToTerms
      ? setShowTerms(false)
      : toast.error("You must agree to the terms and conditions.");
  };

  const getHeaderImage = () => {
    switch (step) {
      case 1:
        return "/user_header.png";
      case 2:
        return "/motor_header.png";
      case 3:
        return "/emer_header.png";
      case 4:
        return "/fingerprint_header.png";
      case 5:
        return "/confirm_header.png";
      default:
        return "";
    }
  };

  const isStep1Valid = () =>
    fname && lname && username && email && password && confirmPassword && password === confirmPassword;

  const isStep2Valid = () => motorName && plateNumber;
  const isStep3Valid = () => 
    contactName && 
    contactNumber && 
    relationship && 
    contactNumber.length === 12 &&  // Ensure it's 12 digits (start with "63")
    contactNumberError !== "invalid"; // Check if contact number is valid

    const isStep4Valid = () => fingerprintID !== null;

  return (
    <div style={styles.appContainer}>
      <div className="text-center mb-2">
        <img src={getHeaderImage()} alt="Signup Header" style={styles.headerImage} />
      </div>

      <div style={styles.card}>
        <ProgressBar now={(step / 6) * 100} className="mb-3" style={styles.progressBar} />

        {/* Terms Modal */}
        <Modal 
  show={showTerms} 
  onHide={() => { setShowTerms(false); navigate("/login"); }} 
  centered 
  dialogClassName="custom-terms-modal"
>


  <Modal.Header closeButton>
    <Modal.Title>Terms and Conditions</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>By registering, you agree to all terms and conditions of the service.</p>
    <Form.Check
      type="checkbox"
      label="I agree to the terms and conditions."
      onChange={(e) => setAgreedToTerms(e.target.checked)}
      checked={agreedToTerms}
    />
    <div style={styles.agreeButtonContainer}>
      <Button
        variant={agreedToTerms ? "primary" : "secondary"}
        disabled={!agreedToTerms}
        onClick={handleTermsClose}
      >
        Continue
      </Button>
    </div>
  </Modal.Body>
</Modal>


        {/* Step 1 */}
        {step === 1 && !showTerms && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" onChange={(e) => setFname(e.target.value)} required style={styles.formControl} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" onChange={(e) => setLname(e.target.value)} required style={styles.formControl} />
            </Form.Group>
            <Form.Group className="mb-1">
  <Form.Label>Username</Form.Label>
  <Form.Control
    type="text"
    onChange={(e) => {
      setUsername(e.target.value);
      setUsernameError(false); // Reset error when typing
    }}
    onBlur={handleUsernameBlur}
    required
    style={{
      ...styles.formControl,
      ...(usernameError ? styles.formControlError : {}), // Add error styling
    }}
  />
  {usernameError && (
    <div style={styles.errorText}>Username is already taken</div> // Show error message below the input
  )}
</Form.Group>
<Form.Group className="mb-3">
  <Form.Label>Email</Form.Label>
  <Form.Control
    type="email"
    value={email}
    onChange={handleEmailChange}
    required
    style={{
      ...styles.formControl,
      ...(emailError === "invalid" || emailError === "exists" ? styles.formControlError : {}),
    }}
  />
  {emailError === "invalid" && (
    <div style={styles.errorText}>Please enter a valid email address.</div>
  )}
  {emailError === "exists" && (
    <div style={styles.errorText}>Email is already in use.</div>
  )}
</Form.Group>

            <Form.Group className="mb-3">
  <Form.Label>Password</Form.Label>
  <div style={{ position: "relative" }}>
    <Form.Control
      type={passwordVisible ? "text" : "password"} // Password visibility toggle
      onChange={handlePasswordChange}
      required
      style={{
        ...styles.formControl,
        ...(password && !passwordMatch ? { border: "1px solid red" } : {}),
        ...(password && passwordMatch ? { border: "1px solid green" } : {}),
      }}
    />
    <button
      type="button"
      onClick={() => setPasswordVisible(!passwordVisible)}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
      }}
    >
      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Confirm Password</Form.Label>
  <div style={{ position: "relative" }}>
    <Form.Control
      type={passwordVisible ? "text" : "password"} // Password visibility toggle
      onChange={handleConfirmPasswordChange}
      required
      style={{
        ...styles.formControl,
        ...(confirmPassword && !passwordMatch ? { border: "1px solid red" } : {}),
        ...(confirmPassword && passwordMatch ? { border: "1px solid green" } : {}),
      }}
    />
    <button
      type="button"
      onClick={() => setPasswordVisible(!passwordVisible)}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
      }}
    >
      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>
</Form.Group>

          </>
        )}


        {/* Step 2 */}
        {step === 2 && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Motorcycle Name</Form.Label>
              <Form.Control type="text" onChange={(e) => setMotorName(e.target.value)} required style={styles.formControl} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Plate Number</Form.Label>
              <Form.Control
                type="text"
                onChange={handlePlateNumberChange}
                value={plateNumber}
                required
                style={styles.formControl}
              />
            </Form.Group>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
  <>
    <Form.Group className="mb-3">
      <Form.Label>Emergency Contact Name</Form.Label>
      <Form.Control
        type="text"
        onChange={(e) => setContactName(e.target.value)}
        required
        style={styles.formControl}
      />
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Emergency Contact Number</Form.Label>
      <Form.Control
        type="text"
        onChange={handleContactNumberChange}
        value={contactNumber}
        required
        style={{
          ...styles.formControl,
          ...(contactNumberError === "invalid" ? styles.formControlError : {}), // Apply error style if there's an error
        }}
      />
      {contactNumberError === "invalid" && (
        <div style={styles.errorText}>
          Invalid format. Contact number should start with "63" and be 12 digits long.
        </div>
      )}

    </Form.Group>

    {/* Add the Relationship input field back */}
    <Form.Group className="mb-3">
      <Form.Label>Relationship to Contact</Form.Label>
      <Form.Control
        type="text"
        onChange={(e) => setRelationship(e.target.value)}
        required
        style={styles.formControl}
      />
    </Form.Group>

          </>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div style={styles.fingerprintScanContainer}>
            <Button variant="primary" onClick={handleFingerprintScan}>
              Scan Fingerprint
            </Button>
          </div>
        )}

{/* Step 5 - Confirmation Summary */}
{step === 5 && (
  <>
    <div style={styles.card}>
      {/* Personal Information */}
      <div style={{ ...styles.detailsSection, marginBottom: '3px' }}>
        <h5 style={{ ...styles.sectionTitle, fontSize: '16px', marginBottom: '2px', color: '#007bff' }}>Personal Information</h5>
        <p style={{ fontSize: '14px' }}><strong>First Name:</strong> {fname}</p>
        <p style={{ fontSize: '14px' }}><strong>Last Name:</strong> {lname}</p>
        <p style={{ fontSize: '14px' }}><strong>Username:</strong> {username}</p>
        <p style={{ fontSize: '14px' }}><strong>Email:</strong> {email}</p>
      </div>

      {/* Motorcycle Details */}
      <div style={{ ...styles.detailsSection, marginBottom: '3px' }}>
        <h5 style={{ ...styles.sectionTitle, fontSize: '16px', marginBottom: '2px', color: '#007bff' }}>Motorcycle Details</h5>
        <p style={{ fontSize: '14px' }}><strong>Motorcycle Name:</strong> {motorName}</p>
        <p style={{ fontSize: '14px' }}><strong>Plate Number:</strong> {plateNumber}</p>
      </div>

      {/* Emergency Contact */}
      <div style={{ ...styles.detailsSection, marginBottom: '3px' }}>
        <h5 style={{ ...styles.sectionTitle, fontSize: '16px', marginBottom: '2px', color: '#007bff' }}>Emergency Contact</h5>
        <p style={{ fontSize: '14px' }}><strong>Contact Name:</strong> {contactName}</p>
        <p style={{ fontSize: '14px' }}><strong>Contact Number:</strong> {contactNumber}</p>
        <p style={{ fontSize: '14px' }}><strong>Relationship:</strong> {relationship}</p>
      </div>

      {/* Confirmation Button */}
      <div style={styles.confirmButtonContainer}>
        <Button variant="primary" onClick={handleRegister}>
          Confirm
        </Button>
      </div>
    </div>
  </>
)}





<div style={styles.buttonContainer}>
  {/* Conditionally render the Back and Next buttons */}
  {step !== 4 && step !== 5 && (
    <>
      <Button style={styles.button} onClick={handleBack}>
        Back
      </Button>
      <Button
        style={styles.button}
        onClick={handleNext}
        disabled={
          (step === 1 && !isStep1Valid()) ||
          (step === 2 && !isStep2Valid()) ||
          (step === 3 && !isStep3Valid()) ||  // This will now properly validate Step 3
          (step === 4 && !isStep4Valid()) ||
          (step === 5 && !fingerprintAssigned)
        }
      >
        Next
      </Button>
    </>
  )}
</div>

      </div>
    </div>
  );
}

export default Register;
