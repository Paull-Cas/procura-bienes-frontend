import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock,
  Info,
  Key,
  Lightbulb,
  TrendingUp,
  Layers,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Workflow,
  Lock,
  Users,
  BarChart3,
  CheckCircle,
  Settings,
  Eye,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const workflowSteps = [
    {
      step: 1,
      title: 'Configurar Permisos',
      description: 'Define qué acciones se pueden realizar en cada módulo y submódulo',
      icon: Key,
      color: 'bg-blue-500'
    },
    {
      step: 2,
      title: 'Crear Roles',
      description: 'Agrupa permisos relacionados en roles con propósitos específicos',
      icon: Shield,
      color: 'bg-purple-500'
    },
    {
      step: 3,
      title: 'Asignar Roles',
      description: 'Asigna el rol apropiado a cada usuario según sus responsabilidades',
      icon: UserPlus,
      color: 'bg-green-500'
    }
  ];

  const moduleExample = {
    name: 'Control de Accesos',
    icon: Shield,
    childModules: [
      {
        name: 'Gestión de Usuarios',
        grandchildModules: ['Usuarios', 'Roles', 'Permisos'],
        permissions: ['usuarios.crear', 'usuarios.ver', 'usuarios.editar', 'usuarios.eliminar']
      },
      {
        name: 'Configuración de Seguridad',
        grandchildModules: ['Políticas', 'Auditoría', 'Sesiones'],
        permissions: ['seguridad.configurar', 'seguridad.auditar', 'seguridad.ver_logs']
      }
    ]
  };

  const bestPractices = [
    {
      title: 'Roles por Función de Negocio',
      description: 'Agrupa permisos según las responsabilidades reales del trabajo',
      icon: Workflow,
      tip: 'Piensa en qué necesita hacer cada persona diariamente'
    },
    {
      title: 'Revisión Periódica de Asignaciones',
      description: 'Verifica que los usuarios tengan solo lo que necesiten',
      icon: ShieldCheck,
      tip: 'Audita roles trimestralmente para mantener seguridad'
    }
  ];

  const quickActions = [
    {
      icon: Key,
      text: 'Revisa si nuevos módulos necesitan permisos específicos'
    },
    {
      icon: Users,
      text: 'Verifica que cada rol tenga permisos coherentes'
    },
    {
      icon: BarChart3,
      text: 'Analiza qué permisos se usan más frecuentemente'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Roles y Permisos
                </h1>
              </div>
              <p className="text-gray-600">
                Configura permisos por módulos, crea roles y asígnalos a usuarios
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Flujo de Trabajo */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Flujo de Configuración</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-800 text-white rounded-full text-sm font-bold">
                        {step.step}
                      </div>
                      <div className={`${step.color} p-2 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Estructura de Módulos Jerárquica */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Estructura de Módulos Jerárquica</h2>
          </div>
          
          {/* Nota sobre permisos configurados por desarrollador */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Configuración de Permisos</h4>
                <p className="text-sm text-yellow-700">
                  Los permisos específicos son configurados internamente por el desarrollador en el código del sistema. 
                  Aquí solo se asignan y gestionan los roles que agrupan estos permisos predefinidos.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Módulo Padre (Menú Lateral) */}
            <div className="bg-gray-800 text-white p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-lg">{moduleExample.name}</h3>
                  <p className="text-gray-300 text-sm">Módulo Padre - Menú lateral</p>
                </div>
              </div>
            </div>

            {/* Módulos Hijo */}
            <div className="bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-600 mb-3">Módulos Hijo (páginas principales):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moduleExample.childModules.map((childModule, childIdx) => (
                  <div key={childIdx} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">{childModule.name}</h4>
                    
                    {/* Módulos Nieto (Navegación Superior) */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Navegación Superior (Nietos):</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {childModule.grandchildModules.map((grandchild, grandIdx) => (
                          <span key={grandIdx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border">
                            {grandchild}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Permisos CRUD */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Permisos CRUD (configurados por desarrollador):</p>
                      <div className="flex flex-wrap gap-1">
                        {childModule.permissions.map((perm, permIdx) => (
                          <code key={permIdx} className="text-xs bg-gray-800 text-green-400 px-2 py-1 rounded">
                            {perm}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mejores Prácticas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Mejores Prácticas</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bestPractices.map((practice, index) => {
              const Icon = practice.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="text-purple-600 mt-1">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">{practice.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{practice.description}</p>
                      <div className="bg-purple-100 border-l-4 border-purple-500 p-3 rounded">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-purple-700">
                            <strong>Tip:</strong> {practice.tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consejos Rápidos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Consejos de Gestión</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-600 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-gray-700">{tip.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};