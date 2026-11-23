import { useEffect, useState } from "react";
import { fetchPagos } from "../data/api";
import { UsuarioProfile } from "../../data/models";
import {
  FileText
} from "lucide-react";
import { DashboardCard } from "../components/ui/DashboardCard";
import ListaPagos from "./components/ListaPagos";
import { Pago } from "../data/models";

interface HistorialPagosProps {
  user: UsuarioProfile;
}

export default function HistorialPagos({ user }: HistorialPagosProps) {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [permisos, setPermisos] = useState<string[]>([]);

  const cargarPagos = async () => {
    setPagos(await fetchPagos(user.id));
  };

  useEffect(() => {
    const getPermisos = user.permisos.map((p) => p.codigoPermiso);
    setPermisos(getPermisos);
    cargarPagos();
  }, [user.id]);

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Historial de Pagos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
        <DashboardCard
          title="Total de Pagos"
          value={pagos.length}
          icon={<FileText size={20} />}
          color="orange"
        />
        <DashboardCard
          title="Pagos de factura"
          value={pagos.filter((p) => p.tipo_pago === "Factura").length}
          icon={<FileText size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Pagos por detracción"
          value={pagos.filter((p) => p.tipo_pago === "Detracción").length}
          icon={<FileText size={20} />}
          color="purple"
        />
      </div>
      <div>
        <ListaPagos user={user} pagos={pagos} />
      </div>
    </div>
  );
}
