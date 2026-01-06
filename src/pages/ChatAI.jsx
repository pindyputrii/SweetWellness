import React, { useState, useEffect, useRef } from "react";
// HAPUS import GoogleGenerativeAI karena sudah dipindah ke backend
import { db, auth } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ChatAI = () => {
  const navigate = useNavigate();
  
  // State
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Halo! 👋 Saya asisten nutrisi SweetWellness.\nSaya sudah menganalisis profil kesehatan Anda. Mau cari resep apa hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [recipeContext, setRecipeContext] = useState("");
  
  const messagesEndRef = useRef(null);

  // --- DATA FETCHING (FIREBASE) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            alert("Data kesehatan tidak ditemukan. Mohon lengkapi profil Anda terlebih dahulu.");
            navigate("/register", { 
              state: { 
                email: user.email, 
                uid: user.uid, 
                fullName: user.displayName 
              } 
            });
            return;
          }

          const recipeSnapshot = await getDocs(collection(db, "recipes"));
          const recipesString = recipeSnapshot.docs
            .map((doc) => {
              const r = doc.data();
              return `- ${r.title} (${r.calories} kcal) [${r.tags?.join(", ")}] Bahan: ${r.ingredients?.join(", ")}`;
            })
            .join("\n");
          setRecipeContext(recipesString);
        } catch (error) {
          console.error("Gagal memuat data:", error);
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- FUNGSI KIRIM PESAN (UPDATE UTAMA) ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userProfile) return;

    // 1. Tampilkan pesan user di UI
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    try {
      // 2. Panggil Backend API kita (bukan Google langsung)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          userProfile: userProfile,
          recipeContext: recipeContext // Kirim konteks resep ke server
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal mengambil respon");

      // 3. Tampilkan balasan AI
      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "model", text: "Maaf, koneksi sedang sibuk. Coba lagi ya! 😥" }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    return text.split("\n").map((line, i) => (
      <span key={i} className="block min-h-[1.2em]">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => 
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-bold text-[#4B110D]">{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )}
      </span>
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFF5F5] font-sans pt-16">
      {/* HEADER */}
      <div className="fixed top-0 w-full mt-12 bg-white shadow-sm px-6 py-4 flex items-center gap-4 z-20 border-b border-pink-100">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#960C14] to-[#E27E75] flex items-center justify-center text-white text-2xl shadow-md">
            🤖
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h1 className="font-bold text-[#4B110D] text-lg leading-tight">AI Nutritionist</h1>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {userProfile ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                Terhubung dengan data {userProfile.fullName}
              </>
            ) : (
              "Menghubungkan data..."
            )}
          </p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-0 space-y-3 scroll-smooth custom-scrollbar">
        <div className="text-center text-xs text-gray-400 my-4">Hari Ini</div>
        {messages.map((msg, index) => (
          <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${msg.role === "user" ? "bg-[#960C14] text-white rounded-br-none" : "bg-white text-gray-700 border border-gray-100 rounded-bl-none"}`}>
              {formatMessage(msg.text)}
              <div className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3 bg-gray-50 p-2 rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-pink-200 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={userProfile ? "Tanya resep rendah kalori..." : "Tunggu sebentar..."}
            disabled={loading || !userProfile}
            className="flex-1 bg-transparent px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />
          <button type="submit" disabled={loading || !input.trim()} className="bg-[#960C14] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#7a0a10] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md transform active:scale-95">
            {loading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>}
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-2">AI dapat membuat kesalahan. Periksa kembali informasi resep.</p>
      </div>
    </div>
  );  
};

export default ChatAI;