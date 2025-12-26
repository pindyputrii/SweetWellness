import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./index.css";

// Import Pages
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Resep from "./pages/Resep.jsx";
import Tentang from "./pages/Tentang.jsx";
import Edukasi from "./pages/Edukasi.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx"; // <--- 1. JANGAN LUPA IMPORT INI
import ChatAI from "./pages/ChatAI.jsx";

// --- 1. GUARD: UNTUK HALAMAN YANG BUTUH LOGIN ---
const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">Memuat...</div>
    );
  return user ? children : <Navigate to="/login" />;
};

// --- 2. GUARD: UNTUK HALAMAN GUEST SAJA ---
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

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">Memuat...</div>
    );
  return !user ? children : <Navigate to="/" />;
};

// --- 3. KONFIGURASI ROUTER ---
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Layout utama (Navbar + Footer)
    children: [
      { path: "/", element: <Home /> },
      { path: "/resep", element: <Resep /> },
      { path: "/tentang", element: <Tentang /> },
      { path: "/edukasi", element: <Edukasi /> },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "/chat-ai", // URL untuk akses chat
        element: (
          <PrivateRoute>
            <ChatAI />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  // --- 2. TAMBAHKAN ROUTE ADMIN DI SINI ---
  {
    path: "/admin",
    element: <Admin />, // Halaman Admin (Punya logic auth sendiri di dalamnya)
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
