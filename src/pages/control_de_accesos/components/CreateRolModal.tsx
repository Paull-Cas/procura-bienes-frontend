import React, { useEffect, useState } from "react";
import { createRol, fetchModulos, fetchPermisos, fetchRoles } from "../data/api";
import RolForm from "./RolForm";
import { Permiso, Modulo, Rol } from "../data/models";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated: () => void;
}

interface FormData {
  rol: Rol;
  selectedPermisos: number[];
}

export default function CreateRoleModal ({
  isOpen,
  onClose,
  onRoleCreated
}: CreateRoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [formData, setFormData] = useState<FormData>({
    rol: {
      nombre: "",
      descripcion: "",
      estado: 1,
    },
    selectedPermisos: [],
  });

  // Estados para Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const cargarData = async () => {
    setLoading(true);
    try {
      const fetchedPermisos = await fetchPermisos();
      const fetchedModulos = await fetchModulos();
      const fetchedRoles = await fetchRoles();
      
      setPermisos(fetchedPermisos);
      setModulos(fetchedModulos);
      setRoles(fetchedRoles);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setToastMessage("Error al cargar los datos necesarios");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarData();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      rol: {
        nombre: "",
        descripcion: "",
        estado: 1,
      },
      selectedPermisos: [],
    });
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const rolData = {
        nombre: formData.rol.nombre.trim(),
        descripcion: formData.rol.descripcion.trim(),
        estado: formData.rol.estado,
      };

      const success = await createRol(rolData, formData.selectedPermisos);

      if (success) {
        setToastMessage("¡Rol creado exitosamente!");
        setToastType("success");
        setShowToast(true);
        
        // Esperar un momento para mostrar el toast antes de cerrar
        setTimeout(() => {
          resetForm();
          onRoleCreated();
          onClose();
        }, 500);
      } else {
        setToastMessage("Error al crear el rol. Por favor intenta nuevamente.");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error al crear rol:", error);
      setToastMessage("Error al crear el rol. Por favor intenta nuevamente.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Nuevo Rol"
        subtitle="Crear un nuevo rol y asignarle permisos"
        size="xl"
      >
        <div className="bg-white rounded-lg w-full">
          <RolForm
            initialData={formData}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={loading}
            permisos={permisos}
            modulos={modulos}
            roles={roles}
          />
        </div>
      </Modal>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleCloseToast}
          duration={3000}
        />
      )}
    </>
  );
};