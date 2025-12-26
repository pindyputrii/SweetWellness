import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  addDoc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// --- IKON SVG ---
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
  Recipe: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
  Add: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
  Stats: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>,
  Search: () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>,
  Share: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>,
  Bell: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>,
  Eye: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
};

const Admin = () => {
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [showNotif, setShowNotif] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null); 
  const navigate = useNavigate();

  const dietCategories = ["Low Carb", "Keto", "Gluten Free", "High Fiber"];
  const methodCategories = ["No-Bake", "Microwave Ready", "Raw"];

  // --- FORM STATE (DISAMAKAN DENGAN PROFILE.JSX) ---
  const [newRecipe, setNewRecipe] = useState({
    title: "", category: "Low Carb", tags: [], calories: "", 
    servings: "", desc: "", image: "", 
    ingredients: [""], instructions: [""] 
  });

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            // Ambil Resep
            const q = query(collection(db, "recipes")); 
            const unsubRecipes = onSnapshot(q, (snapshot) => {
              const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
              data.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return 0; 
              });
              setRecipes(data);
            });
            // Ambil Users
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
            
            setLoading(false);
            return () => unsubRecipes();
          } else {
            alert("Akses Ditolak! Bukan Admin.");
            navigate("/");
          }
        } catch (error) {
          console.error("Error:", error);
          navigate("/");
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  // --- 2. LOGIC TAMBAH RESEP (ADAPTED FROM PROFILE) ---
  const handleUploadChange = (e) => setNewRecipe({ ...newRecipe, [e.target.name]: e.target.value });
  
  const handleTagChange = (tag) => {
    const currentTags = newRecipe.tags;
    setNewRecipe({ ...newRecipe, tags: currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag] });
  };

  const handleArrayChange = (idx, val, type) => {
    const newArr = [...newRecipe[type]];
    newArr[idx] = val;
    setNewRecipe({ ...newRecipe, [type]: newArr });
  };

  const addArrayItem = (type) => setNewRecipe({ ...newRecipe, [type]: [...newRecipe[type], ""] });
  
  const removeArrayItem = (idx, type) => {
    const newArr = [...newRecipe[type]];
    newArr.splice(idx, 1);
    setNewRecipe({ ...newRecipe, [type]: newArr });
  };

  const handleAddRecipeSubmit = async (e) => {
    e.preventDefault();
    if (!newRecipe.title || !newRecipe.desc) return alert("Isi data minimal!");
    
    try {
      await addDoc(collection(db, "recipes"), {
        ...newRecipe,
        // Bersihkan array kosong
        ingredients: newRecipe.ingredients.filter(i => i.trim() !== ""),
        instructions: newRecipe.instructions.filter(i => i.trim() !== ""),
        status: "approved", // Admin upload otomatis Approved
        views: 0, likes: 0, shares: 0, rating: 0,
        uploadedBy: "Admin", 
        createdAt: serverTimestamp(),
        uploadedAt: new Date()
      });
      alert("Resep berhasil ditambahkan & langsung tayang!");
      setNewRecipe({ title: "", category: "Low Carb", tags: [], calories: "", servings: "", desc: "", image: "", ingredients: [""], instructions: [""] });
      setActiveTab('recipes');
    } catch (error) {
      console.error("Error adding recipe:", error);
      alert("Gagal menambah resep");
    }
  };

  // --- HELPERS ---
  const getCategoryStyle = (cat) => {
    if (!cat) return "bg-gray-100 text-gray-500";
    const lower = cat.toLowerCase();
    if (lower.includes("keto")) return "bg-red-100 text-red-700";
    if (lower.includes("gluten free")) return "bg-yellow-100 text-yellow-700";
    if (lower.includes("low carb")) return "bg-purple-100 text-purple-700";
    if (lower.includes("high fiber")) return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
  };

  const filteredRecipes = recipes.filter(r => selectedCategory === "Semua" ? true : r.category?.toLowerCase() === selectedCategory.toLowerCase());
  
  // LOGIC APPROVE / REJECT / DELETE
  const handleApprove = async (id, title) => {
    if (window.confirm(`Terbitkan "${title}"?`)) {
        await updateDoc(doc(db, "recipes", id), { status: "approved" });
        setSelectedRecipe(null); 
    }
  };
  const handleReject = async (id, title) => {
    if (window.confirm(`Tolak "${title}"?`)) {
        await updateDoc(doc(db, "recipes", id), { status: "rejected" });
        setSelectedRecipe(null);
    }
  };
  const handleDelete = async (id) => window.confirm("Hapus permanen?") && deleteDoc(doc(db, "recipes", id));
  const handleLogout = async () => { await signOut(auth); navigate("/login"); };

  // --- STATISTIK ---
  const pendingList = recipes.filter(r => r.status === "pending");
  const stats = {
    totalViews: recipes.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0),
    totalUsers: users.length,
    totalLikes: recipes.reduce((acc, curr) => acc + (Number(curr.likes) || 0), 0),
    totalShares: recipes.reduce((acc, curr) => acc + (Number(curr.shares) || 0), 0),
    activeRecipes: recipes.filter(r => r.status === "approved").length,
    pendingRecipes: pendingList.length
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#FFF5F5] text-[#960C14] font-bold">Loading Admin Panel...</div>;

  return (
    <div className="flex min-h-screen bg-[#FFF5F5] font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white fixed h-full shadow-lg z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-[#960C14]">Sweet<span className="text-[#4B110D]">Wellness</span></h1>
          <span className="text-xs font-bold bg-yellow-400 px-2 py-1 rounded text-black">Admin Dashboard</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<Icons.Dashboard/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Icons.Recipe/>} label="Kelola Resep" active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} badge={stats.pendingRecipes > 0 ? stats.pendingRecipes : null} />
          <SidebarItem icon={<Icons.Add/>} label="Tambah Resep Baru" active={activeTab === 'add'} onClick={() => setActiveTab('add')} />
          <SidebarItem icon={<Icons.Users/>} label="Pengguna" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-600 w-full px-4 py-2 transition">Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8 relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#4B110D]">
              {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab === 'recipes' ? 'Kelola Resep' : activeTab === 'add' ? 'Tambah Resep Baru' : 'Kelola Pengguna'}
            </h2>
            <p className="text-gray-500">Selamat datang kembali, Administrator!</p>
          </div>
          <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-full hover:bg-gray-100 transition">
                  <Icons.Bell />
                  {pendingList.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-white animate-pulse"></span>}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-[#4B110D] text-sm flex justify-between items-center">
                      <span>Notifikasi</span><span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{pendingList.length} Baru</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {pendingList.length === 0 ? <div className="p-6 text-center text-gray-400 text-xs italic">Tidak ada resep baru.</div> :
                        pendingList.map((item) => (
                          <div key={item.id} onClick={() => { setSelectedRecipe(item); setShowNotif(false); }} className="p-3 border-b border-gray-50 hover:bg-pink-50 cursor-pointer flex gap-3 transition">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0"><img src={item.image} className="w-full h-full object-cover" onError={(e)=>e.target.style.display='none'} /></div>
                            <div><p className="text-sm font-bold text-[#4B110D] line-clamp-1">{item.title}</p><p className="text-xs text-yellow-600 font-bold mt-1">Klik untuk meninjau</p></div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
             </div>
             <div className="w-10 h-10 bg-[#960C14] rounded-full text-white flex items-center justify-center font-bold shadow-md">A</div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard label="Total Resep" value={recipes.length} icon={<Icons.Recipe/>} color="bg-pink-100 text-pink-600" />
              <StatCard label="Pengguna Aktif" value={stats.totalUsers} icon={<Icons.Users/>} color="bg-blue-100 text-blue-600" />
              <StatCard label="Menunggu Review" value={stats.pendingRecipes} icon={<Icons.Add/>} color="bg-yellow-100 text-yellow-600" />
              <StatCard label="Total Views" value={`${(stats.totalViews / 1000).toFixed(1)}k`} icon={<Icons.Stats/>} color="bg-green-100 text-green-600" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-[#4B110D]">Resep Terbaru</h3>
                <button onClick={() => setActiveTab('recipes')} className="text-[#960C14] text-sm hover:underline">Lihat Semua</button>
              </div>
              <RecipeTable 
                data={recipes.slice(0, 5)} 
                handleApprove={handleApprove} 
                handleReject={handleReject} 
                handleDelete={handleDelete} 
                getCategoryStyle={getCategoryStyle} 
                onView={(item) => setSelectedRecipe(item)}
              />
            </div>
          </>
        )}

        {activeTab === 'recipes' && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
             <div className="flex gap-2 mb-6">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border rounded-lg px-3 py-2 bg-gray-50 text-sm">
                  <option value="Semua">Semua Kategori</option>
                  <option value="Keto">Keto</option>
                  <option value="Gluten Free">Gluten Free</option>
                  <option value="Low Carb">Low Carb</option>
                  <option value="High Fiber">High Fiber</option>
                </select>
                <button onClick={() => setActiveTab('add')} className="bg-[#960C14] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#7a0a10] flex items-center gap-2">
                  <Icons.Add /> Tambah Resep
                </button>
             </div>
             <RecipeTable 
               data={filteredRecipes} 
               handleApprove={handleApprove} 
               handleReject={handleReject} 
               handleDelete={handleDelete} 
               getCategoryStyle={getCategoryStyle} 
               fullView={true} 
               onView={(item) => setSelectedRecipe(item)}
             />
           </div>
        )}

        {/* --- FORM TAMBAH RESEP (UPDATED: STYLE PROFILE.JSX, NO POPUP) --- */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-8 max-w-4xl">
            <h3 className="text-2xl font-black text-[#4B110D] mb-6">Buat Resep Baru (Admin)</h3>
            <form onSubmit={handleAddRecipeSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="label-text">Judul Resep</label><input type="text" name="title" required value={newRecipe.title} onChange={handleUploadChange} className="input-field" placeholder="Cth: Keto Avocado" /></div>
                
                <div>
                  <label className="label-text">Kategori</label>
                  <select name="category" value={newRecipe.category} onChange={handleUploadChange} className="input-field bg-white">
                    {dietCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div><label className="label-text">URL Gambar</label><input type="text" name="image" required value={newRecipe.image} onChange={handleUploadChange} className="input-field" placeholder="https://..." /></div>

              <div>
                <label className="label-text">Tags (Cara Buat)</label>
                <div className="flex flex-wrap gap-2">
                  {methodCategories.map(tag => (
                    <button type="button" key={tag} onClick={() => handleTagChange(tag)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${newRecipe.tags.includes(tag) ? 'bg-[#A02E2E] text-white' : 'bg-gray-100 text-gray-500'}`}>{tag}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div><label className="label-text">Kalori</label><input type="number" name="calories" value={newRecipe.calories} onChange={handleUploadChange} className="input-field" placeholder="100" /></div>
                <div><label className="label-text">Porsi</label><input type="text" name="servings" value={newRecipe.servings} onChange={handleUploadChange} className="input-field" placeholder="1 Porsi" /></div>
              </div>

              <div><label className="label-text">Deskripsi</label><textarea name="desc" value={newRecipe.desc} onChange={handleUploadChange} className="input-field h-20 resize-none" placeholder="Ceritakan sedikit..."></textarea></div>

              {/* Dynamic Ingredients */}
              <div>
                <label className="label-text">Bahan-bahan</label>
                {newRecipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={ing} onChange={(e) => handleArrayChange(idx, e.target.value, 'ingredients')} className="input-field py-2" placeholder={`Bahan ${idx + 1}`} />
                    {newRecipe.ingredients.length > 1 && <button type="button" onClick={() => removeArrayItem(idx, 'ingredients')} className="text-red-400 font-bold px-2">✕</button>}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('ingredients')} className="text-xs font-bold text-[#A02E2E] hover:underline">+ Tambah Bahan</button>
              </div>

              {/* Dynamic Instructions */}
              <div>
                <label className="label-text">Instruksi</label>
                {newRecipe.instructions.map((ins, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <span className="py-2 text-gray-400 font-bold text-xs">{idx + 1}.</span>
                    <input type="text" value={ins} onChange={(e) => handleArrayChange(idx, e.target.value, 'instructions')} className="input-field py-2" placeholder={`Langkah ${idx + 1}`} />
                    {newRecipe.instructions.length > 1 && <button type="button" onClick={() => removeArrayItem(idx, 'instructions')} className="text-red-400 font-bold px-2">✕</button>}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('instructions')} className="text-xs font-bold text-[#A02E2E] hover:underline">+ Tambah Langkah</button>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setActiveTab('recipes')} className="px-6 py-2 border rounded-xl font-bold text-gray-500 hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-8 py-3 bg-[#A02E2E] text-white font-bold rounded-xl shadow-lg hover:bg-red-800 transition-all">Publikasikan</button>
              </div>
            </form>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-[#4B110D] mb-4">Daftar Pengguna Terdaftar</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-center">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                   {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-400 text-xs">#{user.id.slice(0,6)}...</td>
                      <td className="px-6 py-4 font-medium text-gray-700">{user.email}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{user.role || 'User'}</span></td>
                      <td className="px-6 py-4 text-center text-green-600 font-bold text-xs">Aktif</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL DETAIL / PREVIEW (Tetap popup untuk view detail) --- */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setSelectedRecipe(null)} className="absolute top-4 right-4 z-10 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 transition">✕</button>
            <div className="h-64 bg-gray-200 w-full relative">
               <img src={selectedRecipe.image} className="w-full h-full object-cover" onError={(e)=>e.target.src="https://via.placeholder.com/600x400?text=No+Image"} />
               <div className="absolute top-4 left-4 flex gap-2">
                 {selectedRecipe.status === 'pending' && <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">Menunggu Review</span>}
                 {selectedRecipe.status === 'rejected' && <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">Ditolak</span>}
               </div>
            </div>
            
            <div className="p-8">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h2 className="text-3xl font-bold text-[#4B110D] mb-1">{selectedRecipe.title}</h2>
                   <p className="text-gray-500 text-sm">Oleh: <span className="font-bold text-[#960C14]">{selectedRecipe.uploadedBy || "Anonim"}</span> • {selectedRecipe.category}</p>
                 </div>
                 <div className="text-right bg-pink-50 px-3 py-2 rounded-lg"><span className="text-xl font-black text-[#960C14] block">{selectedRecipe.calories || "-"}</span><span className="text-xs text-gray-500 uppercase font-bold">Kcal</span></div>
               </div>
               <p className="text-gray-700 italic bg-gray-50 p-4 rounded-xl border-l-4 border-[#960C14] mb-8">"{selectedRecipe.desc}"</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div>
                    <h3 className="font-bold text-[#4B110D] mb-3 flex items-center gap-2 border-b pb-2">📝 Bahan-bahan</h3>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                       {(() => {
                          const data = selectedRecipe.ingredients;
                          if (!data) return <li className="text-gray-400 italic">Tidak ada data bahan.</li>;
                          if (Array.isArray(data)) return data.map((item, i) => <li key={i}>{item}</li>);
                          if (typeof data === 'string') return data.split('\n').map((item, i) => <li key={i}>{item}</li>);
                          return <li>{data}</li>;
                       })()}
                    </ul>
                 </div>
                 <div>
                    <h3 className="font-bold text-[#4B110D] mb-3 flex items-center gap-2 border-b pb-2">🍳 Cara Membuat</h3>
                    <ul className="text-sm text-gray-600 space-y-3 list-decimal pl-5">
                       {(() => {
                          const data = selectedRecipe.instructions;
                          if (!data) return <li className="text-gray-400 italic">Tidak ada instruksi.</li>;
                          if (Array.isArray(data)) return data.map((item, i) => <li key={i}>{item}</li>);
                          if (typeof data === 'string') return data.split('\n').map((item, i) => <li key={i}>{item}</li>);
                          return <li>{data}</li>;
                       })()}
                    </ul>
                 </div>
               </div>

               <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                 <button onClick={() => setSelectedRecipe(null)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 font-medium">Tutup</button>
                 {selectedRecipe.status === 'pending' ? (
                    <>
                       <button onClick={() => handleReject(selectedRecipe.id, selectedRecipe.title)} className="px-5 py-2 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-200 transition">Tolak Resep</button>
                       <button onClick={() => handleApprove(selectedRecipe.id, selectedRecipe.title)} className="px-5 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg transition">Terbitkan Resep</button>
                    </>
                 ) : (
                    <button onClick={() => { if(window.confirm("Hapus?")) { handleDelete(selectedRecipe.id); setSelectedRecipe(null); } }} className="px-5 py-2 rounded-lg bg-gray-100 text-red-500 hover:bg-red-50 font-medium">Hapus Resep</button>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* STYLE CSS KHUSUS ADMIN (SAMA DENGAN PROFILE) */}
      <style>{` .input-field { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #FFDADA; outline: none; transition: all; font-size: 14px; background: #fff; } .input-field:focus { border-color: #A02E2E; ring: 2px solid #FFE4E4; } .label-text { display: block; font-size: 10px; font-weight: 800; color: #A02E2E; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; } `}</style>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const SidebarItem = ({ icon, label, active, onClick, badge }) => (<button onClick={onClick} className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition font-medium ${active ? "bg-[#960C14] text-white shadow-md" : "text-gray-600 hover:bg-pink-50 hover:text-[#960C14]"}`}><div className="flex items-center gap-3">{icon} <span>{label}</span></div>{badge && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">{badge}</span>}</button>);
const StatCard = ({ label, value, color, icon }) => (<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"><div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>{icon}</div><div><p className="text-gray-500 text-sm">{label}</p><h4 className="text-2xl font-bold text-[#4B110D]">{value}</h4></div></div>);
const RecipeTable = ({ data, onView, handleApprove, handleReject, handleDelete, getCategoryStyle, fullView }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="px-6 py-4">Judul Resep</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-center">Aksi</th></tr></thead>
      <tbody className="divide-y divide-gray-100 text-sm">
        {data.length === 0 ? <tr><td colSpan="4" className="text-center py-8 text-gray-400">Tidak ada data.</td></tr> : 
          data.map((recipe) => (
            <tr key={recipe.id} className={`hover:bg-gray-50 ${recipe.status === 'pending' ? 'bg-yellow-50' : recipe.status === 'rejected' ? 'bg-red-50' : ''}`}>
              <td className="px-6 py-4 font-medium text-[#4B110D]"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden"><img src={recipe.image} className="w-full h-full object-cover" onError={(e)=>e.target.style.display='none'}/></div><div>{recipe.title}<div className="text-xs text-gray-400">{recipe.uploadedBy || "Anonim"}</div></div></div></td>
              <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${getCategoryStyle(recipe.category)}`}>{recipe.category}</span></td>
              <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${recipe.status === 'approved' ? 'bg-green-100 text-green-600' : recipe.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{recipe.status === 'pending' ? 'Review' : recipe.status}</span></td>
              <td className="px-6 py-4 text-center flex justify-center gap-2">
                <button onClick={() => onView(recipe)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Lihat Detail"><Icons.Eye /></button>
                {recipe.status === 'pending' && (<><button onClick={() => handleApprove(recipe.id, recipe.title)} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"><Icons.Check /></button><button onClick={() => handleReject(recipe.id, recipe.title)} className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"><Icons.X /></button></>)}
                {recipe.status !== 'pending' && <button onClick={() => handleDelete(recipe.id)} className="p-2 bg-gray-50 text-gray-400 rounded hover:text-red-500"><Icons.Trash /></button>}
              </td>
            </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Admin;