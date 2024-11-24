import React from 'react';

export default function ViandsImage({ isOpen, onClose, imageUrl }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg p-2">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
        <img
          src={imageUrl || '/placeholder-viand.jpg'}
          alt="Viand product"
          className="max-h-[80vh] max-w-[80vw] object-contain"
        />
      </div>
    </div>
  );
}