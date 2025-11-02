import { useState } from "react";
import { Button } from "./Button";

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: string;
}

interface ConfirmModalProps extends ConfirmOptions {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center slide-in-fwd-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>

        <p className="mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <Button onClick={onClose} className="bg-secondary">{cancelText}</Button>

          <Button onClick={onConfirm} className={`bg-${variant}`}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions>({});

  const confirm = (action: () => void, opts: ConfirmOptions = {}) => {
    setConfirmAction(() => action);
    setOptions(opts);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    confirmAction?.();
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setConfirmAction(null);
    setOptions({});
  };

  const ConfirmModalComponent = () => (
    <ConfirmModal isOpen={isOpen} onClose={handleClose} onConfirm={handleConfirm} {...options} />
  );

  return {
    confirm,
    ConfirmModal: ConfirmModalComponent,
  };
}
