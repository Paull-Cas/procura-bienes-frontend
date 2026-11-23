import React, { useEffect, useState } from "react";
import {
  updateRol,
  fetchModulos,
  fetchPermisos,
  fetchRoles,
} from "../data/api";
import RolForm from "./RolForm";
import { Permiso, Modulo, Rol, RolConPermisos } from "../data/models";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

interface FormData {
  rol: Rol;
  selectedPermisos: number[];
}

interface UpdateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleUpdated: () => void;
  rolConPermisos: RolConPermisos;
}

export default function UpdateRolModal({
  isOpen,
  onClose,
  onRoleUpdated,
  rolConPermisos,
}: UpdateRoleModalProps) {
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
    if (isOpen && rolConPermisos) {
      cargarData();
      setFormData({
        rol: {
          nombre: rolConPermisos.rol.nombre,
          descripcion: rolConPermisos.rol.descripcion,
          estado: rolConPermisos.rol.estado,
        },
        selectedPermisos: rolConPermisos.permisos!.map((permiso) => permiso.id_permiso!),
      });
    }
  }, [isOpen, rolConPermisos]);

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

      const success = await updateRol(
        rolConPermisos.rol.id_rol!,
        rolData,
        formData.selectedPermisos
      );

      if (success) {
        setToastMessage("¡Rol actualizado exitosamente!");
        setToastType("success");
        setShowToast(true);

        // Esperar un momento para mostrar el toast antes de cerrar
        setTimeout(() => {
          resetForm();
          onRoleUpdated();
          onClose();
        }, 500);
      } else {
        setToastMessage(
          "Error al actualizar el rol. Por favor intenta nuevamente."
        );
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      setToastMessage(
        "Error al actualizar el rol. Por favor intenta nuevamente."
      );
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
        title={`Editar Rol: ${formData.rol.nombre}`}
        subtitle="Modificar rol existente y sus permisos"
        size="xl"
      >
        <div className="bg-white rounded-lg w-full">
          <RolForm
            initialData={formData}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={loading}
            isEditing={true}
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
}
