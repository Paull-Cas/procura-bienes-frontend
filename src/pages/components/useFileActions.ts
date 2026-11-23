// hooks/useFileActions.ts
import { Dispatch, SetStateAction } from 'react';
import { FileData } from '../data/models';

export const useFileActions = (
  setCurrentFile: Dispatch<SetStateAction<FileData | null>>,
  setModalOpen: Dispatch<SetStateAction<boolean>>
) => {
  const base64ToUint8Array = (base64: string): Uint8Array => {
    // Eliminar el prefijo data URL si existe
    const base64Data = base64.replace(/^data:[^;]+;base64,/, '');
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  };

  const detectFileType = (base64: string): string => {
    // Extraer el tipo MIME del prefijo si está presente
    const mimeMatch = base64.match(/^data:([^;]+);/);
    if (mimeMatch && mimeMatch[1]) {
      return mimeMatch[1];
    }

    // Si no tiene prefijo, detectar por contenido
    const byteArray = base64ToUint8Array(base64);
    
    if (byteArray.length >= 4) {
      // PNG
      if (byteArray[0] === 0x89 && byteArray[1] === 0x50 && 
          byteArray[2] === 0x4E && byteArray[3] === 0x47) {
        return 'image/png';
      }
      // JPEG
      if (byteArray[0] === 0xFF && byteArray[1] === 0xD8 && 
          byteArray[2] === 0xFF) {
        return 'image/jpeg';
      }
      // PDF
      if (byteArray[0] === 0x25 && byteArray[1] === 0x50 && 
          byteArray[2] === 0x44 && byteArray[3] === 0x46) {
        return 'application/pdf';
      }
    }
    // Default to binary
    return 'application/octet-stream';
  };

  const getExtension = (fileType: string): string => {
    return fileType.split('/')[1] || 'bin';
  };

  const handleViewFile = (base64: string, fileName: string) => {
    if (!base64 || base64.length === 0) {
      alert('No hay archivo disponible para esta factura');
      return;
    }

    const fileType = detectFileType(base64);
    const byteArray = base64ToUint8Array(base64);
    const extension = getExtension(fileType);
    
    setCurrentFile({
      data: byteArray,
      type: fileType,
      fileName: `${fileName}.${extension}`
    });
    setModalOpen(true);
  };

  const handleDownloadFile = (base64: string, fileName: string) => {
    if (!base64 || base64.length === 0) {
      alert('No hay archivo disponible para esta factura');
      return;
    }

    const fileType = detectFileType(base64);
    const extension = getExtension(fileType);
    const fullFileName = `${fileName}.${extension}`;
    const byteArray = base64ToUint8Array(base64);
    
    const blob = new Blob([byteArray], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fullFileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return { handleViewFile, handleDownloadFile };
};