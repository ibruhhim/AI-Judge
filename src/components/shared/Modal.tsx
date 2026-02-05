/**
 * Modal Component
 * 
 * Reusable modal/dialog component with overlay
 */

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  darkOverlay?: boolean;
}

function Modal({ isOpen, onClose, children, size = 'md', darkOverlay = false }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      className={`fixed inset-0 ${darkOverlay ? 'bg-overlay-dark' : 'bg-overlay'} backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in`}
      onClick={onClose}
    >
      <div
        className={`glass rounded-3xl p-8 shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
