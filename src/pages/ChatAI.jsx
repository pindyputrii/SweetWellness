import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

  // --- API & DATA FETCHING (LOGIC SAMA, UI BEDA) ---
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) setUserProfile(userDoc.data());

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userProfile) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    try {
      const prompt = `
        Bertindaklah sebagai Ahli Gizi Profesional SweetWellness.
        User: ${userProfile.fullName}, Tujuan: ${userProfile.goal}, Alergi: ${userProfile.allergy}, Diet: ${userProfile.diet}.
        
        DATABASE RESEP KITA:
        ${recipeContext}
        
        TUGAS:
        Jawab pertanyaan user: "${input}".
        Rekomendasikan resep dari database di atas yang cocok dengan profil user. Jelaskan kenapa cocok.
        Gunakan format bullet points dan emoji agar menarik.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "model", text }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", text: "Maaf, koneksi terputus. Coba lagi ya! 😥" }]);
    } finally {
      setLoading(false);
    }
  };

  // Formatter Text (Bold & Newline)
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
    <div className="flex flex-col h-screen bg-[#FFF5F5] font-sans pt-16"> {/* pt-16 untuk kompensasi Navbar Fixed */}
      
      {/* 1. HEADER CHAT (FIXED) */}
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

      {/* 2. CHAT AREA (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto px-4 py-0 space-y-3 scroll-smooth custom-scrollbar">
        {/* Intro Date */}
        <div className="text-center text-xs text-gray-400 my-4">Hari Ini</div>

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${
                msg.role === "user"
                  ? "bg-[#960C14] text-white rounded-br-none"
                  : "bg-white text-gray-700 border border-gray-100 rounded-bl-none"
              }`}
            >
              {formatMessage(msg.text)}
              {/* Timestamp Dummy */}
              <div className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator (Typing...) */}
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

      {/* 3. INPUT AREA (STICKY BOTTOM) */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={handleSend}
          className="max-w-4xl mx-auto flex items-center gap-3 bg-gray-50 p-2 rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-pink-200 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={userProfile ? "Tanya resep rendah kalori..." : "Tunggu sebentar..."}
            disabled={loading || !userProfile}
            className="flex-1 bg-transparent px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#960C14] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#7a0a10] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md transform active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          AI dapat membuat kesalahan. Periksa kembali informasi resep.
        </p>
      </div>
    </div>
  );
};

export default ChatAI;