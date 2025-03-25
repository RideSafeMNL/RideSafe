import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Form, Button, ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

// Define inline styles for a more compressed vertical layout
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
};

// Register component
function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [motorName, setMotorName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [relationship, setRelationship] = useState("");
  const [fingerprintID, setFingerprintID] = useState(null); // New state for fingerprint ID

  const handleNext = () => {
    if (step === 1 && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/login");
    } else {
      setStep(step - 1);
    }
  };

  const handlePlateNumberChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 3) {
      value = value.slice(0, 3) + "-" + value.slice(3);
    }
    if (value.length > 7) {
      value = value.slice(0, 7);
    }
    setPlateNumber(value);
  };

  const handleContactNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    setContactNumber(value);
  };

  const [fingerprintAssigned, setFingerprintAssigned] = useState(false);

  const handleFingerprintScan = async () => {
    try {
        toast.info("Requesting fingerprint enrollment...");

        const response = await fetch("http://192.168.137.112/start", { method: "POST" });
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            throw new Error("Failed to trigger fingerprint scan.");
        }

        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (data.success) {
            toast.success("Fingerprint enrolled successfully!");
            setFingerprintAssigned(true);
            setFingerprintID(data.fingerprintID || "Unknown ID"); 
            setStep((prevStep) => prevStep + 1);
        } else {
            toast.error(data.message || "Fingerprint scan failed. Try again.");
        }
    } catch (error) {
        console.error(error);
        toast.error("Error communicating with ESP32.");
    }
};

const handleRegister = async (e) => {
  e.preventDefault();

  if (contactNumber.length !== 11) {
    toast.error("Contact number must be exactly 11 digits");
    return;
  }

  if (!fingerprintID) {
    toast.error("Please complete fingerprint scanning before registering.");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    
    // Convert fingerprintID to string for Firestore document ID
    const fingerprintDocID = String(fingerprintID);

    // Store user data with fingerprintID as the document ID
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
      password, // Storing passwords in Firestore is NOT recommended for production.
      uid: user.uid, // Still storing uid in the document for reference
    });

    toast.success("Registration Successful!");
    navigate("/login");
  } catch (error) {
    toast.error(error.message);
  }
};


  const getHeaderImage = () => {
    if (step === 1) {
      return "/user_header.png";
    } else if (step === 2) {
      return "/motor_header.png";
    } else if (step === 3) {
      return "/emer_header.png";
    } else if (step === 4) {
      return "/fingerprint_header.png"; // Fingerprint step header image
    } else if (step === 5) {
      return "/confirm_header.png";
    }
    return "";
  };

  const isStep1Valid = () => {
    return fname && lname && username && email && password && confirmPassword && password === confirmPassword;
  };

  const isStep2Valid = () => {
    return motorName && plateNumber;
  };

  const isStep3Valid = () => {
    return contactName && contactNumber && relationship && contactNumber.length === 11;
  };

  const isStep4Valid = () => {
    return fingerprintID !== null;
  };

  return (
    <div style={styles.appContainer}>
      <div className="text-center mb-2">
        <img
          src={getHeaderImage()}
          alt="Signup Header"
          style={styles.headerImage}
        />
      </div>

      <div style={styles.card}>
        <ProgressBar now={(step / 6) * 100} className="mb-3" style={styles.progressBar} />

        {/* Step 1: User Info */}
        {step === 1 && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setFname(e.target.value)}
                required
                style={styles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setLname(e.target.value)}
                required
                style={styles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={styles.formControl}
              />
            </Form.Group>
            <div style={styles.buttonContainer}>
              <Button onClick={handleBack} style={styles.iconButton}>
                &#8592;
              </Button>
              <Button
                onClick={handleNext}
                style={styles.iconButton}
                disabled={!isStep1Valid()}
              >
                &#8594;
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Motor Info */}
        {step === 2 && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Motor Name</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setMotorName(e.target.value)}
                required
                style={styles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Plate Number</Form.Label>
              <Form.Control
                type="text"
                value={plateNumber}
                onChange={handlePlateNumberChange}
                maxLength="7"
                required
                style={styles.formControl}
              />
            </Form.Group>
            <div style={styles.buttonContainer}>
              <Button onClick={handleBack} style={styles.iconButton}>
                &#8592;
              </Button>
              <Button
                onClick={handleNext}
                style={styles.iconButton}
                disabled={!isStep2Valid()}
              >
                &#8594;
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Emergency Contact Info */}
        {step === 3 && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Contact Name</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setContactName(e.target.value)}
                required
                style={styles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                value={contactNumber}
                onChange={handleContactNumberChange}
                maxLength="11"
                required
                style={styles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Relationship</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setRelationship(e.target.value)}
                required
                style={styles.formControl}
              />
            </Form.Group>
            <div style={styles.buttonContainer}>
              <Button onClick={handleBack} style={styles.iconButton}>
                &#8592;
              </Button>
              <Button
                onClick={handleNext}
                style={styles.iconButton}
                disabled={!isStep3Valid()}
              >
                &#8594;
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Fingerprint Registration */}
        {step === 4 && (
          <div style={styles.fingerprintScanContainer}>
             <p>Please scan your fingerprint to register.</p>
             <Button
                style={styles.confirmButton}
                onClick={handleFingerprintScan}
                disabled={fingerprintAssigned}
              >
                {fingerprintAssigned ? "Fingerprint Scanned" : "Scan Fingerprint"}
              </Button>
            </div>
)}


        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div style={styles.confirmButtonContainer}>
            <Button
              onClick={handleRegister}
              style={styles.confirmButton}
              disabled={!isStep4Valid()}
            >
              Confirm and Register
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function storeModel() {
  try {
      // Your model storing logic
      console.log("Model stored successfully.");
      
      // Automatically proceed to the next step when successful
      goToNextStep();

      return 0; // Success
  } catch (error) {
      console.error("Error storing the model:", error);
      return -1; // Failure
  }
}

function goToNextStep() {
  console.log("Proceeding to the next step...");
  document.getElementById("step2").style.display = "block"; // Example transition
  document.getElementById("step1").style.display = "none";
}


export default Register