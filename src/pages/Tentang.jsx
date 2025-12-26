import React from "react";
import { Link } from "react-router-dom"; // 1. Import Link dari react-router-dom

const Tentang = () => {
  return (
    // Div terluar dengan background pink muda (#FCECEB) untuk efek full-width
    <div className="flex-1 min-h-screen bg-[#FCECEB]">
      
      {/* --- Header Section (Tetap Terpusat di MAX-W) --- */}
      <div className="max-w-7xl mx-auto px-7">
        <div className="pt-20 pb-10 text-center">
          <h1 className="text-5xl font-bold text-[#4B110D] mb-4">
            Tentang SweetWellness
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Nikmati kelezatan dessert tanpa rasa bersalah. Kami menghadirkan dessert sehat
            yang tidak hanya lezat, tetapi juga baik untuk tubuh Anda.
          </p>
        </div>
      </div>
      
      {/* --- 1. Cerita Kami (FULL-WIDTH CARD PUTIH) --- */}
      <div className="mt-16 bg-white py-12 shadow-lg"> {/* <-- BG PUTIH FULL-WIDTH */}
        <div className="max-w-7xl mx-auto px-7"> {/* <-- Konten dibatasi di tengah */}
          <div className="flex flex-col md:flex-row items-center gap-12">

            {/* Teks Cerita Kami (1/2 lebar) */}
            <div className="md:w-1/2 w-full space-y-6 order-2 md:order-1">
              <h2 className="text-3xl font-bold text-[#4B110D] mb-4">
                Cerita Kami
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                SweetWellness lahir dari keinginan sederhana: menciptakan dessert yang tidak membuat kita
                merasa bersalah setelah menikmatinya. Kami percaya bahwa hidup sehat tidak berarti harus
                mengorbankan kebahagiaan.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Dengan menggunakan bahan-bahan alami, pemanis sehat, dan resep yang telah dikembangkan dengan
                cermat, kami menghadirkan dessert yang tidak hanya memanjakan lidah, tetapi juga memberikan
                nutrisi yang dibutuhkan tubuh.
              </p>
              <div className="flex items-center space-x-2 text-lg text-gray-700 font-medium pt-2">
                <span className="text-2xl text-[#960C14]">✓</span>
                <span>Dibuat dengan Cinta & Kesehatan</span>
              </div>
            </div>

            {/* Gambar Cerita Kami (1/2 lebar) */}
            <div className="md:w-1/2 w-full flex justify-center order-1 md:order-2">
              <img
                src="./img/tentang/about.png" // Placeholder
                alt="Woman eating healthy dessert"
                className="w-full max-w-md h-auto object-cover rounded-3xl shadow-lg"
              />
            </div>

          </div>
        </div>
      </div>

      {/* --- Konten yang tersisa (DI DALAM MAX-W lagi) --- */}
      <div className="max-w-7xl mx-auto px-7">
        
        {/* --- 2. Nilai-Nilai Kami --- */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-[#4B110D] mb-10">
            Nilai-Nilai Kami
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Komitmen kami terhadap kesehatan dan kelezatan tercermin dalam setiap
            aspek resep kami
          </p>

          {/* Grid Nilai-Nilai */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Nilai 1: 100% Natural */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-4xl text-[#960C14] mb-3">🌱</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">100% Natural</h3>
              <p className="text-gray-600 text-sm">
                Semua yang kami gunakan adalah bahan alami tanpa pemanis buatan atau pewarna sintetis
              </p>
            </div>
            
            {/* Nilai 2: Rendah Gula */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-4xl text-[#960C14] mb-3">🍎</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Rendah Gula</h3>
              <p className="text-gray-600 text-sm">
                Menggunakan pemanis alami meski fruit untuk menjaga kadar gula tetap rendah tanpa mengurangi rasa manisnya.
              </p>
            </div>
            
            {/* Nilai 3: Rasa Premium */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-4xl text-[#960C14] mb-3">⭐</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Rasa Premium</h3>
              <p className="text-gray-600 text-sm">
                Tidak mengurangi kualitas rasa, dessert kami akan memberikan pengalaman yang memanjakan.
              </p>
            </div>
          </div>
        </div>

        {/* --- 3. Misi Kami (Visual) --- */}
        <div className="mt-24 flex flex-col md:flex-row items-center gap-12">
          
          {/* Gambar Misi Kami */}
          <div className="md:w-1/2 w-full flex justify-center">
            <img
              src="./img/tentang/misi.png" // Placeholder
              alt="Small cakes with fruits"
              className="w-full max-w-md h-auto object-cover rounded-3xl shadow-lg"
            />
          </div>

          {/* Teks Misi Kami */}
          <div className="md:w-1/2 w-full space-y-4 pt-8 md:pt-0">
            <h2 className="text-3xl font-bold text-[#4B110D] mb-4">
              Misi Kami
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Mengubah persepsi bahwa dessert sehat itu tidak enak. Berkomitmen untuk menghadirkan
              resep-resep yang memadukan rasa lezat dengan manfaat kesehatan.
            </p>
            <div className="space-y-2 pt-3">
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="text-xl text-[#960C14]">✓</span>
                <span>Menyediakan resep dessert sehat yang tetap nikmat</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="text-xl text-[#960C14]">✓</span>
                <span>Mendukung gaya hidup sehat tanpa mengurangi kenikmatan</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="text-xl text-[#960C14]">✓</span>
                <span>Menggunakan bahan-bahan alami dan berkualitas tinggi</span>
              </div>
            </div>
          </div>
        </div>
      </div> {/* Penutup Container Utama Max-W */}
      
      {/* --- 4. Call to Action (CTA) --- */}
      {/* Background full-width merah/coklat gelap */}
      <div className="bg-[#A92418] mt-24 py-16 text-white text-center">
        <div className="max-w-7xl mx-auto px-7">
          <h2 className="text-4xl font-bold mb-4">
            Siap Menikmati Dessert Tanpa Rasa Bersalah?
          </h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Bergabunglah dengan ribuan pembaca yang sudah mencoba dan menikmati resep dessert sehat kami.
          </p>
          
          {/* 2. UBAH DI SINI: Menggunakan Link component */}
          <Link
            to="/resep" 
            className="inline-block bg-white text-[#4B110D] font-bold px-8 py-3 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
          >
            Lihat Resep Kami
          </Link>

        </div>
      </div>

    </div>
  );
};

export default Tentang;