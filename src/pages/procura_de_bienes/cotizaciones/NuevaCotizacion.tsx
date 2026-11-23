import { useEffect, useState } from "react";
import { Procura } from "../data/models";
import { UsuarioProfile } from "../../data/models";
import ListaProcuras from "./components/ListaProcuras";
import CotizacionProcura from "./components/CotizacionProcura";

interface NuevaCotizacionProps {
  user: UsuarioProfile;
}

export default function NuevaCotizacion({ user }: NuevaCotizacionProps) {
  const [permisos, setPermisos] = useState<string[]>([]);
  const [procuraSeleccionada, setProcuraSeleccionada] = useState<Procura | null>(null);
  const [vistaActual, setVistaActual] = useState<'lista' | 'detalle'>('lista');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');

  useEffect(() => {
    const getPermisos = user.permisos.map((p) => p.codigoPermiso);
    setPermisos(getPermisos);
  }, [user.permisos]);

  const showSuccessToast = (titulo: string) => {
    setToastMessage(`Cotización creada exitosamente:\n• ${titulo}`);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(`Error al guardar: ${message}`);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const showWarningToast = (message: string) => {
    setToastMessage(message);
    setToastType('warning');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleProcuraClick = (procura: Procura) => {
    // Verificar si la procura está vencida
    if (procura.estado?.toLowerCase() === 'vencido') {
      showWarningToast('No se puede cotizar una procura vencida');
      return;
    }

    setProcuraSeleccionada(procura);
    setVistaActual('detalle');
  };

  const handleBackToList = () => {
    setVistaActual('lista');
    setProcuraSeleccionada(null);
  };

  const handleCotizacionSuccess = (titulo: string) => {
    showSuccessToast(titulo);
    // Regresar a la lista después del éxito
    setTimeout(() => {
      handleBackToList();
    }, 1000);
  };

  const handleCotizacionError = (error: string) => {
    showErrorToast(error);
  };

  const getToastColor = () => {
    switch (toastType) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Renderizar según la vista actual
  if (vistaActual === 'detalle' && procuraSeleccionada) {
    return (
      <div className="relative">
        {/* Toast */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className={`${getToastColor()} text-white px-6 py-4 rounded-lg shadow-lg max-w-md`}>
              <div className="flex justify-between items-start">
                <pre className="text-sm font-medium whitespace-pre-line">{toastMessage}</pre>
                <button
                  onClick={() => setShowToast(false)}
                  className="ml-4 text-white hover:text-gray-200 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        <CotizacionProcura
          user={user}
          procura={procuraSeleccionada}
          onBack={handleBackToList}
          onSuccess={handleCotizacionSuccess}
          onError={handleCotizacionError}
        />
      </div>
    );
  }

  // Vista por defecto: lista de procuras
  return (
    <div className="rounded-lg pb-2">
      {/* Toast para la lista */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`${getToastColor()} text-white px-6 py-4 rounded-lg shadow-lg max-w-md`}>
            <div className="flex justify-between items-start">
              <pre className="text-sm font-medium whitespace-pre-line">{toastMessage}</pre>
              <button
                onClick={() => setShowToast(false)}
                className="ml-4 text-white hover:text-gray-200 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <ListaProcuras 
        user={user}
        onProcuraClick={handleProcuraClick}
      />
    </div>
  );
}