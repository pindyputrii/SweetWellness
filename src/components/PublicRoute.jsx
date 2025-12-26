// src/components/PublicRoute.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center py-20">Memuat...</div>;

  // Jika user sudah login, arahkan paksa ke Home (/)
  // Jika belum login, tampilkan halaman yang diminta (Login/Register)
  return user ? <Navigate to="/" /> : children;
};

export default PublicRoute;