import { useEffect, useState } from "react";
import { Link, useNavigate, To } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getLucideIcon } from "./GetLucideIcon";
import { UsuarioProfile } from "../data/models";

import { fetchModulos } from "../data/api";

import {
  Home,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";

interface ModulosPermitidos {
  idModulo: number;
  nombre: string;
  descripcion: string;
  ruta: string | null;
  icono: string;
  dependencia: number | null;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [modulos, setModulos] = useState<ModulosPermitidos[]>([]);
  const [isOpenMap, setIsOpenMap] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  const userProfile: UsuarioProfile = JSON.parse(
    sessionStorage.getItem("user") || JSON.stringify("")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const cargarModulos = async () => {
    setModulos(await fetchModulos());
  };

  useEffect(() => {
    cargarModulos();
  }, [navigate]);

  const toggleDropdown = (idModulo: number) => {
    setIsOpenMap((prev) => ({
      ...prev,
      [idModulo]: !prev[idModulo],
    }));
  };

  const handleChildModuleClick = (idModulo: number) => {
    sessionStorage.setItem("selectedChildModule", idModulo.toString());
  };

  const renderModulos = (parentId: number | null) => {
    return modulos
      .filter((modulo) => modulo.dependencia === parentId)
      .map((modulo) => {
        const hasChildren = modulos.some(
          (child) => child.dependencia === modulo.idModulo
        );

        const Icon = getLucideIcon(modulo.icono);

        return (
          <div key={modulo.idModulo} className="py-1">
            <button
              onClick={() => toggleDropdown(modulo.idModulo)}
              className="w-full flex items-center justify-between text-gray-300 hover:text-orange-400 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span>{modulo.nombre}</span>
              </div>
              {hasChildren &&
                (isOpenMap[modulo.idModulo] ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                ))}
            </button>

            {hasChildren && isOpenMap[modulo.idModulo] && (
              <div className="ml-6 mt-1 border-l-2 border-gray-700">
                {modulos
                  .filter((child) => child.dependencia === modulo.idModulo)
                  .map((child) => {
                    const ChildIcon = getLucideIcon(child.icono);
                    return (
                      <Link
                        key={child.idModulo}
                        to={
                          {
                            pathname: child.ruta || "#",
                            state: { idModulo: child.idModulo },
                          } as To
                        }
                        className="block pl-4 py-2 text-gray-300 hover:text-orange-400 hover:bg-gray-800 rounded-r-lg"
                        onClick={() => handleChildModuleClick(child.idModulo)}
                      >
                        <div className="flex items-center space-x-3">
                          <ChildIcon className="w-4 h-4 ml-1" />
                          <span className="text-sm">{child.nombre}</span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-900 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <button
        onClick={onClose}
        className="absolute -right-[14px] top-1/2 -translate-y-1/2 z-[60] bg-gray-900 rounded-full p-1.5 border-2 border-gray-700 hover:border-orange-400 hover:bg-gray-800 transition-all shadow-lg hover:translate-x-1"
      >
        <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-orange-400" />
      </button>

      <div className="border-b border-gray-700 p-5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {userProfile.email}
            </h3>
            <p className="text-sm text-gray-400">{userProfile.rol}</p>
          </div>
        </div>
        <Link
          to="/profile"
          className="mt-4 flex items-center space-x-2 text-sm text-orange-400 hover:text-orange-300"
        >
          <Settings size={16} />
          <span>Gestionar Perfil</span>
        </Link>
      </div>

      <div className="p-4 h-[calc(100vh-160px)] overflow-y-auto">
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center text-gray-300 hover:text-orange-400 space-x-3 p-2 rounded-lg hover:bg-gray-800"
          >
            <Home className="w-5 h-5" />
            <span>Inicio</span>
          </Link>
          {renderModulos(null)}

          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 hover:text-red-400"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
