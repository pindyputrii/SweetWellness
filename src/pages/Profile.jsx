import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth"; // Tambahkan updateProfile
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

// --- KOMPONEN RECIPE CARD (TIDAK BERUBAH) ---
const RecipeCard = ({ recipe, viewMode, onDelete }) => {
  const isList = viewMode === "list";
  const getStatusColor = (status) => {
    if (status === "approved") return "bg-green-500";
    if (status === "rejected") return "bg-red-500";
    return "bg-yellow-400";
  };
  const getStatusLabel = (status) => {
    if (status === "approved") return "Tayang";
    if (status === "rejected") return "Ditolak";
    return "Menunggu";
  };

  return (
    <div
      className={`bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100 relative ${
        isList ? "flex flex-row h-auto min-h-[160px]" : "flex flex-col"
      }`}
    >
      <div
        className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-sm uppercase tracking-widest ${getStatusColor(
          recipe.status
        )}`}
      >
        {getStatusLabel(recipe.status)}
      </div>
      <button
        onClick={() => onDelete(recipe.id)}
        className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/90 text-red-500 rounded-full font-bold shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
      >
        ✕
      </button>
      <div
        className={`relative overflow-hidden ${
          isList ? "w-48 shrink-0" : "h-48 w-full"
        }`}
      >
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col justify-between w-full">
        <div>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 text-lg">
            {recipe.title}
          </h3>
          <p className="text-gray-500 text-xs mb-2 line-clamp-2">
            {recipe.desc}
          </p>
          {recipe.status === "rejected" && (
            <div className="bg-red-50 border border-red-100 p-2 rounded-lg mb-2">
              <p className="text-[10px] text-red-600 font-bold">
                ⚠️ Alasan Penolakan:
              </p>
              <p className="text-[10px] text-red-500 italic">
                {recipe.rejectionReason || "Tidak memenuhi pedoman komunitas."}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-xs font-medium mt-auto pt-2">
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1 text-[#A02E2E] font-bold">
              {recipe.calories || "-"} kcal
            </span>
            <div className="flex items-center gap-1 text-yellow-500">
              ★ {recipe.rating || 0}
            </div>
          </div>
          <span className="bg-[#FFE4E4] text-[#A02E2E] px-2 py-1 rounded-full text-[10px] font-bold">
            {recipe.category}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA PROFILE ---
const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Resep Saya");
  const [viewMode, setViewMode] = useState("grid");

  // --- LOGIKA EDIT PROFIL (LENGKAP DENGAN FOTO PROFIL) ---
  const [isEditing, setIsEditing] = useState(false);
  const [healthForm, setHealthForm] = useState({
    fullName: "",
    photoURL: "", // Field Baru untuk Foto
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

  // --- STATE MODAL UPLOAD (TIDAK BERUBAH) ---
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    category: "Low Carb",
    tags: [],
    calories: "",
    servings: "",
    desc: "",
    image: "",
    ingredients: [""],
    instructions: [""],
  });

  const dietCategories = ["Low Carb", "Keto", "Gluten Free", "High Fiber"];
  const methodCategories = ["No-Bake", "Microwave Ready", "Raw"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setHealthForm({
              fullName: data.fullName || "",
              photoURL: data.photoURL || user.photoURL || "", // Ambil dari Firestore atau Auth
              gender: data.gender || "",
              dob: data.dob || "",
              height: data.height || "",
              weight: data.weight || "",
              activityLevel: data.activityLevel || "",
              goal: data.goal || "",
              favDessert: data.favDessert || "",
              allergy: data.allergy || "",
              diet: data.diet || "",
            });
          }
        } catch (error) {
          console.error(error);
        }
        fetchUserRecipes(user);
        setLoading(false);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUserRecipes = async (user) => {
    try {
      const userName = user.displayName || user.email.split("@")[0];
      const q = query(
        collection(db, "recipes"),
        where("uploadedBy", "==", userName)
      );
      const querySnapshot = await getDocs(q);
      setMyRecipes(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  // --- LOGIKA SIMPAN PROFIL (UPDATE AUTH & FIRESTORE) ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;

      // 1. Update Profile di Firebase Auth (Agar foto di header berubah)
      await updateProfile(user, {
        displayName: healthForm.fullName,
        photoURL: healthForm.photoURL,
      });

      // 2. Update Data di Firestore
      const docRef = doc(db, "users", user.uid);
      const updatedData = {
        ...healthForm,
        height: Number(healthForm.height),
        weight: Number(healthForm.weight),
      };
      await setDoc(docRef, updatedData, { merge: true });

      setUserData({ ...userData, ...updatedData });
      setIsEditing(false);
      alert("Profil berhasil diperbarui! ✅");
    } catch (error) {
      alert("Gagal menyimpan: " + error.message);
    }
  };

  // --- LOGIKA UPLOAD RESEP (TIDAK BERUBAH) ---
  const handleUploadChange = (e) =>
    setUploadData({ ...uploadData, [e.target.name]: e.target.value });
  const handleTagChange = (tag) => {
    const currentTags = uploadData.tags;
    setUploadData({
      ...uploadData,
      tags: currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag],
    });
  };
  const handleArrayChange = (idx, val, type) => {
    const newArr = [...uploadData[type]];
    newArr[idx] = val;
    setUploadData({ ...uploadData, [type]: newArr });
  };
  const addArrayItem = (type) =>
    setUploadData({ ...uploadData, [type]: [...uploadData[type], ""] });
  const removeArrayItem = (idx, type) => {
    const newArr = [...uploadData[type]];
    newArr.splice(idx, 1);
    setUploadData({ ...uploadData, [type]: newArr });
  };

  const handleSubmitRecipe = async (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.image)
      return alert("Judul & Gambar wajib!");
    try {
      const userName =
        currentUser.displayName || currentUser.email.split("@")[0];
      await addDoc(collection(db, "recipes"), {
        ...uploadData,
        ingredients: uploadData.ingredients.filter((i) => i.trim() !== ""),
        instructions: uploadData.instructions.filter((i) => i.trim() !== ""),
        rating: 0,
        uploadedBy: userName,
        uploadedAt: new Date(),
        status: "pending",
      });
      alert("Resep berhasil dikirim! ⏳");
      setShowUploadModal(false);
      fetchUserRecipes(currentUser);
      setUploadData({
        title: "",
        category: "Low Carb",
        tags: [],
        calories: "",
        servings: "",
        desc: "",
        image: "",
        ingredients: [""],
        instructions: [""],
      });
    } catch (error) {
      alert("Gagal upload.");
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm("Hapus resep ini?")) {
      await deleteDoc(doc(db, "recipes", id));
      fetchUserRecipes(currentUser);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Kalkulator BMI
  const calculateBMI = () => {
    if (!userData?.height || !userData?.weight) return null;
    const heightInMeters = userData.height / 100;
    const bmi = (userData.weight / (heightInMeters * heightInMeters)).toFixed(
      1
    );
    let status =
      bmi < 18.5
        ? "Kurus"
        : bmi < 25
        ? "Normal"
        : bmi < 30
        ? "Gemuk"
        : "Obesitas";
    let color =
      bmi < 18.5
        ? "text-blue-500"
        : bmi < 25
        ? "text-green-600"
        : bmi < 30
        ? "text-yellow-600"
        : "text-red-600";
    return { val: bmi, status, color };
  };

  const bmiData = calculateBMI();

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A02E2E]"></div>
      </div>
    );

  return (
    <div className="bg-[#FFF5F5] mt-[-32px] min-h-screen font-sans">
      {/* HEADER BANNER */}
      <div className="bg-[#A02E2E] pt-20 pb-20">
        <div className="max-w-7xl mx-auto flex items-center gap-6 px-6">
          <div className="w-28 h-28 rounded-full border-4 border-white shrink-0 bg-gray-200 overflow-hidden relative group">
            <img
              className="w-full h-full object-cover"
              src={
                currentUser?.photoURL ||
                userData?.photoURL ||
                "https://via.placeholder.com/150"
              }
              alt="Profile"
            />
            {/* Indikator Edit saat Hover */}
            <div
              onClick={() => setIsEditing(true)}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold"
            >
              Ubah Foto
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-3xl text-white mt-5">
              {userData?.fullName || currentUser?.displayName || "Pengguna"}
            </h1>
            <p className="text-white mt-3 opacity-90">{currentUser?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/20 text-white px-6 py-2 rounded-full font-bold hover:bg-white/30 transition-all border border-white/40"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!isEditing ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-1/4 space-y-6">
              <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-900">
                    Data Kesehatan
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[#A02E2E] text-xs font-bold hover:underline"
                  >
                    Edit Profil
                  </button>
                </div>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex justify-between border-b pb-2">
                    <span>Tinggi</span>
                    <span className="font-bold text-[#A02E2E]">
                      {userData?.height || "-"} cm
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Berat</span>
                    <span className="font-bold text-[#A02E2E]">
                      {userData?.weight || "-"} kg
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>Diet</span>
                    <span className="font-bold text-[#A02E2E]">
                      {userData?.diet || "Normal"}
                    </span>
                  </div>
                </div>
              </div>

              {bmiData && (
                <div className="bg-[#FFE4E4] p-6 rounded-[20px] shadow-sm border border-pink-100 text-center">
                  <h4 className="text-[#A02E2E] font-black text-[10px] uppercase mb-1">
                    BMI Score
                  </h4>
                  <div className="text-4xl font-black text-[#A02E2E] mb-1">
                    {bmiData.val}
                  </div>
                  <div className={`text-sm font-bold ${bmiData.color}`}>
                    {bmiData.status}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full py-3 bg-[#A02E2E] text-white font-bold rounded-xl shadow-md hover:bg-red-800 transition"
              >
                + Buat Resep Baru
              </button>
            </aside>

            <main className="w-full lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 bg-white p-1 rounded-lg border">
                  {["Resep Saya", "Tersimpan"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                        activeTab === tab
                          ? "bg-[#A02E2E] text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {myRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    viewMode={viewMode}
                    onDelete={handleDeleteRecipe}
                  />
                ))}
              </div>
            </main>
          </div>
        ) : (
          /* --- FORM UPDATE PROFIL LENGKAP --- */
          <div className="bg-[#FFDBD8] p-10 rounded-[40px] shadow-lg border border-gray-100 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black text-[#4B110D] mb-8 text-center uppercase tracking-widest">
              Update Profil & Foto
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#A02E2E] border-b pb-2">
                    Informasi Dasar
                  </h3>
                  <div>
                    <label className="label-text">URL Foto Profil</label>
                    <input
                      type="text"
                      value={healthForm.photoURL}
                      onChange={(e) =>
                        setHealthForm({
                          ...healthForm,
                          photoURL: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="https://link-foto-anda.jpg"
                    />
                  </div>
                  <div>
                    <label className="label-text">Nama Lengkap</label>
                    <input
                      type="text"
                      value={healthForm.fullName}
                      onChange={(e) =>
                        setHealthForm({
                          ...healthForm,
                          fullName: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="👤 Nama Lengkap"
                    />
                  </div>
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Laki-Laki"
                        checked={healthForm.gender === "Laki-Laki"}
                        onChange={(e) =>
                          setHealthForm({
                            ...healthForm,
                            gender: e.target.value,
                          })
                        }
                        className="accent-[#A02E2E]"
                      />{" "}
                      Laki-Laki
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Perempuan"
                        checked={healthForm.gender === "Perempuan"}
                        onChange={(e) =>
                          setHealthForm({
                            ...healthForm,
                            gender: e.target.value,
                          })
                        }
                        className="accent-[#A02E2E]"
                      />{" "}
                      Perempuan
                    </label>
                  </div>
                  <div>
                    <label className="label-text">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={healthForm.dob}
                      onChange={(e) =>
                        setHealthForm({ ...healthForm, dob: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#A02E2E] border-b pb-2">
                    Informasi Kesehatan
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">Tinggi (cm)</label>
                      <input
                        type="number"
                        value={healthForm.height}
                        onChange={(e) =>
                          setHealthForm({
                            ...healthForm,
                            height: e.target.value,
                          })
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label-text">Berat (kg)</label>
                      <input
                        type="number"
                        value={healthForm.weight}
                        onChange={(e) =>
                          setHealthForm({
                            ...healthForm,
                            weight: e.target.value,
                          })
                        }
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-text">Tingkat Aktivitas</label>
                    <select
                      value={healthForm.activityLevel}
                      onChange={(e) =>
                        setHealthForm({
                          ...healthForm,
                          activityLevel: e.target.value,
                        })
                      }
                      className="input-field bg-white"
                    >
                      <option value="">Pilih Aktivitas</option>
                      <option value="Ringan">Ringan</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Berat">Berat</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Tujuan Anda</label>
                    <select
                      value={healthForm.goal}
                      onChange={(e) =>
                        setHealthForm({ ...healthForm, goal: e.target.value })
                      }
                      className="input-field bg-white"
                    >
                      <option value="">Pilih Tujuan</option>
                      <option value="Menurunkan Berat Badan">
                        Menurunkan BB
                      </option>
                      <option value="Menjaga Berat Badan">Menjaga BB</option>
                      <option value="Menambah Berat Badan">Menambah BB</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEKSI PREFERENSI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t">
                <div>
                  <h3 className="label-text text-base mb-4">
                    Preferensi Dessert
                  </h3>
                  {[
                    "Cookies",
                    "Ice Cream",
                    "Dessert Buah",
                    "Cake & Puding",
                  ].map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 mb-3 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="favDessert"
                        value={item}
                        checked={healthForm.favDessert === item}
                        onChange={(e) =>
                          setHealthForm({
                            ...healthForm,
                            favDessert: e.target.value,
                          })
                        }
                        className="accent-[#A02E2E]"
                      />{" "}
                      {item}
                    </label>
                  ))}
                </div>
                <div>
                  <h3 className="label-text text-base mb-4">Alergi</h3>
                  {[
                    "Tidak ada",
                    "Kacang-kacangan",
                    "Susu/Dairy",
                    "Gluten",
                    "Telur",
                  ].map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 mb-3 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="allergy"
                        value={item}
                        checked={healthForm.allergy === item}
                        onChange={(e) =>
                          setHealthForm({
                            ...healthForm,
                            allergy: e.target.value,
                          })
                        }
                        className="accent-[#A02E2E]"
                      />{" "}
                      {item}
                    </label>
                  ))}
                </div>
                <div>
                  <h3 className="label-text text-base mb-4">Pola Makan</h3>
                  {["Normal", "Vegetarian", "Vegan"].map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 mb-3 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="diet"
                        value={item}
                        checked={healthForm.diet === item}
                        onChange={(e) =>
                          setHealthForm({ ...healthForm, diet: e.target.value })
                        }
                        className="accent-[#A02E2E]"
                      />{" "}
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 bg-white text-gray-700 font-bold rounded-2xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#A02E2E] text-white font-bold rounded-2xl shadow-lg hover:bg-red-800 transition"
                >
                  Simpan Perubahan ✨
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* --- MODAL UPLOAD RESEP (TIDAK BERUBAH) --- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[30px] shadow-2xl flex flex-col overflow-hidden border border-pink-100 animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black text-[#4B110D]">
                Dapur Kreasi 👩‍🍳
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-10 h-10 bg-white rounded-full text-gray-500 font-bold shadow-sm hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSubmitRecipe}
              className="overflow-y-auto p-8 custom-scrollbar space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-text">Judul Resep</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={uploadData.title}
                    onChange={handleUploadChange}
                    className="input-field"
                    placeholder="Cth: Keto Avocado"
                  />
                </div>
                <div>
                  <label className="label-text">Kategori</label>
                  <select
                    name="category"
                    value={uploadData.category}
                    onChange={handleUploadChange}
                    className="input-field bg-white"
                  >
                    {dietCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">URL Gambar</label>
                <input
                  type="text"
                  name="image"
                  required
                  value={uploadData.image}
                  onChange={handleUploadChange}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label-text">Kalori</label>
                  <input
                    type="number"
                    name="calories"
                    value={uploadData.calories}
                    onChange={handleUploadChange}
                    className="input-field"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="label-text">Porsi</label>
                  <input
                    type="text"
                    name="servings"
                    value={uploadData.servings}
                    onChange={handleUploadChange}
                    className="input-field"
                    placeholder="1 Porsi"
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Deskripsi</label>
                <textarea
                  name="desc"
                  value={uploadData.desc}
                  onChange={handleUploadChange}
                  className="input-field h-20 resize-none"
                  placeholder="Ceritakan sedikit..."
                ></textarea>
              </div>
              <div>
                <label className="label-text">Bahan-bahan</label>
                {uploadData.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={ing}
                      onChange={(e) =>
                        handleArrayChange(idx, e.target.value, "ingredients")
                      }
                      className="input-field py-2"
                      placeholder={`Bahan ${idx + 1}`}
                    />
                    {uploadData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(idx, "ingredients")}
                        className="text-red-400 font-bold px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("ingredients")}
                  className="text-xs font-bold text-[#A02E2E] hover:underline"
                >
                  + Tambah Bahan
                </button>
              </div>
              <div>
                <label className="label-text">Instruksi</label>
                {uploadData.instructions.map((ins, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <span className="py-2 text-gray-400 font-bold text-xs">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={ins}
                      onChange={(e) =>
                        handleArrayChange(idx, e.target.value, "instructions")
                      }
                      className="input-field py-2"
                      placeholder={`Langkah ${idx + 1}`}
                    />
                    {uploadData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(idx, "instructions")}
                        className="text-red-400 font-bold px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("instructions")}
                  className="text-xs font-bold text-[#A02E2E] hover:underline"
                >
                  + Tambah Langkah
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-[#A02E2E] text-white font-bold rounded-2xl shadow-lg hover:bg-red-800 transition active:scale-95"
              >
                Upload Resep ✨
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .input-field { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #FFDADA; outline: none; font-size: 14px; background: #fff; transition: border-color 0.2s; }
        .input-field:focus { border-color: #A02E2E; }
        .label-text { display: block; font-size: 10px; font-weight: 800; color: #A02E2E; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FFDADA; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Profile;
