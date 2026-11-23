import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

let modalStack: HTMLDivElement[] = [];

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children,
  size = 'md'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (modalStack[modalStack.length - 1] === modalRef.current) {
          onClose();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        modalRef.current &&
        isOpen &&
        modalStack[modalStack.length - 1] === modalRef.current &&
        !modalRef.current.contains(target)
      ) {
        onClose();
      }
    };

    if (isOpen && modalRef.current) {
      modalStack.push(modalRef.current);
    }

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
      
      if (modalRef.current) {
        modalStack = modalStack.filter(modal => modal !== modalRef.current);
      }
    };
  }, [isOpen, onClose]);

  // Versión más simple del manejo de scroll
  useEffect(() => {
    if (isOpen) {
      // Solo prevenir scroll, sin fijar posición
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurar scroll cuando se cierre
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    xxl: 'max-w-6xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      data-modal-layer
    >
      <div 
        ref={modalRef}
        className={`${sizeClasses[size]} w-full bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold">{title}</h2>
            {subtitle && (
              <p className="text-blue-100 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-white/20"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;