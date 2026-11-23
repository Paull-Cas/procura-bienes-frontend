import { useState, useEffect } from 'react';
import ProcessDetails from './components/ProcessDetails';
import RoleCard from './components/RoleCard';
import StatusCard from './components/StatusCard';
import { FileText, Users } from 'lucide-react';

export default function HomeRequerimientos() {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 rounded-lg">

      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <section className={`mb-10 transition-all duration-1000 delay-200 transform ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-start md:items-center mb-4">
              <FileText size={28} className="text-orange-500 mr-3 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-gray-800">Flujo de Trabajo del Módulo de Requerimientos</h2>
            </div>
            <p className="text-gray-700">
              Este módulo permite la gestión completa del ciclo de vida de los requerimientos de bienes, 
              desde su creación inicial por el Jefe de Área hasta su aprobación final y procesamiento.
            </p>
          </div>
        </section>

        <section className={`mb-12 transition-all duration-1000 delay-400 transform ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProcessDetails />
        </section>

        <section className={`mb-12 transition-all duration-1000 delay-500 transform ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users size={28} className="text-orange-500 mr-3" />
              Roles y Responsabilidades
            </h2>
            <p className="text-gray-600 mt-2">
              Cada participante del proceso tiene responsabilidades específicas para asegurar que los requerimientos 
              se procesen de manera eficiente y efectiva.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RoleCard 
              title="Jefe de Área" 
              description="Responsable de identificar necesidades y crear requerimientos"
              icon="jefe-area"
              actions={[
                "Identificar necesidades de bienes para el área",
                "Rellenar y enviar formatos de requerimiento",
                "Justificar requerimientos cuando sea necesario"
              ]}
            />
            
            <RoleCard 
              title="Jefe de Control de Proyectos" 
              description="Evalúa y valida los requerimientos según el presupuesto"
              icon="jefe-control"
              actions={[
                "Revisar requerimientos contra presupuesto meta",
                "Aprobar o rechazar requerimientos",
                "Evaluar justificaciones de requerimientos"
              ]}
            />
            
            <RoleCard 
              title="Encargado de Compras" 
              description="Gestiona las cotizaciones para requerimientos aprobados"
              icon="encargado-compras"
              actions={[
                "Iniciar proceso de búsqueda de cotizaciones",
                "Gestionar proveedores y ofertas",
                "Procesar requerimientos aprobados"
              ]}
            />
          </div>
        </section>

        <section className={`mb-12 transition-all duration-1000 delay-600 transform ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Estados del Requerimiento</h2>
            <p className="text-gray-600 mt-2">
              Durante su ciclo de vida, un requerimiento puede pasar por diferentes estados que indican su progreso en el sistema.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatusCard 
              type="pendiente" 
              description="El requerimiento ha sido creado y está esperando revisión por parte del Jefe de Control de Proyectos." 
            />
            
            <StatusCard 
              type="aprobado" 
              description="El requerimiento cumple con el presupuesto meta y ha sido aprobado para continuar con el proceso de cotización." 
            />
            
            <StatusCard 
              type="rechazado" 
              description="El requerimiento no cumple con el presupuesto meta y ha sido rechazado con observaciones." 
            />
            
            <StatusCard 
              type="justificado" 
              description="El requerimiento ha sido rechazado pero solicita una justificación por parte del solicitante." 
            />
          </div>
        </section>
      </main>
    </div>
  );
}
