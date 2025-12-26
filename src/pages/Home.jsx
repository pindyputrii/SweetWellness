import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  where
} from "firebase/firestore";

const Home = () => {
  // --- STATE USER ---
  const [currentUser, setCurrentUser] = useState(null);
  
  // --- STATE RESEP POPULER (TOP RATED - DYNAMIC) ---
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Modal
  const [popPage, setPopPage] = useState(1);
  const itemsPerPage = 3;

  // --- STATE ULASAN KOMUNITAS ---
  const [reviews, setReviews] = useState([]);
  const [inputComment, setInputComment] = useState("");
  const [loadingReview, setLoadingReview] = useState(false);

  // 1. MONITOR AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  // 2. FETCH DATA RESEP & HITUNG RATING (LOGIKA BARU)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil resep yang approved
        const recipesQ = query(collection(db, "recipes"), where("status", "==", "approved"));
        const recipesSnap = await getDocs(recipesQ);
        const recipesData = recipesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Dengarkan update rating dari feedbacks
        const unsubscribeFeedback = onSnapshot(collection(db, "feedbacks"), (snapshot) => {
          const ratingsMap = {};
          snapshot.docs.forEach(doc => {
            const { recipeId, rating } = doc.data();
            if (recipeId && rating) {
              if (!ratingsMap[recipeId]) ratingsMap[recipeId] = { total: 0, count: 0 };
              ratingsMap[recipeId].total += Number(rating);
              ratingsMap[recipeId].count += 1;
            }
          });

          const recipesWithRating = recipesData.map(recipe => {
            const stats = ratingsMap[recipe.id];
            const avgRating = stats ? (stats.total / stats.count) : 0;
            const reviewCount = stats ? stats.count : 0;
            return { ...recipe, averageRating: avgRating, reviewCount };
          });

          // Urutkan Rating Tertinggi ke Terendah
          const sortedRecipes = recipesWithRating.sort((a, b) => b.averageRating - a.averageRating);
          
          setPopularRecipes(sortedRecipes);
          setLoadingRecipes(false);
        });

        return () => unsubscribeFeedback();
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingRecipes(false);
      }
    };
    fetchData();
  }, []);

  // 3. FETCH ULASAN WEBSITE
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 4. KIRIM ULASAN WEBSITE (DENGAN PERBAIKAN ALERT)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!inputComment.trim()) return alert("Tuliskan sesuatu sebelum mengirim.");

    setLoadingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        name: currentUser.displayName || "Pengguna SweetWellness",
        comment: inputComment,
        uid: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      
      setInputComment("");
      alert("Terima kasih! Ulasanmu berhasil dikirim. 🎉"); // Feedback Sukses

    } catch (error) {
      console.error("Gagal mengirim ulasan:", error);
      alert(`Gagal mengirim ulasan: ${error.message}`); // Feedback Gagal
    } finally {
      setLoadingReview(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Baru saja";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  // Pagination Logic
  const indexOfLast = popPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPopular = popularRecipes.slice(indexOfFirst, indexOfLast);
  const totalPopPages = Math.ceil(popularRecipes.length / itemsPerPage);

  return (
    <div className="flex-1 min-h-screen pt-20">
      
      {/* --- HERO SECTION --- */}
      <div className="max-w-7xl mx-auto px-7">
        <div className="max-w-7xl flex items-center mx auto px-7">
          <div className="md:w-1/2 w-full text-[#960C14] space-y-4 relative">
            <h1 className="text-5xl font-bold md:pr-10 pr-0 md:mt-18 mt-6">
              Dessert Manis, Lebih Sehat <br /> Tanpa Rasa Bersalah{" "}
            </h1>
            <p className="text-lg pr-[120px] pb-10">
              Kami percaya dessert adalah bagian dari kebahagiaan. Jika Anda mau
              cari dessert yang benar-benar enak, sehat, dan ramah untuk segala
              kondisi—dari alergi hingga diet ketat—tidak perlu mencari lagi.
              Cuma di SweetWellness Anda akan menemukan segalanya di sini.
            </p>
            {currentUser ? (
              <Link to="/chat-ai" className="bg-[#960C14] text-white px-8 py-3 rounded-full text-sm font-bold shadow-md hover:bg-[#7a0a10] transition-all flex items-center gap-2 w-fit">
                <span>✨</span> Gunakan Fitur AI
              </Link>
            ) : (
              <Link to="/login" className="bg-[#960C14] text-white px-8 py-3 rounded-full text-sm font-bold shadow-md hover:bg-[#7a0a10] transition-all w-fit inline-block">
                Login untuk fitur AI
              </Link>
            )}
          </div>
          <div className=" md:w-1/2 w-full absolute right-0">
            <img src="./img/home/eskrim-hero.png" alt="" />
          </div>
        </div>

        {/* --- SECTION RESEP TERPOPULER (DYNAMIC) --- */}
        <div className="mt-[100px] text-center">
          <h1 className="text-center text-[#960C14] text-5xl mb-4 font-bold">
            Resep Terpopuler
          </h1>
          <p className="text-lg text-[#994433]">
            Manis alami yang terasa hangat hingga gigitan terakhir.
          </p>
        </div>

        {loadingRecipes ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#960C14]"></div></div>
        ) : (
          <>
            <div className="grid grid-cols-1 mt-6 md:grid-cols-3 gap-8">
              {currentPopular.map((recipe) => (
                <div 
                  key={recipe.id} 
                  onClick={() => setSelectedRecipe(recipe)} // BUKA MODAL
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="h-48 w-full relative">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      onError={(e)=>{e.target.src="https://via.placeholder.com/300?text=No+Image"}}
                    />
                    {/* Badge Rating Dinamis */}
                    <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#960C14] shadow-sm backdrop-blur-sm">
                        ⭐ {recipe.averageRating ? recipe.averageRating.toFixed(1) : "New"}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-yellow-100 text-yellow-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {recipe.category}
                      </span>
                      <div className="flex items-center gap-1 text-gray-700 font-bold text-sm">
                        <span className="text-yellow-400">★</span> {recipe.averageRating ? recipe.averageRating.toFixed(1) : "0"}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                      {recipe.desc}
                    </p>
                    <div className="flex items-center gap-6 text-gray-400 text-sm font-medium">
                      <div className="flex items-center gap-2">🕒 {recipe.time} min</div>
                      <div className="flex items-center gap-2">🔥 {recipe.calories || "-"} kcal</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPopPages > 1 && (
              <div className="flex justify-center items-center mt-10 gap-4">
                <button 
                  onClick={() => setPopPage(prev => Math.max(prev - 1, 1))}
                  disabled={popPage === 1}
                  className="w-10 h-10 rounded-full border border-[#960C14] text-[#960C14] hover:bg-[#960C14] hover:text-white transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#960C14]"
                >
                  &lt;
                </button>
                <span className="font-bold text-[#960C14]">
                  {popPage} / {totalPopPages}
                </span>
                <button 
                  onClick={() => setPopPage(prev => Math.min(prev + 1, totalPopPages))}
                  disabled={popPage === totalPopPages}
                  className="w-10 h-10 rounded-full border border-[#960C14] text-[#960C14] hover:bg-[#960C14] hover:text-white transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#960C14]"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}

        {/* --- KATEGORI DESSERT --- */}
        <div className="mt-20">
          <h1 className="text-center font-bold text-5xl text-[#960C14]">
            Kategori Dessert
          </h1>
          <div className="grid grid-cols-4 gap-4 mt-10">
            {[
                {img: "rendah-gula.png", label: "Rendah Gula"},
                {img: "bebas-gluten.png", label: "Bebas Gluten"},
                {img: "vegan.png", label: "Keto"},
                {img: "tinggi-serat.png", label: "Tinggi Serat"}
            ].map((item, idx) => (
                <div key={idx} className="bg-[#FFD1D1] rounded-[30px] md:rounded-[40px] aspect-square flex flex-col justify-center items-center text-[#8B1E1E] transition-transform duration-300 hover:scale-105 cursor-pointer p-3 md:p-4">
                    <img src={`./img/home/${item.img}`} className="md:w-[130px] object-contain" alt={item.label} />
                    <h3 className="text-base md:text-2xl font-bold text-center mt-2">{item.label}</h3>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION KENAPA SWEETWELLNESS (STATIC) --- */}
      <div className="bg-[#E27E75] min-h-screen w-full mt-20">
        <div className="max-w-7xl mx-auto px-7">
          <section className="px-4 md:px-0">
            <h1 className="font-bold pt-20 text-4xl md:text-5xl text-[#4B110D] text-center mt-10 md:mt-0">
              Kenapa sweetwellness?
            </h1>
            <div className="flex flex-col md:flex-row mt-10 md:mt-20">
              <div className="w-full md:w-1/2 flex justify-center mb-10 md:mb-[120px]">
                <img
                  src="./img/home/cewe.png"
                  className="w-[280px] md:w-[400px] h-auto object-contain"
                  alt="Woman enjoying dessert"
                />
              </div>

              <div className="w-full md:w-1/2 px-2 md:px-0">
                <p className="text-lg md:text-2xl font-medium text-[#621A14] text-center md:text-left leading-relaxed">
                  SweetWellness membantu Anda memahami kebutuhan nutrisi harian
                  dengan mudah. Dapatkan informasi kalori, gula, dan komposisi
                  gizi dari setiap dessert, sehingga Anda bisa menikmati makanan
                  manis sambil tetap menjaga kesehatan. Semua rekomendasi
                  disesuaikan dengan preferensi dan pola makan Anda.
                </p>

                <p className="text-center md:text-left mt-8 md:mt-10">
                  <a
                    href="/Tentang"
                    className="inline-block bg-white text-[#621A14] font-bold px-8 py-3 rounded-full shadow-sm hover:shadow-md transition-all text-sm md:text-base"
                  >
                    Baca Selengkapnya
                  </a>
                </p>
              </div>
            </div>
          </section>

         
        </div>
      </div>

      {/* --- SECTION ULASAN WEBSITE --- */}
      <div className="w-full bg-[#FFF5F5] py-16 px-4">
        <div className="max-w-7xl mx-auto rounded-[30px] overflow-hidden shadow-xl border border-gray-100">
          <div className="flex flex-col md:flex-row h-auto md:h-[600px]">
            {/* Feed Ulasan */}
            <div className="w-full md:w-1/2 bg-gray-50 flex flex-col">
              <div className="p-8 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-[#A92418]">
                  Ulasan Komunitas
                </h2>
                <p className="text-sm text-gray-500">
                  Lihat apa kata mereka tentang resep kami.
                </p>
              </div>
              <div className="p-8 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#FFE4E4] text-[#A92418] flex items-center justify-center font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{review.name}</h4>
                        <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="w-full md:w-1/2 bg-[#A92418] p-8 md:p-12 flex flex-col justify-center text-white">
              {currentUser ? (
                <div className="animate-fade-in">
                  <h2 className="text-3xl font-bold mb-2">Halo, {currentUser.displayName}!</h2>
                  <p className="text-white/80 mb-8 text-sm">Bagikan pengalamanmu.</p>
                  <form onSubmit={handleReviewSubmit} className="space-y-5">
                    <textarea 
                        rows="4" 
                        value={inputComment} 
                        onChange={(e) => setInputComment(e.target.value)} 
                        placeholder="Tulis ulasan website..." 
                        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 focus:outline-none border border-white/20 resize-none"
                    ></textarea>
                    <button type="submit" disabled={loadingReview} className="w-full bg-white text-[#A92418] font-bold py-4 rounded-xl hover:bg-gray-100 transition disabled:opacity-50">
                        {loadingReview ? "Mengirim..." : "Kirim Ulasan"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="text-6xl">🔒</div>
                  <h2 className="text-3xl font-bold">Ingin berbagi ulasan?</h2>
                  <Link to="/login" className="inline-block bg-white text-[#A92418] font-bold py-3 px-10 rounded-xl hover:bg-gray-100 transition shadow-lg">Login Sekarang</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- POP-UP MODAL (DETAIL RESEP DARI POPULER) --- */}
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
                      <span className="bg-white/20 px-2 rounded backdrop-blur-md">⭐ {selectedRecipe.averageRating ? selectedRecipe.averageRating.toFixed(1) : "New"}</span>
                      <span>🔥 {selectedRecipe.calories || "-"} Kkal</span>
                  </div>
              </div>
            </div>
            <div className="overflow-y-auto p-8 custom-scrollbar">
                <h4 className="text-lg font-bold text-[#960C14] mb-2">Deskripsi</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">{selectedRecipe.desc}</p>
                
                <h4 className="text-lg font-bold text-[#960C14] mb-2">Bahan Utama</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                    {selectedRecipe.ingredients?.map((ing, i) => (
                        <span key={i} className="bg-pink-50 text-gray-700 px-3 py-1 rounded-full text-sm border border-pink-100">{ing}</span>
                    ))}
                </div>
                
                <div className="text-center mt-8">
                    <Link to="/resep" className="inline-block bg-[#960C14] text-white px-6 py-3 rounded-full font-bold hover:bg-[#7a0a10] transition shadow-md">
                        Lihat Detail Lengkap di Halaman Resep
                    </Link>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;