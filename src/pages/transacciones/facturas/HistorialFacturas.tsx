import { useEffect, useState } from "react";
import ListaFacturas from "./components/ListaFacturas";
import { Factura } from "../data/models";
import { fetchFacturas } from "../data/api";
import { UsuarioProfile } from "../../data/models";
import {
  FileText,
  Clock,
  Check,
  AlertTriangle,
  CreditCard,
  CircleFadingArrowUp,
  CircleCheck,
} from "lucide-react";
import { DashboardCard } from "../components/ui/DashboardCard";

interface HistorialFacturasProps {
  user: UsuarioProfile;
}

export default function HistorialFacturas({ user }: HistorialFacturasProps) {
  const [facturas, setFacturas] = useState<Factura[]>([]);

  const cargarFacturas = async () => {
    setFacturas(await fetchFacturas(user.id));
  };

  useEffect(() => {
    cargarFacturas();
  }, [user.id]);

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Historial de Facturas
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
        <DashboardCard
          title="Total Facturas"
          value={facturas.length}
          icon={<FileText size={20} />}
          color="orange"
        />
        <DashboardCard
          title="Facturas Pendientes"
          value={
            facturas.filter((f) => f.estado_factura === "Pendiente").length
          }
          icon={<Clock size={20} />}
          color="yellow"
        />
        <DashboardCard
          title="Facturas Aprobadas"
          value={facturas.filter((f) => f.estado_factura === "Aprobada").length}
          icon={<CircleCheck size={20} />}
          color="blue"
        />
        <DashboardCard
          title="Facturas en Pago"
          value={facturas.filter((f) => f.estado_factura === "Pagando").length}
          icon={<CircleFadingArrowUp size={20} />}
          color="purple"
        />
        <DashboardCard
          title="Facturas Pagadas"
          value={facturas.filter((f) => f.estado_factura === "Pagada").length}
          icon={<Check size={20} />}
          color="green"
        />
        <DashboardCard
          title="Facturas Rechazadas"
          value={
            facturas.filter((f) => f.estado_factura === "Rechazada").length
          }
          icon={<AlertTriangle size={20} />}
          color="red"
        />
      </div>

      <ListaFacturas
        facturas={facturas}
        user={user}
        onFacturasCargar={cargarFacturas}
      />
    </div>
  );
}
