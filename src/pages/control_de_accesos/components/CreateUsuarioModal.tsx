import React, { useEffect, useState } from "react";
import { createUsuario, fetchRoles } from "../data/api";
import UsuarioForm from "./UsuarioForm";
import { Rol, Usuario } from "../data/models";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

interface CreateUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  roles: Rol[];
}

interface FormData {
  nombre_usuario: string;
  alias: string; // ✅ Campo alias agregado
  email: string;
  estado: 0 | 1;
  contrasena: string;
  id_rol: number | null;
}

export default function CreateUsuarioModal({
  isOpen,
  onClose,
  onCreate,
  roles
}: CreateUsuarioModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre_usuario: "",
    alias: "", // ✅ Inicializar alias
    email: "",
    estado: 1,
    contrasena: "",
    id_rol: null,
  });

  // Estados para Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const resetForm = () => {
    setFormData({
      nombre_usuario: "",
      alias: "", // ✅ Resetear alias
      email: "",
      estado: 1,
      contrasena: "",
      id_rol: null,
    });
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const usuarioData : Usuario = {
        nombre_usuario: formData.nombre_usuario.trim(),
        alias: formData.alias.trim(), // ✅ Incluir alias en usuarioData
        email: formData.email.trim(),
        estado: formData.estado,
        contrasena: formData.contrasena,
        id_rol: formData.id_rol!,
      };

      const success = await createUsuario(usuarioData);

      if (success) {
        setToastMessage("¡Usuario creado exitosamente!");
        setToastType("success");
        setShowToast(true);
        
        // Esperar un momento para mostrar el toast antes de cerrar
        setTimeout(() => {
          resetForm();
          onCreate();
          onClose();
        }, 500);
      } else {
        setToastMessage("Error al crear el usuario. Por favor intenta nuevamente.");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      setToastMessage("Error al crear el usuario. Por favor intenta nuevamente.");
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
        title="Nuevo Usuario"
        subtitle="Crear un nuevo usuario y asignarle un rol"
        size="md"
      >
        <div className="bg-white rounded-lg w-full">
          <UsuarioForm
            initialData={formData}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={loading}
            roles={roles}
            isEditing={false}
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