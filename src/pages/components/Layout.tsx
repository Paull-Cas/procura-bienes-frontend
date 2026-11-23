import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="bg-gray-900 text-white shadow">
        <div className="relative flex justify-center items-center px-6 py-4">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-6 text-gray-300 hover:text-orange-400 transition-colors"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-3xl font-semibold text-white text-center">
            Sistema E.I.G.R.
          </h1>
        </div>
      </header>
    </>
  );
}