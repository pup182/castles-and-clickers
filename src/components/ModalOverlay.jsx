import { useEffect } from 'react';

const ModalOverlay = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[90vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - semi-transparent so dungeon is visible */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal - Pixel panel style */}
      <div className={`relative ${sizeClasses[size]} w-full mx-4 max-h-[85vh] flex flex-col pixel-panel`}>
        {/* Header with pixel styling */}
        <div className="flex items-center justify-between px-4 py-3 border-b-3 border-[var(--color-border)]"
             style={{ background: 'linear-gradient(180deg, #3a3a5a 0%, #2a2a4a 100%)' }}>
          <h2 className="pixel-title">{title}</h2>
          <button
            onClick={onClose}
            className="pixel-btn w-8 h-8 flex items-center justify-center text-xl leading-none p-0"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalOverlay;
