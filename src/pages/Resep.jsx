import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Resep = () => {
  // --- 1. STATE MANAGEMENT ---
  const [allRecipes, setAllRecipes] = useState([]);
  const [displayedRecipes, setDisplayedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [user, setUser] = useState(null);

  // State Baru: Menyimpan Rata-rata Rating per Resep
  // Format: { "ID_RESEP_A": 4.5, "ID_RESEP_B": 5.0 }
  const [averageRatings, setAverageRatings] = useState({}); 

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 6;
  const [availableDiet, setAvailableDiet] = useState([]);
  const [filterDiet, setFilterDiet] = useState([]);
  const [filterMethod, setFilterMethod] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const methodCategories = ["No-Bake", "Microwave Ready", "Raw"];

  // Feedback States
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [recipeFeedbacks, setRecipeFeedbacks] = useState([]);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // --- 2. LOGIKA UTAMA ---

  // A. Monitor Status Login User
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // B. Ambil Data Resep
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const q = query(collection(db, "recipes"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        setAllRecipes(data);
        setDisplayedRecipes(data);
        
        const diets = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
        setAvailableDiet(diets);
      } catch (error) { 
        console.error("Error fetching recipes:", error); 
      } 
      finally { 
        setLoading(false); 
      }
    };
    fetchRecipes();
  }, []);

  // --- LOGIKA BARU: HITUNG RATA-RATA RATING REAL-TIME ---
  useEffect(() => {
    // Kita dengarkan perubahan di seluruh koleksi feedbacks
    const q = query(collection(db, "feedbacks"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ratingsMap = {}; // Object penampung sementara

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const rId = data.recipeId;
        const ratingVal = Number(data.rating);

        if (rId && ratingVal) {
          if (!ratingsMap[rId]) {
            ratingsMap[rId] = { total: 0, count: 0 };
          }
          ratingsMap[rId].total += ratingVal;
          ratingsMap[rId].count += 1;
        }
      });

      // Hitung rata-rata akhir
      const finalAverages = {};
      Object.keys(ratingsMap).forEach((key) => {
        const avg = ratingsMap[key].total / ratingsMap[key].count;
        // Simpan dengan 1 desimal (contoh: 4.5)
        finalAverages[key] = parseFloat(avg.toFixed(1)); 
      });

      setAverageRatings(finalAverages);
    });

    return () => unsubscribe();
  }, []); // Jalan sekali saat komponen mount, lalu update otomatis jika ada feedback baru

  // C. Listener Feedback (Untuk Modal Detail)
  useEffect(() => {
    if (!selectedRecipe) return;
    const q = query(collection(db, "feedbacks"), where("recipeId", "==", selectedRecipe.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbacks = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date() 
        };
      });
      setRecipeFeedbacks(feedbacks);
    });
    return () => unsubscribe();
  }, [selectedRecipe]);

  // D. Filter Logic
  useEffect(() => {
    setCurrentPage(1);
    const filtered = allRecipes.filter((recipe) => {
      const isVisible = recipe.status === "approved"; 
      const matchesDiet = filterDiet.length === 0 || filterDiet.includes(recipe.category);
      const matchesMethod = filterMethod.length === 0 || 
        (recipe.tags && recipe.tags.some(tag => filterMethod.includes(tag)));
      const matchesSearch =
        (recipe.title && recipe.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (recipe.desc && recipe.desc.toLowerCase().includes(searchTerm.toLowerCase()));

      return isVisible && matchesDiet && matchesMethod && matchesSearch;
    });
    setDisplayedRecipes(filtered);
  }, [searchTerm, filterDiet, filterMethod, allRecipes]);

  // E. Kirim Feedback
  const handleSendFeedback = async () => {
    if (!userRating) return alert("Mohon berikan rating bintang! ⭐");
    if (!comment.trim()) return alert("Mohon isi komentar ulasan! 📝");
    
    setSendingFeedback(true);
    try {
      const feedbackData = {
        recipeId: selectedRecipe.id,
        userUid: user.uid,
        userName: user.displayName || user.email.split('@')[0] || "Pengguna",
        rating: Number(userRating),
        comment: comment,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "feedbacks"), feedbackData);
      setComment(""); 
      setUserRating(0);
      alert("Terima kasih! Review kamu berhasil dikirim.");
    } catch (e) { 
      console.error("Gagal kirim review:", e); 
      alert(`Gagal mengirim review: ${e.message}`);
    } finally {
      setSendingFeedback(false);
    }
  };

  // Pagination Logic
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = displayedRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(displayedRecipes.length / recipesPerPage);
  
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) startPage = Math.max(1, endPage - maxVisiblePages + 1);
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#960C14]"></div>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-[#FFF9F9] mt-[-64px] pt-16 font-sans">
      
      {/* HEADER */}
      <div className="pt-12 pb-10 text-center relative overflow-hidden">
        <div className="absolute top-[-50px] left-[-30px] w-64 h-64 bg-pink-100/50 rounded-full blur-3xl"></div>
        <h1 className="text-4xl md:text-5xl font-black text-[#4B110D] mb-4 relative z-10">
            Sweet Treats, <span className="text-[#E27E75]">Healthy Beats</span> ✨
        </h1>
        <div className="max-w-md mx-auto relative px-6 z-10">
          <input type="text" placeholder="Cari resep (contoh: puding)..." className="w-full py-3 px-6 rounded-full border border-pink-100 outline-none focus:ring-2 focus:ring-pink-200 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-7 pb-20 mt-4 flex flex-col md:flex-row gap-10">
        
        {/* SIDEBAR FILTER */}
        <div className="w-full md:w-1/4 bg-white p-7 rounded-[40px] shadow-sm border border-pink-50 h-fit">
          <h2 className="text-2xl font-black text-[#960C14] mb-8">Filters 🎨</h2>
          <div className="mb-8">
            <h3 className="text-xs font-bold text-[#E27E75] uppercase tracking-widest border-b border-pink-50 pb-2 mb-4">Jenis Diet</h3>
            {availableDiet.map(diet => (
              <label key={diet} className="flex items-center gap-3 cursor-pointer group mb-3">
                <input type="checkbox" checked={filterDiet.includes(diet)} onChange={() => filterDiet.includes(diet) ? setFilterDiet(filterDiet.filter(d => d !== diet)) : setFilterDiet([...filterDiet, diet])} className="w-5 h-5 rounded text-[#E27E75] focus:ring-[#E27E75]" />
                <span className="text-gray-600 capitalize group-hover:text-[#960C14] transition-colors">{diet}</span>
              </label>
            ))}
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#E27E75] uppercase tracking-widest border-b border-pink-50 pb-2 mb-4">Cara Buat</h3>
            {methodCategories.map(method => (
              <label key={method} className="flex items-center gap-3 cursor-pointer group mb-3">
                <input type="checkbox" checked={filterMethod.includes(method)} onChange={() => filterMethod.includes(method) ? setFilterMethod(filterMethod.filter(m => m !== method)) : setFilterMethod([...filterMethod, method])} className="w-5 h-5 rounded text-[#E27E75] focus:ring-[#E27E75]" />
                <span className="text-gray-600 group-hover:text-[#960C14] transition-colors">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* GRID RESEP */}
        <div className="w-full md:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentRecipes.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-[30px] border border-dashed border-pink-200">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p className="text-gray-400 italic">Tidak ada resep yang ditemukan untuk filter ini.</p>
                    <button onClick={() => {setFilterDiet([]); setFilterMethod([]); setSearchTerm("")}} className="mt-4 text-[#960C14] font-bold underline hover:text-[#E27E75]">Reset Filter</button>
                </div>
            ) : (
                currentRecipes.map((recipe) => (
                <div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="bg-white rounded-[35px] shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-transparent hover:border-pink-100 group h-full flex flex-col">
                    <div className="h-48 overflow-hidden relative flex-shrink-0">
                        <img 
                            src={recipe.image} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt={recipe.title} 
                            onError={(e)=>{e.target.src="https://via.placeholder.com/300?text=No+Image"}} 
                        />
                        {/* UPDATE DISPLAY RATING: MENGGUNAKAN HASIL HITUNGAN */}
                        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#960C14] shadow-sm backdrop-blur-sm flex items-center gap-1">
                            ⭐ {averageRatings[recipe.id] ? averageRatings[recipe.id] : "New"}
                        </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-[10px] font-black text-[#E27E75] uppercase bg-pink-50 px-2 py-1 rounded-md">{recipe.category}</span>
                            {recipe.calories && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{recipe.calories} kkal</span>}
                        </div>
                        <h3 className="text-lg font-bold text-[#4B110D] mb-2 line-clamp-2">{recipe.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2 italic mb-4">"{recipe.desc}"</p>
                        
                        <div className="mt-auto pt-3 border-t border-pink-50 flex justify-between items-center text-[10px] text-gray-400">
                            <span>🕒 {recipe.time || "-"} min</span>
                            <span>{recipe.uploadedBy ? `Oleh: ${recipe.uploadedBy}` : "Admin"}</span>
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-2 text-xs font-bold text-[#960C14] disabled:opacity-30 hover:bg-pink-50 rounded-lg">First</button>
              {getPageNumbers().map(num => (
                  <button key={num} onClick={() => {setCurrentPage(num); window.scrollTo({top: 0, behavior: 'smooth'});}} className={`w-10 h-10 rounded-2xl font-bold transition-all ${currentPage === num ? 'bg-[#960C14] text-white shadow-md transform scale-110' : 'bg-white text-gray-400 border border-pink-50 hover:border-[#960C14]'}`}>{num}</button>
              ))}
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-2 text-xs font-bold text-[#960C14] disabled:opacity-30 hover:bg-pink-50 rounded-lg">Last</button>
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden animate-zoom-in">
            
            <div className="relative h-64 md:h-72 flex-shrink-0">
              <img src={selectedRecipe.image} className="w-full h-full object-cover" alt={selectedRecipe.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <button onClick={() => setSelectedRecipe(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all">✕</button>
              <div className="absolute bottom-6 left-8 text-white">
                  <h2 className="text-3xl font-black mb-1 drop-shadow-md">{selectedRecipe.title}</h2>
                  <div className="flex gap-2 text-sm font-medium opacity-90">
                      <span>🔥 {selectedRecipe.calories || "-"} Kkal</span> • 
                      <span>⏱️ {selectedRecipe.time} Min</span> •
                      {/* UPDATE DISPLAY RATING DI MODAL */}
                      <span className="flex items-center gap-1 bg-white/20 px-2 rounded-lg">
                        ⭐ {averageRatings[selectedRecipe.id] || "Belum ada rating"}
                      </span>
                  </div>
              </div>
            </div>

            <div className="overflow-y-auto p-8 pt-6 custom-scrollbar flex-1">
              <div className="space-y-8 mb-10">
                <div>
                    <h4 className="text-lg font-bold text-[#960C14] mb-4 flex items-center gap-2"><span>🥣</span> Bahan Utama</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{selectedRecipe.ingredients?.map((ing, i) => (<div key={i} className="bg-[#FFF9F9] px-4 py-3 rounded-xl text-sm border border-pink-50 text-gray-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E27E75]"></span> {ing}</div>))}</div>
                </div>
                <div>
                    <h4 className="text-lg font-bold text-[#960C14] mb-4 flex items-center gap-2"><span>👩‍🍳</span> Cara Membuat</h4>
                    <div className="space-y-3">{selectedRecipe.instructions?.map((step, i) => (<div key={i} className="flex gap-4 p-4 bg-white border border-pink-50 rounded-2xl shadow-sm hover:border-pink-200 transition-colors"><div className="flex-shrink-0 w-8 h-8 bg-[#960C14] text-white rounded-full flex items-center justify-center font-bold text-sm">{i+1}</div><p className="text-sm text-gray-600 leading-relaxed pt-1">{step}</p></div>))}</div>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-pink-100 pt-8">
                <h4 className="text-xl font-bold text-[#4B110D] mb-6 flex items-center gap-2"><span>💬</span> Ulasan Komunitas</h4>
                {user ? (
                  <div className="bg-pink-50/50 p-6 rounded-[30px] mb-8">
                    <p className="text-sm font-bold text-gray-700 mb-3">Bagaimana menurutmu?</p>
                    <div className="flex gap-2 mb-4">{[1,2,3,4,5].map(s => (<button key={s} onClick={() => setUserRating(s)} className={`text-3xl transition-transform hover:scale-110 ${s <= userRating ? "text-yellow-400" : "text-gray-300"}`}>★</button>))}</div>
                    <textarea placeholder="Tulis pendapat jujurmu disini..." className="w-full h-24 p-4 bg-white border border-pink-100 rounded-2xl outline-none focus:ring-2 focus:ring-pink-200 text-sm text-gray-700 resize-none mb-4" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                    <button onClick={handleSendFeedback} disabled={sendingFeedback} className="w-full py-3 bg-[#960C14] text-white font-bold rounded-xl shadow-md hover:bg-[#7a0a10] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">{sendingFeedback ? "Mengirim..." : "Kirim Ulasan ✨"}</button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-[20px] border border-gray-200 mb-8 text-center"><span className="text-2xl block mb-2">🔒</span><p className="text-gray-500 text-sm">Silakan login terlebih dahulu untuk memberikan ulasan.</p></div>
                )}
                
                <div className="space-y-4">
                  {recipeFeedbacks.length > 0 ? (
                    recipeFeedbacks.sort((a,b) => b.createdAt - a.createdAt).map((fb) => (
                      <div key={fb.id} className="p-5 bg-white border border-pink-50 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div><p className="text-sm font-bold text-[#960C14]">{fb.userName}</p><span className="text-[10px] text-gray-400">{fb.createdAt instanceof Date ? fb.createdAt.toLocaleDateString() : "Baru saja"}</span></div>
                            <div className="flex text-yellow-400 text-xs">{"★".repeat(fb.rating)}<span className="text-gray-200">{"★".repeat(5 - fb.rating)}</span></div>
                        </div>
                        <p className="text-sm text-gray-600 italic">"{fb.comment}"</p>
                      </div>
                    ))
                  ) : (<div className="text-center py-8 opacity-60"><p className="text-gray-400 text-sm italic">Belum ada ulasan. Jadilah yang pertama mereview! 🥇</p></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resep;