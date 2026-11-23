import React from "react";
import Button from "../../../components/Button";
import { DetalleBien } from "../data/models";
import { Pencil, Trash2, Info } from "lucide-react";

interface BienesTableProps {
  bienes: DetalleBien[];
  onAddClick: () => void;
  onEditClick: (bien: DetalleBien) => void;
  onDeleteClick: (bienId: number) => void;
  bienesData: { [key: number]: string };
  edit: boolean;
}

const TablaBienes: React.FC<BienesTableProps> = ({
  bienes,
  onAddClick,
  onEditClick,
  onDeleteClick,
  bienesData,
  edit,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bienes</h2>
        <div className="flex space-x-2">
          {edit && (
            <Button
              variant="primary"
              onClick={onAddClick}
              icon={<span>+</span>}
            >
              Agregar
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ítem
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Marca
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cantidad
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bienes.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No hay bienes agregados. Haga clic en "Agregar" para comenzar.
                </td>
              </tr>
            ) : (
              bienes.map((bien, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bienesData[bien.id_bien]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bien.marca}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bien.cantidad} {bien.unidad_medida}
                  </td>
                  {edit && (
                    <td className="pl-8 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => onEditClick(bien)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() =>
                          bien.id_detalle && onDeleteClick(bien.id_detalle)
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                  {!edit && (
                    <td className="pl-11 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEditClick(bien)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Info size={20} />
                    </button>
                  </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaBienes;
