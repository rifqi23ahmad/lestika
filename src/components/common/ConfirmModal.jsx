import React from "react";
import { Modal, Button } from "react-bootstrap";
import { HelpCircle, AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  show,
  title,
  message,
  variant = "primary",
  onCancel,
  onConfirm,
  loading,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
}) {
  const getColorClass = () => {
    if (variant === "danger") return "bg-red-100 text-red-600";
    if (variant === "warning") return "bg-yellow-100 text-yellow-600";
    return "bg-blue-100 text-blue-600";
  };

  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static">
      <Modal.Body className="p-4 text-center">
        <div
          className={`mx-auto mb-3 p-3 rounded-full w-fit ${getColorClass()}`}
        >
          {variant === "danger" || variant === "warning" ? (
            <AlertTriangle size={32} />
          ) : (
            <HelpCircle size={32} />
          )}
        </div>
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="text-muted mb-4">{message}</p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
