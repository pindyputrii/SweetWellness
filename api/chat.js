import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Validasi Method (Hanya izinkan POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Ambil Key dari Environment Variable
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key server belum dikonfigurasi" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    // 3. Destructuring data sesuai yang dikirim frontend (ChatAI.jsx)
    const { message, userProfile, recipeContext } = req.body;

    // Validasi input minimal
    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong" });
    }

    // 4. Konstruksi Prompt dengan Konteks (Prompt Engineering)
    // Kita gabungkan data profil dan resep agar AI menjadi pintar
    const promptKonteks = `
      Kamu adalah AI Nutritionist profesional untuk aplikasi "SweetWellness".
      
      PROFIL PENGGUNA:
      - Nama: ${userProfile?.fullName || 'User'}
      - Gender: ${userProfile?.gender || 'Tidak disebutkan'}
      - Berat Badan: ${userProfile?.weight || '-'} kg
      - Tinggi Badan: ${userProfile?.height || '-'} cm
      - Aktivitas: ${userProfile?.activity || 'Sedenter'}

      DAFTAR RESEP TERSEDIA (Hanya gunakan resep ini jika merekomendasikan):
      ${recipeContext || 'Tidak ada resep tersedia di database saat ini.'}

      TUGAS:
      Berikan jawaban yang ramah, personal, dan informatif berdasarkan data profil di atas. 
      Jika pengguna bertanya tentang resep, arahkan ke resep yang ada di daftar di atas yang sesuai dengan profil mereka.

      PERTANYAAN USER: 
      "${message}"
    `;

    // 5. Kirim prompt yang sudah lengkap ke Google Gemini
    const result = await model.generateContent(promptKonteks);
    const response = await result.response;
    const text = response.text();

    // 6. Kembalikan respon ke frontend
    res.status(200).json({ text });

  } catch (error) {
    console.error("Server Error Details:", error);
    res.status(500).json({ error: "Gagal memproses permintaan AI. Pastikan API Key valid." });
  }
}