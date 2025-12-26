import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const SeedRecipes = () => {
  const [loading, setLoading] = useState(false);

  // DATA 50 RESEP DESSERT SEHAT (BAHASA INDONESIA & UNIK)
  const recipesData = [
    // --- LOW CARB (1-13) ---
    { 
      title: "Mousse Cokelat Alpukat", category: "Low Carb", tags: ["No-Bake"], calories: 180, rating: 4.8, servings: "2 Porsi", 
      desc: "Mousse cokelat super lembut tanpa susu, menggunakan lemak sehat alpukat.", 
      image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=500", 
      ingredients: ["2 Alpukat matang", "1/2 cup Bubuk Kakao", "1/3 cup Madu/Stevia", "1 sdt Vanila"], 
      instructions: ["Blender daging alpukat hingga sangat halus.", "Masukkan kakao dan pemanis.", "Dinginkan 1 jam agar set."] 
    },
    { 
      title: "Krim Ricotta Lemon", category: "Low Carb", tags: ["No-Bake"], calories: 140, rating: 4.6, servings: "2 Porsi", 
      desc: "Dessert keju ringan dengan aroma lemon yang segar.", 
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500", 
      ingredients: ["1 cup Keju Ricotta", "Parutan Kulit Lemon", "1 sdm Erythritol"], 
      instructions: ["Kocok ricotta dengan mixer hingga mengembang.", "Aduk parutan lemon.", "Sajikan dingin di gelas."] 
    },
    { 
      title: "Cheesecake Stroberi Jar", category: "Low Carb", tags: ["No-Bake"], calories: 210, rating: 4.7, servings: "2 Jar", 
      desc: "Cheesecake tanpa tepung dalam toples kaca.", 
      image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500", 
      ingredients: ["Cream Cheese", "Yogurt Greek", "Strawberry segar", "Stevia"], 
      instructions: ["Kocok cream cheese dan yogurt.", "Potong dadu strawberry.", "Susun berlapis di toples."] 
    },
    { 
      title: "Kue Kering Almond", category: "Low Carb", tags: ["Microwave Ready"], calories: 160, rating: 4.4, servings: "4 Keping", 
      desc: "Kue kering almond klasik yang renyah.", 
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500", 
      ingredients: ["1 cup Tepung Almond", "2 sdm Mentega cair", "1 sdm Pemanis"], 
      instructions: ["Campur semua bahan jadi adonan.", "Cetak bulat pipih.", "Microwave 90 detik, biarkan dingin agar keras."] 
    },
    { 
      title: "Parfait Beri Santan", category: "Low Carb", tags: ["No-Bake"], calories: 195, rating: 4.9, servings: "1 Porsi", 
      desc: "Lapisan krim santan kental dan buah beri.", 
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500", 
      ingredients: ["Santan kental dingin", "Blueberry", "Raspberry", "Vanila"], 
      instructions: ["Kocok santan dingin hingga kaku seperti whipped cream.", "Susun selang-seling dengan buah beri."] 
    },
    { 
      title: "Cokelat Batang Hitam", category: "Low Carb", tags: ["No-Bake"], calories: 170, rating: 4.5, servings: "4 Potong", 
      desc: "Cokelat batang tipis dengan taburan garam laut.", 
      image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500", 
      ingredients: ["85% Cokelat Hitam", "Garam Laut", "Kacang Almond cincang"], 
      instructions: ["Lelehkan cokelat.", "Ratakan di kertas roti.", "Tabur garam dan kacang.", "Bekukan."] 
    },
    { 
      title: "Ganache Cokelat Tahu", category: "Low Carb", tags: ["No-Bake"], calories: 150, rating: 4.2, servings: "2 Porsi", 
      desc: "Ganache cokelat vegan dari tahu sutra.", 
      image: "https://images.unsplash.com/photo-1516919549054-e08258825f80?w=500", 
      ingredients: ["Tahu Sutra", "Bubuk Kakao", "Sirup Maple sugar-free"], 
      instructions: ["Blender tahu hingga halus.", "Campur kakao dan sirup.", "Dinginkan hingga set."] 
    },
    { 
      title: "Pecan Panggang Kayu Manis", category: "Low Carb", tags: ["Raw"], calories: 180, rating: 4.3, servings: "1 Porsi", 
      desc: "Kacang pecan manis berempah.", 
      image: "https://images.unsplash.com/photo-1536591376356-97400898864c?w=500", 
      ingredients: ["Kacang Pecan", "Putih Telur", "Kayu Manis", "Stevia"], 
      instructions: ["Kocok putih telur berbusa.", "Balut kacang.", "Sangrai di wajan anti lengket hingga harum."] 
    },
    { 
      title: "Yogurt Beku Buah", category: "Low Carb", tags: ["No-Bake"], calories: 90, rating: 4.6, servings: "1 Lembar", 
      desc: "Yogurt beku dengan topping buah.", 
      image: "https://images.unsplash.com/photo-1563841930606-67e2b64d897e?w=500", 
      ingredients: ["Yogurt Greek Plain", "Strawberry", "Kacang Pistachio"], 
      instructions: ["Ratakan yogurt di loyang.", "Tabur topping.", "Bekukan hingga keras lalu patahkan."] 
    },
    { 
      title: "Panna Cotta Vanila", category: "Low Carb", tags: ["No-Bake"], calories: 120, rating: 4.8, servings: "2 Cup", 
      desc: "Puding Italia lembut tanpa gula.", 
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500", 
      ingredients: ["Krim Encer", "Gelatin", "Biji Vanila", "Stevia"], 
      instructions: ["Panaskan krim dan vanila.", "Larutkan gelatin.", "Tuang ke cetakan dan dinginkan 4 jam."] 
    },
    { 
      title: "Busa Raspberry", category: "Low Carb", tags: ["Raw"], calories: 60, rating: 4.1, servings: "1 Porsi", 
      desc: "Busa buah ringan dan manis.", 
      image: "https://images.unsplash.com/photo-1563841930606-67e2b64d897e?w=500", 
      ingredients: ["Raspberry beku", "Putih Telur Steril", "Air Lemon"], 
      instructions: ["Blender semua bahan dengan kecepatan tinggi hingga mengembang seperti busa."] 
    },
    { 
      title: "Mousse Selai Kacang", category: "Low Carb", tags: ["No-Bake"], calories: 200, rating: 4.7, servings: "2 Porsi", 
      desc: "Mousse kacang gurih creamy.", 
      image: "https://images.unsplash.com/photo-1590080873974-9a38ca49067a?w=500", 
      ingredients: ["Cream Cheese", "Selai Kacang Tanpa Gula", "Whipped Cream"], 
      instructions: ["Kocok cream cheese dan selai.", "Lipat dengan whipped cream.", "Sajikan dingin."] 
    },
    { 
      title: "Es Loli Chia Santan", category: "Low Carb", tags: ["No-Bake"], calories: 85, rating: 4.5, servings: "4 Pops", 
      desc: "Es loli santan dan chia.", 
      image: "https://images.unsplash.com/photo-1505394033343-4edaf11211fe?w=500", 
      ingredients: ["Santan Cair", "Biji Chia", "Pemanis"], 
      instructions: ["Campur semua bahan.", "Tuang ke cetakan es.", "Bekukan."] 
    },

    // --- KETO DESSERTS (14-25) ---
    { 
      title: "Cup Selai Kacang Keto", category: "Keto", tags: ["No-Bake"], calories: 220, rating: 4.9, servings: "4 Cup", 
      desc: "Cokelat isi selai kacang ala keto.", 
      image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500", 
      ingredients: ["Cokelat Bebas Gula", "Selai Kacang", "Minyak Kelapa"], 
      instructions: ["Lelehkan cokelat di dasar cup.", "Beri isian selai.", "Tutup dengan cokelat lagi.", "Bekukan."] 
    },
    { 
      title: "Bola Kelapa Lemon", category: "Keto", tags: ["Raw"], calories: 130, rating: 4.3, servings: "10 Biji", 
      desc: "Bola energi kelapa lemon.", 
      image: "https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?w=500", 
      ingredients: ["Kelapa Parut", "Cream Cheese", "Jus Lemon"], 
      instructions: ["Campur semua bahan hingga padat.", "Bentuk bola.", "Gulingkan di kelapa parut."] 
    },
    { 
      title: "Jeli Kopi Dadu", category: "Keto", tags: ["No-Bake"], calories: 15, rating: 4.0, servings: "1 Mangkuk", 
      desc: "Jeli kopi hitam untuk teman ngemil.", 
      image: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500", 
      ingredients: ["Kopi Hitam Kuat", "Gelatin", "Stevia"], 
      instructions: ["Campur kopi panas dan gelatin.", "Tuang ke wadah kotak.", "Potong dadu setelah set."] 
    },
    { 
      title: "Kue Mug Blueberry", category: "Keto", tags: ["Microwave Ready"], calories: 190, rating: 4.6, servings: "1 Mug", 
      desc: "Kue mug hangat dengan blueberry.", 
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500", 
      ingredients: ["Tepung Kelapa", "Mentega", "Telur", "Blueberry"], 
      instructions: ["Aduk rata bahan di mug.", "Microwave 90 detik.", "Nikmati hangat."] 
    },
    { 
      title: "Es Krim Cokelat Alpukat", category: "Keto", tags: ["No-Bake"], calories: 210, rating: 4.8, servings: "2 Porsi", 
      desc: "Es krim cokelat lembut tinggi lemak.", 
      image: "https://images.unsplash.com/photo-1563841930606-67e2b64d897e?w=500", 
      ingredients: ["Alpukat beku", "Santan kental", "Kakao", "Erythritol"], 
      instructions: ["Blender semua bahan beku hingga tekstur creamy.", "Sajikan langsung."] 
    },
    { 
      title: "Bom Lemak Matcha", category: "Keto", tags: ["No-Bake"], calories: 140, rating: 4.4, servings: "8 Biji", 
      desc: "Bom lemak teh hijau.", 
      image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=500", 
      ingredients: ["Cocoa Butter", "Bubuk Matcha", "Minyak Kelapa"], 
      instructions: ["Lelehkan mentega.", "Aduk matcha.", "Tuang cetakan silikon.", "Bekukan."] 
    },
    { 
      title: "Praline Kacang Pecan", category: "Keto", tags: ["Microwave Ready"], calories: 180, rating: 4.5, servings: "6 Biji", 
      desc: "Permen kacang karamel.", 
      image: "https://images.unsplash.com/photo-1582176604856-e82296df4ec9?w=500", 
      ingredients: ["Kacang Pecan", "Mentega", "Gula Merah Keto"], 
      instructions: ["Lelehkan mentega dan gula di microwave.", "Masukkan pecan.", "Sendokkan ke kertas roti."] 
    },
    { 
      title: "Awan Krim Keju", category: "Keto", tags: ["No-Bake"], calories: 160, rating: 4.7, servings: "1 Porsi", 
      desc: "Adonan keju manis seperti awan.", 
      image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500", 
      ingredients: ["Cream Cheese", "Mentega", "Vanila"], 
      instructions: ["Kocok cream cheese dan mentega suhu ruang.", "Beri vanila.", "Makan dengan sendok."] 
    },
    { 
      title: "Stroberi Celup Cokelat", category: "Keto", tags: ["No-Bake"], calories: 100, rating: 4.9, servings: "5 Buah", 
      desc: "Stroberi celup cokelat hitam.", 
      image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500", 
      ingredients: ["Strawberry utuh", "90% Cokelat Hitam", "Minyak kelapa"], 
      instructions: ["Lelehkan cokelat.", "Celupkan buah.", "Dinginkan di kulkas."] 
    },
    { 
      title: "Kue Selai Almond", category: "Keto", tags: ["Microwave Ready"], calories: 150, rating: 4.2, servings: "2 Cookie", 
      desc: "Kue selai almond 3 bahan.", 
      image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500", 
      ingredients: ["Selai Almond", "Erythritol", "Telur"], 
      instructions: ["Aduk semua bahan.", "Bentuk bulat pipih.", "Microwave 2 menit."] 
    },
    { 
      title: "Mousse Labu Rempah", category: "Keto", tags: ["No-Bake"], calories: 175, rating: 4.6, servings: "2 Porsi", 
      desc: "Mousse labu rempah.", 
      image: "https://images.unsplash.com/photo-1476887334197-56adbf254e1a?w=500", 
      ingredients: ["Puree Labu", "Heavy Cream", "Bumbu Spekuk"], 
      instructions: ["Kocok cream hingga kaku.", "Lipat dengan labu dan bumbu."] 
    },
    { 
      title: "Puding Wijen Hitam", category: "Keto", tags: ["No-Bake"], calories: 190, rating: 4.1, servings: "2 Porsi", 
      desc: "Puding wijen hitam unik.", 
      image: "https://images.unsplash.com/photo-1517697471339-4aa32003c11a?w=500", 
      ingredients: ["Pasta Wijen Hitam", "Santan", "Gelatin"], 
      instructions: ["Masak santan dan wijen.", "Larutkan gelatin.", "Cetakan."] 
    },

    // --- GLUTEN FREE DESSERTS (26-38) ---
    { 
      title: "Kue Pisang Oat", category: "Gluten Free", tags: ["Microwave Ready"], calories: 110, rating: 4.4, servings: "4 Keping", 
      desc: "Kue pisang oat sederhana.", 
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500", 
      ingredients: ["Pisang Lumat", "Oat Bebas Gluten", "Kismis"], 
      instructions: ["Campur pisang dan oat.", "Bentuk cookie.", "Microwave 2 menit."] 
    },
    { 
      title: "Ketan Mangga (Versi Sehat)", category: "Gluten Free", tags: ["Microwave Ready"], calories: 250, rating: 4.9, servings: "1 Porsi", 
      desc: "Ketan mangga versi sehat.", 
      image: "https://images.unsplash.com/photo-1490474418645-44091ca055a8?w=500", 
      ingredients: ["Beras Ketan Putih", "Santan", "Mangga Manis"], 
      instructions: ["Masak ketan di microwave.", "Siram saus santan.", "Sajikan dengan mangga."] 
    },
    { 
      title: "Pir Panggang Kayu Manis", category: "Gluten Free", tags: ["Microwave Ready"], calories: 120, rating: 4.5, servings: "2 Porsi", 
      desc: "Pir panggang kayu manis.", 
      image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=500", 
      ingredients: ["Buah Pir", "Madu", "Kayu Manis", "Kenari"], 
      instructions: ["Belah pir, buang biji.", "Isi tengahnya dengan madu dan kenari.", "Microwave 4 menit."] 
    },
    { 
      title: "Kue Cokelat Tanpa Tepung", category: "Gluten Free", tags: ["Microwave Ready"], calories: 230, rating: 4.8, servings: "1 Potong", 
      desc: "Kue cokelat basah tanpa tepung.", 
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500", 
      ingredients: ["Cokelat Leleh", "Telur", "Mentega", "Kakao"], 
      instructions: ["Kocok telur dan gula.", "Masukkan cokelat leleh.", "Microwave 1-2 menit."] 
    },
    { 
      title: "Nachos Apel", category: "Gluten Free", tags: ["Raw"], calories: 140, rating: 4.6, servings: "1 Piring", 
      desc: "Irisan apel dengan saus.", 
      image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500", 
      ingredients: ["Apel Fuji", "Selai Kacang Cair", "Choco Chips"], 
      instructions: ["Iris tipis apel.", "Susun di piring.", "Drizzle selai kacang dan tabur cokelat."] 
    },
    { 
      title: "Persik Bakar Madu", category: "Gluten Free", tags: ["Microwave Ready"], calories: 100, rating: 4.7, servings: "2 Porsi", 
      desc: "Persik hangat madu.", 
      image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=500", 
      ingredients: ["Buah Persik", "Madu", "Yogurt"], 
      instructions: ["Belah persik.", "Oles madu.", "Microwave 2 menit.", "Sajikan dengan yogurt."] 
    },
    { 
      title: "Cokelat Quinoa", category: "Gluten Free", tags: ["No-Bake"], calories: 160, rating: 4.3, servings: "4 Keping", 
      desc: "Cokelat renyah dengan quinoa.", 
      image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500", 
      ingredients: ["Quinoa Matang", "Cokelat Hitam", "Garam Laut"], 
      instructions: ["Campur quinoa ke cokelat leleh.", "Ratakan tipis.", "Bekukan."] 
    },
    { 
      title: "Gulungan Kurma Kenari", category: "Gluten Free", tags: ["Raw"], calories: 180, rating: 4.5, servings: "6 Iris", 
      desc: "Gulungan kurma kenari klasik.", 
      image: "https://images.unsplash.com/photo-1542849959-4564ab41384b?w=500", 
      ingredients: ["Kurma Halus", "Kacang Kenari", "Kelapa"], 
      instructions: ["Pipihkan adonan kurma.", "Tabur kenari.", "Gulung dan iris."] 
    },
    { 
      title: "Lumpia Buah Segar", category: "Gluten Free", tags: ["Raw"], calories: 90, rating: 4.2, servings: "2 Gulung", 
      desc: "Lumpia buah segar transparan.", 
      image: "https://images.unsplash.com/photo-1505394033343-4edaf11211fe?w=500", 
      ingredients: ["Rice Paper", "Strawberry", "Kiwi", "Mangga"], 
      instructions: ["Basahi rice paper.", "Isi dengan potongan buah.", "Lipat seperti lumpia."] 
    },
    { 
      title: "Blueberry Yogurt Beku", category: "Gluten Free", tags: ["No-Bake"], calories: 60, rating: 4.6, servings: "1 Mangkuk", 
      desc: "Blueberry salut yogurt beku.", 
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500", 
      ingredients: ["Blueberry", "Yogurt Vanila", "Tusuk Gigi"], 
      instructions: ["Celup blueberry ke yogurt.", "Taruh di loyang.", "Bekukan 1 jam."] 
    },
    { 
      title: "Pizza Semangka", category: "Gluten Free", tags: ["Raw"], calories: 80, rating: 4.8, servings: "1 Loyang", 
      desc: "Irisan semangka dengan topping buah.", 
      image: "https://images.unsplash.com/photo-1563841930606-67e2b64d897e?w=500", 
      ingredients: ["Semangka Bulat", "Yogurt", "Beri", "Mint"], 
      instructions: ["Potong semangka melintang.", "Oles yogurt.", "Tabur beri dan potong juring."] 
    },
    { 
      title: "Pisang Karamel", category: "Gluten Free", tags: ["Microwave Ready"], calories: 150, rating: 4.4, servings: "1 Porsi", 
      desc: "Pisang karamel cepat.", 
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500", 
      ingredients: ["Pisang", "Gula Kelapa", "Kayu Manis"], 
      instructions: ["Iris pisang.", "Tabur gula.", "Microwave 1 menit hingga gula meleleh."] 
    },
    { 
      title: "Brownies Ubi Jalar", category: "Gluten Free", tags: ["Microwave Ready"], calories: 190, rating: 4.5, servings: "1 Potong", 
      desc: "Brownies ubi jalar lembut.", 
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500", 
      ingredients: ["Ubi Jalar Rebus", "Kakao", "Selai Kacang", "Maple"], 
      instructions: ["Lumatkan ubi.", "Campur bahan lain.", "Microwave 2 menit."] 
    },

    // --- HIGH FIBER DESSERTS (39-50) ---
    { 
      title: "Puding Chia Klasik", category: "High Fiber", tags: ["No-Bake"], calories: 160, rating: 4.9, servings: "1 Porsi", 
      desc: "Puding biji chia standar emas.", 
      image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=500", 
      ingredients: ["Biji Chia", "Susu Almond", "Madu"], 
      instructions: ["Aduk chia dan susu.", "Diamkan semalaman di kulkas."] 
    },
    { 
      title: "Bola Oat Kismis", category: "High Fiber", tags: ["Raw"], calories: 100, rating: 4.3, servings: "5 Biji", 
      desc: "Bola energi kismis oat.", 
      image: "https://images.unsplash.com/photo-1505394033343-4edaf11211fe?w=500", 
      ingredients: ["Oat", "Kismis", "Selai Kacang"], 
      instructions: ["Campur semua bahan.", "Bentuk bola kecil.", "Simpan dingin."] 
    },
    { 
      title: "Brownies Kacang Hitam", category: "High Fiber", tags: ["Microwave Ready"], calories: 180, rating: 4.1, servings: "1 Potong", 
      desc: "Brownies kacang hitam kaya serat.", 
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500", 
      ingredients: ["Kacang Hitam Kaleng", "Kakao", "Telur", "Madu"], 
      instructions: ["Blender kacang.", "Aduk dengan telur kakao.", "Microwave 2 menit."] 
    },
    { 
      title: "Raspberry Isi Cokelat", category: "High Fiber", tags: ["Raw"], calories: 60, rating: 4.7, servings: "10 Biji", 
      desc: "Raspberry isi cokelat chips.", 
      image: "https://images.unsplash.com/photo-1510130315332-9c362143431d?w=500", 
      ingredients: ["Raspberry Segar", "Dark Choco Chips"], 
      instructions: ["Masukkan 1 butir chip ke dalam lubang raspberry."] 
    },
    { 
      title: "Popcorn Cokelat Hitam", category: "High Fiber", tags: ["Microwave Ready"], calories: 120, rating: 4.5, servings: "1 Mangkuk", 
      desc: "Popcorn cokelat serat tinggi.", 
      image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=500", 
      ingredients: ["Jagung Popcorn", "Cokelat Leleh"], 
      instructions: ["Meletupkan jagung.", "Drizzle cokelat leleh."] 
    },
    { 
      title: "Kacang Arab Madu", category: "High Fiber", tags: ["Microwave Ready"], calories: 140, rating: 4.2, servings: "1 Porsi", 
      desc: "Kacang arab panggang manis.", 
      image: "https://images.unsplash.com/photo-1582176604856-e82296df4ec9?w=500", 
      ingredients: ["Kacang Arab", "Madu", "Kayu Manis"], 
      instructions: ["Keringkan kacang.", "Balur madu.", "Microwave 3-4 menit hingga garing."] 
    },
    { 
      title: "Edamame Cokelat", category: "High Fiber", tags: ["No-Bake"], calories: 130, rating: 4.0, servings: "1 Porsi", 
      desc: "Edamame salut cokelat.", 
      image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500", 
      ingredients: ["Edamame Kupas", "Cokelat Hitam"], 
      instructions: ["Gunakan edamame kering sangrai.", "Celup cokelat.", "Dinginkan."] 
    },
    { 
      title: "Muffin Mug Biji Rami", category: "High Fiber", tags: ["Microwave Ready"], calories: 170, rating: 4.4, servings: "1 Mug", 
      desc: "Muffin biji rami super serat.", 
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500", 
      ingredients: ["Tepung Flaxseed", "Telur", "Kayu Manis", "Stevia"], 
      instructions: ["Aduk semua di mug.", "Microwave 60 detik."] 
    },
    { 
      title: "Crumble Pir & Kenari", category: "High Fiber", tags: ["Microwave Ready"], calories: 200, rating: 4.6, servings: "1 Porsi", 
      desc: "Crumble pir cepat.", 
      image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=500", 
      ingredients: ["Pir Potong", "Oat", "Walnut", "Mentega"], 
      instructions: ["Taruh pir di bawah.", "Tabur oat walnut mentega.", "Microwave 2 menit."] 
    },
    { 
      title: "Bola Energi Plum", category: "High Fiber", tags: ["Raw"], calories: 110, rating: 4.3, servings: "8 Biji", 
      desc: "Bola energi plum kering.", 
      image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500", 
      ingredients: ["Plum Kering", "Almond", "Kelapa"], 
      instructions: ["Blender plum dan almond.", "Bentuk bola."] 
    },
    { 
      title: "Parfait Jali-jali Beri", category: "High Fiber", tags: ["No-Bake"], calories: 180, rating: 4.2, servings: "1 Gelas", 
      desc: "Parfait jali-jali unik.", 
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500", 
      ingredients: ["Jali-jali Rebus", "Yogurt", "Beri"], 
      instructions: ["Layer jali-jali, yogurt, dan beri di gelas."] 
    },
    { 
      title: "Puding Ubi Jalar", category: "High Fiber", tags: ["No-Bake"], calories: 150, rating: 4.5, servings: "2 Porsi", 
      desc: "Puding ubi jalar dingin.", 
      image: "https://images.unsplash.com/photo-1517697471339-4aa32003c11a?w=500", 
      ingredients: ["Ubi Rebus", "Susu", "Agar-agar", "Gula Kelapa"], 
      instructions: ["Blender ubi dan susu.", "Masak dengan agar.", "Dinginkan."] 
    },
  ];

  const handleUpload = async () => {
    setLoading(true);
    try {
      // Loop data dan tambahkan "status: approved" agar langsung muncul di Resep.jsx
      for (const recipe of recipesData) {
        await addDoc(collection(db, "recipes"), {
          ...recipe,
          status: "approved", // <--- AGAR LANGSUNG MUNCUL
          uploadedBy: "Admin Official",
          uploadedAt: new Date()
        });
      }
      alert("SUKSES! 50 Dessert Sehat (Bahasa Indonesia & Auto-Approved) telah diunggah.");
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengunggah data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FFF9F9]">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl text-center border-4 border-[#FFDADA]">
        <h1 className="text-3xl font-black mb-4 text-[#960C14]">Seeder Pro (Final ID)</h1>
        <p className="mb-8 text-gray-600 italic">Pastikan koleksi 'recipes' di Firebase KOSONG sebelum klik.</p>
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-[#960C14] text-white px-8 py-4 rounded-full font-bold hover:scale-105 active:scale-95 disabled:bg-gray-400 transition-all shadow-lg"
        >
          {loading ? "Menanam Data..." : "UPLOAD 50 DESSERT INDO"}
        </button>
      </div>
    </div>
  );
};

export default SeedRecipes;