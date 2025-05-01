import React, { useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";  // Import useNavigate

function Login() {
  const [identifier, setIdentifier] = useState(""); // Email or username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [emailError, setEmailError] = useState(""); // Track error message
  const [emailValid, setEmailValid] = useState(true); // Flag to track valid email
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();  // Hook to navigate between pages

  // ✅ Check if email is registered in Firestore
  const checkIfEmailExists = async (email) => {
    try {
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty; // If no matching documents, return false
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  // ✅ Handle login with email and password
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form default submit behavior
    setLoading(true);
    try {
      const userEmail = identifier; // Use email for login
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
      toast.success("Login successful!", { position: "top-center" });
  
      // After successful login, navigate based on email
      const user = userCredential.user;
      console.log(user.email); // Debugging the user's email
  
      if (user.email === "d4rwe@gmail.com") {
        console.log("Navigating to admin dashboard...");
        navigate("/admin-dashboard");  // Redirect to Admin.js
      } else {
        navigate("/profile");  // Redirect to Profile.js
      }
  
    } catch (error) {
      toast.error("Login failed: " + error.message, { position: "top-center" });
    } finally {
      setLoading(false); // Reset loading state
    }
  };
  

  // ✅ Send reset email after validation
  const handleSendResetEmail = async () => {
    if (!resetEmail.includes("@")) {
      toast.error("Please enter a valid email", { position: "bottom-center" });
      return;
    }

    // Validate if the email exists in Firestore
    const isEmailRegistered = await checkIfEmailExists(resetEmail);
    
    if (!isEmailRegistered) {
      setEmailError("Email not registered");
      setEmailValid(false);
      return;
    }

    setEmailError(""); // Clear previous error message if valid

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Reset link sent! Check your inbox.", { position: "top-center" });
      setShowResetModal(false);
      setResetEmail("");
    } catch (error) {
      console.error(error.message);
      toast.error("Error sending reset email", { position: "bottom-center" });
    }
  };

  return (
    <>
      <form className="text-center" onSubmit={handleLogin}>
        {/* Top Image */}
        <div>
          <img
            src="/login_header.png"
            alt="Login Header"
            className="img-fluid mb-3"
            style={{ maxWidth: "100%" }}
          />
        </div>

        {/* Email/Username Input */}
        <div className="mb-3">
          <label htmlFor="identifier" style={{ textAlign: "left", display: "block" }}>
            Email or Username
          </label>
          <input
            type="text"
            className="form-control"
            id="identifier"
            placeholder="Enter email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="mb-3">
          <label htmlFor="password" style={{ textAlign: "left", display: "block" }}>
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"} // Toggle between text and password
            className="form-control"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Show Password Checkbox */}
        <div className="form-check mb-3" style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            className="form-check-input"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            style={{ marginTop: 0, width: "13px", height: "13px" }} // Reduced size of the checkbox
          />
          <label
            className="form-check-label"
            htmlFor="showPassword"
            style={{
              fontSize: "12px",  // Smaller font size
              marginLeft: "5px",
              display: "inline-block",
              marginTop: "1px", // Move up slightly to align better with checkbox
              fontWeight: "normal", // Normal weight instead of bold
            }}
          >
            Show Password
          </label>
        </div>

        {/* Login Button */}
        <div className="d-grid mt-3 mb-3">
          <button
            type="submit"
            className="btn"
            style={{ backgroundColor: "#687eff", color: "#fff" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="text-center mt-1">
          <button
            type="button"
            className="btn btn-link"
            onClick={() => setShowResetModal(true)}
            style={{
              padding: 0,
              fontSize: "13px",
              background: "none",
              color: "black",
              fontWeight: "normal",
              textDecoration: "none",
            }}
          >
            Forgot <span style={{ textDecoration: "underline", color: "#007bff", fontWeight: "normal" }}>Password</span>?
          </button>
        </div>

        {/* Don't have an account? Sign up link */}
        <div className="text-center mt-0">
          <span style={{ fontSize: "13px", fontWeight: "normal", color: "black" }}>
            Don't have an account?{" "}
            <button
              type="button"
              className="btn btn-link"
              onClick={() => window.location.href = "/register"}
              style={{
                textDecoration: "underline",
                fontWeight: "normal",
                color: "#007bff",
                padding: 0,
                fontSize: "13px",
                background: "none",
              }}
            >
              Sign up
            </button>
          </span>
        </div>
      </form>

      {/* Modal for Forgot Password */}
      {showResetModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h5 className="mb-3">Reset Password</h5>
            <input
              type="email"
              className={`form-control mb-2 ${!emailValid ? 'is-invalid' : ''}`} // Adding class for invalid email
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                setEmailValid(true); // Reset the email validity as the user types
                setEmailError(""); // Clear error message
              }}
            />
            {!emailValid && (
              <div className="invalid-feedback" style={{ display: "block" }}>
                {emailError}
              </div>
            )}
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSendResetEmail}>
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
