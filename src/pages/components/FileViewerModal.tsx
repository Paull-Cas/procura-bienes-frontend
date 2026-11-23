// components/FileViewerModal.tsx
import React from 'react';
import { FileData } from '../data/models';
import Modal from './Modal';

const bufferToBase64 = (buffer: Uint8Array) => {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
};

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: FileData | null;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  fileData,
}) => {
  if (!isOpen || !fileData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vista previa: ${fileData.fileName}`}
      size="xl"
    >
      <div className="p-4">
        {fileData.type === 'application/pdf' ? (
          <iframe 
            src={`data:application/pdf;base64,${bufferToBase64(fileData.data)}`}
            title={fileData.fileName}
            className="w-full h-[65vh]"
          />
        ) : (
          <img 
            src={`data:${fileData.type};base64,${bufferToBase64(fileData.data)}`}
            alt={fileData.fileName}
            className="max-w-full max-h-[65vh] mx-auto"
          />
        )}
      </div>
      
      <div className="border-t p-4 flex justify-end">
        <button
          onClick={() => {
            const blob = new Blob([fileData.data], { type: fileData.type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileData.fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Descargar
        </button>
      </div>
    </Modal>
  );
};

export default FileViewerModal;