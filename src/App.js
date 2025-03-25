import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/register";
import Profile from "./components/profile";
import UserDetailsPage from "./components/UserDetailsPage"; // New import for user details page
import MotorDetailsPage from "./components/MotorDetailsPage"; // New import for motor details page
import EmergencyDetailsPage from "./components/EmergencyDetailsPage"; // New import for emergency details page
import { auth } from "./components/firebase";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              {/* Redirect to Profile if user is logged in */}
              <Route path="/" element={user ? <Navigate to="/profile" /> : <Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              {/* Additional routes for details pages */}
              <Route path="/userDetails" element={<UserDetailsPage />} />
              <Route path="/motorDetails" element={<MotorDetailsPage />} />
              <Route path="/emergencyDetails" element={<EmergencyDetailsPage />} />
            </Routes>
            <ToastContainer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
