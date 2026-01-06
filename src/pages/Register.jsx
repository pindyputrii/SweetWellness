import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase"; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [loading, setLoading] = useState(false);

  // Ambil data kiriman dari Google Login melalui Login.jsx (jika ada)
  const googleData = location.state || null;

  const [formData, setFormData] = useState({
    fullName: googleData?.fullName || "", // Auto-isi nama jika dari Google
    email: googleData?.email || "",       // Auto-isi email jika dari Google
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
      // LOGIKA UTAMA: Gunakan UID dari Google jika ada, jika tidak buat baru
      let uid = googleData?.uid;

      if (!uid) {
        // Proses pendaftaran manual
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;
        uid = user.uid;

        await updateProfile(user, {
          displayName: formData.fullName
        });
      }

      // Simpan data lengkap ke Firestore menggunakan UID yang sudah didapat
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        fullName: formData.fullName,
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
        authMethod: googleData ? "google" : "email",
      });

      alert(`Halo ${formData.fullName}, akun SweetWellness berhasil dilengkapi!`);
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
          <img src="/img/logo.png" alt="SweetWellness Icon" className="w-12 h-12 mx-auto mb-2" />
          <h1 className="text-xl font-extrabold text-[#960C14]">SWEETWELLNESS</h1>
          <p className="text-sm text-gray-700 mt-1">
            {googleData ? "Sedikit lagi! Lengkapi data profil Anda." : "Dessert Manis, Lebih Sehat, Tanpa Rasa Bersalah."}
          </p>
        </div>

        <form className="space-y-10" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Kolom Kiri: Informasi Dasar */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Informasi Dasar</h3>
              
              <div className="relative">
                <input name="fullName" type="text" placeholder="Nama Lengkap" required 
                  defaultValue={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2">👤</span>
              </div>

              <div className="relative">
                <input name="email" type="email" placeholder="nama@email.com" required 
                  value={formData.email}
                  readOnly={!!googleData} 
                  onChange={handleChange}
                  className={`w-full py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14] ${googleData ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-[#F7F1E7] text-gray-700"}`} />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2">📧</span>
              </div>

              {!googleData && (
                <div className="relative">
                  <input name="password" type="password" placeholder="Minimal 8 karakter" required onChange={handleChange}
                    className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2">🔒</span>
                </div>
              )}
              
              <div className="flex space-x-6 pt-2 text-gray-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="gender" value="Laki-Laki" required onChange={handleChange} className="form-radio text-[#960C14]" />
                  <span>Laki-Laki</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="gender" value="Perempuan" required onChange={handleChange} className="form-radio text-[#960C14]" />
                  <span>Perempuan</span>
                </label>
              </div>

              {/* SECTION TANGGAL LAHIR (Sudah Dilengkapi Label) */}
              <div className="space-y-2">
                <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 ml-1">Tanggal Lahir</label>
                <div className="relative">
                  <input id="dob" name="dob" type="date" required onChange={handleChange}
                    className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">📅</span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Informasi Kesehatan */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Informasi Kesehatan</h3>
              
              <div className="flex space-x-4">
                <div className="relative w-1/2">
                  <input name="height" type="number" placeholder="Tinggi (cm)" required onChange={handleChange}
                    className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2">📏</span>
                </div>
                <div className="relative w-1/2">
                  <input name="weight" type="number" placeholder="Berat (kg)" required onChange={handleChange}
                    className="w-full bg-[#F7F1E7] text-gray-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]" />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2">🏋️</span>
                </div>
              </div>

              <select name="activityLevel" required onChange={handleChange} className="w-full bg-[#F7F1E7] text-gray-700 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]">
                <option value="">Pilih Tingkat Aktivitas</option>
                <option value="Ringan">Ringan (Jarang olahraga)</option>
                <option value="Sedang">Sedang (Olahraga 3x seminggu)</option>
                <option value="Berat">Berat (Atlet/Pekerja Fisik)</option>
              </select>

              <select name="goal" required onChange={handleChange} className="w-full bg-[#F7F1E7] text-gray-700 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#960C14]">
                <option value="">Pilih Tujuan Anda</option>
                <option value="Menjaga Berat Badan">Menjaga Berat Badan</option>
                <option value="Menurunkan Berat Badan">Menurunkan Berat Badan</option>
                <option value="Menambah Berat Badan">Menambah Berat Badan</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6 pt-4 border-t border-red-200">
            <PreferenceSection title="Preferensi Dessert" name="favDessert" items={["Cookies", "Ice Cream", "Dessert Buah", "Cake & Puding"]} onChange={handleChange} />
            <PreferenceSection title="Alergi" name="allergy" items={["Tidak ada", "Kacang-kacangan", "Susu/Dairy", "Gluten", "Telur"]} onChange={handleChange} />
            <PreferenceSection title="Pola Makan" name="diet" items={["Normal", "Vegetarian", "Vegan"]} onChange={handleChange} />
          </div>

          <div className="text-center pt-8">
            <button type="submit" disabled={loading}
              className="bg-[#960C14] text-white font-bold py-3 px-12 rounded-xl hover:bg-[#8B1E1E] transition duration-150 shadow-md disabled:bg-gray-400">
              {loading ? "Memproses..." : googleData ? "Selesaikan Profil" : "Mulai Perjalanan Sehat!"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PreferenceSection = ({ title, name, items, onChange }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">{title}</h3> 
    <div className="space-y-3 text-gray-700">
      {items.map((item) => (
        <label key={item} className="flex items-center space-x-2 cursor-pointer">
          <input type="radio" name={name} value={item} required onChange={onChange} className="form-radio text-[#960C14]" />
          <span>{item}</span>
        </label>
      ))}
    </div>
  </div>
);

export default Register;