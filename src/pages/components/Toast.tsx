import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 1000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-emerald-100 border-emerald-400 text-emerald-700',
    error: 'bg-red-100 border-red-400 text-red-700'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md border ${typeStyles[type]} shadow-lg`}>
      <div className="flex items-center">
        <span className="mr-2">
          {type === 'success' ? '✅' : '❌'}
        </span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;