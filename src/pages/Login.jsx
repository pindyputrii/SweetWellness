import React, { useState } from "react";
import { auth } from "../firebase"; // Pastikan path ke file firebase.js kamu benar
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // State untuk loading
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Menggunakan Firebase Auth untuk masuk
      await signInWithEmailAndPassword(auth, email, password);

      alert("Login Berhasil!");
      // Diarahkan ke halaman utama (Home)
      navigate("/");
    } catch (error) {
      console.error("Login Error:", error.code);
      // Penanganan error sederhana
      if (error.code === "auth/invalid-credential") {
        alert("Email atau kata sandi salah.");
      } else {
        alert("Terjadi kesalahan: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#FCECEB] p-4">
      <div className="w-full max-w-sm p-8 bg-[#FFD1D1] rounded-3xl shadow-2xl relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mx-auto mb-2">
            <img
              src="/img/logo.png"
              alt="SweetWellness Icon"
              className="w-12 h-12 mx-auto"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-[#960C14]">
            SWEETWELLNESS
          </h1>
          <p className="text-sm text-gray-700 mt-1">
            Dessert Manis, Lebih Sehat, Tanpa Rasa Bersalah.
          </p>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Masuk ke Akun Anda
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="Masukkan Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#8B1E1E] text-white placeholder-white/80 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]"
            />
          </div>

          {/* Kata Sandi Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kata Sandi
            </label>
            <input
              type="password"
              id="password"
              required
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#8B1E1E] text-white placeholder-white/80 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]"
            />
          </div>

          {/* Ingat Saya & Lupa Kata Sandi */}
          <div className="flex justify-between items-center text-sm pt-2">
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 text-[#960C14] border-gray-300 rounded focus:ring-[#960C14]"
              />
              <label htmlFor="remember_me" className="ml-2 text-gray-700">
                Ingat Saya
              </label>
            </div>
            <button
              type="button"
              className="font-medium text-[#960C14] hover:underline"
            >
              Lupa kata sandi?
            </button>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#960C14] text-white font-bold py-3 rounded-xl hover:bg-[#8B1E1E] transition duration-150 shadow-md mt-6 disabled:bg-gray-400"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-700">
            Belum punya akun?
            <Link
              to="/register"
              className="font-bold text-[#960C14] hover:underline ml-1"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>

        <div className="absolute bottom-4 left-4">
          <Link
            to="/"
            className="text-xl font-bold text-gray-700 hover:text-[#960C14]"
          >
            &larr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
