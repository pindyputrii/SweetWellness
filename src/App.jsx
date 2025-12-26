import "./App.css";
import { Link, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SeedRecipes from "./components/SeedRecipes";

function App() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
      {/* <SeedRecipes /> */}
      <Footer />
    </div>
  );
}

export default App;
