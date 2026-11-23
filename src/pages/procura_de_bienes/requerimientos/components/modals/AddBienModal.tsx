import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../../components/Modal';
import Button from '../../../../components/Button';
import Toast from '../../../../components/Toast'; 
import { Bien } from '../../data/models'
import { createBien } from '../../data/api';

interface AddBienModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function AddBienModal({
  isOpen,
  onClose,
  onSaveSuccess,
}: AddBienModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Bien>({
    id_bien: 0,
    nombre: '',
    descripcion: '',
    categoria: ''
  });
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {      
      await createBien(formData);
      onSaveSuccess();
      setFormData({
        id_bien: 0,
        nombre: '',
        descripcion: '',
        categoria: ''
      });
      setToastMessage('¡Bien guardado exitosamente!');
      setToastType('success');
      setShowToast(true);
      
      onClose();

    } catch (error) {
      console.error("Error en el guardado:", error);
      setToastMessage('Error al guardar el bien. Por favor, inténtelo de nuevo.');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nuevo Bien">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Materiales">Materiales</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Guardar Bien
            </Button>
          </div>
        </form>
      </Modal>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleCloseToast}
          duration={1000}
        />
      )}
    </>
  );
}