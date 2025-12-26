import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Tambahkan updateProfile
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 1. Tambahkan 'fullName' ke dalam state
  const [formData, setFormData] = useState({
    fullName: "", // Kolom Nama baru
    email: "",
    password: "",
    gender: "",
    dob: "",
    height: "",
    weight: "",
    activityLevel: "",
    goal: "",
    favDessert: "",
    allergy: "",
    diet: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Langkah A: Buat akun di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Langkah B: (Opsional tapi disarankan) Update nama di Firebase Auth
      await updateProfile(user, {
        displayName: formData.fullName
      });

      // Langkah C: Simpan seluruh data ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName, // Simpan Nama Lengkap
        email: formData.email,
        gender: formData.gender,
        dob: formData.dob,
        height: Number(formData.height),
        weight: Number(formData.weight),
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        favDessert: formData.favDessert,
        allergy: formData.allergy,
        diet: formData.diet,
        createdAt: new Date().toISOString(),
      });

      alert(`Halo ${formData.fullName}, akun SweetWellness berhasil dibuat!`);
      navigate("/"); 
    } catch (error) {
      console.error("Registrasi Gagal:", error.message);
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#FCECEB] p-4 py-10">
      <div className="w-full max-w-4xl p-8 md:p-12 bg-[#FFD0CE] rounded-3xl shadow-2xl relative">
        
        <div className="text-center mb-8">
          <div className="text-4xl mx-auto mb-2">
            <img src="/img/logo.png" alt="SweetWellness Icon" className="w-12 h-12 mx-auto" />
          </div>
          <h1 className="text-xl font-extrabold text-[#960C14]">SWEETWELLNESS</h1>
          <p className="text-sm text-gray-700 mt-1">Dessert Manis, Lebih Sehat, Tanpa Rasa Bersalah.</p>
        </div>

        <form className="space-y-10" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Kolom Kiri: Informasi Dasar */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Informasi Dasar</h3>
              
              {/* INPUT NAMA LENGKAP */}
              <div className="relative">
                <input name="fullName" type="text" placeholder="Nama Lengkap" required onChange={handleChange}
                  className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">👤</span>
              </div>

              <div className="relative">
                <input name="email" type="email" placeholder="nama@email.com" required onChange={handleChange}
                  className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">📧</span>
              </div>

              <div className="relative">
                <input name="password" type="password" placeholder="Minimal 8 karakter" required onChange={handleChange}
                  className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">🔒</span>
              </div>
              
              <div className="flex space-x-6 pt-2 text-gray-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="gender" value="Laki-Laki" onChange={handleChange} className="form-radio text-[#960C14]" />
                  <span>Laki-Laki</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="gender" value="Perempuan" onChange={handleChange} className="form-radio text-[#960C14]" />
                  <span>Perempuan</span>
                </label>
              </div>

              <div className="relative">
                <input name="dob" type="date" required onChange={handleChange}
                  className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">📅</span>
              </div>
            </div>

            {/* Kolom Kanan: Informasi Kesehatan */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Informasi Kesehatan</h3>
              
              <div className="flex space-x-4">
                <div className="relative w-1/2">
                  <input name="height" type="number" placeholder="170" onChange={handleChange}
                    className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">📏</span>
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>
                </div>
                <div className="relative w-1/2">
                  <input name="weight" type="number" placeholder="50" onChange={handleChange}
                    className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">🏋️</span>
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">kg</span>
                </div>
              </div>

              <div className="relative">
                <select name="activityLevel" onChange={handleChange} className="w-full bg-[#F7F1E7] text-gray-700 py-3 px-4 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#960C14]">
                  <option value="">Pilih Tingkat Aktivitas</option>
                  <option value="Ringan">Ringan</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Berat">Berat</option>
                </select>
              </div>

              <div className="relative">
                <select name="goal" onChange={handleChange} className="w-full bg-[#F7F1E7] text-gray-700 py-3 px-4 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#960C14]">
                  <option value="">Pilih Tujuan Anda</option>
                  <option value="Menjaga Berat Badan">Menjaga Berat Badan</option>
                  <option value="Menurunkan Berat Badan">Menurunkan Berat Badan</option>
                  <option value="Menambah Berat Badan">Menambah Berat Badan</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* --- BAGIAN 2: PREFERENSI DESSERT --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Preferensi Dessert</h3> 
              <div className="space-y-3 text-gray-700">
                {["Cookies", "Ice Cream", "Dessert Buah", "Cake & Puding"].map((item) => (
                  <label key={item} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="favDessert" value={item} onChange={handleChange} className="form-radio text-[#960C14]" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Alergi</h3>
              <div className="space-y-3 text-gray-700">
                {["Tidak ada", "Kacang-kacangan", "Susu/Dairy", "Gluten", "Telur"].map((item) => (
                  <label key={item} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="allergy" value={item} onChange={handleChange} className="form-radio text-[#960C14]" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Pola Makan</h3>
              <div className="space-y-3 text-gray-700">
                {["Normal", "Vegetarian", "Vegan"].map((item) => (
                  <label key={item} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="diet" value={item} onChange={handleChange} className="form-radio text-[#960C14]" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center pt-8">
            <button type="submit" disabled={loading}
              className="bg-[#960C14] text-white font-bold py-3 px-12 rounded-xl hover:bg-[#8B1E1E] transition duration-150 shadow-md mb-4 disabled:bg-gray-400">
              {loading ? "Memproses..." : "Mulai Perjalanan Sehat!"}
            </button>
            <p className="text-gray-700">
              Sudah punya akun? <Link to="/login" className="font-bold text-[#960C14] hover:underline ml-1">Masuk di sini</Link>
            </p>
          </div>
        </form>

        <div className="absolute bottom-4 left-4">
          <Link to="/" className="text-3xl font-bold text-gray-700 hover:text-[#960C14]">&larr;</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;