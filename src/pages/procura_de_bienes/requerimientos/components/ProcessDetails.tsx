import { FileText, CheckSquare, AlertTriangle } from 'lucide-react';

const ProcessDetails: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-10">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
        <h2 className="text-xl font-bold text-white">Descripción del Proceso</h2>
      </div>
      <div className="p-6">
        <p className="text-gray-700 mb-6">
          El caso de uso inicia cuando el Jefe de Área identifica una necesidad de bienes, por ello rellena un formato de 
          requerimiento de bienes, el cual es una lista de bienes con especificaciones. Este requerimiento debe se evaluado 
          por el Jefe de Control de Proyectos, para su validación. En caso de que no cumpla con las especificaciones se 
          realizará una justificación del requerimiento, el cual también será evaluado.
        </p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-orange-600 flex items-center mb-3">
              <FileText className="mr-2" size={20} />
              Flujo Básico
            </h3>
            <ul className="list-decimal pl-8 space-y-2 text-gray-700">
              <li className="transition-all duration-300 hover:text-orange-600">
                Jefe de área rellena un formato de requerimiento de bienes con los bienes necesitados.
              </li>
              <li className="transition-all duration-300 hover:text-orange-600">
                Jefe de control de proyectos evalúa si el requerimiento está dentro del presupuesto meta.
              </li>
              <li className="transition-all duration-300 hover:text-orange-600">
                Si el requerimiento está dentro del presupuesto meta, el Encargado de Compras activa la búsqueda cotizaciones para el requerimiento (Gestionar Cotizaciones).
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
                <span className="font-medium mr-2">Paso 3a:</span>
                <span className="transition-all duration-300 hover:text-orange-600">
                  Si el requerimiento no está dentro del presupuesto meta, el Jefe de Control de Proyectos rechaza el requerimiento y realiza una observación.
                </span>
              </li>
              <li>
                <span className="font-medium mr-2">Paso 3b:</span>
                <span className="transition-all duration-300 hover:text-orange-600">
                  El Jefe de Área de ser necesario, realiza una justificación del requerimiento.
                </span>
              </li>
              <li>
                <span className="font-medium mr-2">Paso 3c:</span>
                <span className="ml-4 transition-all duration-300 hover:text-orange-600">
                  El Jefe de Control de Proyectos evalúa la justificación.
                </span>
                <ul className="ml-8 mt-1 space-y-1">
                  <li className="transition-all duration-300 hover:text-orange-600">
                    Paso 3-c-1: Si la Justificación es aceptada entonces sigue el flujo (paso 3).
                  </li>
                  <li className="transition-all duration-300 hover:text-orange-600">
                    Paso 3-c-2: si la Justificación no es aceptada entonces termina el proceso.
                  </li>
                </ul>
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
                    El Jefe de área debe realizar su requerimiento de acuerdo al presupuesto meta.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-800">Postcondiciones:</p>
                <ul className="list-disc pl-8 text-gray-700">
                  <li className="transition-all duration-300 hover:text-orange-600">
                    El requerimiento aprobado es archivado y se inicia con el proceso de Gestionar Cotizaciones.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetails;