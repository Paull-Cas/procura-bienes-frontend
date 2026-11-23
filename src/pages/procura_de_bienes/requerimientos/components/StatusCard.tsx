import { ClipboardCheck, FileWarning, FilePlus, FileQuestion } from 'lucide-react';

type StatusProps = {
  type: 'aprobado' | 'pendiente' | 'rechazado' | 'justificado';
  description: string;
};

const StatusCard: React.FC<StatusProps> = ({ type, description }) => {
  const getStatusContent = () => {
    switch (type) {
      case 'aprobado':
        return {
          icon: <ClipboardCheck size={24} className="text-green-500" />,
          title: 'Requerimiento Aprobado',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-700'
        };
      case 'pendiente':
        return {
          icon: <FileQuestion size={24} className="text-blue-500" />,
          title: 'Requerimiento Pendiente',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-700'
        };
      case 'rechazado':
        return {
          icon: <FileWarning size={24} className="text-red-500" />,
          title: 'Requerimiento Rechazado',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-700'
        };
      case 'justificado':
        return {
          icon: <FilePlus size={24} className="text-orange-500" />,
          title: 'Requerimiento en Justificación',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-700'
        };
      default:
        return {
          icon: <FileQuestion size={24} className="text-gray-500" />,
          title: 'Estado Desconocido',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-700'
        };
    }
  };

  const status = getStatusContent();

  return (
    <div className={`rounded-lg p-4 ${status.bgColor} border-l-4 ${status.borderColor} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center">
        {status.icon}
        <h3 className={`ml-2 font-semibold ${status.textColor}`}>{status.title}</h3>
      </div>
      <p className="mt-2 text-gray-700 text-sm">{description}</p>
    </div>
  );
};

export default StatusCard;