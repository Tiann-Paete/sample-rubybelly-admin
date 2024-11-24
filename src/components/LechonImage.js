import React, { useEffect } from 'react';

const LechonImage = ({ isOpen, onClose, imageUrl }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
        <img
          src={imageUrl || '/placeholder-lechon.jpg'}
          alt="Lechon product"
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>
    </div>
  );
};

export default LechonImage;