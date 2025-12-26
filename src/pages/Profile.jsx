import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";

// --- KOMPONEN RECIPE CARD (UPDATED: Support Status Ditolak) ---
const RecipeCard = ({ recipe, viewMode, onDelete }) => {
  const isList = viewMode === "list";

  // Helper untuk warna badge
  const getStatusColor = (status) => {
    if (status === 'approved') return 'bg-green-500';
    if (status === 'rejected') return 'bg-red-500'; // Warna Merah untuk Ditolak
    return 'bg-yellow-400'; // Default Kuning (Pending)
  };

  // Helper untuk teks badge
  const getStatusLabel = (status) => {
    if (status === 'approved') return 'Tayang';
    if (status === 'rejected') return 'Ditolak';
    return 'Menunggu';
  };

  return (
    <div className={`bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100 relative ${isList ? "flex flex-row h-auto min-h-[160px]" : "flex flex-col"}`}>
      
      {/* BADGE STATUS (UPDATED) */}
      <div className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-sm uppercase tracking-widest ${getStatusColor(recipe.status)}`}>
        {getStatusLabel(recipe.status)}
      </div>

      {/* Tombol Hapus */}
      <button 
        onClick={() => onDelete(recipe.id)}
        className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/90 text-red-500 rounded-full font-bold shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
        title="Hapus Resep"
      >
        ✕
      </button>

      <div className={`relative overflow-hidden ${isList ? "w-48 shrink-0" : "h-48 w-full"}`}>
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
        />
      </div>

      <div className="p-5 flex flex-col justify-between w-full">
        <div>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 text-lg">{recipe.title}</h3>
          <p className="text-gray-500 text-xs mb-2 line-clamp-2">{recipe.desc}</p>
          
          {/* FITUR BARU: TAMPILKAN ALASAN PENOLAKAN JIKA ADA */}
          {recipe.status === 'rejected' && (
            <div className="bg-red-50 border border-red-100 p-2 rounded-lg mb-2">
                <p className="text-[10px] text-red-600 font-bold">⚠️ Alasan Penolakan:</p>
                <p className="text-[10px] text-red-500 italic">
                    {recipe.rejectionReason || "Tidak memenuhi pedoman komunitas."}
                </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs font-medium mt-auto pt-2">
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1 text-[#A02E2E] font-bold">{recipe.calories || "-"} kcal</span>
            <div className="flex items-center gap-1 text-yellow-500">★ {recipe.rating || 0}</div>
          </div>
          <span className="bg-[#FFE4E4] text-[#A02E2E] px-2 py-1 rounded-full text-[10px] font-bold">{recipe.category}</span>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA PROFILE ---
const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null); // Data Kesehatan (TB/BB)
  const [currentUser, setCurrentUser] = useState(null); // Data Auth
  const [myRecipes, setMyRecipes] = useState([]); // Data Resep Buatan User
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Resep Saya");
  const [viewMode, setViewMode] = useState("grid");

  // State Modal Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "", category: "Low Carb", tags: [], calories: "", servings: "", 
    desc: "", image: "", ingredients: [""], instructions: [""]
  });

  const methodCategories = ["No-Bake", "Microwave Ready", "Raw"];
  const dietCategories = ["Low Carb", "Keto", "Gluten Free", "High Fiber"];

  // --- 1. FETCH DATA USER & DATA RESEP ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // A. Ambil Data Kesehatan dari koleksi 'users'
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }

        // B. Ambil Resep User dari koleksi 'recipes'
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
      const userName = user.displayName || user.email.split('@')[0];
      const q = query(collection(db, "recipes"), where("uploadedBy", "==", userName));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMyRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  // --- 2. LOGIKA UPLOAD FORM ---
  const handleUploadChange = (e) => setUploadData({ ...uploadData, [e.target.name]: e.target.value });
  
  const handleTagChange = (tag) => {
    const currentTags = uploadData.tags;
    setUploadData({ ...uploadData, tags: currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag] });
  };

  const handleArrayChange = (idx, val, type) => {
    const newArr = [...uploadData[type]];
    newArr[idx] = val;
    setUploadData({ ...uploadData, [type]: newArr });
  };

  const addArrayItem = (type) => setUploadData({ ...uploadData, [type]: [...uploadData[type], ""] });
  const removeArrayItem = (idx, type) => {
    const newArr = [...uploadData[type]];
    newArr.splice(idx, 1);
    setUploadData({ ...uploadData, [type]: newArr });
  };

  const handleSubmitRecipe = async (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.image) return alert("Judul & Gambar wajib diisi!");

    try {
      const userName = currentUser.displayName || currentUser.email.split('@')[0];
      await addDoc(collection(db, "recipes"), {
        ...uploadData,
        ingredients: uploadData.ingredients.filter(i => i.trim() !== ""),
        instructions: uploadData.instructions.filter(i => i.trim() !== ""),
        rating: 0,
        uploadedBy: userName,
        uploadedAt: new Date(),
        status: "pending" // Default status menunggu review
      });
      
      alert("Resep berhasil diunggah! Menunggu persetujuan Admin untuk tayang. ⏳");
      setShowUploadModal(false);
      setUploadData({ title: "", category: "Low Carb", tags: [], calories: "", servings: "", desc: "", image: "", ingredients: [""], instructions: [""] });
      fetchUserRecipes(currentUser);
    } catch (error) {
      console.error(error);
      alert("Gagal upload.");
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm("Yakin ingin menghapus resep ini?")) {
      try {
        await deleteDoc(doc(db, "recipes", id));
        fetchUserRecipes(currentUser);
      } catch (error) { console.error(error); }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-[#FFF5F5]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A02E2E]"></div></div>;

  return (
    <div className="bg-[#FFF5F5] mt-[-32px] min-h-screen font-sans">
      
      {/* HEADER BANNER */}
      <div className="bg-[#A02E2E] pt-20 pb-20">
        <div className="max-w-7xl mx-auto flex items-center gap-6 px-6">
          <div className="w-28 h-28 rounded-full border-4 border-white shrink-0 bg-gray-200 overflow-hidden">
            <img className="w-full h-full object-cover" src={currentUser?.photoURL || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400"} alt="Profile" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-3xl text-white mt-5">{userData?.email || currentUser?.email}</h1>
            <p className="text-white mt-3 opacity-90">Penggemar Dessert Sehat</p>
          </div>
          <button onClick={handleLogout} className="bg-white/20 text-white px-6 py-2 rounded-full font-bold hover:bg-white/30 transition-all border border-white/40">Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR (Data Kesehatan + Tombol Upload) */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Informasi Kesehatan</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between border-b pb-2"><span>Tinggi Badan</span><span className="font-bold text-[#A02E2E]">{userData?.height || "-"} cm</span></div>
              <div className="flex justify-between border-b pb-2"><span>Berat Badan</span><span className="font-bold text-[#A02E2E]">{userData?.weight || "-"} kg</span></div>
              <div className="flex justify-between border-b pb-2"><span>Tujuan</span><span className="font-bold text-[#A02E2E]">{userData?.goal || "Belum diatur"}</span></div>
              <div className="flex justify-between border-b pb-2"><span>Pola Makan</span><span className="font-bold text-[#A02E2E]">{userData?.diet || "Normal"}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Aksi Cepat</h3>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="w-full py-3 bg-[#A02E2E] text-white font-bold rounded-xl shadow-md hover:bg-red-800 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> Buat Resep Baru
            </button>
          </div>
        </aside>

        {/* MAIN FEED (Resep User) */}
        <main className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
              {["Resep Saya", "Tersimpan", "Koleksi"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === tab ? "bg-[#A02E2E] text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}>{tab}</button>
              ))}
            </div>
            <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-100">
              <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "text-[#A02E2E]" : "text-gray-400"}`}>Grid</button>
              <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "text-[#A02E2E]" : "text-gray-400"}`}>List</button>
            </div>
          </div>

          {myRecipes.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {myRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} viewMode={viewMode} onDelete={handleDeleteRecipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[30px] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 mb-4">Belum ada resep yang dibuat.</p>
              <button onClick={() => setShowUploadModal(true)} className="text-[#A02E2E] font-bold hover:underline">Upload Sekarang</button>
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL UPLOAD FORM --- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[30px] shadow-2xl border border-pink-100 flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[30px]">
              <h2 className="text-2xl font-black text-[#4B110D]">Dapur Kreasi 👩‍🍳</h2>
              <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 bg-white rounded-full text-gray-500 shadow-sm font-bold hover:text-red-500">✕</button>
            </div>
            
            <form onSubmit={handleSubmitRecipe} className="overflow-y-auto p-8 custom-scrollbar space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="label-text">Judul Resep</label><input type="text" name="title" required value={uploadData.title} onChange={handleUploadChange} className="input-field" placeholder="Cth: Keto Avocado" /></div>
                <div>
                  <label className="label-text">Kategori</label>
                  <select name="category" value={uploadData.category} onChange={handleUploadChange} className="input-field bg-white">
                    {dietCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label-text">URL Gambar</label><input type="text" name="image" required value={uploadData.image} onChange={handleUploadChange} className="input-field" placeholder="https://..." /></div>
              <div>
                <label className="label-text">Tags (Cara Buat)</label>
                <div className="flex flex-wrap gap-2">
                  {methodCategories.map(tag => (
                    <button type="button" key={tag} onClick={() => handleTagChange(tag)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${uploadData.tags.includes(tag) ? 'bg-[#A02E2E] text-white' : 'bg-gray-100 text-gray-500'}`}>{tag}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="label-text">Kalori</label><input type="number" name="calories" value={uploadData.calories} onChange={handleUploadChange} className="input-field" placeholder="100" /></div>
                <div><label className="label-text">Porsi</label><input type="text" name="servings" value={uploadData.servings} onChange={handleUploadChange} className="input-field" placeholder="1 Porsi" /></div>
              </div>
              <div><label className="label-text">Deskripsi</label><textarea name="desc" value={uploadData.desc} onChange={handleUploadChange} className="input-field h-20 resize-none" placeholder="Ceritakan sedikit..."></textarea></div>
              <div>
                <label className="label-text">Bahan-bahan</label>
                {uploadData.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={ing} onChange={(e) => handleArrayChange(idx, e.target.value, 'ingredients')} className="input-field py-2" placeholder={`Bahan ${idx + 1}`} />
                    {uploadData.ingredients.length > 1 && <button type="button" onClick={() => removeArrayItem(idx, 'ingredients')} className="text-red-400 font-bold px-2">✕</button>}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('ingredients')} className="text-xs font-bold text-[#A02E2E] hover:underline">+ Tambah Bahan</button>
              </div>
              <div>
                <label className="label-text">Instruksi</label>
                {uploadData.instructions.map((ins, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <span className="py-2 text-gray-400 font-bold text-xs">{idx + 1}.</span>
                    <input type="text" value={ins} onChange={(e) => handleArrayChange(idx, e.target.value, 'instructions')} className="input-field py-2" placeholder={`Langkah ${idx + 1}`} />
                    {uploadData.instructions.length > 1 && <button type="button" onClick={() => removeArrayItem(idx, 'instructions')} className="text-red-400 font-bold px-2">✕</button>}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('instructions')} className="text-xs font-bold text-[#A02E2E] hover:underline">+ Tambah Langkah</button>
              </div>
              <button type="submit" className="w-full py-4 bg-[#A02E2E] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-red-800">Upload Resep ✨</button>
            </form>
          </div>
        </div>
      )}
      <style>{` .input-field { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #FFDADA; outline: none; transition: all; font-size: 14px; background: #fff; } .input-field:focus { border-color: #A02E2E; ring: 2px solid #FFE4E4; } .label-text { display: block; font-size: 10px; font-weight: 800; color: #A02E2E; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; } `}</style>
    </div>
  );
};

export default Profile;