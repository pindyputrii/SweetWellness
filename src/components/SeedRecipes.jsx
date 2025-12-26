import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const SeedRecipes = () => {
  const [loading, setLoading] = useState(false);

  // DATA 50 RESEP DESSERT SEHAT (BAHASA INDONESIA & UNIK)
  const recipesData = [
    // --- LOW CARB (1-13) ---
    {
      title: "Mousse Cokelat Alpukat",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 180,
      rating: 4.8,
      servings: "2 Porsi",
      desc: "Mousse cokelat super lembut tanpa susu, menggunakan lemak sehat alpukat.",
      image:
        "https://image.idntimes.com/post/20231018/1-49d63280e9b60d9f4ac305ef66d91913.jpg",
      ingredients: [
        "2 Alpukat matang",
        "1/2 cup Bubuk Kakao",
        "1/3 cup Madu/Stevia",
        "1 sdt Vanila",
      ],
      instructions: [
        "Blender daging alpukat hingga sangat halus.",
        "Masukkan kakao dan pemanis.",
        "Dinginkan 1 jam agar set.",
      ],
    },
    {
      title: "Krim Ricotta Lemon",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 140,
      rating: 4.6,
      servings: "2 Porsi",
      desc: "Dessert keju ringan dengan aroma lemon yang segar.",
      image:
        "https://staticcookist.akamaized.net/wp-content/uploads/sites/22/2022/08/lemon-ricotta-cream.jpeg",
      ingredients: [
        "1 cup Keju Ricotta",
        "Parutan Kulit Lemon",
        "1 sdm Erythritol",
      ],
      instructions: [
        "Kocok ricotta dengan mixer hingga mengembang.",
        "Aduk parutan lemon.",
        "Sajikan dingin di gelas.",
      ],
    },
    {
      title: "Cheesecake Stroberi Jar",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 210,
      rating: 4.7,
      servings: "2 Jar",
      desc: "Cheesecake tanpa tepung dalam toples kaca.",
      image:
        "https://whatsgabycooking.com/wp-content/uploads/2018/03/MINI_MASON_JAR_STRAW_CHEESECAKE_BLOG_12.jpg",
      ingredients: [
        "Cream Cheese",
        "Yogurt Greek",
        "Strawberry segar",
        "Stevia",
      ],
      instructions: [
        "Kocok cream cheese dan yogurt.",
        "Potong dadu strawberry.",
        "Susun berlapis di toples.",
      ],
    },
    {
      title: "Kue Kering Almond",
      category: "Low Carb",
      tags: ["Microwave Ready"],
      calories: 160,
      rating: 4.4,
      servings: "4 Keping",
      desc: "Kue kering almond klasik yang renyah.",
      image:
        "https://img.okezone.com/content/2015/07/03/298/1175881/resep-kue-kering-almond-untuk-lebaran-rf2izvk4O1.jpg",
      ingredients: [
        "1 cup Tepung Almond",
        "2 sdm Mentega cair",
        "1 sdm Pemanis",
      ],
      instructions: [
        "Campur semua bahan jadi adonan.",
        "Cetak bulat pipih.",
        "Microwave 90 detik, biarkan dingin agar keras.",
      ],
    },
    {
      title: "Parfait Beri Santan",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 195,
      rating: 4.9,
      servings: "1 Porsi",
      desc: "Lapisan krim santan kental dan buah beri.",
      image:
        "https://tradisikuliner.com/wp-content/uploads/2025/06/TRADISI-ANIME-PBN-8-1-1024x512.jpg",
      ingredients: ["Santan kental dingin", "Blueberry", "Raspberry", "Vanila"],
      instructions: [
        "Kocok santan dingin hingga kaku seperti whipped cream.",
        "Susun selang-seling dengan buah beri.",
      ],
    },
    {
      title: "Cokelat Batang Hitam",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 170,
      rating: 4.5,
      servings: "4 Potong",
      desc: "Cokelat batang tipis dengan taburan garam laut.",
      image:
        "https://www.seriouseats.com/thmb/lzCcXBC2cO9XBaccq9dDa4CslXo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20250421-SEA-NoBakeFudgyChocolateSquares-MorganGlaze-Beauty1-2d3be09670754d099c965bc3888efcaf.jpg",
      ingredients: ["85% Cokelat Hitam", "Garam Laut", "Kacang Almond cincang"],
      instructions: [
        "Lelehkan cokelat.",
        "Ratakan di kertas roti.",
        "Tabur garam dan kacang.",
        "Bekukan.",
      ],
    },
    {
      title: "Ganache Cokelat Tahu",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 150,
      rating: 4.2,
      servings: "2 Porsi",
      desc: "Ganache cokelat vegan dari tahu sutra.",
      image:
        "https://media-cdn2.greatbritishchefs.com/media/pxofi0dj/img74629.whqc_600x400q80.jpg",
      ingredients: ["Tahu Sutra", "Bubuk Kakao", "Sirup Maple sugar-free"],
      instructions: [
        "Blender tahu hingga halus.",
        "Campur kakao dan sirup.",
        "Dinginkan hingga set.",
      ],
    },
    {
      title: "Pecan Panggang Kayu Manis",
      category: "Low Carb",
      tags: ["Raw"],
      calories: 180,
      rating: 4.3,
      servings: "1 Porsi",
      desc: "Kacang pecan manis berempah.",
      image:
        "https://hips.hearstapps.com/hmg-prod/images/delish-candiedpecans-006-ls-1608590089.jpg?crop=1xw:0.45xh;0,0.156xh&resize=1200:*",
      ingredients: ["Kacang Pecan", "Putih Telur", "Kayu Manis", "Stevia"],
      instructions: [
        "Kocok putih telur berbusa.",
        "Balut kacang.",
        "Sangrai di wajan anti lengket hingga harum.",
      ],
    },
    {
      title: "Yogurt Beku Buah",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 90,
      rating: 4.6,
      servings: "1 Lembar",
      desc: "Yogurt beku dengan topping buah.",
      image:
        "https://healthy.kaiserpermanente.org/content/dam/kporg/aboutkp/recipe/pbj-frozen-yogurt-bark.jpg",
      ingredients: ["Yogurt Greek Plain", "Strawberry", "Kacang Pistachio"],
      instructions: [
        "Ratakan yogurt di loyang.",
        "Tabur topping.",
        "Bekukan hingga keras lalu patahkan.",
      ],
    },
    {
      title: "Panna Cotta Vanila",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 120,
      rating: 4.8,
      servings: "2 Cup",
      desc: "Puding Italia lembut tanpa gula.",
      image:
        "https://asset.kompas.com/crops/VeV3EirWiSXXyFqk6EhYgEbhrBw=/7x0:1000x662/1200x800/data/photo/2020/06/26/5ef5e529e436f.jpg",
      ingredients: ["Krim Encer", "Gelatin", "Biji Vanila", "Stevia"],
      instructions: [
        "Panaskan krim dan vanila.",
        "Larutkan gelatin.",
        "Tuang ke cetakan dan dinginkan 4 jam.",
      ],
    },
    {
      title: "Busa Raspberry",
      category: "Low Carb",
      tags: ["Raw"],
      calories: 60,
      rating: 4.1,
      servings: "1 Porsi",
      desc: "Busa buah ringan dan manis.",
      image:
        "https://carolinagelen.com/wp-content/uploads/2024/05/IMG_9763_VSCO-1024x770.jpg",
      ingredients: ["Raspberry beku", "Putih Telur Steril", "Air Lemon"],
      instructions: [
        "Blender semua bahan dengan kecepatan tinggi hingga mengembang seperti busa.",
      ],
    },
    {
      title: "Mousse Selai Kacang",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 200,
      rating: 4.7,
      servings: "2 Porsi",
      desc: "Mousse kacang gurih creamy.",
      image:
        "https://www.allrecipes.com/thmb/-NG-VdbAgd7JDO13U8ga3hng1rI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/8405377_4-Ingredient-Peanut-Butter-Mousse_Yoly_2x1-4bcb6695de0746539b8e14b4688835e8.jpg",
      ingredients: ["Cream Cheese", "Selai Kacang Tanpa Gula", "Whipped Cream"],
      instructions: [
        "Kocok cream cheese dan selai.",
        "Lipat dengan whipped cream.",
        "Sajikan dingin.",
      ],
    },
    {
      title: "Es Loli Chia Santan",
      category: "Low Carb",
      tags: ["No-Bake"],
      calories: 85,
      rating: 4.5,
      servings: "4 Pops",
      desc: "Es loli santan dan chia.",
      image:
        "https://awsimages.detik.net.id/customthumb/2014/05/23/297/chialuar.jpg?w=600&q=90",
      ingredients: ["Santan Cair", "Biji Chia", "Pemanis"],
      instructions: ["Campur semua bahan.", "Tuang ke cetakan es.", "Bekukan."],
    },

    // --- KETO DESSERTS (14-25) ---
    {
      title: "Cup Selai Kacang Keto",
      category: "Keto",
      tags: ["No-Bake"],
      calories: 220,
      rating: 4.9,
      servings: "4 Cup",
      desc: "Cokelat isi selai kacang ala keto.",
      image:
        "https://www.ruled.me/wp-content/uploads/2020/07/Keto-Peanut-Butter-Cups-Second.jpg",
      ingredients: ["Cokelat Bebas Gula", "Selai Kacang", "Minyak Kelapa"],
      instructions: [
        "Lelehkan cokelat di dasar cup.",
        "Beri isian selai.",
        "Tutup dengan cokelat lagi.",
        "Bekukan.",
      ],
    },
    {
      title: "Bola Kelapa Lemon",
      category: "Keto",
      tags: ["Raw"],
      calories: 130,
      rating: 4.3,
      servings: "10 Biji",
      desc: "Bola energi kelapa lemon.",
      image:
        "https://lovefoodnourish.com/wp-content/uploads/2018/11/Lemon-Coconut-Balls-1024x706.jpg",
      ingredients: ["Kelapa Parut", "Cream Cheese", "Jus Lemon"],
      instructions: [
        "Campur semua bahan hingga padat.",
        "Bentuk bola.",
        "Gulingkan di kelapa parut.",
      ],
    },
    {
      title: "Jeli Kopi Dadu",
      category: "Keto",
      tags: ["No-Bake"],
      calories: 15,
      rating: 4.0,
      servings: "1 Mangkuk",
      desc: "Jeli kopi hitam untuk teman ngemil.",
      image:
        "https://kopimaniablog.wordpress.com/wp-content/uploads/2016/09/kopi-jeli-lampung-6.jpg",
      ingredients: ["Kopi Hitam Kuat", "Gelatin", "Stevia"],
      instructions: [
        "Campur kopi panas dan gelatin.",
        "Tuang ke wadah kotak.",
        "Potong dadu setelah set.",
      ],
    },
    {
      title: "Kue Mug Blueberry",
      category: "Keto",
      tags: ["Microwave Ready"],
      calories: 190,
      rating: 4.6,
      servings: "1 Mug",
      desc: "Kue mug hangat dengan blueberry.",
      image:
        "https://www.mychefsapron.com/wp-content/uploads/Best-Almond-Flour-Mug-Cakes.jpg",
      ingredients: ["Tepung Kelapa", "Mentega", "Telur", "Blueberry"],
      instructions: [
        "Aduk rata bahan di mug.",
        "Microwave 90 detik.",
        "Nikmati hangat.",
      ],
    },
    {
      title: "Es Krim Cokelat Alpukat",
      category: "Keto",
      tags: ["No-Bake"],
      calories: 210,
      rating: 4.8,
      servings: "2 Porsi",
      desc: "Es krim cokelat lembut tinggi lemak.",
      image:
        "https://img-global.cpcdn.com/recipes/6f7c4d5eb159f9a0/1200x630cq80/photo.jpg",
      ingredients: ["Alpukat beku", "Santan kental", "Kakao", "Erythritol"],
      instructions: [
        "Blender semua bahan beku hingga tekstur creamy.",
        "Sajikan langsung.",
      ],
    },
    {
      title: "Bom Lemak Matcha",
      category: "Keto",
      tags: ["No-Bake"],
      calories: 140,
      rating: 4.4,
      servings: "8 Biji",
      desc: "Bom lemak teh hijau.",
      image:
        "https://thecoconutmama.com/wp-content/uploads/2020/02/matcha_fat_bombs.jpg",
      ingredients: ["Cocoa Butter", "Bubuk Matcha", "Minyak Kelapa"],
      instructions: [
        "Lelehkan mentega.",
        "Aduk matcha.",
        "Tuang cetakan silikon.",
        "Bekukan.",
      ],
    },
    {
      title: "Praline Kacang Pecan",
      category: "Keto",
      tags: ["Microwave Ready"],
      calories: 180,
      rating: 4.5,
      servings: "6 Biji",
      desc: "Permen kacang karamel.",
      image:
        "https://joyfilledeats.com/wp-content/uploads/2020/03/pecan-pralines-1-3.jpg",
      ingredients: ["Kacang Pecan", "Mentega", "Gula Merah Keto"],
      instructions: [
        "Lelehkan mentega dan gula di microwave.",
        "Masukkan pecan.",
        "Sendokkan ke kertas roti.",
      ],
    },
    {
      title: "Awan Krim Keju",
      category: "Keto",
      tags: ["No-Bake"],
      calories: 160,
      rating: 4.7,
      servings: "1 Porsi",
      desc: "Adonan keju manis seperti awan.",
      image:
        "https://asset.kompas.com/crops/_tZZbx9Z-L4ZUTHzg72Wx8wCxS8=/0x25:1000x692/1200x800/data/photo/2022/09/29/63356848e98f9.jpg",
      ingredients: ["Cream Cheese", "Mentega", "Vanila"],
      instructions: [
        "Kocok cream cheese dan mentega suhu ruang.",
        "Beri vanila.",
        "Makan dengan sendok.",
      ],
    },
    {
      title: "Stroberi Celup Cokelat",
      category: "Keto",
      tags: ["No-Bake"],
      calories: 100,
      rating: 4.9,
      servings: "5 Buah",
      desc: "Stroberi celup cokelat hitam.",
      image:
        "https://italianfoodforever.com/wp-content/uploads/2013/02/chocolatestrawberries.jpg",
      ingredients: ["Strawberry utuh", "90% Cokelat Hitam", "Minyak kelapa"],
      instructions: [
        "Lelehkan cokelat.",
        "Celupkan buah.",
        "Dinginkan di kulkas.",
      ],
    },
    {
      title: "Kue Selai Almond",
      category: "Keto",
      tags: ["Microwave Ready"],
      calories: 150,
      rating: 4.2,
      servings: "2 Cookie",
      desc: "Kue selai almond 3 bahan.",
      image:
        "https://veganyackattack.com/wp-content/uploads/2015/07/thumbprintcookies-4-735x491.jpg",
      ingredients: ["Selai Almond", "Erythritol", "Telur"],
      instructions: [
        "Aduk semua bahan.",
        "Bentuk bulat pipih.",
        "Microwave 2 menit.",
      ],
    },
    {
      title: "Mousse Labu Rempah",
      category: "Keto",
      tags: ["No-Bake"],
      calories: 175,
      rating: 4.6,
      servings: "2 Porsi",
      desc: "Mousse labu rempah.",
      image:
        "https://www.simplyrecipes.com/thmb/QAsZclFkUx4p98uzqjBdGSWdtRY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Pumpkin-Mousse-LEAD-2-3f0171ece31c404d9daa27dddb3adf9f.jpg",
      ingredients: ["Puree Labu", "Heavy Cream", "Bumbu Spekuk"],
      instructions: [
        "Kocok cream hingga kaku.",
        "Lipat dengan labu dan bumbu.",
      ],
    },
    {
      title: "Puding Wijen Hitam",
      category: "Keto",
      tags: ["No-Bake"],
      calories: 190,
      rating: 4.1,
      servings: "2 Porsi",
      desc: "Puding wijen hitam unik.",
      image:
        "https://onolicioushawaii.com/wp-content/uploads/2021/10/black-sesame-soy-milk-pudding-6.jpg",
      ingredients: ["Pasta Wijen Hitam", "Santan", "Gelatin"],
      instructions: [
        "Masak santan dan wijen.",
        "Larutkan gelatin.",
        "Cetakan.",
      ],
    },

    // --- GLUTEN FREE DESSERTS (26-38) ---
    {
      title: "Kue Pisang Oat",
      category: "Gluten Free",
      tags: ["Microwave Ready"],
      calories: 110,
      rating: 4.4,
      servings: "4 Keping",
      desc: "Kue pisang oat sederhana.",
      image:
        "https://asset.kompas.com/crops/ogZiXDOSR6TRd1mx_mRNiUN1o-g=/32x0:1000x645/1200x800/data/photo/2022/07/21/62d8ec01ca319.jpg",
      ingredients: ["Pisang Lumat", "Oat Bebas Gluten", "Kismis"],
      instructions: [
        "Campur pisang dan oat.",
        "Bentuk cookie.",
        "Microwave 2 menit.",
      ],
    },
    {
      title: "Ketan Mangga (Versi Sehat)",
      category: "Gluten Free",
      tags: ["Microwave Ready"],
      calories: 250,
      rating: 4.9,
      servings: "1 Porsi",
      desc: "Ketan mangga versi sehat.",
      image:
        "https://thumb.viva.id/vivabanyuwangi/665x374/2025/08/06/6892ca31e4d5a-resep-ketan-mangga-manis-ala-thailand_banyuwangi.jpg",
      ingredients: ["Beras Ketan Putih", "Santan", "Mangga Manis"],
      instructions: [
        "Masak ketan di microwave.",
        "Siram saus santan.",
        "Sajikan dengan mangga.",
      ],
    },
    {
      title: "Pir Panggang Kayu Manis",
      category: "Gluten Free",
      tags: ["Microwave Ready"],
      calories: 120,
      rating: 4.5,
      servings: "2 Porsi",
      desc: "Pir panggang kayu manis.",
      image:
        "https://i2.wp.com/healingfamilyeats.com/wp-content/uploads/2014/09/roasted-cinnamon-pears-for-AIP-oatmeal-Healing-Family-Eats.jpg",
      ingredients: ["Buah Pir", "Madu", "Kayu Manis", "Kenari"],
      instructions: [
        "Belah pir, buang biji.",
        "Isi tengahnya dengan madu dan kenari.",
        "Microwave 4 menit.",
      ],
    },
    {
      title: "Kue Cokelat Tanpa Tepung",
      category: "Gluten Free",
      tags: ["Microwave Ready"],
      calories: 230,
      rating: 4.8,
      servings: "1 Potong",
      desc: "Kue cokelat basah tanpa tepung.",
      image:
        "https://recipefiction.com/wp-content/uploads/2015/07/brown-butter-flourless-chocolate-cake.jpg",
      ingredients: ["Cokelat Leleh", "Telur", "Mentega", "Kakao"],
      instructions: [
        "Kocok telur dan gula.",
        "Masukkan cokelat leleh.",
        "Microwave 1-2 menit.",
      ],
    },
    {
      title: "Nachos Apel",
      category: "Gluten Free",
      tags: ["Raw"],
      calories: 140,
      rating: 4.6,
      servings: "1 Piring",
      desc: "Irisan apel dengan saus.",
      image:
        "https://static.republika.co.id/uploads/images/inpicture_slide/nachos-apel-_141204170902-605.jpg",
      ingredients: ["Apel Fuji", "Selai Kacang Cair", "Choco Chips"],
      instructions: [
        "Iris tipis apel.",
        "Susun di piring.",
        "Drizzle selai kacang dan tabur cokelat.",
      ],
    },
    {
      title: "Persik Bakar Madu",
      category: "Gluten Free",
      tags: ["Microwave Ready"],
      calories: 100,
      rating: 4.7,
      servings: "2 Porsi",
      desc: "Persik hangat madu.",
      image: "https://farm2.staticflickr.com/1825/41701582990_dd24b93ba8_b.jpg",
      ingredients: ["Buah Persik", "Madu", "Yogurt"],
      instructions: [
        "Belah persik.",
        "Oles madu.",
        "Microwave 2 menit.",
        "Sajikan dengan yogurt.",
      ],
    },
    {
      title: "Cokelat Quinoa",
      category: "Gluten Free",
      tags: ["No-Bake"],
      calories: 160,
      rating: 4.3,
      servings: "4 Keping",
      desc: "Cokelat renyah dengan quinoa.",
      image:
        "https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/E7033099-D6C9-46AA-8D44-849E4675BA2C/Derivates/A903DD69-37B1-4207-9C96-C514EC5C2A29.jpg",
      ingredients: ["Quinoa Matang", "Cokelat Hitam", "Garam Laut"],
      instructions: [
        "Campur quinoa ke cokelat leleh.",
        "Ratakan tipis.",
        "Bekukan.",
      ],
    },
    {
      title: "Gulungan Kurma Kenari",
      category: "Gluten Free",
      tags: ["Raw"],
      calories: 180,
      rating: 4.5,
      servings: "6 Iris",
      desc: "Gulungan kurma kenari klasik.",
      image:
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZNiv1nSzRSsSgkxEah9eAVv1s-lXD7EG7Rlx6PmG_U2d_aGGymN1cPs5NOmnv_ugrIUfN5O12JhX78s76k-vwkYcesqZg2oimOS7LwtONg2dRIvzzxgzCP-4lSOXmGkUGvfZrjqicSFz5/s1600/20161016_120148.jpg",
      ingredients: ["Kurma Halus", "Kacang Kenari", "Kelapa"],
      instructions: [
        "Pipihkan adonan kurma.",
        "Tabur kenari.",
        "Gulung dan iris.",
      ],
    },
    {
      title: "Lumpia Buah Segar",
      category: "Gluten Free",
      tags: ["Raw"],
      calories: 90,
      rating: 4.2,
      servings: "2 Gulung",
      desc: "Lumpia buah segar transparan.",
      image:
        "https://img.inews.co.id/media/1200/files/inews_new/2020/03/19/lumpia_buah.jpg",
      ingredients: ["Rice Paper", "Strawberry", "Kiwi", "Mangga"],
      instructions: [
        "Basahi rice paper.",
        "Isi dengan potongan buah.",
        "Lipat seperti lumpia.",
      ],
    },
    {
      title: "Blueberry Yogurt Beku",
      category: "Gluten Free",
      tags: ["No-Bake"],
      calories: 60,
      rating: 4.6,
      servings: "1 Mangkuk",
      desc: "Blueberry salut yogurt beku.",
      image:
        "https://eveganrecipes.com/wp-content/uploads/2024/06/Frozen-Blueberry-Yogurt-Bites-500x500.jpg",
      ingredients: ["Blueberry", "Yogurt Vanila", "Tusuk Gigi"],
      instructions: [
        "Celup blueberry ke yogurt.",
        "Taruh di loyang.",
        "Bekukan 1 jam.",
      ],
    },
    {
      title: "Pizza Semangka",
      category: "Gluten Free",
      tags: ["Raw"],
      calories: 80,
      rating: 4.8,
      servings: "1 Loyang",
      desc: "Irisan semangka dengan topping buah.",
      image:
        "https://img.okezone.com/content/2016/12/12/298/1564655/yuk-coba-sensasi-segarnya-pizza-semangka-x8KAMGmnqb.jpg",
      ingredients: ["Semangka Bulat", "Yogurt", "Beri", "Mint"],
      instructions: [
        "Potong semangka melintang.",
        "Oles yogurt.",
        "Tabur beri dan potong juring.",
      ],
    },
    {
      title: "Pisang Karamel",
      category: "Gluten Free",
      tags: ["Microwave Ready"],
      calories: 150,
      rating: 4.4,
      servings: "1 Porsi",
      desc: "Pisang karamel cepat.",
      image:
        "https://media.zcreators.id/crop/0x0:0x0/750x500/photo/indizone/2019/08/31/bnsZWX/t_5d6a49032cff1.jpg",
      ingredients: ["Pisang", "Gula Kelapa", "Kayu Manis"],
      instructions: [
        "Iris pisang.",
        "Tabur gula.",
        "Microwave 1 menit hingga gula meleleh.",
      ],
    },
    {
      title: "Brownies Ubi Jalar",
      category: "Gluten Free",
      tags: ["Microwave Ready"],
      calories: 190,
      rating: 4.5,
      servings: "1 Potong",
      desc: "Brownies ubi jalar lembut.",
      image:
        "https://radarmetro.disway.id/upload/446a0f158187200d046565cff2d46cfe.jpg",
      ingredients: ["Ubi Jalar Rebus", "Kakao", "Selai Kacang", "Maple"],
      instructions: [
        "Lumatkan ubi.",
        "Campur bahan lain.",
        "Microwave 2 menit.",
      ],
    },

    // --- HIGH FIBER DESSERTS (39-50) ---
    {
      title: "Puding Chia Klasik",
      category: "High Fiber",
      tags: ["No-Bake"],
      calories: 160,
      rating: 4.9,
      servings: "1 Porsi",
      desc: "Puding biji chia standar emas.",
      image:
        "https://www.tastingtable.com/img/gallery/classic-chia-pudding-recipe/classic-chia-pudding-recipe-1667832593.jpg",
      ingredients: ["Biji Chia", "Susu Almond", "Madu"],
      instructions: ["Aduk chia dan susu.", "Diamkan semalaman di kulkas."],
    },
    {
      title: "Bola Oat Kismis",
      category: "High Fiber",
      tags: ["Raw"],
      calories: 100,
      rating: 4.3,
      servings: "5 Biji",
      desc: "Bola energi kismis oat.",
      image:
        "https://saltandbaker.com/wp-content/uploads/2019/01/Oatmeal-Raising-No-Bake-Energy-Bites-5.jpg",
      ingredients: ["Oat", "Kismis", "Selai Kacang"],
      instructions: [
        "Campur semua bahan.",
        "Bentuk bola kecil.",
        "Simpan dingin.",
      ],
    },
    {
      title: "Brownies Kacang Hitam",
      category: "High Fiber",
      tags: ["Microwave Ready"],
      calories: 180,
      rating: 4.1,
      servings: "1 Potong",
      desc: "Brownies kacang hitam kaya serat.",
      image:
        "https://realfood.tesco.com/media/images/RFO-1400x919-BlackBeanBrowniesWithPeanutButterSwirl-3a374468-a3c5-4d43-aeba-7226c67d437b-0-1400x919.jpg",
      ingredients: ["Kacang Hitam Kaleng", "Kakao", "Telur", "Madu"],
      instructions: [
        "Blender kacang.",
        "Aduk dengan telur kakao.",
        "Microwave 2 menit.",
      ],
    },
    {
      title: "Raspberry Isi Cokelat",
      category: "High Fiber",
      tags: ["Raw"],
      calories: 60,
      rating: 4.7,
      servings: "10 Biji",
      desc: "Raspberry isi cokelat chips.",
      image:
        "https://addapinch.com/wp-content/blogs.dir/3/files/2014/02/chocolate-filled-raspberries-DSC_2363-640x426.jpg",
      ingredients: ["Raspberry Segar", "Dark Choco Chips"],
      instructions: ["Masukkan 1 butir chip ke dalam lubang raspberry."],
    },
    {
      title: "Popcorn Cokelat Hitam",
      category: "High Fiber",
      tags: ["Microwave Ready"],
      calories: 120,
      rating: 4.5,
      servings: "1 Mangkuk",
      desc: "Popcorn cokelat serat tinggi.",
      image:
        "https://insanelygoodrecipes.com/wp-content/uploads/2024/12/chocolate-covered-popcorn-featured.jpg",
      ingredients: ["Jagung Popcorn", "Cokelat Leleh"],
      instructions: ["Meletupkan jagung.", "Drizzle cokelat leleh."],
    },
    {
      title: "Kacang Arab Madu",
      category: "High Fiber",
      tags: ["Microwave Ready"],
      calories: 140,
      rating: 4.2,
      servings: "1 Porsi",
      desc: "Kacang arab panggang manis.",
      image:
        "https://www.tosimplyinspire.com/wp-content/uploads/2016/05/Honey-Mustard-Roasted-Chickpeas2.jpg",
      ingredients: ["Kacang Arab", "Madu", "Kayu Manis"],
      instructions: [
        "Keringkan kacang.",
        "Balur madu.",
        "Microwave 3-4 menit hingga garing.",
      ],
    },
    {
      title: "Edamame Cokelat",
      category: "High Fiber",
      tags: ["No-Bake"],
      calories: 130,
      rating: 4.0,
      servings: "1 Porsi",
      desc: "Edamame salut cokelat.",
      image:
        "https://video.antaranews.com/preview/2025/02/ori/AB_MENILIK-PERPADUAN-COKELAT-DAN-EDAMAME-SEBAGAI-KUDAPAN-UNIK-DI-JEMBER.jpg",
      ingredients: ["Edamame Kupas", "Cokelat Hitam"],
      instructions: [
        "Gunakan edamame kering sangrai.",
        "Celup cokelat.",
        "Dinginkan.",
      ],
    },
    {
      title: "Muffin Mug Biji Rami",
      category: "High Fiber",
      tags: ["Microwave Ready"],
      calories: 170,
      rating: 4.4,
      servings: "1 Mug",
      desc: "Muffin biji rami super serat.",
      image:
        "https://divaliciousrecipes.com/wp-content/uploads/2019/01/low-carb-muffins.jpg",
      ingredients: ["Tepung Flaxseed", "Telur", "Kayu Manis", "Stevia"],
      instructions: ["Aduk semua di mug.", "Microwave 60 detik."],
    },
    {
      title: "Crumble Pir & Kenari",
      category: "High Fiber",
      tags: ["Microwave Ready"],
      calories: 200,
      rating: 4.6,
      servings: "1 Porsi",
      desc: "Crumble pir cepat.",
      image:
        "https://www.wordsofdeliciousness.com/wp-content/uploads/2016/09/Side-angle-of-the-pear-cream-cheese-bars.jpg",
      ingredients: ["Pir Potong", "Oat", "Walnut", "Mentega"],
      instructions: [
        "Taruh pir di bawah.",
        "Tabur oat walnut mentega.",
        "Microwave 2 menit.",
      ],
    },
    {
      title: "Bola Energi Plum",
      category: "High Fiber",
      tags: ["Raw"],
      calories: 110,
      rating: 4.3,
      servings: "8 Biji",
      desc: "Bola energi plum kering.",
      image:
        "https://bakingthegoods.com/wp-content/uploads/2023/01/Prune-Almond-Energy-Balls-54-1024x683.jpg",
      ingredients: ["Plum Kering", "Almond", "Kelapa"],
      instructions: ["Blender plum dan almond.", "Bentuk bola."],
    },
    {
      title: "Parfait Jali-jali Beri",
      category: "High Fiber",
      tags: ["No-Bake"],
      calories: 180,
      rating: 4.2,
      servings: "1 Gelas",
      desc: "Parfait jali-jali unik.",
      image:
        "https://img.taste.com.au/bfUYrq-k/w720-h480-cfill-q80/taste/2016/11/berry-parfaits-32942-1.jpeg",
      ingredients: ["Jali-jali Rebus", "Yogurt", "Beri"],
      instructions: ["Layer jali-jali, yogurt, dan beri di gelas."],
    },
    {
      title: "Puding Ubi Jalar",
      category: "High Fiber",
      tags: ["No-Bake"],
      calories: 150,
      rating: 4.5,
      servings: "2 Porsi",
      desc: "Puding ubi jalar dingin.",
      image:
        "https://mymilk.com/uploads/2018/04//Buat_Puding_Ubi_Gula_Merah_Yuk,_Milk_Lovers!1.jpg",
      ingredients: ["Ubi Rebus", "Susu", "Agar-agar", "Gula Kelapa"],
      instructions: [
        "Blender ubi dan susu.",
        "Masak dengan agar.",
        "Dinginkan.",
      ],
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
          uploadedAt: new Date(),
        });
      }
      alert(
        "SUKSES! 50 Dessert Sehat (Bahasa Indonesia & Auto-Approved) telah diunggah."
      );
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
        <h1 className="text-3xl font-black mb-4 text-[#960C14]">
          Seeder Pro (Final ID)
        </h1>
        <p className="mb-8 text-gray-600 italic">
          Pastikan koleksi 'recipes' di Firebase KOSONG sebelum klik.
        </p>
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
