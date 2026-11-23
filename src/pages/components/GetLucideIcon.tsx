import * as LucideIcons from 'lucide-react';

export const getLucideIcon = (iconName: string): React.ElementType => {
  // Primero intentar con el nombre tal como viene
  const icons = LucideIcons as unknown as Record<string, React.ElementType>;
  
  // Si existe el icono con el nombre exacto, usarlo
  if (icons[iconName]) {
    return icons[iconName];
  }
  
  // Si no existe, intentar con el formateo (por compatibilidad)
  const formattedName = iconName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
    
  return icons[formattedName] || LucideIcons.AlertTriangle;
};
{/* 
  const formattedName = iconName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  const icons = LucideIcons as unknown as Record<string, React.ElementType>;
*/}
