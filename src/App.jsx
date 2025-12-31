import "./App.css";
import { Link, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SeedRecipes from "./components/SeedRecipes";

/** * Mengambil API Key secara aman dari environment variable Vite.
 * Key ini tidak akan muncul di source code GitHub jika .env.local sudah masuk .gitignore.
 */
const apiKey = import.meta.env.VITE_API_KEY;

function App() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Komponen navigasi atas */}
      <Navbar />
      
      <main className="pt-20">
        {/* Outlet digunakan untuk menampilkan halaman dinamis berdasarkan route (Home, Recipes, dll.) */}
        <Outlet />
      </main>

      {/* Komponen SeedRecipes (saat ini di-comment sesuai kode asli Anda) */}
      {/* <SeedRecipes /> */}
      
      {/* Komponen kaki halaman */}
      <Footer />
    </div>
  );
}

export default App;