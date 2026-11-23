import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import { fetchUserProfile } from "./data/api";
import { UsuarioProfile } from "./data/models";

interface Permiso {
  nombre: string;
  codigoPermiso: string;
  descripcion: string;
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UsuarioProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    const loadUserProfile = async () => {
      try {
        const data = await fetchUserProfile();

        if (data) {
          const userData: UsuarioProfile = {
            id : data.idUsuario,
            nombre: data.nombreUsuario,
            email: data.email,
            rol: data.rol,
            permisos: data.permisos.map((permiso: Permiso) => ({
              nombre: permiso.nombre,
              codigoPermiso: permiso.codigoPermiso,
              descripcion: permiso.descripcion,
            })),
          };

          setUserProfile(userData)

          sessionStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Layout />

      <main className="py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          <div className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-orange-500">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Hola, <span className="text-orange-600">{userProfile?.nombre}</span>!
            </h2>
            <p className="text-lg text-gray-600">
              Bienvenido al sistema de <span className="font-bold text-orange-600">E.I.G.R.</span>
            </p>
            <p className="text-lg text-gray-800 mt-2">
              Tu rol actual es:{" "}
              <span className="text-orange-600 font-medium">{userProfile?.rol}</span>
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tus Permisos</h2>
            <div className="space-y-4">
              {userProfile?.permisos.map((permiso, index) => (
                <div
                  key={index}
                  className="border-l-4 border-orange-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                >
                  <h3 className="text-lg font-medium text-gray-900">{permiso.nombre}</h3>
                  <p className="text-gray-600 mt-1">{permiso.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
