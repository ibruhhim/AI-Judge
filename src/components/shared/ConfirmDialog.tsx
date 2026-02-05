/**
 * Confirm Dialog Component
 * 
 * Reusable confirmation dialog for destructive actions
 */

import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <h3 className="text-2xl font-bold mb-4 text-text-primary">{title}</h3>
      <div className="mb-6 text-text-secondary">{message}</div>
      <div className="flex space-x-3">
        <Button
          onClick={onConfirm}
          variant={variant}
          className="flex-1"
        >
          {confirmText}
        </Button>
        <Button
          onClick={onClose}
          variant="ghost"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
