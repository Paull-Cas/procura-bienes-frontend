import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getLucideIcon } from "../../components/GetLucideIcon";
import { Home } from "lucide-react";
import HistorialRequerimientos from "./HistorialRequerimientos";
import NuevoRequerimiento from "./NuevoRequerimiento";
import HomeRequerimientos from "./HomeRequerimientos";
import { fetchModulos } from "../../data/api";
import { UsuarioProfile, Modulo } from "../../data/models";

export default function Requerimientos() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [modulosNieto, setModulosNieto] = useState<Modulo[]>([]);
  const navigate = useNavigate();

  const cargarModulosNieto = async () => {
    setModulos(await fetchModulos());
  };
  useEffect(() => {
    cargarModulosNieto();
  }, [navigate]);

  const user: UsuarioProfile = JSON.parse(
    sessionStorage.getItem("user") || JSON.stringify("")
  );

  useEffect(() => {
    const selectedChildModuleId = sessionStorage.getItem("selectedChildModule");
    if (selectedChildModuleId) {
      const filteredNietos = modulos.filter(
        (modulo) => modulo.dependencia === parseInt(selectedChildModuleId)
      );
      setModulosNieto(filteredNietos);
    }
  }, [modulos]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Layout />
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="px-4 py-8 sm:px-0">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1 rounded">
              Módulo de Requerimientos
            </span>
          </div>

          <div className="mb-4 bg-white rounded-lg shadow-md p-4">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("home")}
                className={`$${
                  activeTab === "home"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>

              {modulosNieto.map((modulo) => {
                const Icon = getLucideIcon(modulo.icono);
                return (
                  <button
                    key={modulo.idModulo}
                    onClick={() => setActiveTab(modulo.ruta || "")}
                    className={`$${
                      activeTab === modulo.ruta
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 cursor-pointer`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{modulo.nombre}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-white shadow-lg rounded-lg">
            {activeTab === "home" && (
              <div className="fade-in">
                <HomeRequerimientos />
              </div>
            )}
            {modulos
              .filter((modulo) => modulo.ruta === activeTab)
              .map((modulo) => (
                <div key={modulo.idModulo} className="fade-in">
                  {modulo.ruta === "/requerimientos-crear" && (
                    <NuevoRequerimiento user={user}/>
                  )}
                  {modulo.ruta === "/requerimientos-historial" && (
                    <HistorialRequerimientos user={user} />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
