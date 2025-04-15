import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../store/authSlice"; // Adjust the import path as needed
import { MoonLoader } from "react-spinners"; // Import spinner

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const isAdminLoggedIn = useSelector((state) => state.auth.isAdminLoggedIn);
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  const checkLogin = async () => {
    setLoadingAnimation(true);
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/checkAdminToken`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.error) {
          dispatch(logout()); // Token is invalid
        } else {
          dispatch(login()); // Token is valid
        }
      } catch (error) {
        dispatch(logout()); // Error handling
      }
    } else {
      dispatch(logout()); // No token
    }
    setLoadingAnimation(false);
  };

  useEffect(() => {
    checkLogin();
  }, [dispatch]);

  if (loadingAnimation) {
    return (
      <div style={loadingStyle}>
        <MoonLoader size={50} color="#007bff" />
      </div>
    ); // Show spinner in center of page
  }

  if (!isAdminLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Centering spinner styles
const loadingStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0)',
};

export default ProtectedRoute;
