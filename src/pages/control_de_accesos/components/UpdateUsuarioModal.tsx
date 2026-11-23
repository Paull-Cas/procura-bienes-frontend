import { useEffect, useState } from "react";
import {
  updateUsuario,
  fetchUsuarios, 
} from "../data/api";
import UsuarioForm from "./UsuarioForm";
import { Rol, Usuario } from "../data/models";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

interface FormData {
  nombre_usuario: string;
  alias: string;
  email: string;
  estado: 0 | 1;
  contrasena: string;
  id_rol: number | null;
}

interface UpdateUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsuarioUpdated: () => void;
  usuario: Usuario;
  roles: Rol[];
}

export default function UpdateUsuarioModal({
  isOpen,
  onClose,
  onUsuarioUpdated,
  usuario,
  roles,
}: UpdateUsuarioModalProps) {
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre_usuario: "",
    alias: "",
    email: "",
    estado: 1,
    contrasena: "",
    id_rol: null,
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const cargarData = async () => {
    setLoading(true);
    try {
      const fetchedUsuarios = await fetchUsuarios();
      setUsuarios(fetchedUsuarios);
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
    if (isOpen && usuario) {
      cargarData();
      setFormData({
        nombre_usuario: usuario.nombre_usuario,
        alias: usuario.alias,
        email: usuario.email,
        estado: usuario.estado,
        contrasena: "", 
        id_rol: usuario.id_rol!,
      });
    }
  }, [isOpen, usuario]);

  const resetForm = () => {
    setFormData({
      nombre_usuario: "",
      alias: "",
      email: "",
      estado: 1,
      contrasena: "",
      id_rol: null,
    });
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const usuarioData = {
        nombre_usuario: formData.nombre_usuario.trim(),
        alias: formData.alias.trim(),
        email: formData.email.trim(),
        estado: formData.estado,
        id_rol: formData.id_rol!,
      };

      const success = await updateUsuario(
        usuario.id_usuario!,
        usuarioData
      );

      if (success) {
        setToastMessage("¡Usuario actualizado exitosamente!");
        setToastType("success");
        setShowToast(true);

        setTimeout(() => {
          resetForm();
          onUsuarioUpdated();
          onClose();
        }, 500);
      } else {
        setToastMessage(
          "Error al actualizar el usuario. Por favor intenta nuevamente."
        );
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setToastMessage(
        "Error al actualizar el usuario. Por favor intenta nuevamente."
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
        title={`Editar Usuario: ${formData.nombre_usuario}`}
        subtitle="Modificar datos del usuario existente"
        size="lg"
      >
        <div className="bg-white rounded-lg w-full">
          <UsuarioForm
            initialData={formData}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={loading}
            isEditing={true}
            roles={roles}
            usuarios={usuarios}
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