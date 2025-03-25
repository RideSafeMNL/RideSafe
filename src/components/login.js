import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import React, { useState } from "react";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";

function Login() {
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");

  const loginWithUsername = async (username, password) => {
    try {
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Username not found");
      }

      const userDoc = querySnapshot.docs[0].data();
      return userDoc.email;
    } catch (error) {
      throw new Error("Failed to retrieve email for username");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let email = identifier;

      if (!identifier.includes("@")) { // Check if it's a username
        email = await loginWithUsername(identifier, password);
      }

      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      window.location.href = "/profile";
      toast.success("User logged in Successfully", { position: "top-center" });
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Top Image */}
      <div className="text-center">
        <img
          src="/login_header.png" // Updated image path for the new header image
          alt="Login Header"
          className="img-fluid mb-3" // Optional: Adds some margin and makes the image responsive
          style={{ maxWidth: "100%" }} // Optional: Controls the max width of the logo
        />
      </div>

      <div className="mb-3">
        <label>Email or Username</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="d-grid">
        <button 
          type="submit" 
          className="btn" 
          style={{ backgroundColor: "#f29b71", color: "#fff" }} // Button color
        >
          login
        </button>
      </div>
      <p className="forgot-password text-right">
        New user? <a href="/register">Register Here</a>
      </p>

    </form>
  );
}

export default Login;
