import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// Pastikan kamu mengimport 'db' juga dari konfigurasi firebase
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null); // Menyimpan objek user
  const [isAdmin, setIsAdmin] = useState(false); // Menyimpan status admin
  const navigate = useNavigate();

  // 1. OBSERVER: Melacak status login & Cek Role Admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // --- LOGIKA CEK ROLE ADMIN ---
        try {
          // Mengambil data user dari Firestore berdasarkan UID
          // Asumsi: Nama koleksi di database kamu adalah "users"
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Cek apakah field 'role' isinya 'admin'
            if (userData.role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          }
        } catch (error) {
          console.error("Error cek role admin:", error);
          setIsAdmin(false);
        }
        // -----------------------------
      } else {
        // Jika logout
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. FUNGSI LOGOUT FIREBASE
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Berhasil keluar!");
      navigate("/login");
    } catch (error) {
      console.error("Error saat logout:", error.message);
    }
  };

  return (
    <nav className="bg-[#FFDBD8] z-50 text-white fixed w-full top-0 left-0 shadow-md">
      <div className="max-w-8xl mx-auto px-4 py-1 flex justify-between items-center ">
        <div className="flex items-center">
          <img src="./img/logo.png" alt="Logo" className="h-10 mr-2" />
          <h1 className="text-[#4B110D] text-xl font-bold">SweetWellness</h1>
        </div>

        <div className="flex space-x-7 items-center">
          <Link
            to="/"
            className="text-[#4B110D] transition hover:text-[#960C14] font-medium"
          >
            Beranda
          </Link>
          <Link
            to="/resep"
            className="text-[#4B110D] transition hover:text-[#960C14] font-medium"
          >
            Resep
          </Link>
          <Link
            to="/tentang"
            className="text-[#4B110D] transition hover:text-[#960C14] font-medium"
          >
            Tentang
          </Link>
          <Link
            to="/edukasi"
            className="text-[#4B110D] transition hover:text-[#960C14] font-medium"
          >
            Edukasi
          </Link>

          {/* --- PROFILE LINK --- */}
          {currentUser && (
            <Link
              to="/profile"
              className="text-[#4B110D] transition hover:text-[#960C14] font-medium"
            >
              Profile
            </Link>
          )}
          {currentUser && (
            <Link
              to="/Chat-Ai"
              className="text-[#4B110D] transition hover:text-[#960C14] font-medium"
            >
              Chat Ai
            </Link>
          )}

        {currentUser && isAdmin && (
            <Link
              to="/admin"
              className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700 transition font-semibold"
            >
              Admin Panel
            </Link>
          )}
          {/* --- TOMBOL LOGIN / LOGOUT --- */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="bg-[#960C14] text-white px-5 py-2 rounded-full hover:bg-[#7a0a10] transition"
            >
              Logout
            </button>
          ) : (
            <div className="flex space-x-4 items-center">
              <Link
                to="/register"
                className="text-[#4B110D] transition hover:text-[#960C14] font-medium"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="bg-[#960C14] text-white px-5 py-2 rounded-full hover:bg-[#7a0a10] transition"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
