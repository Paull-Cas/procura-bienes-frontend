
interface StatusBadgeProps {
  status: string;
  type: 'factura';
}

export default function StatusBadge ({status, type}: StatusBadgeProps) {
  const getStatusClasses = () => {
    if (type === 'factura') {
      switch (status) {
        case 'Pendiente':
          return 'bg-yellow-100 text-yellow-800';
        case 'Aprobada':
          return 'bg-blue-100 text-blue-800';
        case 'Pagando':
          return 'bg-purple-100 text-purple-800';
        case 'Pagada':
          return 'bg-green-100 text-green-800';
        case 'Rechazada':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};