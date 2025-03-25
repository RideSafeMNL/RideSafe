import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/register";
import Profile from "./components/profile";
import UserDetailsPage from "./components/UserDetailsPage";
import MotorDetailsPage from "./components/MotorDetailsPage";
import EmergencyDetailsPage from "./components/EmergencyDetailsPage";
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
              {/* Set Register as the default entry point (No.1) */}
              <Route path="/" element={<Navigate to="/register" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
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
