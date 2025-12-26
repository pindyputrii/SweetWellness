import React, { useState } from "react";

const Edukasi = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const artikelList = [
    {
      id: 1,
      img: "/img/edukasi/Alternatif.png",
      tag: "Bahan Alami",
      title: "Alternatif Gula Alami untuk Dessert",
      desc: "Samarkan berbagai pengganti gula yang lebih sehat tanpa mengurangi rasa manis dan gudang rasa alami.",
      content:
        "Gula pasir seringkali menjadi musuh utama dalam diet sehat. Namun, membuat dessert tanpa rasa manis tentu kurang nikmat. Cobalah menggunakan Stevia, Madu, atau Sirup Maple murni. Stevia memiliki nol kalori dan tidak menaikkan gula darah. Sementara madu mengandung antioksidan yang baik. Pastikan takarannya disesuaikan karena pemanis alami seringkali lebih manis daripada gula biasa.",
    },
    {
      id: 2,
      img: "/img/edukasi/Baking.png",
      tag: "Teknik",
      title: "Teknik Memanggang Sehat",
      desc: "Pelajari cara memanggang dessert dengan mengurangi lemak dan gula, namun tetap lezat.",
      content:
        "Memanggang sehat bukan berarti menghilangkan rasa. Salah satu triknya adalah mengganti mentega (butter) dengan saus apel (applesauce) atau yogurt yunani (greek yogurt) untuk menjaga kelembapan kue tanpa lemak jenuh berlebih. Selain itu, gunakan kertas roti (parchment paper) agar tidak perlu mengolesi loyang dengan minyak atau mentega tambahan.",
    },
    {
      id: 3,
      img: "/img/edukasi/Protein.png",
      tag: "Nilai Gizi",
      title: "Menambah Protein dalam Dessert",
      desc: "Cara kreatif meningkatkan kandungan protein dessert untuk nutrisi yang lebih seimbang.",
      content:
        "Dessert biasanya kaya karbohidrat dan lemak. Untuk menyeimbangkannya, tambahkan bubuk protein (whey/plant-based) ke dalam adonan pancake atau muffin Anda. Anda juga bisa menggunakan kacang-kacangan, selai kacang alami, atau tahu sutra (silken tofu) ke dalam mousse cokelat untuk tekstur creamy sekaligus asupan protein tinggi.",
    },
  ];

  const closeModal = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="flex-1 mt-10 min-h-screen relative">
      <div className="max-w-7xl mx-auto px-7">
        {/* ============================= */}
        {/* 1. HEADER EDUKASI DESSERT SEHAT */}
        {/* ============================= */}
        <div className="flex flex-col relative md:flex-row items-center gap-10 py-10 pt-20">
          <div className="md:w-5/12 w-full space-y-3">
            <h1 className="text-5xl font-extrabold text-[#960C14]">
              Edukasi Dessert Sehat
            </h1>
            <p className="text-lg text-gray-700">
              Pelajari cara membuat dessert lezat yang tetap menyehatkan dari
              tips memilih bahan hingga teknik memasak yang tepat
            </p>
          </div>
          <div className="md:w-1/2 absolute right-[-80px] w-full">
            <img
              src="/img/edukasi/Edukasi.png"
              alt="Edukasi Dessert"
              className="w-[72%] h-auto object-cover rounded-3xl shadow-lg"
            />
          </div>
        </div>

        {/* ============================= */}
        {/* 2. KATEGORI PEMBELAJARAN */}
        {/* ============================= */}
        <div className="mt-25 text-center">
          <h2 className="text-4xl font-bold text-[#960C14] mb-10">
            Kategori Pembelajaran
          </h2>
          <p className="text-lg text-[#994433] mb-8">
            Pilih topik yang ingin Anda pelajari untuk membuat dessert sehat yang
            lezat
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl text-[#960C14] mb-3">🌿</div>
              <h3 className="text-xl font-bold text-gray-800">Bahan Alami</h3>
              <p className="text-gray-600 mt-2">
                Pelajari bahan-bahan alami untuk dessert sehat
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl text-[#960C14] mb-3">👩‍🍳</div>
              <h3 className="text-xl font-bold text-gray-800">Teknik Memasak</h3>
              <p className="text-gray-600 mt-2">
                Pelajari cara memasak yang mempertahankan nutrisi
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl text-[#960C14] mb-3">❤️</div>
              <h3 className="text-xl font-bold text-gray-800">Nilai Gizi</h3>
              <p className="text-gray-600 mt-2">
                Pahami kandungan nutrisi dalam dessert
              </p>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* 3. ARTIKEL TERPOPULER */}
        {/* ============================= */}
        <div className="mt-20">
          <h2 className="text-4xl font-bold text-center text-[#960C14] mb-3">
            Artikel Terpopuler
          </h2>
          <p className="text-lg text-[#994433] text-center mb-10">
            Pelajari tips dan trik dari ahli dessert sehat
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {artikelList.map((artikel) => (
              <div
                key={artikel.id}
                className="bg-[#A92418] rounded-3xl overflow-hidden shadow-xl flex flex-col h-full"
              >
                <div className="h-48 w-full">
                  <img
                    src={artikel.img}
                    alt={artikel.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-[#A92418] flex flex-col flex-grow">
                  <span className="bg-[#FFD0CE] text-xs font-bold px-2 py-1 rounded-full inline-block w-fit mb-3">
                    {artikel.tag}
                  </span>
                  <h3 className="text-xl text-white font-bold mb-2">
                    {artikel.title}
                  </h3>
                  <p className="text-sm text-white leading-relaxed mb-4 flex-grow text-justify">
                    {artikel.desc}
                  </p>
                  
                  <button
                    onClick={() => setSelectedArticle(artikel)}
                    className="bg-white text-[#4B110D] font-bold px-4 py-2 rounded-full text-sm self-start mt-auto hover:bg-gray-100 transition-colors"
                  >
                    Baca Selengkapnya
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================= */}
        {/* 4. TIPS HARIAN */}
        {/* ============================= */}
        <div className="mt-20 py-10">
          <h2 className="text-4xl font-bold text-center text-[#960C14] mb-3">
            Tips Harian
          </h2>
          <p className="text-lg text-[#994433] text-center mb-10">
            Tips praktis yang bisa langsung dalam pembuatan dessert sehat
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#FFD1D1] rounded-3xl p-8 flex items-start gap-6 shadow-md">
              <div className="text-4xl text-[#8B1E1E]">🌾</div>
              <div>
                <h3 className="text-xl font-bold text-[#8B1E1E] mb-2">
                  Ganti tepung putih
                </h3>
                <p className="text-[#8B1E1E]">
                  Gunakan tepung almond atau oat untuk tekstur yang lebih sehat
                  dan kandungan serat tinggi.
                </p>
              </div>
            </div>
            <div className="bg-[#FFD1D1] rounded-3xl p-8 flex items-start gap-6 shadow-md">
              <div className="text-4xl text-[#8B1E1E]">🥄</div>
              <div>
                <h3 className="text-xl font-bold text-[#8B1E1E] mb-2">
                  Porsi kecil
                </h3>
                <p className="text-[#8B1E1E]">
                  Buat dessert dalam porsi kecil untuk mengontrol asupan kalori
                  dan gula harian.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* 5. MODAL POPUP COMPONENT */}
      {/* ============================= */}
      {selectedArticle && (
        // PERUBAHAN DISINI: Mengganti bg-black menjadi backdrop-blur dan warna terang
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-md transition-opacity">
          
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn border border-gray-100">
            
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full p-2 w-10 h-10 flex items-center justify-center font-bold z-10 transition-colors"
            >
              ✕
            </button>

            <div className="h-64 w-full relative">
              <img
                src={selectedArticle.img}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                 <span className="bg-[#A92418] text-white px-3 py-1 rounded-full text-sm font-bold">
                    {selectedArticle.tag}
                 </span>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-3xl font-extrabold text-[#960C14] mb-4">
                {selectedArticle.title}
              </h2>
              
              <div className="prose prose-lg text-gray-700 leading-relaxed text-justify">
                <p className="mb-4 font-semibold text-gray-500">
                    {selectedArticle.desc}
                </p>
                <hr className="my-4 border-gray-200"/>
                <p>
                    {selectedArticle.content}
                </p>
                <p className="mt-4">
                    Selamat mencoba dan nikmati dessert sehatmu!
                </p>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                    onClick={closeModal}
                    className="bg-[#960C14] text-white font-bold py-2 px-6 rounded-full hover:bg-[#7a0a10] transition-colors"
                >
                    Tutup Artikel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Edukasi;