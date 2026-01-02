import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Keamanan: Hanya izinkan method POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // 2. Ambil API Key dari Environment Variable (Sisi Server)
  // Pastikan di Vercel/File .env namanya GEMINI_API_KEY (tanpa VITE_)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key tidak terkonfigurasi di server." });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt kosong." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Sesuaikan model dengan yang kamu inginkan
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 3. Kirim hasil kembali ke Frontend
    return res.status(200).json({ text });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ 
      error: "Terjadi kesalahan pada server AI",
      details: error.message 
    });
  }
}