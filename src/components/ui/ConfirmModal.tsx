import { useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
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

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmButtonClass =
    variant === "danger"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : "bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>

        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors"
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// 사용을 위한 커스텀 훅
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [options, setOptions] = useState<{
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "danger";
  }>({});

  const confirm = (
    action: () => void,
    opts?: {
      title?: string;
      message?: string;
      confirmText?: string;
      cancelText?: string;
      variant?: "default" | "danger";
    }
  ) => {
    setConfirmAction(() => action);
    setOptions(opts || {});
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setIsOpen(false);
    setConfirmAction(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setConfirmAction(null);
  };

  const ConfirmModalComponent = () => (
    <ConfirmModal isOpen={isOpen} onClose={handleClose} onConfirm={handleConfirm} {...options} />
  );

  return {
    confirm,
    ConfirmModal: ConfirmModalComponent,
  };
}
