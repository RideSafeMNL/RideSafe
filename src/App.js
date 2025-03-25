import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              {/* Always redirect to Login on initial load */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              {/* Additional routes for details pages */}
              <Route path="/userDetails" element={user ? <UserDetailsPage /> : <Navigate to="/login" />} />
              <Route path="/motorDetails" element={user ? <MotorDetailsPage /> : <Navigate to="/login" />} />
              <Route path="/emergencyDetails" element={user ? <EmergencyDetailsPage /> : <Navigate to="/login" />} />
            </Routes>
            <ToastContainer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
