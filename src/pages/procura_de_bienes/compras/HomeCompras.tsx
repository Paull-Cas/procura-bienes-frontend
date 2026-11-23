import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Users,
  FileText,
  AlertTriangle,
  CheckSquare,
  CheckCircle,
  UserCircle2,
  PackageCheck,
  ClipboardCheck,
  FileClock,
} from "lucide-react";

const roles = [
  {
    title: "Encargado de Compras",
    icon: <UserCircle2 size={48} className="text-orange-500" />,
    description: "Compara las ofertas cotizadas y emite las órdenes de compra.",
    actions: [
      "Comparar precios de los proveedores por cada ítem",
      "Seleccionar la mejor oferta y emitir la orden de compra por proveedor",
      "Adjuntar el contrato al emitir la orden",
      "Registrar los pagos de las facturas",
    ],
  },
  {
    title: "Proveedor",
    icon: <PackageCheck size={48} className="text-orange-500" />,
    description: "Recibe, revisa y acepta las órdenes de compra asignadas.",
    actions: [
      "Revisar las órdenes de compra emitidas a su nombre",
      "Aceptar la orden de compra",
      "Cargar la factura de la orden aceptada",
    ],
  },
];

const estados = [
  {
    icon: <FileClock size={24} className="text-amber-500" />,
    title: "Orden Emitida",
    bg: "bg-amber-50",
    border: "border-amber-500",
    text: "text-amber-700",
    description:
      "La orden de compra fue generada por el Encargado de Compras y está a la espera de que el proveedor la acepte.",
  },
  {
    icon: <ClipboardCheck size={24} className="text-green-500" />,
    title: "Orden Aceptada",
    bg: "bg-green-50",
    border: "border-green-500",
    text: "text-green-700",
    description:
      "El proveedor confirmó la orden de compra. Ya se puede cargar la factura asociada.",
  },
];

export default function HomeCompras() {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 rounded-lg">
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {/* Hero */}
        <section
          className={`mb-10 transition-all duration-1000 delay-200 transform ${
            isAnimated ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-start md:items-center mb-4">
              <ShoppingCart size={28} className="text-orange-500 mr-3 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-gray-800">
                Flujo de Trabajo del Módulo de Compras
              </h2>
            </div>
            <p className="text-gray-700">
              Este módulo permite gestionar la compra de bienes: comparar las ofertas cotizadas por
              los proveedores, emitir las órdenes de compra (con su contrato) y darles seguimiento
              hasta que el proveedor las acepta y se procesan la factura y el pago.
            </p>
          </div>
        </section>

        {/* Descripción del proceso */}
        <section
          className={`mb-12 transition-all duration-1000 delay-400 transform ${
            isAnimated ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
              <h2 className="text-xl font-bold text-white">Descripción del Proceso</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                El proceso de compras inicia cuando una procura ya tiene cotizaciones evaluadas
                técnicamente. El Encargado de Compras compara las ofertas por ítem, selecciona las
                mejores y emite una orden de compra por cada proveedor. El proveedor revisa y acepta
                su orden, habilitando la carga de la factura y su posterior pago.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-orange-600 flex items-center mb-3">
                    <FileText className="mr-2" size={20} />
                    Flujo Básico
                  </h3>
                  <ul className="list-decimal pl-8 space-y-2 text-gray-700">
                    <li className="transition-all duration-300 hover:text-orange-600">
                      El Encargado de Compras abre el comparativo de una procura y ve las ofertas
                      aceptadas técnicamente por cada ítem.
                    </li>
                    <li className="transition-all duration-300 hover:text-orange-600">
                      Selecciona la mejor oferta por ítem (cada ítem solo puede comprarse una vez).
                    </li>
                    <li className="transition-all duration-300 hover:text-orange-600">
                      Agrupa la selección por proveedor y emite una orden de compra por cada uno,
                      adjuntando el contrato.
                    </li>
                    <li className="transition-all duration-300 hover:text-orange-600">
                      El proveedor revisa y acepta su orden de compra.
                    </li>
                    <li className="transition-all duration-300 hover:text-orange-600">
                      Con la orden aceptada, el proveedor carga la factura y Administración registra
                      el pago.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-orange-600 flex items-center mb-3">
                    <AlertTriangle className="mr-2" size={20} />
                    Flujo Alternativo
                  </h3>
                  <ul className="pl-8 space-y-2 text-gray-700">
                    <li>
                      <span className="font-medium mr-2">Ítem sin ofertas:</span>
                      <span className="transition-all duration-300 hover:text-orange-600">
                        Si un ítem no tiene ofertas aceptadas técnicamente, no aparece en el
                        comparativo y no puede comprarse hasta que se cotice y evalúe.
                      </span>
                    </li>
                    <li>
                      <span className="font-medium mr-2">Ítem ya comprado:</span>
                      <span className="transition-all duration-300 hover:text-orange-600">
                        Una vez que un ítem se incluye en una orden de compra, deja de estar
                        disponible para nuevas órdenes de la misma procura.
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-orange-600 flex items-center mb-3">
                    <CheckSquare className="mr-2" size={20} />
                    Condiciones
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-800">Precondiciones:</p>
                      <ul className="list-disc pl-8 text-gray-700">
                        <li className="transition-all duration-300 hover:text-orange-600">
                          La procura debe tener cotizaciones con ítems aceptados técnicamente.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Postcondiciones:</p>
                      <ul className="list-disc pl-8 text-gray-700">
                        <li className="transition-all duration-300 hover:text-orange-600">
                          La orden de compra queda registrada como "Emitida" y sus ítems dejan de
                          estar disponibles para nuevas órdenes.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roles y responsabilidades */}
        <section
          className={`mb-12 transition-all duration-1000 delay-500 transform ${
            isAnimated ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users size={28} className="text-orange-500 mr-3" />
              Roles y Responsabilidades
            </h2>
            <p className="text-gray-600 mt-2">
              Cada participante del proceso de compras tiene responsabilidades específicas para que
              las órdenes se emitan y procesen correctamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((rol) => (
              <div
                key={rol.title}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {rol.icon}
                    <h3 className="ml-4 text-xl font-bold text-gray-800">{rol.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{rol.description}</p>
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Responsabilidades:</h4>
                    <ul className="space-y-2">
                      {rol.actions.map((action, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle
                            size={16}
                            className="text-orange-500 mt-1 mr-2 flex-shrink-0"
                          />
                          <span className="text-gray-600">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Estados de la orden */}
        <section
          className={`mb-12 transition-all duration-1000 delay-600 transform ${
            isAnimated ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Estados de la Orden de Compra</h2>
            <p className="text-gray-600 mt-2">
              Durante su ciclo de vida, una orden de compra puede pasar por los siguientes estados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estados.map((est) => (
              <div
                key={est.title}
                className={`rounded-lg p-4 ${est.bg} border-l-4 ${est.border} transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-center">
                  {est.icon}
                  <h3 className={`ml-2 font-semibold ${est.text}`}>{est.title}</h3>
                </div>
                <p className="mt-2 text-gray-700 text-sm">{est.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
