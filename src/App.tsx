import { JSX } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Requerimientos from "./pages/procura_de_bienes/requerimientos/Requerimientos";
import Cotizaciones from "./pages/procura_de_bienes/cotizaciones/Cotizaciones";
import Compras from "./pages/procura_de_bienes/compras/Compras";

import Pagos from "./pages/transacciones/pagos/Pagos";
import Facturas from "./pages/transacciones/facturas/Facturas";

import Accesos from "./pages/control_de_accesos/Accesos";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Redirector = () => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Redirector />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Procura de bienes */}
          <Route
            path="/requerimiento-bienes"
            element={
              <ProtectedRoute>
                <Requerimientos />
              </ProtectedRoute>
            }
          />
          {/* Cotizaciones */}
          <Route
            path="/cotizaciones-bienes"
            element={
              <ProtectedRoute>
                <Cotizaciones />
              </ProtectedRoute>
            }
          />

          {/* Compras */}
          <Route
            path="/compras-bienes"
            element={
              <ProtectedRoute>
                <Compras />
              </ProtectedRoute>
            }
          />

          {/* Transacciones */}
          <Route
            path="/pagos"
            element={
              <ProtectedRoute>
                <Pagos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facturas"
            element={
              <ProtectedRoute>
                <Facturas />
              </ProtectedRoute>
            }
          />

          {/* Control de Accesos */}
          <Route
            path="/accesos"
            element={
              <ProtectedRoute>
                <Accesos />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center text-gray-500">
            &copy; {new Date().getFullYear()} E.I.G.R. CONTRATISTAS S.R.L.
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
