import React, { useState, useEffect } from 'react';
import { Check, X, User, Mail, Lock, Shield, Eye, EyeOff, AtSign } from 'lucide-react';
import { Rol } from '../data/models';
import Toast from '../../components/Toast';

interface UsuarioFormProps {
  initialData: {
    nombre_usuario: string;
    alias: string;
    email: string;
    estado: 0 | 1;
    contrasena: string;
    id_rol: number | null;
  };
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  roles: Rol[];
  isEditing: boolean;
  loading?: boolean;
  usuarios?: any[];
}

export default function UsuarioForm({
  initialData,
  onSubmit,
  onCancel,
  roles,
  isEditing,
  loading = false,
  usuarios = []
}: UsuarioFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  // Actualizar formData cuando initialData cambie (importante para el modo edición)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Función específica para manejar el cambio del alias
  const handleAliasChange = (value: string) => {
    // Filtrar solo letras y convertir a minúsculas
    const filteredValue = value
      .replace(/[^a-zA-Z]/g, '') // Eliminar todo lo que no sean letras
      .toLowerCase(); // Convertir a minúsculas
    
    setFormData(prev => ({ ...prev, alias: filteredValue }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsuarioExists = (nombre_usuario: string, alias: string, email: string): { exists: boolean; field: string; value: string } => {
    const nombreTrimmed = nombre_usuario.trim().toLowerCase();
    const aliasTrimmed = alias.trim().toLowerCase();
    const emailTrimmed = email.trim().toLowerCase();
    
    // Si estamos editando, excluir el usuario actual de la validación
    const usuariosToCheck = isEditing 
      ? usuarios.filter(user => 
          user.nombre_usuario.toLowerCase() !== initialData.nombre_usuario.toLowerCase() &&
          user.alias?.toLowerCase() !== initialData.alias?.toLowerCase() &&
          user.email.toLowerCase() !== initialData.email.toLowerCase()
        )
      : usuarios;
    
    // Verificar nombre de usuario
    const existingUser = usuariosToCheck.find(user => 
      user.nombre_usuario.trim().toLowerCase() === nombreTrimmed
    );
    
    if (existingUser) {
      return { exists: true, field: 'nombre_usuario', value: nombre_usuario.trim() };
    }

    // Verificar alias
    const existingAlias = usuariosToCheck.find(user => 
      user.alias?.trim().toLowerCase() === aliasTrimmed
    );
    
    if (existingAlias) {
      return { exists: true, field: 'alias', value: alias.trim() };
    }

    // Verificar email
    const existingEmail = usuariosToCheck.find(user => 
      user.email.trim().toLowerCase() === emailTrimmed
    );
    
    if (existingEmail) {
      return { exists: true, field: 'email', value: email.trim() };
    }

    return { exists: false, field: '', value: '' };
  };

  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (!password && !isEditing) {
      return { valid: false, message: "La contraseña es obligatoria" };
    }
    
    if (password && password.length < 6) {
      return { valid: false, message: "La contraseña debe tener al menos 6 caracteres" };
    }
    
    return { valid: true, message: "" };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que el nombre de usuario no esté vacío
    if (!formData.nombre_usuario.trim()) {
      setToastMessage("El nombre de usuario es obligatorio");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que el nombre de usuario tenga al menos 3 caracteres
    if (formData.nombre_usuario.trim().length < 3) {
      setToastMessage("El nombre de usuario debe tener al menos 3 caracteres");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que el alias no esté vacío
    if (!formData.alias.trim()) {
      setToastMessage("El alias es obligatorio");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que el alias tenga al menos 2 caracteres
    if (formData.alias.trim().length < 2) {
      setToastMessage("El alias debe tener al menos 2 caracteres");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que el email no esté vacío
    if (!formData.email.trim()) {
      setToastMessage("El email es obligatorio");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar formato del email
    if (!validateEmail(formData.email)) {
      setToastMessage("Por favor ingresa un email válido");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que el usuario/alias/email no existan
    const userExists = validateUsuarioExists(formData.nombre_usuario, formData.alias, formData.email);
    if (userExists.exists) {
      const fieldNames = {
        'nombre_usuario': 'nombre de usuario',
        'alias': 'alias',
        'email': 'email'
      };
      const fieldName = fieldNames[userExists.field as keyof typeof fieldNames];
      setToastMessage(`Ya existe un usuario con este ${fieldName}: "${userExists.value}"`);
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar contraseña (solo en modo creación)
    if (!isEditing) {
      const passwordValidation = validatePassword(formData.contrasena);
      if (!passwordValidation.valid) {
        setToastMessage(passwordValidation.message);
        setToastType("error");
        setShowToast(true);
        return;
      }
    }

    // Validar que se haya seleccionado un rol
    if (!formData.id_rol) {
      setToastMessage("Debe seleccionar un rol para el usuario");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Validar que el rol exista y esté activo
    const selectedRol = roles.find(rol => rol.id_rol === formData.id_rol);
    if (!selectedRol) {
      setToastMessage("El rol seleccionado no es válido");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (selectedRol.estado === 0) {
      setToastMessage("No se puede asignar un rol inactivo al usuario");
      setToastType("error");
      setShowToast(true);
      return;
    }

    onSubmit(formData);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Filtrar solo roles activos para el select
  const rolesActivos = roles.filter(rol => rol.estado === 1);

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className={`grid grid-cols-1 ${!isEditing ? 'md:grid-cols-2' : ''} gap-4`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline w-4 h-4 mr-1" />
              Nombre de Usuario *
            </label>
            <input
              type="text"
              value={formData.nombre_usuario}
              onChange={(e) => handleChange('nombre_usuario', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ingresa el nombre de usuario"
              required
              disabled={loading}
              minLength={5}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 5 caracteres</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <AtSign className="inline w-4 h-4 mr-1" />
              Alias *
            </label>
            <input
              type="text"
              value={formData.alias}
              onChange={(e) => handleAliasChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="alias"
              required
              disabled={loading || isEditing}
              minLength={5}
            />
            <p className="text-xs text-gray-500 mt-1">Solo letras, mínimo 5 caracteres.</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${!isEditing ? 'md:grid-cols-2' : ''} gap-4`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline w-4 h-4 mr-1" />
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="usuario1@example.invalid"
              required
              disabled={loading}
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="inline w-4 h-4 mr-1" />
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.contrasena}
                  onChange={(e) => handleChange('contrasena', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="********"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => handleChange('estado', parseInt(e.target.value) as 0 | 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={loading}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Shield className="inline w-4 h-4 mr-1" />
              Rol *
            </label>
            <select
              value={formData.id_rol || ''}
              onChange={(e) => handleChange('id_rol', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              disabled={loading}
            >
              <option value="">Seleccionar rol</option>
              {rolesActivos.map(rol => (
                <option key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre}
                </option>
              ))}
            </select>
            {rolesActivos.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No hay roles activos disponibles. Contacta al administrador.
              </p>
            )}
          </div>
        </div>

        {/* Información adicional si está editando */}
        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Información de edición:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• El nombre de usuario, alias y email deben ser únicos</li>
              <li>• Solo se pueden asignar roles activos</li>
              <li>• Todos los campos marcados con * son obligatorios</li>
            </ul>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" /> Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || rolesActivos.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Check className="w-4 h-4 mr-2" />
            {loading ? 'Procesando...' : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')}
          </button>
        </div>
      </form>

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