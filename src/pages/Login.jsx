import React, { useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      alert("Login gagal: " + error.message);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Cek apakah profil sudah ada di Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        navigate("/");
      } else {
        alert("Akun Google terhubung. Mohon lengkapi profil kesehatan Anda.");
        // Arahkan ke Register dengan membawa data Google
        navigate("/register", { 
          state: { email: user.email, uid: user.uid, fullName: user.displayName } 
        });
      }
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") alert(error.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#FCECEB] p-4">
      <div className="w-full max-w-sm p-8 bg-[#FFD1D1] rounded-3xl shadow-2xl">
        <div className="text-center mb-10">
          <img src="/img/logo.png" alt="Logo" className="w-12 h-12 mx-auto mb-2" />
          <h1 className="text-2xl font-extrabold text-[#960C14]">SWEETWELLNESS</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#8B1E1E] text-white p-3 rounded-xl outline-none" />
          <input type="password" placeholder="Kata Sandi" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#8B1E1E] text-white p-3 rounded-xl outline-none" />
          <button type="submit" disabled={loading} className="w-full bg-[#960C14] text-white font-bold py-3 rounded-xl shadow-md">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="px-3 text-xs text-gray-500 font-bold">ATAU</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>

        <button onClick={handleGoogleLogin} type="button" className="w-full bg-white text-gray-700 font-semibold py-3 rounded-xl border flex items-center justify-center gap-2 hover:bg-gray-50 transition">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
          Masuk dengan Google
        </button>

        <p className="text-center mt-6 text-sm">Belum punya akun? <Link to="/register" className="font-bold text-[#960C14]">Daftar Sekarang</Link></p>
      </div>
    </div>
  );
};

export default Login;